import type { AssignmentStatus, Priority } from "@/types/studyflow";

export const ASSIGNMENT_STATUS_OPTIONS: { value: AssignmentStatus; label: string }[] = [
  { value: "not-started", label: "Not started" },
  { value: "in-progress", label: "In progress" },
  { value: "completed", label: "Completed" },
];

export const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

export function formatAssignmentStatus(status: AssignmentStatus): string {
  return ASSIGNMENT_STATUS_OPTIONS.find((option) => option.value === status)?.label ?? "Not started";
}

export function formatPriority(priority: Priority): string {
  return PRIORITY_OPTIONS.find((option) => option.value === priority)?.label ?? "Medium";
}

export function toStoredDate(dateValue: string): string {
  return new Date(`${dateValue}T12:00:00`).toISOString();
}

export function toDateInputValue(dateValue?: string): string {
  if (!dateValue) return "";
  const date = new Date(dateValue);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatDueDate(dateValue?: string): string {
  if (!dateValue) return "No due date";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(dateValue));
}

export function getDueDateTone(dateValue: string | undefined, status: AssignmentStatus): "overdue" | "today" | "upcoming" | "complete" | "none" {
  if (!dateValue) return "none";
  if (status === "completed") return "complete";
  const today = new Date();
  const dateKey = toDateInputValue(dateValue);
  const todayKey = toDateInputValue(today.toISOString());
  if (dateKey < todayKey) return "overdue";
  if (dateKey === todayKey) return "today";
  return "upcoming";
}

export function toLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}