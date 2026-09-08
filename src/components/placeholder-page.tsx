import { AppShell } from "@/components/app-shell";
import { Inbox } from "lucide-react";

export function PlaceholderPage({ title, description, eyebrow = "Workspace" }: { title: string; description: string; eyebrow?: string }) {
  return (
    <AppShell>
      <div className="border-b border-[var(--line)] pb-8">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-blue-600">{eyebrow}</p>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">{title}</h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted)]">{description}</p>
      </div>
      <section className="mt-8 flex flex-col items-center rounded-[var(--radius-card)] border border-dashed border-slate-300 bg-white px-6 py-16 text-center sm:px-10" aria-label={`${title} empty state`}>
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
          <Inbox size={22} strokeWidth={1.8} aria-hidden="true" />
        </span>
        <h2 className="mt-5 text-lg font-semibold text-slate-950">No {title.toLowerCase()} yet</h2>
        <p className="mx-auto mt-2 w-full max-w-sm text-center text-sm leading-6 text-[var(--muted)]">Your {title.toLowerCase()} workspace will appear here when the core build is ready.</p>
      </section>
    </AppShell>
  );
}
