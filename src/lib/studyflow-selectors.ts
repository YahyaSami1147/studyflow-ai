import type { Assignment, Course, StudyFlowData, Task } from "@/types/studyflow";

export type TaskDueState = "overdue" | "today" | "upcoming" | "none" | "completed";
export type CalendarItemType = "assignment" | "task";
export type CalendarItemDueState = "overdue" | "today" | "upcoming" | "completed";
export type CalendarItem = {
  id: string;
  type: CalendarItemType;
  title: string;
  dueDate: string;
  courseId?: string;
  completed: boolean;
  priority?: "low" | "medium" | "high";
  status?: "not-started" | "in-progress" | "completed";
};

export function getCourseById(data: StudyFlowData, id: string): Course | undefined {
  return data.courses.find((course) => course.id === id);
}

export function getAssignmentById(data: StudyFlowData, id: string): Assignment | undefined {
  return data.assignments.find((assignment) => assignment.id === id);
}

export function getTaskById(data: StudyFlowData, id: string): Task | undefined {
  return data.tasks.find((task) => task.id === id);
}

export function getNoteById(data: StudyFlowData, id: string) {
  return data.notes.find((note) => note.id === id);
}

export function getAssignmentsForCourse(data: StudyFlowData, courseId: string): Assignment[] {
  return data.assignments.filter((assignment) => assignment.courseId === courseId);
}

export function getTasksForCourse(data: StudyFlowData, courseId: string): Task[] {
  const assignmentIds = new Set(getAssignmentsForCourse(data, courseId).map((assignment) => assignment.id));
  return data.tasks.filter((task) => task.courseId === courseId || (task.assignmentId ? assignmentIds.has(task.assignmentId) : false));
}

export function getNotesForCourse(data: StudyFlowData, courseId: string) {
  return data.notes.filter((note) => note.courseId === courseId);
}

export function getNotesSortedByUpdated(data: StudyFlowData) {
  return [...data.notes].sort((first, second) => second.updatedAt.localeCompare(first.updatedAt));
}

export function getCalendarItemsForDate(data: StudyFlowData, date: Date): CalendarItem[] {
  const dateKey = getLocalDateKey(date);
  return getCalendarItems(data).filter((item) => getDateKey(item.dueDate) === dateKey);
}

