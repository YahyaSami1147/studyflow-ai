import { AppShell } from "@/components/app-shell";
import { ArrowUpRight, BookOpen, CheckCircle2, Clock3, ListTodo } from "lucide-react";

export default function DashboardPage() {
  return (
    <AppShell>
      <header className="border-b border-[var(--line)] pb-8">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-blue-600">Today</p>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Good afternoon.</h1>
        <p className="mt-3 text-base leading-7 text-[var(--muted)]">Here&apos;s an overview of your study workspace.</p>
      </header>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Study overview">
        <Metric label="Study progress" value="68%" note="+8% this week" icon={CheckCircle2} />
        <Metric label="Tasks today" value="4" note="2 remaining" icon={ListTodo} />
        <Metric label="Upcoming assignments" value="3" note="Next due Friday" icon={BookOpen} />
        <Metric label="Study time" value="6h 20m" note="This week" icon={Clock3} />
      </section>

      <section className="mt-8 grid gap-5 lg:grid-cols-[1.25fr_1fr]">
        <DashboardPanel title="Today&apos;s tasks" action="View tasks">
          <TaskItem title="Review probability notes" meta="Mathematics · 30 min" done />
          <TaskItem title="Read chapter 6" meta="Biology · 45 min" />
          <TaskItem title="Outline essay introduction" meta="Writing seminar · 25 min" />
        </DashboardPanel>
        <DashboardPanel title="Upcoming assignments" action="View all">
          <AssignmentItem title="Problem set 04" course="Mathematics" due="Due Friday" />
          <AssignmentItem title="Lab report draft" course="Biology" due="Due Monday" />
          <AssignmentItem title="Reading response" course="History" due="Due next week" />
        </DashboardPanel>
      </section>

      <section className="mt-5 rounded-[var(--radius-card)] border border-[var(--line)] bg-white p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4"><div><h2 className="font-semibold text-slate-950">Course progress</h2><p className="mt-1 text-sm text-[var(--muted)]">A quick view of your current study rhythm.</p></div><ArrowUpRight size={18} className="text-slate-400" aria-hidden="true" /></div>
        <div className="mt-6 grid gap-5 sm:grid-cols-3"><Progress label="Mathematics" value="82%" /><Progress label="Biology" value="64%" /><Progress label="History" value="47%" /></div>
      </section>
    </AppShell>
  );
}

function Metric({ label, value, note, icon: Icon }: { label: string; value: string; note: string; icon: typeof CheckCircle2 }) {
  return <div className="rounded-[var(--radius-card)] border border-[var(--line)] bg-white p-5 transition-shadow hover:shadow-[0_8px_24px_rgba(16,24,40,0.06)]"><div className="flex items-center justify-between"><p className="text-sm text-[var(--muted)]">{label}</p><Icon size={18} strokeWidth={1.8} className="text-blue-600" aria-hidden="true" /></div><p className="mt-5 text-2xl font-semibold tracking-tight text-slate-950">{value}</p><p className="mt-1 text-xs font-medium text-[var(--success)]">{note}</p></div>;
}

function DashboardPanel({ title, action, children }: { title: string; action: string; children: React.ReactNode }) {
  return <div className="rounded-[var(--radius-card)] border border-[var(--line)] bg-white p-5 sm:p-6"><div className="flex items-center justify-between gap-4"><h2 className="font-semibold text-slate-950">{title}</h2><span className="text-xs font-semibold text-blue-600">{action}</span></div><div className="mt-5 divide-y divide-[var(--line)]">{children}</div></div>;
}

function TaskItem({ title, meta, done = false }: { title: string; meta: string; done?: boolean }) {
  return <div className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"><span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${done ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300"}`}>{done && <CheckCircle2 size={13} aria-hidden="true" />}</span><div className="min-w-0"><p className={`text-sm font-medium ${done ? "text-slate-400 line-through" : "text-slate-800"}`}>{title}</p><p className="mt-1 text-xs text-[var(--muted)]">{meta}</p></div></div>;
}

function AssignmentItem({ title, course, due }: { title: string; course: string; due: string }) {
  return <div className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"><div className="min-w-0"><p className="truncate text-sm font-medium text-slate-800">{title}</p><p className="mt-1 text-xs text-[var(--muted)]">{course}</p></div><span className="shrink-0 text-xs font-medium text-slate-500">{due}</span></div>;
}

function Progress({ label, value }: { label: string; value: string }) {
  return <div><div className="flex justify-between text-sm"><span className="font-medium text-slate-700">{label}</span><span className="text-[var(--muted)]">{value}</span></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-blue-600" style={{ width: value }} /></div></div>;
}
