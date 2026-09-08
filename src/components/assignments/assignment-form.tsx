"use client";

import { useState, type FormEvent } from "react";
import { FeedbackMessage } from "@/components/feedback-message";
import { ASSIGNMENT_STATUS_OPTIONS, PRIORITY_OPTIONS, toDateInputValue, toStoredDate } from "@/lib/studyflow-format";
import type { Assignment, Course, NewAssignment } from "@/types/studyflow";

type AssignmentFormProps = {
  courses: Course[];
  initialAssignment?: Assignment;
  onSubmit: (assignment: NewAssignment) => void;
  onCancel: () => void;
};

export function AssignmentForm({ courses, initialAssignment, onSubmit, onCancel }: AssignmentFormProps) {
  const [courseId, setCourseId] = useState(initialAssignment?.courseId ?? courses[0]?.id ?? "");
  const [title, setTitle] = useState(initialAssignment?.title ?? "");
  const [description, setDescription] = useState(initialAssignment?.description ?? "");
  const [dueDate, setDueDate] = useState(toDateInputValue(initialAssignment?.dueDate));
  const [status, setStatus] = useState(initialAssignment?.status ?? "not-started");
  const [priority, setPriority] = useState(initialAssignment?.priority ?? "medium");
  const [estimatedMinutes, setEstimatedMinutes] = useState(initialAssignment?.estimatedMinutes?.toString() ?? "");
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedTitle = title.trim();
    if (!courseId) return setError("Choose a course before saving this assignment.");
    if (!trimmedTitle) return setError("Enter an assignment title to continue.");
    if (!dueDate || Number.isNaN(new Date(`${dueDate}T12:00:00`).getTime())) return setError("Choose a valid due date.");
    const parsedMinutes = estimatedMinutes ? Number(estimatedMinutes) : undefined;
    if (parsedMinutes !== undefined && (!Number.isInteger(parsedMinutes) || parsedMinutes <= 0)) return setError("Estimated minutes must be a positive whole number.");

    setError("");
    try {
      onSubmit({ courseId, title: trimmedTitle, description: description.trim() || undefined, dueDate: toStoredDate(dueDate), status, priority, estimatedMinutes: parsedMinutes });
    } catch {
      setError("This assignment could not be saved. Check that the selected course still exists.");
    }
  }

  if (courses.length === 0) return <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-3 text-sm leading-6 text-amber-900">Create a course before adding assignments.</p>;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div>
        <label htmlFor="assignment-course" className="mb-2 block text-sm font-semibold text-slate-800">Course <span className="text-red-700">*</span></label>
        <select id="assignment-course" value={courseId} onChange={(event) => setCourseId(event.target.value)} required className="h-11 w-full rounded-md border border-[var(--line)] bg-white px-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100">{courses.map((course) => <option key={course.id} value={course.id}>{course.name}{course.code ? ` · ${course.code}` : ""}</option>)}</select>
      </div>
      <div>
        <label htmlFor="assignment-title" className="mb-2 block text-sm font-semibold text-slate-800">Title <span className="text-red-700">*</span></label>
        <input id="assignment-title" value={title} onChange={(event) => { setTitle(event.target.value); if (error) setError(""); }} autoFocus required placeholder="e.g. Research paper" className="h-11 w-full rounded-md border border-[var(--line)] bg-white px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div><label htmlFor="assignment-due-date" className="mb-2 block text-sm font-semibold text-slate-800">Due date <span className="text-red-700">*</span></label><input id="assignment-due-date" type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} required className="h-11 w-full rounded-md border border-[var(--line)] bg-white px-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></div>
        <div><label htmlFor="assignment-estimate" className="mb-2 block text-sm font-semibold text-slate-800">Estimated minutes</label><input id="assignment-estimate" type="number" min="1" step="1" value={estimatedMinutes} onChange={(event) => setEstimatedMinutes(event.target.value)} placeholder="e.g. 90" className="h-11 w-full rounded-md border border-[var(--line)] bg-white px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></div>
      </div>
      <div>
        <label htmlFor="assignment-description" className="mb-2 block text-sm font-semibold text-slate-800">Description</label>
        <textarea id="assignment-description" value={description} onChange={(event) => setDescription(event.target.value)} rows={3} placeholder="Add instructions, context, or a next step." className="w-full resize-y rounded-md border border-[var(--line)] bg-white px-3 py-2.5 text-sm leading-6 text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <SelectField id="assignment-status" label="Status" value={status} options={ASSIGNMENT_STATUS_OPTIONS} onChange={setStatus} />
        <SelectField id="assignment-priority" label="Priority" value={priority} options={PRIORITY_OPTIONS} onChange={setPriority} />
      </div>
      {error && <FeedbackMessage variant="error">{error}</FeedbackMessage>}
      <div className="flex flex-col-reverse gap-2 border-t border-[var(--line)] pt-5 sm:flex-row sm:justify-end"><button type="button" onClick={onCancel} className="h-10 rounded-md border border-[var(--line)] px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">Cancel</button><button type="submit" disabled={!title.trim() || !courseId || !dueDate} className="h-10 rounded-md bg-blue-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">{initialAssignment ? "Save changes" : "Add assignment"}</button></div>
    </form>
  );
}

function SelectField<T extends string>({ id, label, value, options, onChange }: { id: string; label: string; value: T; options: { value: T; label: string }[]; onChange: (value: T) => void }) {
  return <div><label htmlFor={id} className="mb-2 block text-sm font-semibold text-slate-800">{label}</label><select id={id} value={value} onChange={(event) => onChange(event.target.value as T)} className="h-11 w-full rounded-md border border-[var(--line)] bg-white px-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100">{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></div>;
}
