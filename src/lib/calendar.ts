import { toLocalDateKey } from "@/lib/studyflow-format";

export function getMonthGridDates(month: Date, weekStartsOn: 0 | 1): Date[] {
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const offset = (firstDay.getDay() - weekStartsOn + 7) % 7;
  const start = new Date(month.getFullYear(), month.getMonth(), 1 - offset);
  return Array.from({ length: 42 }, (_, index) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + index));
}

export function isSameLocalDate(first: Date, second: Date): boolean {
  return toLocalDateKey(first) === toLocalDateKey(second);
}

export function formatMonthLabel(month: Date): string {
  return new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" }).format(month);
}

export function formatCalendarDate(date: Date): string {
  return new Intl.DateTimeFormat(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" }).format(date);
}

export function getWeekdayLabels(weekStartsOn: 0 | 1): string[] {
  const base = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return [...base.slice(weekStartsOn), ...base.slice(0, weekStartsOn)];
}
