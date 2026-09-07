"use client";

import { useState, type FormEvent } from "react";
import type { Course, NewNote, Note } from "@/types/studyflow";

type NoteFormProps = { courses: Course[]; initialNote?: Note; onSubmit: (note: NewNote) => void; onCancel: () => void };

export function NoteForm({ courses, initialNote, onSubmit, onCancel }: NoteFormProps) {
  const [title, setTitle] = useState(initialNote?.title ?? "");
  const [courseId, setCourseId] = useState(initialNote?.courseId ?? "");
  const [content, setContent] = useState(initialNote?.content ?? "");
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();
    if (!trimmedTitle) return setError("Enter a note title to continue.");
    if (!trimmedContent) return setError("Add some content before saving this note.");
    if (courseId && !courses.some((course) => course.id === courseId)) return setError("That course is no longer available. Choose another course.");

    setError("");
    try {
      onSubmit({ title: trimmedTitle, content: trimmedContent, courseId: courseId || undefined });
    } catch {
      setError("This note could not be saved. Check the selected course and try again.");
    }
  }

  return <form onSubmit={handleSubmit} noValidate className="space-y-5"><div><label htmlFor="note-title" className="mb-2 block text-sm font-semibold text-slate-800">Title <span className="text-red-700">*</span></label><input id="note-title" value={title} onChange={(event) => { setTitle(event.target.value); if (error) setError(""); }} autoFocus required placeholder="e.g. Recursion summary" className="h-11 w-full rounded-md border border-[var(--line)] bg-white px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></div><div><label htmlFor="note-course" className="mb-2 block text-sm font-semibold text-slate-800">Course</label><select id="note-course" value={courseId} onChange={(event) => setCourseId(event.target.value)} className="h-11 w-full rounded-md border border-[var(--line)] bg-white px-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"><option value="">No course</option>{courses.map((course) => <option key={course.id} value={course.id}>{course.name}{course.code ? ` · ${course.code}` : ""}</option>)}</select></div><div><label htmlFor="note-content" className="mb-2 block text-sm font-semibold text-slate-800">Content <span className="text-red-700">*</span></label><textarea id="note-content" value={content} onChange={(event) => setContent(event.target.value)} required rows={12} placeholder="Write a summary, idea, or useful reference..." className="w-full resize-y rounded-md border border-[var(--line)] bg-white px-3 py-2.5 text-sm leading-6 text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></div>{error && <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800">{error}</p>}<div className="flex flex-col-reverse gap-2 border-t border-[var(--line)] pt-5 sm:flex-row sm:justify-end"><button type="button" onClick={onCancel} className="h-10 rounded-md border border-[var(--line)] px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">Cancel</button><button type="submit" disabled={!title.trim() || !content.trim()} className="h-10 rounded-md bg-blue-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">{initialNote ? "Save changes" : "Add note"}</button></div></form>;
}
