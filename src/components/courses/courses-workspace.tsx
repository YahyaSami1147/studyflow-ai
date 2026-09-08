"use client";

import { useRef, useState } from "react";
import { Plus, Search } from "lucide-react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { FeedbackMessage } from "@/components/feedback-message";
import { Modal } from "@/components/modal";
import { CourseCard } from "@/components/courses/course-card";
import { CourseForm } from "@/components/courses/course-form";
import { useStudyFlow } from "@/providers/studyflow-provider";
import type { Course, NewCourse } from "@/types/studyflow";

export function CoursesWorkspace() {
  const { data, isHydrated, addCourse, updateCourse, deleteCourse, getAssignmentsForCourse, getUpcomingAssignmentsForCourse, getCourseProgress } = useStudyFlow();
  const [formOpen, setFormOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course>();
  const [deletingCourse, setDeletingCourse] = useState<Course>();
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");
  const deleteButtonRef = useRef<HTMLButtonElement>(null);

  if (!isHydrated) return <WorkspaceSkeleton label="Loading courses" />;

  const courses = data.courses.filter((course) => {
    const search = query.trim().toLowerCase();
    return !search || [course.name, course.code, course.instructor, course.semester].some((value) => value?.toLowerCase().includes(search));
  });

  function openCreate() {
    setEditingCourse(undefined);
    setFormOpen(true);
  }

  function openEdit(course: Course) {
    setEditingCourse(course);
    setFormOpen(true);
  }

  function handleSubmit(input: NewCourse) {
    if (editingCourse) {
      updateCourse(editingCourse.id, input);
      setNotice(`${input.name} was updated.`);
    } else {
      addCourse(input);
      setNotice(`${input.name} was added.`);
    }
    setFormOpen(false);
  }

  function handleDelete() {
    if (!deletingCourse) return;
    deleteCourse(deletingCourse.id);
    setNotice(`${deletingCourse.name} and its related study items were deleted.`);
    setDeletingCourse(undefined);
  }

  return <>
    <header className="border-b border-[var(--line)] pb-8"><div className="flex flex-wrap items-end justify-between gap-5"><div><p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-blue-600">Workspace</p><h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Courses</h1><p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted)]">Keep your subjects, deadlines, and study progress in one place.</p></div><button type="button" onClick={openCreate} className="inline-flex h-11 items-center gap-2 rounded-md bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"><Plus size={17} aria-hidden="true" />Add course</button></div></header>
    {notice && <div className="mt-5"><FeedbackMessage variant="success">{notice}</FeedbackMessage></div>}
    {data.courses.length > 0 && <div className="mt-6 flex flex-wrap items-center justify-between gap-3"><label className="relative block min-w-[min(100%,20rem)] flex-1 sm:max-w-sm"><Search size={16} className="pointer-events-none absolute left-3 top-3 text-slate-400" aria-hidden="true" /><span className="sr-only">Search courses</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search courses" className="h-10 w-full rounded-md border border-[var(--line)] bg-white pl-9 pr-3 text-sm outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></label><p className="text-sm text-[var(--muted)]">{courses.length} of {data.courses.length} {data.courses.length === 1 ? "course" : "courses"}</p></div>}
    {data.courses.length === 0 ? <EmptyCourses onAdd={openCreate} /> : courses.length === 0 ? <div className="mt-8 rounded-[var(--radius-card)] border border-dashed border-slate-300 bg-white px-6 py-14 text-center"><h2 className="text-lg font-semibold text-slate-950">No courses match that search</h2><p className="mt-2 text-sm text-[var(--muted)]">Try a different name, code, instructor, or semester.</p></div> : <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{courses.map((course) => <CourseCard key={course.id} course={course} assignmentCount={getAssignmentsForCourse(course.id).length} upcomingCount={getUpcomingAssignmentsForCourse(course.id).length} progress={getCourseProgress(course.id)} onEdit={() => openEdit(course)} onDelete={(button) => { deleteButtonRef.current = button; setDeletingCourse(course); }} />)}</div>}
    {formOpen ? <Modal open title={editingCourse ? `Update ${editingCourse.name}` : "Add a course"} onClose={() => setFormOpen(false)}><p className="-mt-4 mb-6 text-sm leading-6 text-[var(--muted)]">{editingCourse ? "Keep the details current so your workspace stays useful." : "Start with a subject you want to organize."}</p><CourseForm key={editingCourse?.id ?? "new"} initialCourse={editingCourse} onSubmit={handleSubmit} onCancel={() => setFormOpen(false)} /></Modal> : null}
    <ConfirmDialog open={Boolean(deletingCourse)} title={`Delete ${deletingCourse?.name ?? "this course"}?`} description="This will also remove its assignments, course-linked notes, and tasks connected to the course or those assignments. This action cannot be undone." confirmLabel="Delete course" onCancel={() => setDeletingCourse(undefined)} onConfirm={handleDelete} returnFocusRef={deleteButtonRef} />
  </>;
}

function EmptyCourses({ onAdd }: { onAdd: () => void }) { return <section className="mt-8 flex flex-col items-center rounded-[var(--radius-card)] border border-dashed border-slate-300 bg-white px-6 py-16 text-center sm:px-10"><div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600"><Plus size={22} aria-hidden="true" /></div><h2 className="mt-5 text-xl font-semibold tracking-tight text-slate-950">No courses yet</h2><p className="mx-auto mt-2 w-full max-w-md text-center text-sm leading-6 text-[var(--muted)]">Add your subjects to organize assignments and track your study progress.</p><button type="button" onClick={onAdd} className="mt-6 inline-flex h-10 items-center gap-2 rounded-md bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"><Plus size={16} aria-hidden="true" />Add your first course</button></section>; }
function WorkspaceSkeleton({ label }: { label: string }) { return <div role="status" aria-label={label} className="animate-pulse"><div className="h-4 w-24 rounded bg-slate-200" /><div className="mt-4 h-10 w-64 rounded bg-slate-200" /><div className="mt-3 h-5 w-96 max-w-full rounded bg-slate-200" /><div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3"><div className="h-72 rounded-[var(--radius-card)] bg-slate-200" /><div className="h-72 rounded-[var(--radius-card)] bg-slate-200" /></div></div>; }
