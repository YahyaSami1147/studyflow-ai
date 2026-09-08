"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { ClipboardList, Plus } from "lucide-react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { FeedbackMessage } from "@/components/feedback-message";
import { Modal } from "@/components/modal";
import { AssignmentCard } from "@/components/assignments/assignment-card";
import { AssignmentForm } from "@/components/assignments/assignment-form";
import { useStudyFlow } from "@/providers/studyflow-provider";
import type { Assignment, NewAssignment } from "@/types/studyflow";

type AssignmentGroup = { key: string; title: string; description: string; assignments: Assignment[] };

export function AssignmentsWorkspace() {
  const { data, isHydrated, addAssignment, updateAssignment, deleteAssignment, getCourseById, getOverdueAssignments, getAssignmentsDueToday, getUpcomingAssignments } = useStudyFlow();
  const [formOpen, setFormOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment>();
  const [deletingAssignment, setDeletingAssignment] = useState<Assignment>();
  const [filter, setFilter] = useState<"all" | "open" | "completed">("all");
  const [notice, setNotice] = useState("");
  const deleteButtonRef = useRef<HTMLButtonElement>(null);

  if (!isHydrated) return <WorkspaceSkeleton label="Loading assignments" />;

  const visibleAssignments = filter === "completed" ? data.assignments.filter((assignment) => assignment.status === "completed") : filter === "open" ? data.assignments.filter((assignment) => assignment.status !== "completed") : data.assignments;
  const visibleIds = new Set(visibleAssignments.map((assignment) => assignment.id));
  const overdue = getOverdueAssignments().filter((assignment) => visibleIds.has(assignment.id));
  const dueToday = getAssignmentsDueToday().filter((assignment) => visibleIds.has(assignment.id));
  const upcoming = getUpcomingAssignments().filter((assignment) => visibleIds.has(assignment.id) && !dueToday.some((item) => item.id === assignment.id));
  const completed = visibleAssignments.filter((assignment) => assignment.status === "completed");
  const groups: AssignmentGroup[] = [{ key: "overdue", title: "Overdue", description: "Open work that needs attention.", assignments: overdue }, { key: "today", title: "Due today", description: "Assignments on today’s schedule.", assignments: dueToday }, { key: "upcoming", title: "Upcoming", description: "Open work with a future due date.", assignments: upcoming }, { key: "completed", title: "Completed", description: "Finished assignments.", assignments: completed }].filter((group) => group.assignments.length > 0);

  function openCreate() { setEditingAssignment(undefined); setFormOpen(true); }
  function openEdit(assignment: Assignment) { setEditingAssignment(assignment); setFormOpen(true); }
  function handleSubmit(input: NewAssignment) {
    if (editingAssignment) { updateAssignment(editingAssignment.id, input); setNotice(`${input.title} was updated.`); } else { addAssignment(input); setNotice(`${input.title} was added.`); }
    setFormOpen(false);
  }
  function handleDelete() {
    if (!deletingAssignment) return;
    deleteAssignment(deletingAssignment.id);
    setNotice(`${deletingAssignment.title} and its linked study tasks were deleted.`);
    setDeletingAssignment(undefined);
  }

  return <>
    <header className="border-b border-[var(--line)] pb-8"><div className="flex flex-wrap items-end justify-between gap-5"><div><p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-blue-600">Workspace</p><h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Assignments</h1><p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted)]">Keep deadlines visible and make the next piece of coursework easier to start.</p></div><button type="button" onClick={openCreate} disabled={data.courses.length === 0} className="inline-flex h-11 items-center gap-2 rounded-md bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"><Plus size={17} aria-hidden="true" />Add assignment</button></div></header>
    {notice && <div className="mt-5"><FeedbackMessage variant="success">{notice}</FeedbackMessage></div>}
    {data.courses.length === 0 ? <NoCourseState /> : data.assignments.length === 0 ? <EmptyAssignments onAdd={openCreate} /> : <><div className="mt-6 flex flex-wrap items-center gap-2" aria-label="Assignment filters"><span className="mr-1 text-sm font-semibold text-slate-700">Show</span>{(["all", "open", "completed"] as const).map((value) => <button key={value} type="button" onClick={() => setFilter(value)} aria-pressed={filter === value} className={`rounded-md px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${filter === value ? "bg-blue-600 text-white" : "border border-[var(--line)] bg-white text-slate-600 hover:bg-slate-50"}`}>{value === "all" ? "All" : value === "open" ? "Open" : "Completed"}</button>)}<span className="ml-auto text-sm text-[var(--muted)]">{visibleAssignments.length} {visibleAssignments.length === 1 ? "assignment" : "assignments"}</span></div>{groups.length === 0 ? <div className="mt-8 rounded-[var(--radius-card)] border border-dashed border-slate-300 bg-white px-6 py-14 text-center"><h2 className="text-lg font-semibold text-slate-950">Nothing here yet</h2><p className="mt-2 text-sm text-[var(--muted)]">Try another assignment filter.</p></div> : <div className="mt-8 space-y-10">{groups.map((group) => <section key={group.key} aria-labelledby={`assignment-group-${group.key}`}><div className="mb-4"><h2 id={`assignment-group-${group.key}`} className="text-lg font-semibold text-slate-950">{group.title}</h2><p className="mt-1 text-sm text-[var(--muted)]">{group.description}</p></div><div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{group.assignments.map((assignment) => <AssignmentCard key={assignment.id} assignment={assignment} course={getCourseById(assignment.courseId)} onEdit={() => openEdit(assignment)} onDelete={(button) => { deleteButtonRef.current = button; setDeletingAssignment(assignment); }} />)}</div></section>)}</div>}</>}
    <Modal open={formOpen} title={editingAssignment ? `Update ${editingAssignment.title}` : "Add an assignment"} onClose={() => setFormOpen(false)}><p className="-mt-4 mb-6 text-sm leading-6 text-[var(--muted)]">Keep the deadline and next step close at hand.</p><AssignmentForm key={editingAssignment?.id ?? "new"} courses={data.courses} initialAssignment={editingAssignment} onSubmit={handleSubmit} onCancel={() => setFormOpen(false)} /></Modal>
    <ConfirmDialog open={Boolean(deletingAssignment)} title={`Delete ${deletingAssignment?.title ?? "this assignment"}?`} description="This will also remove tasks linked to this assignment. This action cannot be undone." confirmLabel="Delete assignment" onCancel={() => setDeletingAssignment(undefined)} onConfirm={handleDelete} returnFocusRef={deleteButtonRef} />
  </>;
}

function NoCourseState() { return <section className="mt-8 rounded-[var(--radius-card)] border border-dashed border-slate-300 bg-white px-6 py-16 text-center sm:px-10"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-700"><ClipboardList size={22} aria-hidden="true" /></div><h2 className="mt-5 text-xl font-semibold tracking-tight text-slate-950">Create a course first</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--muted)]">Assignments belong to courses. Add your first course before creating an assignment.</p><Link href="/courses" className="mt-6 inline-flex h-10 items-center rounded-md bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">Go to courses</Link></section>; }
function EmptyAssignments({ onAdd }: { onAdd: () => void }) { return <section className="mt-8 flex flex-col items-center rounded-[var(--radius-card)] border border-dashed border-slate-300 bg-white px-6 py-16 text-center sm:px-10"><div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600"><Plus size={22} aria-hidden="true" /></div><h2 className="mt-5 text-xl font-semibold tracking-tight text-slate-950">No assignments yet</h2><p className="mt-2 w-full max-w-lg text-center text-sm leading-6 text-[var(--muted)]">Add a deadline to turn your course list into a clear next step.</p><button type="button" onClick={onAdd} className="mt-6 inline-flex h-10 items-center gap-2 rounded-md bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"><Plus size={16} aria-hidden="true" />Add your first assignment</button></section>; }
function WorkspaceSkeleton({ label }: { label: string }) { return <div role="status" aria-label={label} className="animate-pulse"><div className="h-4 w-24 rounded bg-slate-200" /><div className="mt-4 h-10 w-72 rounded bg-slate-200" /><div className="mt-3 h-5 w-96 max-w-full rounded bg-slate-200" /><div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3"><div className="h-64 rounded-[var(--radius-card)] bg-slate-200" /><div className="h-64 rounded-[var(--radius-card)] bg-slate-200" /></div></div>; }
