"use client";

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { AlertCircle, ArrowDown, BarChart3, Bot, CheckCircle2, Clock3, LoaderCircle, RefreshCw, Send, Square, WifiOff } from "lucide-react";
import type { StudyFlowTools, StudyProgressAnalysis } from "@/lib/ai/study-progress-tool";

const BOTTOM_THRESHOLD = 80;
const EXAMPLE_PROMPTS = ["Explain recursion simply", "Create a study plan for my exam", "Quiz me on operating systems"];
type StudyFlowMessage = UIMessage<unknown, Record<string, never>, StudyFlowTools>;

export function StudyFlowChat() {
  const { messages, sendMessage, stop, status, error, clearError, regenerate } = useChat<StudyFlowMessage>({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      headers: (): Record<string, string> => {
        const failureTest = window.localStorage.getItem("studyflow-failure-test");
        return failureTest ? { "x-studyflow-failure-test": failureTest } : {};
      },
    }),
  });
  const [input, setInput] = useState("");
  const [isRetrying, setIsRetrying] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const isPinnedRef = useRef(true);
  const [showJump, setShowJump] = useState(false);
  const isGenerating = status === "submitted" || status === "streaming";
  const hasAssistantText = messages.some((message) => message.role === "assistant" && getMessageText(message).trim().length > 0);
  const isWaitingForFirstToken = status === "submitted";
  const isStreamingWithoutText = status === "streaming" && !hasAssistantText;
  const hasPartialResponse = hasPartialAssistantResponse(messages);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container || !isPinnedRef.current) return;
    const frame = requestAnimationFrame(() => { container.scrollTop = container.scrollHeight; });
    return () => cancelAnimationFrame(frame);
  }, [messages, status, error]);

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

  function chooseExample(prompt: string) {
    setInput(prompt);
    requestAnimationFrame(() => composerRef.current?.focus());
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

  async function handleRetry() {
    if (isGenerating) return;
    setIsRetrying(true);
    clearError();
    try {
      await regenerate();
    } finally {
      setIsRetrying(false);
    }
  }

  return <section className="relative flex h-[calc(100dvh-13rem)] min-h-[28rem] flex-col overflow-hidden rounded-[var(--radius-card)] border border-[var(--line)] bg-white shadow-[0_12px_32px_rgba(16,24,40,0.05)]" aria-label="StudyFlow AI chat">
    <div ref={scrollRef} onScroll={handleScroll} className="relative min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-4 py-5 sm:px-8 sm:py-8">
      {messages.length === 0 ? <EmptyState onChoosePrompt={chooseExample} /> : <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">{messages.map((message) => <ChatMessage key={message.id} message={message} />)}</div>}
      {(isWaitingForFirstToken || isStreamingWithoutText || (isRetrying && isGenerating)) && <PendingState isRetrying={isRetrying} isStreaming={status === "streaming"} />}
      {error && <ChatErrorState error={error} hasPartialResponse={hasPartialResponse} isRetrying={isRetrying} onRetry={() => void handleRetry()} />}
    </div>

    {showJump && <button type="button" onClick={jumpToLatest} className="absolute bottom-28 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full border border-[var(--line)] bg-white px-4 py-2 text-xs font-semibold text-blue-700 shadow-md transition-colors hover:bg-blue-50"><ArrowDown size={14} aria-hidden="true" />Jump to latest</button>}
    <div className="border-t border-[var(--line)] bg-slate-50/70 p-3 sm:p-5"><form onSubmit={handleSubmit} className="mx-auto flex max-w-3xl items-end gap-2 rounded-lg border border-[var(--line)] bg-white p-2 shadow-sm focus-within:border-blue-400"><label htmlFor="studyflow-message" className="sr-only">Message StudyFlow AI</label><textarea ref={composerRef} id="studyflow-message" value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={handleKeyDown} rows={1} placeholder="Ask about your study plan, courses, or next task..." className="max-h-32 min-h-11 min-w-0 flex-1 resize-none bg-transparent px-2 py-3 text-sm leading-5 text-slate-800 outline-none placeholder:text-slate-400" />{isGenerating ? <button type="button" onClick={() => void stop()} className="flex h-11 shrink-0 items-center gap-2 rounded-md bg-slate-900 px-3 text-sm font-semibold text-white transition-colors hover:bg-slate-700" aria-label="Stop generating"><Square size={14} fill="currentColor" aria-hidden="true" /><span>Stop</span></button> : <button type="submit" disabled={!input.trim()} className="flex h-11 shrink-0 items-center gap-2 rounded-md bg-blue-600 px-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400" aria-label="Send message"><Send size={15} aria-hidden="true" /><span className="hidden sm:inline">Send</span></button>}</form><p className="mx-auto mt-2 max-w-3xl px-2 text-[11px] text-slate-400">Enter to send · Shift+Enter for a new line</p></div>
  </section>;
}

function EmptyState({ onChoosePrompt }: { onChoosePrompt: (prompt: string) => void }) {
  return <div className="mx-auto flex min-h-[22rem] w-full max-w-2xl flex-col items-center justify-center text-center"><span className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600"><Bot size={26} strokeWidth={1.7} aria-hidden="true" /></span><h2 className="mt-5 text-xl font-semibold tracking-tight text-slate-950">What would you like to study today?</h2><p className="mt-2 max-w-md text-sm leading-6 text-[var(--muted)]">Ask for an explanation, a focused plan, or a quick way to test what you know.</p><div className="mt-6 flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-center">{EXAMPLE_PROMPTS.map((prompt) => <button key={prompt} type="button" onClick={() => onChoosePrompt(prompt)} className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-left text-sm font-medium text-blue-800 transition-colors hover:bg-blue-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:text-center">{prompt}</button>)}</div></div>;
}

