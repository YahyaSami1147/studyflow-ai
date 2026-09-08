"use client";

import { useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { FeedbackMessage } from "@/components/feedback-message";
import { useStudyFlow } from "@/providers/studyflow-provider";

export function SettingsWorkspace() {
  const { data, isHydrated, updateSettings, resetStudyFlowData } = useStudyFlow();
  const [status, setStatus] = useState("");
  const [resetOpen, setResetOpen] = useState(false);
  const resetButtonRef = useRef<HTMLButtonElement>(null);

  if (!isHydrated) return <SettingsSkeleton />;

  function handleWeekChange(value: string) {
    const nextValue = Number(value) as 0 | 1;
    updateSettings({ weekStartsOn: nextValue });
    setStatus("Calendar week setting saved.");
  }

  function handlePriorityChange(value: string) {
    updateSettings({ defaultTaskPriority: value as "low" | "medium" | "high" });
    setStatus("Default task priority saved.");
  }

  function handleResetConfirm() {
    resetStudyFlowData();
    setResetOpen(false);
    setStatus("StudyFlow data reset.");
  }

  return (
    <>
      <header className="border-b border-[var(--line)] pb-8">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-cyan-300">Settings</p>
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Workspace settings</h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-slate-300">Keep your local StudyFlow preferences aligned with the way you plan, track, and complete work.</p>
      </header>

      <section className="mt-8 space-y-6">
        <div className="rounded-[var(--radius-card)] border border-[var(--line)] bg-white p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-slate-950">Calendar</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="setting-week-start" className="mb-2 block text-sm font-semibold text-slate-800">Week starts on</label>
              <select id="setting-week-start" value={String(data.settings.weekStartsOn)} onChange={(event) => handleWeekChange(event.target.value)} className="h-11 w-full rounded-md border border-[var(--line)] bg-white px-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
                <option value="0">Sunday</option>
                <option value="1">Monday</option>
              </select>
            </div>
          </div>
        </div>

        <div className="rounded-[var(--radius-card)] border border-[var(--line)] bg-white p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-slate-950">Task defaults</h2>
          <div className="mt-5 max-w-md">
            <label htmlFor="setting-default-priority" className="mb-2 block text-sm font-semibold text-slate-800">Default priority for new tasks</label>
            <select id="setting-default-priority" value={data.settings.defaultTaskPriority} onChange={(event) => handlePriorityChange(event.target.value)} className="h-11 w-full rounded-md border border-[var(--line)] bg-white px-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        <div className="rounded-[var(--radius-card)] border border-[var(--line)] bg-white p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-slate-950">Theme</h2>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">A dark/light theme toggle is intentionally not exposed in this Phase because the app does not yet have a complete theme implementation that changes the full interface reliably.</p>
        </div>

        <div className="rounded-[var(--radius-card)] border border-[var(--line)] bg-white p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Data</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">Reset all local StudyFlow data stored in this browser.</p>
            </div>
            <button ref={resetButtonRef} type="button" onClick={() => setResetOpen(true)} className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-red-400/30 bg-red-500/10 px-4 text-sm font-semibold text-red-200 hover:bg-red-500/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-300"><RotateCcw size={15} aria-hidden="true" />Reset StudyFlow data</button>
          </div>
        </div>
      </section>

      {status ? <div className="mt-6"><FeedbackMessage variant="success">{status}</FeedbackMessage></div> : null}

      <ConfirmDialog
        open={resetOpen}
        title="Reset all StudyFlow data?"
        description="This permanently removes your courses, assignments, tasks, notes, profile information, and preferences from this browser. This action cannot be undone."
        confirmLabel="Reset data"
        onCancel={() => setResetOpen(false)}
        onConfirm={handleResetConfirm}
        returnFocusRef={resetButtonRef}
      />
    </>
  );
}

function SettingsSkeleton() {
  return (
    <div role="status" aria-label="Loading settings" className="animate-pulse">
      <div className="h-4 w-20 rounded bg-slate-200" />
      <div className="mt-4 h-10 w-64 rounded bg-slate-200" />
      <div className="mt-3 h-5 w-96 max-w-full rounded bg-slate-200" />
      <div className="mt-8 space-y-6">
        <div className="h-40 rounded-[var(--radius-card)] bg-slate-200" />
        <div className="h-40 rounded-[var(--radius-card)] bg-slate-200" />
        <div className="h-32 rounded-[var(--radius-card)] bg-slate-200" />
      </div>
    </div>
  );
}
