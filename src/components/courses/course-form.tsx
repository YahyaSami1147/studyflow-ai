"use client";

import { useState, type FormEvent } from "react";
import type { Course, NewCourse } from "@/types/studyflow";

const COURSE_COLORS = [
  { value: "#2563eb", label: "Blue" },
  { value: "#059669", label: "Green" },
  { value: "#d97706", label: "Amber" },
  { value: "#e11d48", label: "Rose" },
  { value: "#7c3aed", label: "Violet" },
  { value: "#475569", label: "Slate" },
];

type CourseFormProps = {
  initialCourse?: Course;
  onSubmit: (course: NewCourse) => void;
  onCancel: () => void;
};

export function CourseForm({ initialCourse, onSubmit, onCancel }: CourseFormProps) {
  const [name, setName] = useState(initialCourse?.name ?? "");
  const [code, setCode] = useState(initialCourse?.code ?? "");
  const [instructor, setInstructor] = useState(initialCourse?.instructor ?? "");
  const [semester, setSemester] = useState(initialCourse?.semester ?? "");
  const [description, setDescription] = useState(initialCourse?.description ?? "");
  const [color, setColor] = useState(initialCourse?.color ?? COURSE_COLORS[0].value);
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Enter a course name to continue.");
      return;
    }

    setError("");
    try {
      onSubmit({
        name: trimmedName,
        code: code.trim() || undefined,
        instructor: instructor.trim() || undefined,
        semester: semester.trim() || undefined,
        description: description.trim() || undefined,
        color: color || undefined,
      });
    } catch {
      setError("This course could not be saved. Please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div>
        <label htmlFor="course-name" className="mb-2 block text-sm font-semibold text-slate-800">Course name <span className="text-red-700">*</span></label>
        <input id="course-name" value={name} onChange={(event) => { setName(event.target.value); if (error) setError(""); }} autoFocus required placeholder="e.g. Software Engineering" className="h-11 w-full rounded-md border border-[var(--line)] bg-white px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100" aria-invalid={Boolean(error)} aria-describedby={error ? "course-form-error" : undefined} />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="course-code" label="Course code" value={code} onChange={setCode} placeholder="e.g. CS 301" />
        <Field id="course-instructor" label="Instructor" value={instructor} onChange={setInstructor} placeholder="e.g. Dr. Morgan" />
        <Field id="course-semester" label="Semester" value={semester} onChange={setSemester} placeholder="e.g. Fall 2026" />
      </div>
      <div>
        <label htmlFor="course-description" className="mb-2 block text-sm font-semibold text-slate-800">Description</label>
        <textarea id="course-description" value={description} onChange={(event) => setDescription(event.target.value)} rows={3} placeholder="What are you working toward in this course?" className="w-full resize-y rounded-md border border-[var(--line)] bg-white px-3 py-2.5 text-sm leading-6 text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
      </div>
      <fieldset>
        <legend className="text-sm font-semibold text-slate-800">Course color</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {COURSE_COLORS.map((option) => (
            <label key={option.value} className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-xs font-semibold transition-colors ${color === option.value ? "border-blue-500 bg-blue-50 text-blue-800" : "border-[var(--line)] bg-white text-slate-600 hover:bg-slate-50"}`}>
              <input type="radio" name="course-color" value={option.value} checked={color === option.value} onChange={() => setColor(option.value)} className="sr-only" />
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: option.value }} aria-hidden="true" />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>
      {error && <p id="course-form-error" role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800">{error}</p>}
      <div className="flex flex-col-reverse gap-2 border-t border-[var(--line)] pt-5 sm:flex-row sm:justify-end">
        <button type="button" onClick={onCancel} className="h-10 rounded-md border border-[var(--line)] px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">Cancel</button>
        <button type="submit" disabled={!name.trim()} className="h-10 rounded-md bg-blue-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">{initialCourse ? "Save changes" : "Add course"}</button>
      </div>
    </form>
  );
}

function Field({ id, label, value, onChange, placeholder }: { id: string; label: string; value: string; onChange: (value: string) => void; placeholder: string }) {
  return <div><label htmlFor={id} className="mb-2 block text-sm font-semibold text-slate-800">{label}</label><input id={id} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="h-11 w-full rounded-md border border-[var(--line)] bg-white px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></div>;
}
