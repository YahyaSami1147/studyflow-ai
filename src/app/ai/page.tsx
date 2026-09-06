import { StudyFlowChat } from "@/components/ai/chat";
import { AppShell } from "@/components/app-shell";

export default function AiPage() {
  return <AppShell><header className="mb-6 border-b border-[var(--line)] pb-6"><p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-blue-600">Study companion</p><h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">StudyFlow AI</h1><p className="mt-2 text-base leading-7 text-[var(--muted)]">Your personal AI study assistant.</p></header><StudyFlowChat /></AppShell>;
}