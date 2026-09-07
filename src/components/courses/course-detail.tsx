"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, BookOpen, CalendarDays, Pencil, Plus, Trash2, UserRound } from "lucide-react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Modal } from "@/components/modal";
import { CourseForm } from "@/components/courses/course-form";
import { formatAssignmentStatus, formatDueDate } from "@/lib/studyflow-format";
import { useStudyFlow } from "@/providers/studyflow-provider";
import type { NewCourse } from "@/types/studyflow";

export function CourseDetail({ courseId }: { courseId: string }) {
  const router = useRouter();
  const { isHydrated, getCourseById, getAssignmentsForCourse, getUpcomingAssignmentsForCourse, getCourseProgress, updateCourse, deleteCourse } = useStudyFlow();
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const deleteButtonRef = useRef<HTMLButtonElement>(null);

  if (!isHydrated) return <DetailSkeleton label="Loading course" />;
  const course = getCourseById(courseId);
  if (!course) return <NotFoundState />;
  const currentCourseId = course.id;

  const assignments = getAssignmentsForCourse(course.id);
  const upcoming = getUpcomingAssignmentsForCourse(course.id);

  function handleUpdate(input: NewCourse) {
    updateCourse(currentCourseId, input);
    setEditing(false);
  }

  function handleDelete() {
    deleteCourse(currentCourseId);
    setDeleting(false);
    router.push("/courses");
  }

  return <>
    <Link href="/courses" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"><ArrowLeft size={16} aria-hidden="true" />Back to courses</Link>
    <header className="mt-6 border-b border-[var(--line)] pb-8"><div className="flex flex-wrap items-start justify-between gap-5"><div className="min-w-0"><p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-blue-600">Course detail</p><div className="flex items-start gap-3"><span className="mt-2 h-4 w-4 shrink-0 rounded-full" style={{ backgroundColor: course.color ?? "var(--brand)" }} aria-hidden="true" /><div><h1 className="break-words text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">{course.name}</h1><p className="mt-2 text-base text-[var(--muted)]">{course.code || "Course workspace"}</p></div></div></div><div className="flex flex-wrap gap-2"><button type="button" onClick={() => setEditing(true)} className="inline-flex h-10 items-center gap-2 rounded-md border border-[var(--line)] bg-white px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"><Pencil size={15} aria-hidden="true" />Edit course</button><button ref={deleteButtonRef} type="button" onClick={() => setDeleting(true)} className="inline-flex h-10 items-center gap-2 rounded-md border border-red-200 bg-white px-3 text-sm font-semibold text-red-700 hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"><Trash2 size={15} aria-hidden="true" />Delete</button></div></div>{course.description && <p className="mt-5 max-w-2xl whitespace-pre-wrap text-base leading-7 text-[var(--muted)]">{course.description}</p>}</header>
    <section className="mt-8 grid gap-4 sm:grid-cols-3" aria-label="Course overview"><Metric label="Progress" value={`${getCourseProgress(course.id)}%`} /><Metric label="Assignments" value={String(assignments.length)} /><Metric label="Upcoming" value={String(upcoming.length)} /></section>
    <section className="mt-8 grid gap-5 lg:grid-cols-[1fr_1.2fr]"><div className="rounded-[var(--radius-card)] border border-[var(--line)] bg-white p-5 sm:p-6"><h2 className="font-semibold text-slate-950">Course details</h2><dl className="mt-5 divide-y divide-[var(--line)]">{course.instructor && <DetailRow icon={UserRound} label="Instructor" value={course.instructor} />}{course.semester && <DetailRow icon={CalendarDays} label="Semester" value={course.semester} />}<DetailRow icon={BookOpen} label="Created" value={new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(course.createdAt))} /></dl></div><div className="rounded-[var(--radius-card)] border border-[var(--line)] bg-white p-5 sm:p-6"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-semibold text-slate-950">Upcoming assignments</h2><p className="mt-1 text-sm text-[var(--muted)]">Deadlines connected to this course.</p></div><Link href="/assignments" className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700 hover:text-blue-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"><Plus size={15} aria-hidden="true" />Add assignment</Link></div>{upcoming.length === 0 ? <p className="mt-6 rounded-md bg-slate-50 px-4 py-5 text-sm leading-6 text-[var(--muted)]">No upcoming assignments yet. Add one when you have a deadline to track.</p> : <div className="mt-5 divide-y divide-[var(--line)]">{upcoming.map((assignment) => <Link key={assignment.id} href={`/assignments/${assignment.id}`} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"><div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-800">{assignment.title}</p><p className="mt-1 text-xs text-[var(--muted)]">{formatDueDate(assignment.dueDate)} · {formatAssignmentStatus(assignment.status)}</p></div><ArrowRight size={16} className="shrink-0 text-slate-400" aria-hidden="true" /></Link>)}</div>}</div></section>
    <Modal open={editing} title={`Edit ${course.name}`} onClose={() => setEditing(false)}><p className="-mt-4 mb-6 text-sm leading-6 text-[var(--muted)]">Update the details for this course.</p><CourseForm initialCourse={course} onSubmit={handleUpdate} onCancel={() => setEditing(false)} /></Modal>
    <ConfirmDialog open={deleting} title={`Delete ${course.name}?`} description="This will also remove the course's assignments, course-linked notes, and tasks connected to the course or those assignments. This action cannot be undone." confirmLabel="Delete course" onCancel={() => setDeleting(false)} onConfirm={handleDelete} returnFocusRef={deleteButtonRef} />
  </>;
}

function Metric({ label, value }: { label: string; value: string }) { return <div className="rounded-[var(--radius-card)] border border-[var(--line)] bg-white p-5"><p className="text-sm text-[var(--muted)]">{label}</p><p className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">{value}</p></div>; }
function DetailRow({ icon: Icon, label, value }: { icon: typeof UserRound; label: string; value: string }) { return <div className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"><Icon size={16} className="shrink-0 text-blue-600" aria-hidden="true" /><dt className="text-sm text-[var(--muted)]">{label}</dt><dd className="ml-auto text-right text-sm font-medium text-slate-800">{value}</dd></div>; }
function NotFoundState() { return <section className="rounded-[var(--radius-card)] border border-dashed border-slate-300 bg-white px-6 py-16 text-center"><h1 className="text-2xl font-semibold tracking-tight text-slate-950">Course not found</h1><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--muted)]">This course may have been deleted or the link is invalid.</p><Link href="/courses" className="mt-6 inline-flex h-10 items-center rounded-md bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">Back to courses</Link></section>; }
function DetailSkeleton({ label }: { label: string }) { return <div role="status" aria-label={label} className="animate-pulse"><div className="h-4 w-28 rounded bg-slate-200" /><div className="mt-8 h-12 w-80 max-w-full rounded bg-slate-200" /><div className="mt-4 h-5 w-56 rounded bg-slate-200" /><div className="mt-10 grid gap-5 lg:grid-cols-2"><div className="h-64 rounded-[var(--radius-card)] bg-slate-200" /><div className="h-64 rounded-[var(--radius-card)] bg-slate-200" /></div></div>; }
