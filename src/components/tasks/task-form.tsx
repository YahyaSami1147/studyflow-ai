"use client";

import { useState, type FormEvent } from "react";
import { FeedbackMessage } from "@/components/feedback-message";
import { PRIORITY_OPTIONS, toDateInputValue, toStoredDate } from "@/lib/studyflow-format";
import type { Assignment, Course, NewTask, Priority, Task } from "@/types/studyflow";

type TaskFormProps = {
  courses: Course[];
  assignments: Assignment[];
  defaultPriority: Priority;
  initialTask?: Task;
  onSubmit: (task: NewTask) => void;
  onCancel: () => void;
};

export function TaskForm({ courses, assignments, defaultPriority, initialTask, onSubmit, onCancel }: TaskFormProps) {
  const [title, setTitle] = useState(initialTask?.title ?? "");
  const [description, setDescription] = useState(initialTask?.description ?? "");
  const [courseId, setCourseId] = useState(initialTask?.courseId ?? "");
  const [assignmentId, setAssignmentId] = useState(initialTask?.assignmentId ?? "");
  const [dueDate, setDueDate] = useState(toDateInputValue(initialTask?.dueDate));
  const [priority, setPriority] = useState<Priority>(initialTask?.priority ?? defaultPriority);
  const [error, setError] = useState("");

  const availableAssignments = courseId ? assignments.filter((assignment) => assignment.courseId === courseId) : [];

  function handleCourseChange(nextCourseId: string) {
    setCourseId(nextCourseId);
    if (assignmentId && !assignments.some((assignment) => assignment.id === assignmentId && assignment.courseId === nextCourseId)) setAssignmentId("");
  }

  function handleAssignmentChange(nextAssignmentId: string) {
    setAssignmentId(nextAssignmentId);
    const assignment = assignments.find((item) => item.id === nextAssignmentId);
    if (assignment) setCourseId(assignment.courseId);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return setError("Enter a task title to continue.");
    if (courseId && !courses.some((course) => course.id === courseId)) return setError("That course is no longer available. Choose another course.");
    const assignment = assignmentId ? assignments.find((item) => item.id === assignmentId) : undefined;
    if (assignmentId && !assignment) return setError("That assignment is no longer available. Choose another assignment.");
    if (assignment && assignment.courseId !== courseId) return setError("The selected assignment does not belong to that course.");
    if (dueDate && Number.isNaN(new Date(`${dueDate}T12:00:00`).getTime())) return setError("Choose a valid due date.");

    setError("");
    try {
      onSubmit({ title: trimmedTitle, description: description.trim() || undefined, courseId: courseId || undefined, assignmentId: assignmentId || undefined, dueDate: dueDate ? toStoredDate(dueDate) : undefined, priority, completed: initialTask?.completed ?? false });
    } catch {
      setError("This task could not be saved. Check the selected course and assignment.");
    }
  }

  return <form onSubmit={handleSubmit} noValidate className="space-y-5">
    <div><label htmlFor="task-title" className="mb-2 block text-sm font-semibold text-slate-800">Title <span className="text-red-700">*</span></label><input id="task-title" value={title} onChange={(event) => { setTitle(event.target.value); if (error) setError(""); }} autoFocus required placeholder="e.g. Review chapter 4" className="h-11 w-full rounded-md border border-[var(--line)] bg-white px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></div>
    <div className="grid gap-5 sm:grid-cols-2"><div><label htmlFor="task-course" className="mb-2 block text-sm font-semibold text-slate-800">Course</label><select id="task-course" value={courseId} onChange={(event) => handleCourseChange(event.target.value)} className="h-11 w-full rounded-md border border-[var(--line)] bg-white px-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"><option value="">No course</option>{courses.map((course) => <option key={course.id} value={course.id}>{course.name}{course.code ? ` · ${course.code}` : ""}</option>)}</select></div><div><label htmlFor="task-assignment" className="mb-2 block text-sm font-semibold text-slate-800">Assignment</label><select id="task-assignment" value={assignmentId} onChange={(event) => handleAssignmentChange(event.target.value)} disabled={!courseId || availableAssignments.length === 0} className="h-11 w-full rounded-md border border-[var(--line)] bg-white px-3 text-sm text-slate-900 outline-none disabled:cursor-not-allowed disabled:bg-slate-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"><option value="">{courseId ? availableAssignments.length ? "No assignment" : "No assignments for course" : "Choose a course first"}</option>{availableAssignments.map((assignment) => <option key={assignment.id} value={assignment.id}>{assignment.title}</option>)}</select></div></div>
    <div className="grid gap-5 sm:grid-cols-2"><div><label htmlFor="task-due-date" className="mb-2 block text-sm font-semibold text-slate-800">Due date</label><input id="task-due-date" type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} className="h-11 w-full rounded-md border border-[var(--line)] bg-white px-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></div><div><label htmlFor="task-priority" className="mb-2 block text-sm font-semibold text-slate-800">Priority</label><select id="task-priority" value={priority} onChange={(event) => setPriority(event.target.value as Priority)} className="h-11 w-full rounded-md border border-[var(--line)] bg-white px-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100">{PRIORITY_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></div></div>
    <div><label htmlFor="task-description" className="mb-2 block text-sm font-semibold text-slate-800">Description</label><textarea id="task-description" value={description} onChange={(event) => setDescription(event.target.value)} rows={3} placeholder="Add a useful next step or bit of context." className="w-full resize-y rounded-md border border-[var(--line)] bg-white px-3 py-2.5 text-sm leading-6 text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></div>
    {error && <FeedbackMessage variant="error">{error}</FeedbackMessage>}
    <div className="flex flex-col-reverse gap-2 border-t border-[var(--line)] pt-5 sm:flex-row sm:justify-end"><button type="button" onClick={onCancel} className="h-10 rounded-md border border-[var(--line)] px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">Cancel</button><button type="submit" disabled={!title.trim()} className="h-10 rounded-md bg-blue-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">{initialTask ? "Save changes" : "Add task"}</button></div>
  </form>;
}
