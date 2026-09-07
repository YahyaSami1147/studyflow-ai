"use client";

import { useMemo, useRef, useState } from "react";
import { Plus } from "lucide-react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Modal } from "@/components/modal";
import { TaskCard } from "@/components/tasks/task-card";
import { TaskForm } from "@/components/tasks/task-form";
import { useStudyFlow } from "@/providers/studyflow-provider";
import type { NewTask, Task } from "@/types/studyflow";

export function TasksWorkspace() {
  const { data, isHydrated, addTask, updateTask, deleteTask, toggleTask, getOrderedTasks } = useStudyFlow();
  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task>();
  const [deletingTask, setDeletingTask] = useState<Task>();
  const [filter, setFilter] = useState<"all" | "todo" | "completed">("all");
  const [notice, setNotice] = useState("");
  const deleteButtonRef = useRef<HTMLButtonElement>(null);

  const coursesById = useMemo(() => new Map(data.courses.map((course) => [course.id, course])), [data.courses]);
  const assignmentsById = useMemo(() => new Map(data.assignments.map((assignment) => [assignment.id, assignment])), [data.assignments]);
  const tasks = useMemo(() => getOrderedTasks().filter((task) => filter === "all" ? true : filter === "todo" ? !task.completed : task.completed), [filter, getOrderedTasks]);

  if (!isHydrated) return <WorkspaceSkeleton />;

  function openCreate() { setEditingTask(undefined); setFormOpen(true); }
  function openEdit(task: Task) { setEditingTask(task); setFormOpen(true); }
  function handleSubmit(input: NewTask) {
    if (editingTask) { updateTask(editingTask.id, input); setNotice(`${input.title} was updated.`); } else { addTask(input); setNotice(`${input.title} was added.`); }
    setFormOpen(false);
  }
  function handleDelete() {
    if (!deletingTask) return;
    deleteTask(deletingTask.id);
    setNotice(`${deletingTask.title} was deleted.`);
    setDeletingTask(undefined);
  }
  function handleToggle(task: Task) {
    toggleTask(task.id);
    setNotice(task.completed ? `${task.title} is now open.` : `${task.title} marked complete.`);
  }

  return <>
    <header className="border-b border-[var(--line)] pb-8"><div className="flex flex-wrap items-end justify-between gap-5"><div><p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-blue-600">Workspace</p><h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Tasks</h1><p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted)]">Break coursework into clear next actions and keep momentum visible.</p></div><button type="button" onClick={openCreate} className="inline-flex h-11 items-center gap-2 rounded-md bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"><Plus size={17} aria-hidden="true" />Add task</button></div></header>
    {notice && <p role="status" className="mt-5 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-800">{notice}</p>}
    {data.tasks.length === 0 ? <EmptyTasks onAdd={openCreate} /> : <><div className="mt-6 flex flex-wrap items-center gap-2" aria-label="Task filters"><span className="mr-1 text-sm font-semibold text-slate-700">Show</span>{(["all", "todo", "completed"] as const).map((value) => <button key={value} type="button" onClick={() => setFilter(value)} aria-pressed={filter === value} className={`rounded-md px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${filter === value ? "bg-blue-600 text-white" : "border border-[var(--line)] bg-white text-slate-600 hover:bg-slate-50"}`}>{value === "all" ? "All" : value === "todo" ? "To do" : "Completed"}</button>)}<span className="ml-auto text-sm text-[var(--muted)]">{tasks.length} {tasks.length === 1 ? "task" : "tasks"}</span></div>{tasks.length === 0 ? <div className="mt-8 rounded-[var(--radius-card)] border border-dashed border-slate-300 bg-white px-6 py-14 text-center"><h2 className="text-lg font-semibold text-slate-950">Nothing here yet</h2><p className="mt-2 text-sm text-[var(--muted)]">Try another task filter.</p></div> : <div className="mt-8 space-y-3">{tasks.map((task) => <TaskCard key={task.id} task={task} course={task.courseId ? coursesById.get(task.courseId) : undefined} assignment={task.assignmentId ? assignmentsById.get(task.assignmentId) : undefined} onToggle={() => handleToggle(task)} onEdit={() => openEdit(task)} onDelete={(button) => { deleteButtonRef.current = button; setDeletingTask(task); }} />)}</div>}</>}
    <Modal open={formOpen} title={editingTask ? `Edit ${editingTask.title}` : "Add a task"} onClose={() => setFormOpen(false)}><p className="-mt-4 mb-6 text-sm leading-6 text-[var(--muted)]">Keep this next action specific enough to start.</p><TaskForm key={editingTask?.id ?? "new"} courses={data.courses} assignments={data.assignments} defaultPriority={data.settings.defaultTaskPriority} initialTask={editingTask} onSubmit={handleSubmit} onCancel={() => setFormOpen(false)} /></Modal>
    <ConfirmDialog open={Boolean(deletingTask)} title={`Delete ${deletingTask?.title ?? "this task"}?`} description="This task will be permanently removed. This action cannot be undone." confirmLabel="Delete task" onCancel={() => setDeletingTask(undefined)} onConfirm={handleDelete} returnFocusRef={deleteButtonRef} />
  </>;
}

function EmptyTasks({ onAdd }: { onAdd: () => void }) { return <section className="mt-8 rounded-[var(--radius-card)] border border-dashed border-slate-300 bg-white px-6 py-16 text-center sm:px-10"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600"><Plus size={22} aria-hidden="true" /></div><h2 className="mt-5 text-xl font-semibold tracking-tight text-slate-950">No tasks yet</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--muted)]">Break your coursework into manageable steps and keep track of what needs attention.</p><button type="button" onClick={onAdd} className="mt-6 inline-flex h-10 items-center gap-2 rounded-md bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"><Plus size={16} aria-hidden="true" />Add your first task</button></section>; }
function WorkspaceSkeleton() { return <div role="status" aria-label="Loading tasks" className="animate-pulse"><div className="h-4 w-24 rounded bg-slate-200" /><div className="mt-4 h-10 w-64 rounded bg-slate-200" /><div className="mt-3 h-5 w-96 max-w-full rounded bg-slate-200" /><div className="mt-10 space-y-3"><div className="h-24 rounded-[var(--radius-card)] bg-slate-200" /><div className="h-24 rounded-[var(--radius-card)] bg-slate-200" /></div></div>; }