export function getCalendarItemsForMonth(data: StudyFlowData, month: Date): CalendarItem[] {
  const monthKey = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}`;
  return getCalendarItems(data).filter((item) => getDateKey(item.dueDate).startsWith(monthKey));
}

function getCalendarItems(data: StudyFlowData): CalendarItem[] {
  const assignments: CalendarItem[] = data.assignments.flatMap((assignment) => assignment.dueDate && isValidDate(assignment.dueDate) ? [{ id: assignment.id, type: "assignment", title: assignment.title, dueDate: assignment.dueDate, courseId: assignment.courseId, completed: assignment.status === "completed", priority: assignment.priority, status: assignment.status }] : []);
  const tasks: CalendarItem[] = data.tasks.flatMap((task) => task.dueDate && isValidDate(task.dueDate) ? [{ id: task.id, type: "task", title: task.title, dueDate: task.dueDate, courseId: task.courseId, completed: task.completed, priority: task.priority }] : []);
  return [...assignments, ...tasks].sort((first, second) => Number(first.completed) - Number(second.completed) || first.title.localeCompare(second.title));
}

export function getPendingTasks(data: StudyFlowData): Task[] {
  return data.tasks.filter((task) => !task.completed);
}

export function getCompletedTasks(data: StudyFlowData): Task[] {
  return data.tasks.filter((task) => task.completed);
}

export function getTaskDueState(task: Pick<Task, "completed" | "dueDate">, now = new Date()): TaskDueState {
  if (task.completed) return "completed";
  if (!task.dueDate) return "none";
  const taskDate = getDateKey(task.dueDate);
  const today = getDateKey(now);
  if (taskDate < today) return "overdue";
  if (taskDate === today) return "today";
  return "upcoming";
}

export function getOverdueTasks(data: StudyFlowData, now = new Date()): Task[] {
  return data.tasks.filter((task) => getTaskDueState(task, now) === "overdue");
}

export function getTasksDueToday(data: StudyFlowData, now = new Date()): Task[] {
  return data.tasks.filter((task) => getTaskDueState(task, now) === "today");
}

export function getUpcomingTasks(data: StudyFlowData, now = new Date()): Task[] {
  return data.tasks.filter((task) => getTaskDueState(task, now) === "upcoming");
}

export function getPriorityTasks(data: StudyFlowData): Task[] {
  return data.tasks.filter((task) => !task.completed && task.priority === "high");
}

export function getOrderedTasks(data: StudyFlowData, now = new Date()): Task[] {
  const dueOrder: Record<TaskDueState, number> = { overdue: 0, today: 1, upcoming: 2, none: 3, completed: 4 };
  const priorityOrder = { high: 0, medium: 1, low: 2 } as const;
  return [...data.tasks].sort((first, second) => {
    const firstState = getTaskDueState(first, now);
    const secondState = getTaskDueState(second, now);
    const stateDifference = dueOrder[firstState] - dueOrder[secondState];
    if (stateDifference !== 0) return stateDifference;
    const priorityDifference = priorityOrder[first.priority] - priorityOrder[second.priority];
    if (priorityDifference !== 0) return priorityDifference;
    if (first.dueDate && second.dueDate) return getDateKey(first.dueDate).localeCompare(getDateKey(second.dueDate));
    return first.createdAt.localeCompare(second.createdAt);
  });
}

export function getUpcomingAssignments(data: StudyFlowData, now = new Date()): Assignment[] {
  return data.assignments
    .filter((assignment) => assignment.status !== "completed" && assignment.dueDate && getDateKey(assignment.dueDate) >= getDateKey(now))
    .sort((first, second) => getDateKey(first.dueDate as string).localeCompare(getDateKey(second.dueDate as string)));
}

export function getOverdueAssignments(data: StudyFlowData, now = new Date()): Assignment[] {
  const today = getDateKey(now);
  return data.assignments.filter((assignment) => assignment.status !== "completed" && assignment.dueDate && getDateKey(assignment.dueDate) < today);
}

export function getAssignmentsDueToday(data: StudyFlowData, now = new Date()): Assignment[] {
  const today = getDateKey(now);
  return data.assignments.filter((assignment) => assignment.status !== "completed" && assignment.dueDate && getDateKey(assignment.dueDate) === today);
}

export function getUpcomingAssignmentsForCourse(data: StudyFlowData, courseId: string, now = new Date()): Assignment[] {
  return getUpcomingAssignments(data, now).filter((assignment) => assignment.courseId === courseId);
}

function getDateKey(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getTaskCompletionPercentage(data: StudyFlowData): number {
  if (data.tasks.length === 0) return 0;
  return Math.round((getCompletedTasks(data).length / data.tasks.length) * 100);
}

export function getCourseProgress(data: StudyFlowData, courseId: string): number {
  const assignments = getAssignmentsForCourse(data, courseId);
  const tasks = getTasksForCourse(data, courseId);
  const total = assignments.length + tasks.length;
  if (total === 0) return 0;

  const completedAssignments = assignments.filter((assignment) => assignment.status === "completed").length;
  const completedTasks = tasks.filter((task) => task.completed).length;
  return Math.round(((completedAssignments + completedTasks) / total) * 100);
}

function getLocalDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function isValidDate(value: string): boolean {
  return !Number.isNaN(new Date(value).getTime());
}

export function getCalendarItemDueState(item: CalendarItem, now = new Date()): CalendarItemDueState {
  if (item.completed) return "completed";
  const itemDate = getDateKey(item.dueDate);
  const today = getDateKey(now);
  if (itemDate < today) return "overdue";
  if (itemDate === today) return "today";
  return "upcoming";
}