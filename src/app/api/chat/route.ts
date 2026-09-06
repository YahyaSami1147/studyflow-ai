
import { createUIMessageStreamResponse, convertToModelMessages, streamText, toUIMessageStream, type UIMessage } from "ai";
import { getStudyFlowModel, STUDYFLOW_SYSTEM_PROMPT } from "@/lib/ai/config";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();

    if (!body || typeof body !== "object" || !("messages" in body) || !Array.isArray(body.messages)) {
      return Response.json({ error: "A valid message history is required." }, { status: 400 });
    }

    const messages = body.messages as UIMessage[];
    const modelMessages = await convertToModelMessages(messages);
    const result = streamText({
      model: getStudyFlowModel(),
      system: STUDYFLOW_SYSTEM_PROMPT,
      messages: modelMessages,
      abortSignal: request.signal,
      maxRetries: 1,
    });

    return createUIMessageStreamResponse({
      stream: toUIMessageStream({ stream: result.stream }),
    });
  } catch {
    return Response.json({ error: "StudyFlow AI is temporarily unavailable. Please try again." }, { status: 500 });
  }
}