function PendingState({ isRetrying, isStreaming }: { isRetrying: boolean; isStreaming: boolean }) {
  const label = isRetrying ? "Retrying your response…" : isStreaming ? "StudyFlow is starting its response…" : "StudyFlow is thinking…";
  return <div className="mx-auto mt-6 flex w-full max-w-3xl items-center gap-3 text-sm text-[var(--muted)]" role="status" aria-live="polite"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600"><Bot size={16} aria-hidden="true" /></span><span className="flex items-center gap-2"><span>{label}</span><span className="flex gap-1" aria-hidden="true"><i className="h-1.5 w-1.5 rounded-full bg-blue-500 motion-safe:animate-pulse" /><i className="h-1.5 w-1.5 rounded-full bg-blue-500 motion-safe:animate-pulse [animation-delay:150ms]" /><i className="h-1.5 w-1.5 rounded-full bg-blue-500 motion-safe:animate-pulse [animation-delay:300ms]" /></span></span></div>;
}

function ChatErrorState({ error, hasPartialResponse, isRetrying, onRetry }: { error: Error; hasPartialResponse: boolean; isRetrying: boolean; onRetry: () => void }) {
  const kind = getErrorKind(error, hasPartialResponse);
  const copy = kind === "rate-limit" ? { title: "Too many requests", description: "StudyFlow is receiving too many requests right now. Wait a moment and retry." } : kind === "network" ? { title: "Connection interrupted", description: "Check your internet connection and retry this response." } : kind === "interrupted" ? { title: "Response interrupted", description: "The connection ended before StudyFlow finished this answer." } : { title: "Couldn’t finish this response", description: "StudyFlow ran into a problem while generating this answer." };
  return <div className="mx-auto mt-6 flex w-full max-w-3xl items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-950" role="alert"><span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-700">{kind === "network" ? <WifiOff size={16} aria-hidden="true" /> : <AlertCircle size={16} aria-hidden="true" />}</span><div className="min-w-0 flex-1"><p className="font-semibold">{copy.title}</p><p className="mt-1 text-xs leading-5 text-red-800">{copy.description}</p><button type="button" onClick={onRetry} disabled={isRetrying} className="mt-3 inline-flex items-center gap-2 rounded-md bg-red-700 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-red-800 disabled:cursor-not-allowed disabled:bg-red-300"><RefreshCw size={14} className={isRetrying ? "animate-spin" : ""} aria-hidden="true" />{isRetrying ? "Retrying…" : "Retry response"}</button></div></div>;
}

