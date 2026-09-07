import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { StudyFlowChat } from "@/components/ai/chat";
import { DEFAULT_STUDYFLOW_DATA } from "@/types/studyflow";

vi.mock("@ai-sdk/react", () => ({ useChat: vi.fn() }));
vi.mock("@/providers/studyflow-provider", () => ({ useStudyFlow: () => ({ data: DEFAULT_STUDYFLOW_DATA }) }));
vi.mock("@/lib/ai/studyflow-context", () => ({ buildStudyFlowContext: () => ({}) }));

const { useChat } = await import("@ai-sdk/react");
const useChatMock = vi.mocked(useChat);

function mockChat(overrides: Record<string, unknown> = {}) {
  useChatMock.mockReturnValue({
    messages: [],
    sendMessage: vi.fn(),
    stop: vi.fn(),
    status: "ready",
    error: undefined,
    clearError: vi.fn(),
    regenerate: vi.fn(),
    ...overrides,
  } as never);
}

describe("StudyFlowChat", () => {
  beforeEach(() => {
    mockChat();
  });

  it("shows the pending assistant state", () => {
    mockChat({ status: "submitted" });

    render(<StudyFlowChat />);

    expect(screen.getByText("StudyFlow is thinking…")).toBeInTheDocument();
  });

  it("renders partial streamed assistant text", () => {
    mockChat({
      status: "streaming",
      messages: [{ id: "assistant-1", role: "assistant", parts: [{ type: "text", text: "Start with the call stack." }] }],
    });

    render(<StudyFlowChat />);

    expect(screen.getByText("Start with the call stack.")).toBeInTheDocument();
    expect(screen.getByText("StudyFlow is responding.")).toBeInTheDocument();
  });

  it("announces a response error without crashing the chat", () => {
    mockChat({ error: new Error("NETWORK request failed") });

    render(<StudyFlowChat />);

    expect(screen.getByRole("alert")).toHaveTextContent("Connection interrupted");
    expect(screen.getByRole("button", { name: "Retry response" })).toBeInTheDocument();
  });
});
