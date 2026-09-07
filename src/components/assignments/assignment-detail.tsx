"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { ArrowLeft, CalendarDays, Clock3, Pencil, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Modal } from "@/components/modal";
import { AssignmentForm } from "@/components/assignments/assignment-form";
import { formatAssignmentStatus, formatDueDate, formatPriority } from "@/lib/studyflow-format";
import { useStudyFlow } from "@/providers/studyflow-provider";
import type { NewAssignment } from "@/types/studyflow";

export function AssignmentDetail({ assignmentId }: { assignmentId: string }) {
  const router = useRouter();
  const { data, isHydrated, getAssignmentById, getCourseById, updateAssignment, deleteAssignment } = useStudyFlow();
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const deleteButtonRef = useRef<HTMLButtonElement>(null);

  if (!isHydrated) return <DetailSkeleton label="Loading assignment" />;
  const assignment = getAssignmentById(assignmentId);
  if (!assignment) return <NotFoundState />;
  const currentAssignmentId = assignment.id;
  const course = getCourseById(assignment.courseId);

  function handleUpdate(input: NewAssignment) {
    updateAssignment(currentAssignmentId, input);
    setEditing(false);
  }

  function handleDelete() {
    deleteAssignment(currentAssignmentId);
    setDeleting(false);
    router.push("/assignments");
  }

  return <>
    <Link href="/assignments" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"><ArrowLeft size={16} aria-hidden="true" />Back to assignments</Link>
    <header className="mt-6 border-b border-[var(--line)] pb-8"><div className="flex flex-wrap items-start justify-between gap-5"><div className="min-w-0"><p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-blue-600">Assignment detail</p><p className="text-sm font-semibold text-blue-700">{course?.name ?? "Course unavailable"}</p><h1 className="mt-2 break-words text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">{assignment.title}</h1></div><div className="flex flex-wrap gap-2"><button type="button" onClick={() => setEditing(true)} className="inline-flex h-10 items-center gap-2 rounded-md border border-[var(--line)] bg-white px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"><Pencil size={15} aria-hidden="true" />Edit</button><button ref={deleteButtonRef} type="button" onClick={() => setDeleting(true)} className="inline-flex h-10 items-center gap-2 rounded-md border border-red-200 bg-white px-3 text-sm font-semibold text-red-700 hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"><Trash2 size={15} aria-hidden="true" />Delete</button></div></div></header>
    <section className="mt-8 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]"><div className="rounded-[var(--radius-card)] border border-[var(--line)] bg-white p-5 sm:p-6"><h2 className="font-semibold text-slate-950">Assignment details</h2><div className="mt-5 flex flex-wrap gap-2"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${assignment.status === "completed" ? "bg-emerald-50 text-emerald-800" : assignment.status === "in-progress" ? "bg-blue-50 text-blue-800" : "bg-slate-100 text-slate-700"}`}>{formatAssignmentStatus(assignment.status)}</span><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${assignment.priority === "high" ? "bg-red-50 text-red-800" : assignment.priority === "low" ? "bg-slate-100 text-slate-700" : "bg-amber-50 text-amber-800"}`}>{formatPriority(assignment.priority)} priority</span></div>{assignment.description ? <p className="mt-6 whitespace-pre-wrap text-sm leading-7 text-slate-700">{assignment.description}</p> : <p className="mt-6 rounded-md bg-slate-50 px-4 py-4 text-sm leading-6 text-[var(--muted)]">No description added yet.</p>}</div><div className="rounded-[var(--radius-card)] border border-[var(--line)] bg-white p-5 sm:p-6"><h2 className="font-semibold text-slate-950">Schedule</h2><dl className="mt-5 divide-y divide-[var(--line)]"><InfoRow icon={CalendarDays} label="Due date" value={formatDueDate(assignment.dueDate)} /><InfoRow icon={Clock3} label="Estimated time" value={assignment.estimatedMinutes ? `${assignment.estimatedMinutes} minutes` : "Not estimated"} /><InfoRow icon={CalendarDays} label="Last updated" value={new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(assignment.updatedAt))} /></dl></div></section>
    <Modal open={editing} title={`Edit ${assignment.title}`} onClose={() => setEditing(false)}><p className="-mt-4 mb-6 text-sm leading-6 text-[var(--muted)]">Update the details and deadline for this assignment.</p><AssignmentForm courses={data.courses} initialAssignment={assignment} onSubmit={handleUpdate} onCancel={() => setEditing(false)} /></Modal>
    <ConfirmDialog open={deleting} title={`Delete ${assignment.title}?`} description="This will also remove tasks linked to this assignment. This action cannot be undone." confirmLabel="Delete assignment" onCancel={() => setDeleting(false)} onConfirm={handleDelete} returnFocusRef={deleteButtonRef} />
  </>;
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof CalendarDays; label: string; value: string }) { return <div className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"><Icon size={16} className="shrink-0 text-blue-600" aria-hidden="true" /><dt className="text-sm text-[var(--muted)]">{label}</dt><dd className="ml-auto text-right text-sm font-medium text-slate-800">{value}</dd></div>; }
function NotFoundState() { return <section className="rounded-[var(--radius-card)] border border-dashed border-slate-300 bg-white px-6 py-16 text-center"><h1 className="text-2xl font-semibold tracking-tight text-slate-950">Assignment not found</h1><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--muted)]">This assignment may have been deleted or the link is invalid.</p><Link href="/assignments" className="mt-6 inline-flex h-10 items-center rounded-md bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">Back to assignments</Link></section>; }
function DetailSkeleton({ label }: { label: string }) { return <div role="status" aria-label={label} className="animate-pulse"><div className="h-4 w-32 rounded bg-slate-200" /><div className="mt-8 h-12 w-80 max-w-full rounded bg-slate-200" /><div className="mt-10 grid gap-5 lg:grid-cols-2"><div className="h-64 rounded-[var(--radius-card)] bg-slate-200" /><div className="h-64 rounded-[var(--radius-card)] bg-slate-200" /></div></div>; }