function getErrorKind(error: Error, hasPartialResponse: boolean) {
  const message = error.message.toUpperCase();
  if (message.includes("RATE_LIMIT") || message.includes("429")) return "rate-limit";
  if (message.includes("NETWORK") || message.includes("FAILED TO FETCH") || message.includes("CONNECTION")) return "network";
  if (message.includes("STREAM_INTERRUPTED") || hasPartialResponse) return "interrupted";
  return "server";
}

function hasPartialAssistantResponse(messages: StudyFlowMessage[]) {
  const lastUserMessageIndex = messages.map((message) => message.role).lastIndexOf("user");
  return messages.slice(lastUserMessageIndex + 1).some((message) => message.role === "assistant" && getMessageText(message).trim().length > 0);
}

function ChatMessage({ message }: { message: StudyFlowMessage }) {
  const isUser = message.role === "user";
  const text = getMessageText(message);
  const progressToolParts = message.parts.filter((part): part is Extract<StudyFlowMessage["parts"][number], { type: "tool-analyzeStudyProgress" }> => part.type === "tool-analyzeStudyProgress");
  return <article className={`flex min-w-0 gap-3 ${isUser ? "justify-end" : "justify-start"}`}><div className={`min-w-0 max-w-[88%] sm:max-w-[78%] ${isUser ? "order-1" : "order-2"}`}><p className={`mb-1 text-[10px] font-bold uppercase tracking-[0.14em] ${isUser ? "text-right text-slate-400" : "text-blue-600"}`}>{isUser ? "You" : "StudyFlow AI"}</p>{text && (isUser ? <div className="whitespace-pre-wrap break-words rounded-lg bg-blue-600 px-4 py-3 text-sm leading-6 text-white">{text}</div> : <div className="overflow-hidden rounded-lg border border-[var(--line)] bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-800"><MarkdownMessage content={text} /></div>)}{progressToolParts.map((part) => <StudyProgressToolPart key={part.toolCallId} part={part} />)}</div>{!isUser && <span className="order-1 mt-5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600"><Bot size={16} aria-hidden="true" /></span>}</article>;
}

function MarkdownMessage({ content }: { content: string }) {
  const markdown = content.replace(/<br\s*\/?>/gi, "\n");
  return <div className="break-words [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"><ReactMarkdown remarkPlugins={[remarkGfm]} components={{ h1: ({ children }) => <h1 className="mb-3 mt-5 text-xl font-bold tracking-tight text-slate-950">{children}</h1>, h2: ({ children }) => <h2 className="mb-3 mt-5 text-lg font-bold tracking-tight text-slate-950">{children}</h2>, h3: ({ children }) => <h3 className="mb-2 mt-4 text-base font-bold text-slate-900">{children}</h3>, p: ({ children }) => <p className="my-3">{children}</p>, ul: ({ children }) => <ul className="my-3 list-disc space-y-1 pl-5">{children}</ul>, ol: ({ children }) => <ol className="my-3 list-decimal space-y-1 pl-5">{children}</ol>, li: ({ children }) => <li className="pl-1">{children}</li>, strong: ({ children }) => <strong className="font-semibold text-slate-950">{children}</strong>, a: ({ children, href }) => <a href={href} target="_blank" rel="noreferrer" className="font-medium text-blue-700 underline underline-offset-2 hover:text-blue-900">{children}</a>, code: ({ children }) => <code className="rounded bg-slate-200 px-1 py-0.5 font-mono text-[0.85em] text-slate-900">{children}</code>, pre: ({ children }) => <pre className="my-3 overflow-x-auto rounded-md bg-slate-900 p-3 text-xs leading-5 text-slate-100">{children}</pre>, table: ({ children }) => <div className="my-3 overflow-x-auto"><table className="w-full min-w-max border-collapse text-left text-xs">{children}</table></div>, th: ({ children }) => <th className="border border-slate-200 bg-slate-100 px-2 py-1.5 font-semibold text-slate-900">{children}</th>, td: ({ children }) => <td className="border border-slate-200 px-2 py-1.5 align-top">{children}</td>, hr: () => <hr className="my-4 border-slate-200" /> }}>{markdown}</ReactMarkdown></div>;
}

