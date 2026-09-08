import { describe, expect, it } from "vitest";
import { CHAT_LIMITS, validateChatRequest } from "./request-validation";

function request(messages: unknown[], studyFlowContext?: unknown) {
  const body = { messages, studyFlowContext };
  return validateChatRequest(body, JSON.stringify(body));
}

describe("AI chat request limits", () => {
  it("accepts a normal UI message payload", () => {
    expect(request([{ id: "1", role: "user", parts: [{ type: "text", text: "Explain recursion" }] }])).toEqual({ ok: true });
  });

  it("rejects empty and malformed histories", () => {
    expect(request([])).toMatchObject({ ok: false, status: 400 });
    expect(validateChatRequest({ messages: [{ role: "system" }] }, JSON.stringify({ messages: [{ role: "system" }] }))).toMatchObject({ ok: false, status: 400 });
  });

  it("rejects an empty user message", () => {
    expect(request([{ role: "user", parts: [{ type: "text", text: "   " }] }])).toMatchObject({ ok: false, status: 400 });
  });

  it("rejects oversized user input and conversation payloads", () => {
    expect(request([{ role: "user", parts: [{ type: "text", text: "x".repeat(CHAT_LIMITS.maxUserMessageCharacters + 1) }] }])).toMatchObject({ ok: false, status: 413 });
    expect(request(Array.from({ length: CHAT_LIMITS.maxMessages + 1 }, (_, index) => ({ role: "user", parts: [{ type: "text", text: `message ${index}` }] })))).toMatchObject({ ok: false, status: 413 });
    expect(validateChatRequest({ messages: [{ role: "user", parts: [{ type: "text", text: "hello" }] }] }, "x".repeat(CHAT_LIMITS.maxRequestCharacters + 1))).toMatchObject({ ok: false, status: 413 });
  });
});
