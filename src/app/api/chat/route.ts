
import { createUIMessageStreamResponse, convertToModelMessages, stepCountIs, streamText, toUIMessageStream, type TextStreamPart, type UIMessage } from "ai";
import type { ToolSet } from "@ai-sdk/provider-utils";
import { getStudyFlowModel, STUDYFLOW_SYSTEM_PROMPT } from "@/lib/ai/config";
import { analyzeStudyProgress } from "@/lib/ai/study-progress-tool";
import { createStudyQuiz, type StudyFlowTools } from "@/lib/ai/study-quiz-tool";
import { formatStudyFlowContext, parseStudyFlowContext } from "@/lib/ai/studyflow-context";
import { validateChatRequest } from "./request-validation";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request: Request) {
  try {
    const failureTest = getFailureTest(request);
    if (failureTest === "server") return new Response("SERVER_ERROR", { status: 500 });
    if (failureTest === "rate-limit") return new Response("RATE_LIMIT", { status: 429 });
    if (failureTest === "slow") await new Promise((resolve) => setTimeout(resolve, 2500));

    const contentLength = Number(request.headers.get("content-length"));
    if (Number.isFinite(contentLength) && contentLength > 120_000) {
      return Response.json({ error: "This request is too large." }, { status: 413 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return Response.json({ error: "The request body must be valid JSON." }, { status: 400 });
    }

    const serializedBody = JSON.stringify(body) ?? "";
    const validation = validateChatRequest(body, serializedBody);
    if (!validation.ok) return Response.json({ error: validation.message }, { status: validation.status });

    const requestBody = body as { messages: unknown[]; studyFlowContext?: unknown };
    const messages = requestBody.messages as UIMessage<unknown, Record<string, never>, StudyFlowTools>[];
    const studyFlowContext = parseStudyFlowContext(requestBody.studyFlowContext);
    const modelMessages = await convertToModelMessages(messages);
    const result = streamText({
      model: getStudyFlowModel(),
      system: `${STUDYFLOW_SYSTEM_PROMPT}\n\n${formatStudyFlowContext(studyFlowContext)}`,
      messages: modelMessages,
      abortSignal: request.signal,
      maxRetries: 1,
      tools: { analyzeStudyProgress, createStudyQuiz },
      stopWhen: stepCountIs(5),
    });

    const stream = failureTest === "mid-stream" ? interruptAfterFirstTextDelta(result.stream) : result.stream;
    return createUIMessageStreamResponse({
      stream: toUIMessageStream({
        stream,
        onError: (error) => error instanceof Error && error.message === "STREAM_INTERRUPTED" ? "STREAM_INTERRUPTED" : "SERVER_ERROR",
      }),
    });
  } catch {
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