function StudyProgressToolPart({ part }: { part: Extract<StudyFlowMessage["parts"][number], { type: "tool-analyzeStudyProgress" }> }) {
  if (part.state === "input-streaming") return <div className="mt-2 flex items-center gap-3 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800" role="status"><LoaderCircle className="animate-spin" size={18} aria-hidden="true" /><div><p className="font-semibold">Preparing your study analysis</p><p className="mt-0.5 text-xs text-blue-700">StudyFlow AI is gathering the progress details.</p></div></div>;
  if (part.state === "input-available") return <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950"><div className="flex items-center gap-2 font-semibold"><Clock3 size={17} aria-hidden="true" />Reviewing study details</div><div className="mt-3 grid grid-cols-2 gap-2 text-xs"><Detail label="Subject" value={part.input.subject} /><Detail label="Topics" value={`${part.input.completedTopics} of ${part.input.totalTopics}`} /><Detail label="Study time" value={`${part.input.hoursStudied} hours`} /></div></div>;
  if (part.state === "output-error") return <ToolErrorCard message={part.errorText} />;
  if (part.state !== "output-available" || !isStudyProgressAnalysis(part.output)) return <ToolErrorCard message="We could not read this progress result. Please try again." />;
  const output = part.output;
  return <div className="mt-2 min-w-0 rounded-xl border border-blue-100 bg-white p-4 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-blue-600">Study progress</p><h3 className="mt-1 flex items-center gap-2 text-base font-semibold text-slate-950"><BarChart3 size={18} className="text-blue-600" aria-hidden="true" />{output.subject}</h3></div><span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">{output.progressLevel}</span></div><div className="mt-4"><div className="mb-1.5 flex items-baseline justify-between"><span className="text-sm font-semibold text-slate-800">Completion</span><span className="text-lg font-bold text-slate-950">{output.completionPercentage}%</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-blue-600 transition-all duration-500" style={{ width: `${Math.max(0, Math.min(100, output.completionPercentage))}%` }} /></div></div><div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-4 text-center"><Metric label="Completed" value={`${part.input.completedTopics}/${part.input.totalTopics}`} /><Metric label="Remaining" value={`${output.remainingTopics} topics`} /><Metric label="Suggested" value={`${output.recommendedHours} hrs`} /></div><p className="mt-3 flex items-center gap-1.5 text-xs text-slate-500"><CheckCircle2 size={14} className="shrink-0 text-emerald-600" aria-hidden="true" />{output.remainingTopics === 0 ? "All topics are complete—great work!" : `${output.remainingTopics} topics left. Plan about ${output.recommendedHours} more study hours.`}</p></div>;
}

function ToolErrorCard({ message }: { message?: string }) { return <div className="mt-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-900" role="alert"><div className="flex items-center gap-2 font-semibold"><AlertCircle size={17} aria-hidden="true" />Progress analysis unavailable</div><p className="mt-2 text-xs leading-5 text-red-800">{message || "We could not calculate this progress update. Check the numbers and try again."}</p></div>; }
function isStudyProgressAnalysis(value: unknown): value is StudyProgressAnalysis { if (!value || typeof value !== "object") return false; const result = value as Record<string, unknown>; return typeof result.subject === "string" && typeof result.completionPercentage === "number" && typeof result.remainingTopics === "number" && typeof result.progressLevel === "string" && typeof result.recommendedHours === "number"; }
function Detail({ label, value }: { label: string; value: string }) { return <div className="min-w-0 rounded-md border border-amber-100 bg-white/70 px-2.5 py-2"><p className="text-amber-700">{label}</p><p className="mt-0.5 truncate font-semibold text-amber-950">{value}</p></div>; }
function Metric({ label, value }: { label: string; value: string }) { return <div className="min-w-0"><p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">{label}</p><p className="mt-1 break-words text-xs font-semibold text-slate-800">{value}</p></div>; }
function getMessageText(message: { parts: Array<{ type: string; text?: string }> }) { return message.parts.filter((part) => part.type === "text").map((part) => part.text ?? "").join(""); }
