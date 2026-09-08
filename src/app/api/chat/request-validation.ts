export const CHAT_LIMITS = {
  maxMessages: 32,
  maxUserMessageCharacters: 8_000,
  maxRequestCharacters: 120_000,
  maxStudyFlowContextCharacters: 24_000,
} as const;

type ValidationResult =
  | { ok: true }
  | { ok: false; status: 400 | 413; message: string };

function textFromMessage(message: Record<string, unknown>): string {
  if (typeof message.content === "string") return message.content;
  if (!Array.isArray(message.parts)) return "";
  return message.parts.flatMap((part) => {
    if (!part || typeof part !== "object") return [];
    const value = part as Record<string, unknown>;
    return value.type === "text" && typeof value.text === "string" ? [value.text] : [];
  }).join("");
}

export function validateChatRequest(body: unknown, serializedBody: string): ValidationResult {
  if (!body || typeof body !== "object" || !Array.isArray((body as { messages?: unknown }).messages)) {
    return { ok: false, status: 400, message: "A valid message history is required." };
  }

  if (serializedBody.length > CHAT_LIMITS.maxRequestCharacters) {
    return { ok: false, status: 413, message: "This conversation is too large. Start a new chat or remove older messages." };
  }

  const requestBody = body as { messages: unknown[]; studyFlowContext?: unknown };
  if (requestBody.messages.length === 0) {
    return { ok: false, status: 400, message: "Send a message before starting a chat." };
  }
  if (requestBody.messages.length > CHAT_LIMITS.maxMessages) {
    return { ok: false, status: 413, message: `A conversation can contain at most ${CHAT_LIMITS.maxMessages} messages.` };
  }
  if (requestBody.studyFlowContext !== undefined && JSON.stringify(requestBody.studyFlowContext).length > CHAT_LIMITS.maxStudyFlowContextCharacters) {
    return { ok: false, status: 413, message: "The saved StudyFlow context is too large for one request." };
  }

  let hasUserMessage = false;
  for (const message of requestBody.messages) {
    if (!message || typeof message !== "object") return { ok: false, status: 400, message: "Every message must be a valid object." };
    const record = message as Record<string, unknown>;
    if (record.role !== "user" && record.role !== "assistant") return { ok: false, status: 400, message: "Messages must have a user or assistant role." };
    const text = textFromMessage(record);
    if (record.role === "user") {
      hasUserMessage ||= text.trim().length > 0;
      if (text.length > CHAT_LIMITS.maxUserMessageCharacters) {
        return { ok: false, status: 413, message: `Each message is limited to ${CHAT_LIMITS.maxUserMessageCharacters.toLocaleString()} characters.` };
      }
    }
  }

  return hasUserMessage ? { ok: true } : { ok: false, status: 400, message: "Send a non-empty message before starting a chat." };
}
