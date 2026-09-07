"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CalendarAgenda } from "@/components/calendar/calendar-agenda";
import { CalendarMonth } from "@/components/calendar/calendar-month";
import { formatMonthLabel, getMonthGridDates } from "@/lib/calendar";
import { useStudyFlow } from "@/providers/studyflow-provider";

export function CalendarWorkspace() {
  const { data, isHydrated, getCalendarItemsForDate, getCalendarItemsForMonth, getCourseById } = useStudyFlow();
  const [displayMonth, setDisplayMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(() => new Date());

  if (!isHydrated) return <WorkspaceSkeleton />;

  const today = new Date();
  const dates = getMonthGridDates(displayMonth, data.settings.weekStartsOn);
  const monthItems = getCalendarItemsForMonth(displayMonth);
  const selectedItems = getCalendarItemsForDate(selectedDate);

  function moveMonth(delta: number) {
    const nextMonth = new Date(displayMonth.getFullYear(), displayMonth.getMonth() + delta, 1);
    setDisplayMonth(nextMonth);
    setSelectedDate(nextMonth);
  }

  function goToToday() {
    const nextToday = new Date();
    setDisplayMonth(new Date(nextToday.getFullYear(), nextToday.getMonth(), 1));
    setSelectedDate(nextToday);
  }

  return <><header className="border-b border-[var(--line)] pb-8"><div className="flex flex-wrap items-end justify-between gap-5"><div><p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-blue-600">Planning</p><h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Calendar</h1><p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted)]">See assignments and tasks together, right where they are due.</p></div><div className="flex items-center gap-2"><button type="button" onClick={() => moveMonth(-1)} aria-label="Previous month" className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-[var(--line)] bg-white text-slate-600 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"><ChevronLeft size={18} aria-hidden="true" /></button><button type="button" onClick={goToToday} className="h-10 rounded-md border border-[var(--line)] bg-white px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">Today</button><button type="button" onClick={() => moveMonth(1)} aria-label="Next month" className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-[var(--line)] bg-white text-slate-600 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"><ChevronRight size={18} aria-hidden="true" /></button></div></div></header><section className="mt-8" aria-labelledby="calendar-month-heading"><div className="mb-4 flex flex-wrap items-baseline justify-between gap-3"><h2 id="calendar-month-heading" className="text-xl font-semibold tracking-tight text-slate-950">{formatMonthLabel(displayMonth)}</h2><p className="text-sm text-[var(--muted)]">{monthItems.length ? `${monthItems.length} scheduled ${monthItems.length === 1 ? "item" : "items"}` : "No deadlines this month"}</p></div><CalendarMonth dates={dates} month={displayMonth} selectedDate={selectedDate} today={today} weekStartsOn={data.settings.weekStartsOn} itemsForDate={getCalendarItemsForDate} onSelectDate={(date) => setSelectedDate(date)} /></section><div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.72fr]"><CalendarAgenda date={selectedDate} items={selectedItems} getCourseName={(courseId) => courseId ? getCourseById(courseId) : undefined} /><Legend /></div></>;
}

function Legend() { return <aside className="rounded-[var(--radius-card)] border border-[var(--line)] bg-slate-950/40 p-5 sm:p-6" aria-label="Calendar legend"><h2 className="font-semibold text-white">Calendar key</h2><div className="mt-4 space-y-3 text-sm text-slate-300"><p className="flex items-center gap-3"><span className="flex h-7 w-7 items-center justify-center rounded-md bg-cyan-500/10 text-xs font-bold text-cyan-200 ring-1 ring-cyan-400/20">A</span>Assignment</p><p className="flex items-center gap-3"><span className="flex h-7 w-7 items-center justify-center rounded-md bg-violet-500/10 text-xs font-bold text-violet-200 ring-1 ring-violet-400/20">T</span>Task</p><p className="flex items-center gap-3"><span className="h-3 w-3 rounded-full bg-cyan-400" aria-hidden="true" />Today</p><p className="flex items-center gap-3"><span className="h-3 w-3 rounded-full bg-emerald-400" aria-hidden="true" />Completed</p></div></aside>; }
function WorkspaceSkeleton() { return <div role="status" aria-label="Loading calendar" className="animate-pulse"><div className="h-4 w-24 rounded bg-slate-200" /><div className="mt-4 h-10 w-56 rounded bg-slate-200" /><div className="mt-3 h-5 w-96 max-w-full rounded bg-slate-200" /><div className="mt-10 h-[34rem] rounded-[var(--radius-card)] bg-slate-200" /></div>; }
