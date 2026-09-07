"use client";

import { useState, useRef } from "react";
import { FileText, Plus, Search } from "lucide-react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Modal } from "@/components/modal";
import { NoteCard } from "@/components/notes/note-card";
import { NoteForm } from "@/components/notes/note-form";
import { useStudyFlow } from "@/providers/studyflow-provider";
import type { NewNote, Note } from "@/types/studyflow";

export function NotesWorkspace() {
  const { data, isHydrated, addNote, updateNote, deleteNote, getNotesSortedByUpdated, getCourseById } = useStudyFlow();
  const [formOpen, setFormOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note>();
  const [deletingNote, setDeletingNote] = useState<Note>();
  const [query, setQuery] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [notice, setNotice] = useState("");
  const deleteButtonRef = useRef<HTMLButtonElement>(null);

  if (!isHydrated) return <WorkspaceSkeleton />;

  const notes = getNotesSortedByUpdated().filter((note) => {
    const search = query.trim().toLowerCase();
    const matchesText = !search || note.title.toLowerCase().includes(search) || note.content.toLowerCase().includes(search);
    return matchesText && (!courseFilter || note.courseId === courseFilter);
  });

  function openCreate() { setEditingNote(undefined); setFormOpen(true); }
  function openEdit(note: Note) { setEditingNote(note); setFormOpen(true); }
  function handleSubmit(input: NewNote) {
    if (editingNote) { updateNote(editingNote.id, input); setNotice(`${input.title} was updated.`); } else { addNote(input); setNotice(`${input.title} was added.`); }
    setFormOpen(false);
  }
  function handleDelete() {
    if (!deletingNote) return;
    deleteNote(deletingNote.id);
    setNotice(`${deletingNote.title} was deleted.`);
    setDeletingNote(undefined);
  }

  return <><header className="border-b border-[var(--line)] pb-8"><div className="flex flex-wrap items-end justify-between gap-5"><div><p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-blue-600">Study</p><h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Notes</h1><p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted)]">Keep important study ideas, summaries, and course references in one place.</p></div><button type="button" onClick={openCreate} className="inline-flex h-11 items-center gap-2 rounded-md bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"><Plus size={17} aria-hidden="true" />Add note</button></div></header>{notice && <p role="status" className="mt-5 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-800">{notice}</p>}{data.notes.length > 0 && <div className="mt-6 flex flex-wrap gap-3"><label className="relative min-w-[min(100%,20rem)] flex-1 sm:max-w-sm"><Search size={16} className="pointer-events-none absolute left-3 top-3 text-slate-400" aria-hidden="true" /><span className="sr-only">Search notes</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search title or content" className="h-10 w-full rounded-md border border-[var(--line)] bg-white pl-9 pr-3 text-sm outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></label>{data.courses.length > 0 && <label className="min-w-[12rem] flex-1 sm:max-w-xs"><span className="sr-only">Filter notes by course</span><select value={courseFilter} onChange={(event) => setCourseFilter(event.target.value)} className="h-10 w-full rounded-md border border-[var(--line)] bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"><option value="">All courses</option>{data.courses.map((course) => <option key={course.id} value={course.id}>{course.name}</option>)}</select></label>}<p className="self-center text-sm text-[var(--muted)]">{notes.length} {notes.length === 1 ? "note" : "notes"}</p></div>}{data.notes.length === 0 ? <EmptyNotes onAdd={openCreate} /> : notes.length === 0 ? <NoResults /> : <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{notes.map((note) => <NoteCard key={note.id} note={note} course={note.courseId ? getCourseById(note.courseId) : undefined} onEdit={() => openEdit(note)} onDelete={(button) => { deleteButtonRef.current = button; setDeletingNote(note); }} />)}</div>}<Modal open={formOpen} title={editingNote ? `Edit ${editingNote.title}` : "Add a note"} onClose={() => setFormOpen(false)}><p className="-mt-4 mb-6 text-sm leading-6 text-[var(--muted)]">Capture something you will want to find again.</p><NoteForm key={editingNote?.id ?? "new"} courses={data.courses} initialNote={editingNote} onSubmit={handleSubmit} onCancel={() => setFormOpen(false)} /></Modal><ConfirmDialog open={Boolean(deletingNote)} title={`Delete ${deletingNote?.title ?? "this note"}?`} description="This note will be permanently removed. This action cannot be undone." confirmLabel="Delete note" onCancel={() => setDeletingNote(undefined)} onConfirm={handleDelete} returnFocusRef={deleteButtonRef} /></>;
}

function EmptyNotes({ onAdd }: { onAdd: () => void }) { return <section className="mt-8 rounded-[var(--radius-card)] border border-dashed border-slate-300 bg-white px-6 py-16 text-center sm:px-10"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600"><FileText size={22} aria-hidden="true" /></div><h2 className="mt-5 text-xl font-semibold tracking-tight text-slate-950">No notes yet</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--muted)]">Keep important study ideas, summaries, and course references in one place.</p><button type="button" onClick={onAdd} className="mt-6 inline-flex h-10 items-center gap-2 rounded-md bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"><Plus size={16} aria-hidden="true" />Add your first note</button></section>; }
function NoResults() { return <section className="mt-8 rounded-[var(--radius-card)] border border-dashed border-slate-300 bg-white px-6 py-14 text-center"><h2 className="text-lg font-semibold text-slate-950">No notes match your search</h2><p className="mt-2 text-sm text-[var(--muted)]">Try a different title, phrase, or course filter.</p></section>; }
function WorkspaceSkeleton() { return <div role="status" aria-label="Loading notes" className="animate-pulse"><div className="h-4 w-20 rounded bg-slate-200" /><div className="mt-4 h-10 w-56 rounded bg-slate-200" /><div className="mt-3 h-5 w-96 max-w-full rounded bg-slate-200" /><div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3"><div className="h-64 rounded-[var(--radius-card)] bg-slate-200" /><div className="h-64 rounded-[var(--radius-card)] bg-slate-200" /></div></div>; }
