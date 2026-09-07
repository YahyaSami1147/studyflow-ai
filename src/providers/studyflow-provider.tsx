"use client";

import { createContext, startTransition, useContext, useEffect, useState, type ReactNode } from "react";
import { clearStudyFlowData, loadStudyFlowData, saveStudyFlowData } from "@/lib/studyflow-storage";
import { getAssignmentById, getAssignmentsDueToday, getAssignmentsForCourse, getCalendarItemsForDate, getCalendarItemsForMonth, getCompletedTasks, getCourseById, getCourseProgress, getNoteById, getNotesForCourse, getNotesSortedByUpdated, getOrderedTasks, getOverdueAssignments, getOverdueTasks, getPendingTasks, getPriorityTasks, getTaskById, getTaskCompletionPercentage, getTasksDueToday, getTasksForCourse, getUpcomingAssignments, getUpcomingAssignmentsForCourse, getUpcomingTasks, type CalendarItem } from "@/lib/studyflow-selectors";
import { DEFAULT_STUDYFLOW_DATA, type Assignment, type AssignmentUpdate, type Course, type CourseUpdate, type NewAssignment, type NewCourse, type NewNote, type NewTask, type Note, type NoteUpdate, type StudyFlowData, type StudyFlowSettings, type Task, type TaskUpdate, type UserProfile } from "@/types/studyflow";

type ProfileUpdate = Partial<UserProfile>;
type SettingsUpdate = Partial<StudyFlowSettings>;

type StudyFlowContextValue = {
  data: StudyFlowData;
  isHydrated: boolean;
  addCourse: (input: NewCourse) => Course;
  updateCourse: (id: string, input: CourseUpdate) => void;
  deleteCourse: (id: string) => void;
  getCourseById: (id: string) => Course | undefined;
  addAssignment: (input: NewAssignment) => Assignment;
  updateAssignment: (id: string, input: AssignmentUpdate) => void;
  deleteAssignment: (id: string) => void;
  getAssignmentById: (id: string) => Assignment | undefined;
  addTask: (input: NewTask) => Task;
  updateTask: (id: string, input: TaskUpdate) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  getTaskById: (id: string) => Task | undefined;
  addNote: (input: NewNote) => Note;
  updateNote: (id: string, input: NoteUpdate) => void;
  deleteNote: (id: string) => void;
  getNoteById: (id: string) => Note | undefined;
  getNotesSortedByUpdated: () => Note[];
  getAssignmentsForCourse: (courseId: string) => Assignment[];
  getTasksForCourse: (courseId: string) => Task[];
  getNotesForCourse: (courseId: string) => Note[];
  getPendingTasks: () => Task[];
  getCompletedTasks: () => Task[];
  getOverdueTasks: (now?: Date) => Task[];
  getTasksDueToday: (now?: Date) => Task[];
  getUpcomingTasks: (now?: Date) => Task[];
  getPriorityTasks: () => Task[];
  getOrderedTasks: (now?: Date) => Task[];
  getUpcomingAssignments: (now?: Date) => Assignment[];
  getOverdueAssignments: (now?: Date) => Assignment[];
  getAssignmentsDueToday: (now?: Date) => Assignment[];
  getUpcomingAssignmentsForCourse: (courseId: string, now?: Date) => Assignment[];
  getCalendarItemsForDate: (date: Date) => CalendarItem[];
  getCalendarItemsForMonth: (month: Date) => CalendarItem[];
  getTaskCompletionPercentage: () => number;
  getCourseProgress: (courseId: string) => number;
  updateProfile: (input: ProfileUpdate) => void;
  updateSettings: (input: SettingsUpdate) => void;
  resetStudyFlowData: () => void;
};

const StudyFlowContext = createContext<StudyFlowContextValue | null>(null);

function createId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function timestamp(): string {
  return new Date().toISOString();
}

function assertCourse(data: StudyFlowData, courseId: string): void {
  if (!data.courses.some((course) => course.id === courseId)) throw new Error(`Course not found: ${courseId}`);
}

function assertAssignment(data: StudyFlowData, assignmentId: string): Assignment {
  const assignment = data.assignments.find((item) => item.id === assignmentId);
  if (!assignment) throw new Error(`Assignment not found: ${assignmentId}`);
  return assignment;
}

