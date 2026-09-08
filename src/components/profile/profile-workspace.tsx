"use client";

import { useState } from "react";
import { Save, UserCircle } from "lucide-react";
import { FeedbackMessage } from "@/components/feedback-message";
import { useStudyFlow } from "@/providers/studyflow-provider";

export function ProfileWorkspace() {
  const { data, isHydrated, updateProfile } = useStudyFlow();
  const [form, setForm] = useState({
    name: data.profile.name ?? "",
    program: data.profile.program ?? "",
    semester: data.profile.semester ?? "",
    university: data.profile.university ?? "",
  });
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  if (!isHydrated) return <ProfileSkeleton />;

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    if (error) setError("");
    if (status) setStatus("");
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = form.name.trim();
    if (!name) {
      setError("Name is required.");
      return;
    }

    updateProfile({
      name,
      program: form.program.trim() || undefined,
      semester: form.semester.trim() || undefined,
      university: form.university.trim() || undefined,
    });

    setError("");
    setStatus("Profile saved.");
  }

  return (
    <>
      <header className="border-b border-[var(--line)] pb-8">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-blue-600">Profile</p>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Your profile</h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted)]">Keep the basic details that describe your study identity in this local workspace.</p>
      </header>

      <section className="mt-8 rounded-[var(--radius-card)] border border-[var(--line)] bg-white p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <UserCircle size={22} aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-slate-950">Personal study information</h2>
            <p className="text-sm text-[var(--muted)]">This information is stored in your browser for this app only.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
          <div>
            <label htmlFor="profile-name" className="mb-2 block text-sm font-semibold text-slate-800">Name <span className="text-red-700">*</span></label>
            <input id="profile-name" value={form.name} onChange={(event) => updateField("name", event.target.value)} className="h-11 w-full rounded-md border border-[var(--line)] bg-white px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="Your name" />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="profile-program" className="mb-2 block text-sm font-semibold text-slate-800">Program / degree</label>
              <input id="profile-program" value={form.program} onChange={(event) => updateField("program", event.target.value)} className="h-11 w-full rounded-md border border-[var(--line)] bg-white px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="e.g. Computer Science" />
            </div>
            <div>
              <label htmlFor="profile-semester" className="mb-2 block text-sm font-semibold text-slate-800">Semester</label>
              <input id="profile-semester" value={form.semester} onChange={(event) => updateField("semester", event.target.value)} className="h-11 w-full rounded-md border border-[var(--line)] bg-white px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="e.g. Fall 2026" />
            </div>
          </div>

          <div>
            <label htmlFor="profile-university" className="mb-2 block text-sm font-semibold text-slate-800">University</label>
            <input id="profile-university" value={form.university} onChange={(event) => updateField("university", event.target.value)} className="h-11 w-full rounded-md border border-[var(--line)] bg-white px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="Your university" />
          </div>

          {error ? <FeedbackMessage variant="error">{error}</FeedbackMessage> : null}
          {status ? <FeedbackMessage variant="success">{status}</FeedbackMessage> : null}

          <div className="flex flex-col-reverse gap-2 border-t border-[var(--line)] pt-5 sm:flex-row sm:justify-end">
            <button type="button" onClick={() => setForm({ name: data.profile.name ?? "", program: data.profile.program ?? "", semester: data.profile.semester ?? "", university: data.profile.university ?? "" })} className="h-10 rounded-md border border-[var(--line)] px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">Reset form</button>
            <button type="submit" className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"><Save size={16} aria-hidden="true" />Save profile</button>
          </div>
        </form>
      </section>
    </>
  );
}

function ProfileSkeleton() {
  return (
    <div role="status" aria-label="Loading profile" className="animate-pulse">
      <div className="h-4 w-20 rounded bg-slate-200" />
      <div className="mt-4 h-10 w-56 rounded bg-slate-200" />
      <div className="mt-3 h-5 w-90 max-w-full rounded bg-slate-200" />
      <div className="mt-8 h-80 rounded-[var(--radius-card)] bg-slate-200" />
    </div>
  );
}
