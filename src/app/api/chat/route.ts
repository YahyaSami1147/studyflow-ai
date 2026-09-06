
import { createUIMessageStreamResponse, convertToModelMessages, stepCountIs, streamText, toUIMessageStream, type TextStreamPart, type UIMessage } from "ai";
import type { ToolSet } from "@ai-sdk/provider-utils";
import { getStudyFlowModel, STUDYFLOW_SYSTEM_PROMPT } from "@/lib/ai/config";
import { analyzeStudyProgress, type StudyFlowTools } from "@/lib/ai/study-progress-tool";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const failureTest = getFailureTest(request);
    if (failureTest === "server") return new Response("SERVER_ERROR", { status: 500 });
    if (failureTest === "rate-limit") return new Response("RATE_LIMIT", { status: 429 });
    if (failureTest === "slow") await new Promise((resolve) => setTimeout(resolve, 2500));

    const body: unknown = await request.json();

    if (!body || typeof body !== "object" || !("messages" in body) || !Array.isArray(body.messages)) {
      return Response.json({ error: "A valid message history is required." }, { status: 400 });
    }

    const messages = body.messages as UIMessage<unknown, Record<string, never>, StudyFlowTools>[];
    const modelMessages = await convertToModelMessages(messages);
    const result = streamText({
      model: getStudyFlowModel(),
      system: STUDYFLOW_SYSTEM_PROMPT,
      messages: modelMessages,
      abortSignal: request.signal,
      maxRetries: 1,
      tools: { analyzeStudyProgress },
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