export function StudyFlowProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<StudyFlowData>(DEFAULT_STUDYFLOW_DATA);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    startTransition(() => {
      setData(loadStudyFlowData());
      setIsHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (isHydrated) saveStudyFlowData(data);
  }, [data, isHydrated]);

  function addCourse(input: NewCourse): Course {
    const now = timestamp();
    const course = { ...input, id: createId(), createdAt: now, updatedAt: now };
    setData((current) => ({ ...current, courses: [...current.courses, course] }));
    return course;
  }

  function updateCourse(id: string, input: CourseUpdate): void {
    setData((current) => ({ ...current, courses: current.courses.map((course) => course.id === id ? { ...course, ...input, updatedAt: timestamp() } : course) }));
  }

  function deleteCourse(id: string): void {
    setData((current) => {
      const assignmentIds = new Set(current.assignments.filter((assignment) => assignment.courseId === id).map((assignment) => assignment.id));
      return { ...current, courses: current.courses.filter((course) => course.id !== id), assignments: current.assignments.filter((assignment) => assignment.courseId !== id), tasks: current.tasks.filter((task) => task.courseId !== id && !(task.assignmentId && assignmentIds.has(task.assignmentId))), notes: current.notes.filter((note) => note.courseId !== id) };
    });
  }

  function addAssignment(input: NewAssignment): Assignment {
    assertCourse(data, input.courseId);
    const now = timestamp();
    const assignment = { ...input, id: createId(), createdAt: now, updatedAt: now };
    setData((current) => ({ ...current, assignments: [...current.assignments, assignment] }));
    return assignment;
  }

  function updateAssignment(id: string, input: AssignmentUpdate): void {
    if (input.courseId) assertCourse(data, input.courseId);
    setData((current) => ({ ...current, assignments: current.assignments.map((assignment) => assignment.id === id ? { ...assignment, ...input, updatedAt: timestamp() } : assignment) }));
  }

  function deleteAssignment(id: string): void {
    setData((current) => ({ ...current, assignments: current.assignments.filter((assignment) => assignment.id !== id), tasks: current.tasks.filter((task) => task.assignmentId !== id) }));
  }

  function addTask(input: NewTask): Task {
    if (input.courseId) assertCourse(data, input.courseId);
    if (input.assignmentId) {
      const assignment = assertAssignment(data, input.assignmentId);
      if (input.courseId && input.courseId !== assignment.courseId) throw new Error("Task course must match its assignment course.");
    }
    const now = timestamp();
    const task = { ...input, id: createId(), createdAt: now, updatedAt: now };
    setData((current) => ({ ...current, tasks: [...current.tasks, task] }));
    return task;
  }

  function updateTask(id: string, input: TaskUpdate): void {
    if (input.courseId) assertCourse(data, input.courseId);
    if (input.assignmentId) {
      const assignment = assertAssignment(data, input.assignmentId);
      if (input.courseId && input.courseId !== assignment.courseId) throw new Error("Task course must match its assignment course.");
    }
    setData((current) => ({ ...current, tasks: current.tasks.map((task) => task.id === id ? { ...task, ...input, updatedAt: timestamp() } : task) }));
  }

  function deleteTask(id: string): void {
    setData((current) => ({ ...current, tasks: current.tasks.filter((task) => task.id !== id) }));
  }

  function toggleTask(id: string): void {
    setData((current) => ({ ...current, tasks: current.tasks.map((task) => task.id === id ? { ...task, completed: !task.completed, updatedAt: timestamp() } : task) }));
  }

  function addNote(input: NewNote): Note {
    if (input.courseId) assertCourse(data, input.courseId);
    const now = timestamp();
    const note = { ...input, id: createId(), createdAt: now, updatedAt: now };
    setData((current) => ({ ...current, notes: [...current.notes, note] }));
    return note;
  }

  function updateNote(id: string, input: NoteUpdate): void {
    if (input.courseId) assertCourse(data, input.courseId);
    setData((current) => ({ ...current, notes: current.notes.map((note) => note.id === id ? { ...note, ...input, updatedAt: timestamp() } : note) }));
  }

  function deleteNote(id: string): void {
    setData((current) => ({ ...current, notes: current.notes.filter((note) => note.id !== id) }));
  }

  function updateProfile(input: ProfileUpdate): void {
    setData((current) => ({ ...current, profile: { ...current.profile, ...input } }));
  }

  function updateSettings(input: SettingsUpdate): void {
    setData((current) => ({ ...current, settings: { ...current.settings, ...input } }));
  }

  function resetStudyFlowData(): void {
    clearStudyFlowData();
    setData({ ...DEFAULT_STUDYFLOW_DATA, profile: { ...DEFAULT_STUDYFLOW_DATA.profile }, settings: { ...DEFAULT_STUDYFLOW_DATA.settings } });
  }

  const value: StudyFlowContextValue = {
    data, isHydrated, addCourse, updateCourse, deleteCourse, getCourseById: (id) => getCourseById(data, id), addAssignment, updateAssignment, deleteAssignment, getAssignmentById: (id) => getAssignmentById(data, id), addTask, updateTask, deleteTask, toggleTask, getTaskById: (id) => getTaskById(data, id), addNote, updateNote, deleteNote, getNoteById: (id) => getNoteById(data, id), getNotesSortedByUpdated: () => getNotesSortedByUpdated(data), getAssignmentsForCourse: (courseId) => getAssignmentsForCourse(data, courseId), getTasksForCourse: (courseId) => getTasksForCourse(data, courseId), getNotesForCourse: (courseId) => getNotesForCourse(data, courseId), getPendingTasks: () => getPendingTasks(data), getCompletedTasks: () => getCompletedTasks(data), getOverdueTasks: (now) => getOverdueTasks(data, now), getTasksDueToday: (now) => getTasksDueToday(data, now), getUpcomingTasks: (now) => getUpcomingTasks(data, now), getPriorityTasks: () => getPriorityTasks(data), getOrderedTasks: (now) => getOrderedTasks(data, now), getUpcomingAssignments: (now) => getUpcomingAssignments(data, now), getOverdueAssignments: (now) => getOverdueAssignments(data, now), getAssignmentsDueToday: (now) => getAssignmentsDueToday(data, now), getUpcomingAssignmentsForCourse: (courseId, now) => getUpcomingAssignmentsForCourse(data, courseId, now), getCalendarItemsForDate: (date) => getCalendarItemsForDate(data, date), getCalendarItemsForMonth: (month) => getCalendarItemsForMonth(data, month), getTaskCompletionPercentage: () => getTaskCompletionPercentage(data), getCourseProgress: (courseId) => getCourseProgress(data, courseId), updateProfile, updateSettings, resetStudyFlowData,
  };

  return <StudyFlowContext.Provider value={value}>{children}</StudyFlowContext.Provider>;
}

export function useStudyFlow(): StudyFlowContextValue {
  const context = useContext(StudyFlowContext);
  if (!context) throw new Error("useStudyFlow must be used within StudyFlowProvider");
  return context;
}