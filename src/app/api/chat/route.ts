
import { createUIMessageStreamResponse, convertToModelMessages, stepCountIs, streamText, toUIMessageStream, type TextStreamPart, type UIMessage } from "ai";
import type { ToolSet } from "@ai-sdk/provider-utils";
import { getStudyFlowModel, STUDYFLOW_SYSTEM_PROMPT } from "@/lib/ai/config";
import { analyzeStudyProgress } from "@/lib/ai/study-progress-tool";
import { createStudyQuiz, type StudyFlowTools } from "@/lib/ai/study-quiz-tool";
import { formatStudyFlowContext, parseStudyFlowContext } from "@/lib/ai/studyflow-context";
import { validateChatRequest } from "./request-validation";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();
  const startedAt = Date.now();

  const logTiming = (label: string, extra: Record<string, unknown> = {}) => {
    console.log(`[StudyFlow chat] ${label}`, {
      requestId,
      startedAt,
      elapsedMs: Date.now() - startedAt,
      ...extra,
    });
  };

  logTiming("request received", { method: request.method });

  try {
    const failureTest = getFailureTest(request);
    if (failureTest === "server") {
      logTiming("server failure test triggered", { errorType: "server" });
      return new Response("SERVER_ERROR", { status: 500 });
    }
    if (failureTest === "rate-limit") {
      logTiming("rate-limit failure test triggered", { errorType: "rate-limit" });
      return new Response("RATE_LIMIT", { status: 429 });
    }
    if (failureTest === "slow") {
      logTiming("slow failure test enabled", { delayMs: 2500 });
      await new Promise((resolve) => setTimeout(resolve, 2500));
    }

    const contentLength = Number(request.headers.get("content-length"));
    if (Number.isFinite(contentLength) && contentLength > 120_000) {
      logTiming("oversized request rejected", { contentLength });
      return Response.json({ error: "This request is too large." }, { status: 413 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch (error) {
      logTiming("invalid JSON request body", { error: error instanceof Error ? error.message : String(error) });
      return Response.json({ error: "The request body must be valid JSON." }, { status: 400 });
    }

    const serializedBody = JSON.stringify(body) ?? "";
    const validation = validateChatRequest(body, serializedBody);
    if (!validation.ok) {
      logTiming("request validation failed", { status: validation.status, message: validation.message });
      return Response.json({ error: validation.message }, { status: validation.status });
    }

    logTiming("request validation complete", {
      requestSizeBytes: serializedBody.length,
      messageCount: Array.isArray((body as { messages?: unknown[] })?.messages) ? (body as { messages: unknown[] }).messages.length : 0,
    });

    const requestBody = body as { messages: unknown[]; studyFlowContext?: unknown };
    const messages = requestBody.messages as UIMessage<unknown, Record<string, never>, StudyFlowTools>[];
    const studyFlowContext = parseStudyFlowContext(requestBody.studyFlowContext);
    const modelMessages = await convertToModelMessages(messages);
    const modelRequestStartedAt = Date.now();

    logTiming("model request started", {
      modelRequestStartedAt,
      modelRequestStartDelayMs: modelRequestStartedAt - startedAt,
      messageCount: modelMessages.length,
      toolNames: ["analyzeStudyProgress", "createStudyQuiz"],
      hasStudyFlowContext: Boolean(studyFlowContext),
    });

    let firstTextChunkLogged = false;
    let firstTextChunkAt: number | undefined;
    let firstTextChunkDelayMs: number | undefined;

    const result = streamText({
      model: getStudyFlowModel(),
      system: `${STUDYFLOW_SYSTEM_PROMPT}\n\n${formatStudyFlowContext(studyFlowContext)}`,
      messages: modelMessages,
      abortSignal: request.signal,
      maxRetries: 1,
      tools: { analyzeStudyProgress, createStudyQuiz },
      stopWhen: stepCountIs(5),
      onFinish: ({ text, finishReason, usage, steps }) => {
        const generationFinishedAt = Date.now();
        const totalGenerationMs = generationFinishedAt - modelRequestStartedAt;
        const totalRequestMs = generationFinishedAt - startedAt;
        const outputTokens = usage?.outputTokens ?? 0;
        const outputTokensPerSecond = totalGenerationMs > 0 ? outputTokens / (totalGenerationMs / 1000) : 0;

        logTiming("generation finished", {
          finishReason,
          generationFinishedAt,
          totalGenerationMs,
          totalRequestMs,
          timeToFirstChunkMs: firstTextChunkDelayMs,
          outputTokens,
          outputTokensPerSecond,
          textLength: text.length,
          stepCount: steps.length,
          usage,
        });

        logTiming("total request duration", {
          totalRequestMs,
          generationFinishedAt,
          outputTokens,
          outputTokensPerSecond,
        });
      },
    });

    const stream = failureTest === "mid-stream"
      ? interruptAfterFirstTextDelta(result.stream.pipeThrough(new TransformStream({
          transform(part, controller) {
            if (part.type === "text-delta" && !firstTextChunkLogged) {
              firstTextChunkLogged = true;
              firstTextChunkAt = Date.now();
              firstTextChunkDelayMs = firstTextChunkAt - modelRequestStartedAt;
              logTiming("first text chunk received from model", {
                firstTextChunkAt,
                timeToFirstChunkMs: firstTextChunkDelayMs,
                chunkLength: typeof part.text === "string" ? part.text.length : 0,
              });
            }

            controller.enqueue(part);
          },
        })))
      : result.stream.pipeThrough(new TransformStream({
          transform(part, controller) {
            if (part.type === "text-delta" && !firstTextChunkLogged) {
              firstTextChunkLogged = true;
              firstTextChunkAt = Date.now();
              firstTextChunkDelayMs = firstTextChunkAt - modelRequestStartedAt;
              logTiming("first text chunk received from model", {
                firstTextChunkAt,
                timeToFirstChunkMs: firstTextChunkDelayMs,
                chunkLength: typeof part.text === "string" ? part.text.length : 0,
              });
            }

            controller.enqueue(part);
          },
        }));

    logTiming("stream created", { streamStartedAt: Date.now(), midStreamFailure: failureTest === "mid-stream" });

    return createUIMessageStreamResponse({
      stream: toUIMessageStream({
        stream,
        onError: (error) => error instanceof Error && error.message === "STREAM_INTERRUPTED" ? "STREAM_INTERRUPTED" : "SERVER_ERROR",
      }),
    });
  } catch (error) {
    logTiming("request failed", { error: error instanceof Error ? error.message : String(error) });
    return new Response("SERVER_ERROR", { status: 500 });
  }
}

type FailureTest = "server" | "rate-limit" | "slow" | "mid-stream";

function getFailureTest(request: Request): FailureTest | undefined {
  const enabled = process.env.NODE_ENV === "development" && process.env.STUDYFLOW_ENABLE_FAILURE_TESTS === "true";
  if (!enabled) return undefined;

  const value = request.headers.get("x-studyflow-failure-test");
  return value === "server" || value === "rate-limit" || value === "slow" || value === "mid-stream" ? value : undefined;
}

function interruptAfterFirstTextDelta<TOOLS extends ToolSet>(stream: ReadableStream<TextStreamPart<TOOLS>>) {
  let interrupted = false;
  return stream.pipeThrough(new TransformStream({
    transform(part, controller) {
      controller.enqueue(part);
      if (!interrupted && part.type === "text-delta") {
        interrupted = true;
        controller.error(new Error("STREAM_INTERRUPTED"));
      }
    },
  }));
}
