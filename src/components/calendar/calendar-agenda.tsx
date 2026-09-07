"use client";

import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";
import { formatAssignmentStatus, formatPriority } from "@/lib/studyflow-format";
import { getCalendarItemDueState, type CalendarItem } from "@/lib/studyflow-selectors";
import type { Course } from "@/types/studyflow";

export function CalendarAgenda({ date, items, getCourseName }: { date: Date; items: CalendarItem[]; getCourseName: (courseId?: string) => Course | undefined }) {
  return <section aria-labelledby="calendar-agenda-heading" className="rounded-[var(--radius-card)] border border-[var(--line)] bg-white p-5 sm:p-6"><div className="flex items-start gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-600"><CalendarDays size={18} aria-hidden="true" /></span><div><h2 id="calendar-agenda-heading" className="font-semibold text-slate-950">{new Intl.DateTimeFormat(undefined, { weekday: "long", month: "long", day: "numeric" }).format(date)}</h2><p className="mt-1 text-sm text-[var(--muted)]">{items.length ? `${items.length} ${items.length === 1 ? "item" : "items"} due` : "Nothing due this day."}</p></div></div>{items.length > 0 && <div className="mt-5 divide-y divide-[var(--line)]">{items.map((item) => <AgendaItem key={`${item.type}-${item.id}`} item={item} course={getCourseName(item.courseId)} />)}</div>}</section>;
}

function AgendaItem({ item, course }: { item: CalendarItem; course?: Course }) {
  const dueState = getCalendarItemDueState(item);
  const content = <><div className="flex min-w-0 items-start gap-3"><span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-xs font-bold ${item.completed ? "bg-emerald-50 text-emerald-800" : item.type === "assignment" ? "bg-blue-50 text-blue-800" : "bg-amber-50 text-amber-900"}`}>{item.type === "assignment" ? "A" : "T"}</span><div className="min-w-0"><p className={`break-words text-sm font-semibold ${item.completed ? "text-slate-400 line-through" : "text-slate-800"}`}>{item.title}</p><p className="mt-1 text-xs text-[var(--muted)]">{item.type === "assignment" ? "Assignment" : "Task"}{course ? ` · ${course.name}` : ""}</p></div></div><div className="mt-2 flex flex-wrap gap-2 pl-11 text-xs text-[var(--muted)]">{dueState === "overdue" && <span className="font-semibold text-red-700">Overdue</span>}{item.priority && <span>{formatPriority(item.priority)} priority</span>}{item.status && <span>{formatAssignmentStatus(item.status)}</span>}{item.completed && <span className="font-semibold text-emerald-700">Completed</span>}</div></>;
  return item.type === "assignment" ? <Link href={`/assignments/${item.id}`} className="block py-4 first:pt-0 last:pb-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">{content}<ArrowRight className="float-right -mt-5 text-slate-400" size={16} aria-hidden="true" /></Link> : <Link href="/tasks" className="block py-4 first:pt-0 last:pb-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">{content}<ArrowRight className="float-right -mt-5 text-slate-400" size={16} aria-hidden="true" /></Link>;
}
