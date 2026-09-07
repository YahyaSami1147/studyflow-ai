"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, ClipboardList, Gauge, GraduationCap, ListTodo } from "lucide-react";
import { useStudyFlow } from "@/providers/studyflow-provider";

export function ProgressWorkspace() {
  const {
    data,
    isHydrated,
    getOverdueTasks,
    getOverdueAssignments,
    getAssignmentsForCourse,
    getTasksForCourse,
    getCourseProgress,
    getTaskCompletionPercentage,
  } = useStudyFlow();

  if (!isHydrated) return <ProgressSkeleton />;

  const totalAssignments = data.assignments.length;
  const completedAssignments = data.assignments.filter((assignment) => assignment.status === "completed").length;
  const incompleteAssignments = totalAssignments - completedAssignments;
  const totalTasks = data.tasks.length;
  const completedTasks = data.tasks.filter((task) => task.completed).length;
  const incompleteTasks = totalTasks - completedTasks;
  const overdueTasks = getOverdueTasks().length;
  const overdueAssignments = getOverdueAssignments().length;
  const remainingWork = incompleteTasks + incompleteAssignments;
  const taskCompletion = getTaskCompletionPercentage();
  const assignmentCompletion = totalAssignments ? Math.round((completedAssignments / totalAssignments) * 100) : 0;
  const hasData = data.courses.length > 0 || totalAssignments > 0 || totalTasks > 0;

  if (!hasData) return <EmptyProgressState />;

  return (
    <>
      <header className="border-b border-[var(--line)] pb-8">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-cyan-300">Progress</p>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">Study progress</h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-slate-300">A real view of how your coursework is moving forward across courses, assignments, and tasks.</p>
      </header>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Progress overview">
        <Metric label="Task completion" value={`${taskCompletion}%`} note={`${completedTasks} of ${totalTasks} tasks complete`} icon={CheckCircle2} />
        <Metric label="Assignments" value={`${completedAssignments}/${totalAssignments || 0}`} note={`${assignmentCompletion}% complete`} icon={ClipboardList} />
        <Metric label="Courses" value={String(data.courses.length)} note={`${data.courses.length === 1 ? "Active course" : "Active courses"}`} icon={GraduationCap} />
        <Metric label="Remaining work" value={String(remainingWork)} note={`${incompleteTasks} tasks · ${incompleteAssignments} assignments`} icon={ListTodo} />
      </section>

      <section className="mt-8 grid gap-5 xl:grid-cols-2">
        <ProgressPanel title="Tasks" actionHref="/tasks" actionLabel="Open tasks">
          <div className="grid gap-3 sm:grid-cols-3">
            <StatTile label="Completed" value={String(completedTasks)} tone="success" />
            <StatTile label="Remaining" value={String(incompleteTasks)} tone="neutral" />
            <StatTile label="Overdue" value={String(overdueTasks)} tone="danger" />
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="font-medium text-slate-200">Completion</span>
              <span className="text-slate-300">{taskCompletion}%</span>
            </div>
            <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-800">
              <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500" style={{ width: `${taskCompletion}%` }} />
            </div>
          </div>
        </ProgressPanel>

        <ProgressPanel title="Assignments" actionHref="/assignments" actionLabel="Open assignments">
          <div className="grid gap-3 sm:grid-cols-2">
            <StatTile label="Completed" value={String(completedAssignments)} tone="success" />
            <StatTile label="In progress" value={String(data.assignments.filter((assignment) => assignment.status === "in-progress").length)} tone="neutral" />
            <StatTile label="Not started" value={String(data.assignments.filter((assignment) => assignment.status === "not-started").length)} tone="neutral" />
            <StatTile label="Overdue" value={String(overdueAssignments)} tone="danger" />
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="font-medium text-slate-200">Completion</span>
              <span className="text-slate-300">{assignmentCompletion}%</span>
            </div>
            <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-800">
              <div className="h-full rounded-full bg-gradient-to-r from-violet-400 to-indigo-500" style={{ width: `${assignmentCompletion}%` }} />
            </div>
          </div>
        </ProgressPanel>
      </section>

      <section className="mt-8 rounded-[var(--radius-card)] border border-[var(--line)] bg-slate-950/40 p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-semibold text-white">Course progress</h2>
            <p className="mt-1 text-sm text-slate-300">Each course reflects completed assignments and tasks from your StudyFlow data.</p>
          </div>
          <Link href="/courses" className="inline-flex items-center gap-1.5 text-sm font-semibold text-cyan-300 hover:text-cyan-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300">View courses <ArrowRight size={15} aria-hidden="true" /></Link>
        </div>

        <div className="mt-6 space-y-5">
          {data.courses.map((course) => {
            const courseAssignments = getAssignmentsForCourse(course.id);
            const courseTasks = getTasksForCourse(course.id);
            const completedAssignments = courseAssignments.filter((assignment) => assignment.status === "completed").length;
            const completedTasks = courseTasks.filter((task) => task.completed).length;
            const totalCourseWork = courseAssignments.length + courseTasks.length;
            const courseProgress = getCourseProgress(course.id);

            return (
              <div key={course.id} className="rounded-[var(--radius-card)] border border-[var(--line)] bg-slate-900/50 p-4 sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <h3 className="text-base font-semibold text-white">{course.name}</h3>
                    {course.code ? <p className="mt-1 text-xs font-medium uppercase tracking-[0.12em] text-slate-300">{course.code}</p> : null}
                  </div>
                  <span className="text-sm font-semibold text-slate-200">{courseProgress}%</span>
                </div>

                <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-700">
                  <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-500" style={{ width: `${courseProgress}%` }} />
                </div>

                <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-300">
                  <span className="rounded-full border border-[var(--line)] bg-slate-950/60 px-2.5 py-1">{completedAssignments} / {courseAssignments.length} assignments</span>
                  <span className="rounded-full border border-[var(--line)] bg-slate-950/60 px-2.5 py-1">{completedTasks} / {courseTasks.length} tasks</span>
                  {totalCourseWork === 0 ? <span className="rounded-full border border-[var(--line)] bg-slate-950/60 px-2.5 py-1">No tracked work yet</span> : null}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}

function Metric({ label, value, note, icon: Icon }: { label: string; value: string; note: string; icon: typeof CheckCircle2 }) {
  return (
    <div className="rounded-[var(--radius-card)] border border-[var(--line)] bg-slate-950/40 p-5 shadow-[0_10px_24px_rgba(2,6,23,0.2)]">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-slate-300">{label}</p>
        <Icon size={18} strokeWidth={1.8} className="text-cyan-300" aria-hidden="true" />
      </div>
      <p className="mt-5 text-2xl font-semibold tracking-tight text-white">{value}</p>
      <p className="mt-1 text-xs text-slate-300">{note}</p>
    </div>
  );
}

function ProgressPanel({ title, actionHref, actionLabel, children }: { title: string; actionHref: string; actionLabel: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[var(--radius-card)] border border-[var(--line)] bg-slate-950/40 p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-semibold text-white">{title}</h2>
        <Link href={actionHref} className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-300 hover:text-cyan-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300">{actionLabel} <ArrowRight size={13} aria-hidden="true" /></Link>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function StatTile({ label, value, tone }: { label: string; value: string; tone: "success" | "neutral" | "danger" }) {
  const toneClasses = {
    success: "border-emerald-400/20 bg-emerald-500/10 text-emerald-100 ring-1 ring-emerald-300/10",
    neutral: "border-slate-700 bg-slate-900/60 text-slate-100 ring-1 ring-slate-600/40",
    danger: "border-red-400/20 bg-red-500/10 text-red-100 ring-1 ring-red-300/10",
  };

  return (
    <div className={`rounded-md border p-3 ${toneClasses[tone]}`}>
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-current/80">{label}</p>
      <p className="mt-2 text-xl font-semibold text-white">{value}</p>
    </div>
  );
}

function EmptyProgressState() {
  return (
    <section className="rounded-[var(--radius-card)] border border-dashed border-[var(--line)] bg-slate-950/30 px-6 py-16 text-center sm:px-10">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-300">
        <Gauge size={22} aria-hidden="true" />
      </div>
      <h2 className="mt-5 text-xl font-semibold tracking-tight text-white">No progress to show yet</h2>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-300">Add a course and start completing assignments and tasks to build your StudyFlow progress.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href="/courses" className="inline-flex h-10 items-center gap-2 rounded-md bg-cyan-400 px-4 text-sm font-semibold text-slate-950 hover:bg-cyan-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300">Add course <ArrowRight size={16} aria-hidden="true" /></Link>
        <Link href="/tasks" className="inline-flex h-10 items-center rounded-md border border-[var(--line)] bg-slate-900/60 px-4 text-sm font-semibold text-white hover:bg-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300">View tasks</Link>
      </div>
    </section>
  );
}

function ProgressSkeleton() {
  return (
    <div role="status" aria-label="Loading progress" className="animate-pulse">
      <div className="h-4 w-20 rounded bg-slate-700" />
      <div className="mt-4 h-10 w-64 rounded bg-slate-700" />
      <div className="mt-3 h-5 w-96 max-w-full rounded bg-slate-700" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="h-32 rounded-[var(--radius-card)] bg-slate-700" />
        <div className="h-32 rounded-[var(--radius-card)] bg-slate-700" />
        <div className="h-32 rounded-[var(--radius-card)] bg-slate-700" />
        <div className="h-32 rounded-[var(--radius-card)] bg-slate-700" />
      </div>
      <div className="mt-8 grid gap-5 xl:grid-cols-2">
        <div className="h-56 rounded-[var(--radius-card)] bg-slate-700" />
        <div className="h-56 rounded-[var(--radius-card)] bg-slate-700" />
      </div>
    </div>
  );
}
