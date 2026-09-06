"use client";

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { ArrowDown, Bot, Send, Square } from "lucide-react";

const BOTTOM_THRESHOLD = 80;

export function StudyFlowChat() {
  const { messages, sendMessage, stop, status, error, clearError } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const isPinnedRef = useRef(true);
  const [showJump, setShowJump] = useState(false);
  const isGenerating = status === "submitted" || status === "streaming";
  const lastMessage = messages[messages.length - 1];
  const isThinking = isGenerating && !(lastMessage?.role === "assistant" && getMessageText(lastMessage));

  useEffect(() => {
    const container = scrollRef.current;
    if (!container || !isPinnedRef.current) return;

    const frame = requestAnimationFrame(() => {
      container.scrollTop = container.scrollHeight;
    });

    return () => cancelAnimationFrame(frame);
  }, [messages, status]);

  function handleScroll() {
    const container = scrollRef.current;
    if (!container) return;

    const atBottom = container.scrollHeight - container.scrollTop - container.clientHeight <= BOTTOM_THRESHOLD;
    isPinnedRef.current = atBottom;
    setShowJump(!atBottom);
  }

  function jumpToLatest() {
    const container = scrollRef.current;
    if (!container) return;

    isPinnedRef.current = true;
    setShowJump(false);
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
    container.scrollTo({ top: container.scrollHeight, behavior });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedInput = input.trim();
    if (!trimmedInput || isGenerating) return;

    clearError();
    setInput("");
    isPinnedRef.current = true;
    setShowJump(false);
    void sendMessage({ text: trimmedInput });
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  }

  return (
    <section className="relative flex h-[calc(100dvh-13rem)] max-h-[calc(100dvh-13rem)] min-h-[28rem] flex-col overflow-hidden rounded-[var(--radius-card)] border border-[var(--line)] bg-white shadow-[0_12px_32px_rgba(16,24,40,0.05)]" aria-label="StudyFlow AI chat">
      <div ref={scrollRef} onScroll={handleScroll} className="relative min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-8 sm:py-8">
        {messages.length === 0 ? <EmptyState /> : <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">{messages.map((message) => <ChatMessage key={message.id} role={message.role} text={getMessageText(message)} />)}</div>}

        {isThinking && <div className="mx-auto mt-6 flex w-full max-w-3xl items-center gap-3 text-sm text-[var(--muted)]" role="status" aria-live="polite"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600"><Bot size={16} aria-hidden="true" /></span><span className="flex items-center gap-1"><span>StudyFlow AI is thinking</span><span className="flex gap-1" aria-hidden="true"><i className="h-1.5 w-1.5 motion-safe:animate-pulse rounded-full bg-blue-500" /><i className="h-1.5 w-1.5 motion-safe:animate-pulse rounded-full bg-blue-500 [animation-delay:150ms]" /><i className="h-1.5 w-1.5 motion-safe:animate-pulse rounded-full bg-blue-500 [animation-delay:300ms]" /></span></span></div>}
      </div>

      {showJump && <button type="button" onClick={jumpToLatest} className="absolute bottom-28 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full border border-[var(--line)] bg-white px-4 py-2 text-xs font-semibold text-blue-700 shadow-md transition-colors hover:bg-blue-50"><ArrowDown size={14} aria-hidden="true" />Jump to latest</button>}

      <div className="border-t border-[var(--line)] bg-slate-50/70 p-3 sm:p-5">
        {error && <div className="mx-auto mb-3 flex max-w-3xl items-center justify-between gap-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert"><span>Something went wrong. Please try again.</span><button type="button" onClick={clearError} className="font-semibold underline underline-offset-2">Dismiss</button></div>}
        <form onSubmit={handleSubmit} className="mx-auto flex max-w-3xl items-end gap-2 rounded-lg border border-[var(--line)] bg-white p-2 shadow-sm focus-within:border-blue-400">
          <label htmlFor="studyflow-message" className="sr-only">Message StudyFlow AI</label>
          <textarea id="studyflow-message" value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={handleKeyDown} rows={1} placeholder="Ask about your study plan, courses, or next task..." className="max-h-32 min-h-11 min-w-0 flex-1 resize-none bg-transparent px-2 py-3 text-sm leading-5 text-slate-800 outline-none placeholder:text-slate-400" />
          {isGenerating ? <button type="button" onClick={() => void stop()} className="flex h-11 shrink-0 items-center gap-2 rounded-md bg-slate-900 px-3 text-sm font-semibold text-white transition-colors hover:bg-slate-700" aria-label="Stop generating"><Square size={14} fill="currentColor" aria-hidden="true" /><span>Stop</span></button> : <button type="submit" disabled={!input.trim()} className="flex h-11 shrink-0 items-center gap-2 rounded-md bg-blue-600 px-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400" aria-label="Send message"><Send size={15} aria-hidden="true" /><span className="hidden sm:inline">Send</span></button>}
        </form>
        <p className="mx-auto mt-2 max-w-3xl px-2 text-[11px] text-slate-400">Enter to send · Shift+Enter for a new line</p>
      </div>
    </section>
  );
}

function EmptyState() {
  return <div className="flex min-h-[22rem] flex-col items-center justify-center text-center"><span className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600"><Bot size={26} strokeWidth={1.7} aria-hidden="true" /></span><h2 className="mt-5 text-xl font-semibold tracking-tight text-slate-950">What are you working on?</h2><p className="mt-2 max-w-md text-sm leading-6 text-[var(--muted)]">Ask for a study plan, break down a difficult topic, or decide what to tackle next.</p></div>;
}

function ChatMessage({ role, text }: { role: string; text: string }) {
  const isUser = role === "user";
  return <article className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}><div className={`max-w-[88%] sm:max-w-[78%] ${isUser ? "order-1" : "order-2"}`}><p className={`mb-1 text-[10px] font-bold uppercase tracking-[0.14em] ${isUser ? "text-right text-slate-400" : "text-blue-600"}`}>{isUser ? "You" : "StudyFlow AI"}</p><div className={`whitespace-pre-wrap break-words rounded-lg px-4 py-3 text-sm leading-6 ${isUser ? "bg-blue-600 text-white" : "border border-[var(--line)] bg-slate-50 text-slate-800"}`}>{text}</div></div>{!isUser && <span className="order-1 mt-5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600"><Bot size={16} aria-hidden="true" /></span>}</article>;
}

function getMessageText(message: { parts: Array<{ type: string; text?: string }> }) {
  return message.parts.filter((part) => part.type === "text").map((part) => part.text ?? "").join("");
}