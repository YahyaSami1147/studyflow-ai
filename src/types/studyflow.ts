export type AssignmentStatus = "not-started" | "in-progress" | "completed";
export type Priority = "low" | "medium" | "high";
export type ThemePreference = "system" | "light" | "dark";
export type WeekStartsOn = 0 | 1;

export interface Course {
  id: string;
  name: string;
  code?: string;
  instructor?: string;
  description?: string;
  color?: string;
  semester?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Assignment {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  dueDate?: string;
  status: AssignmentStatus;
  priority: Priority;
  estimatedMinutes?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  courseId?: string;
  assignmentId?: string;
  title: string;
  description?: string;
  dueDate?: string;
  priority: Priority;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: string;
  courseId?: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  name: string;
  program?: string;
  semester?: string;
  university?: string;
}

export interface StudyFlowSettings {
  themePreference: ThemePreference;
  weekStartsOn: WeekStartsOn;
  defaultTaskPriority: Priority;
}

export interface StudyFlowData {
  version: number;
  courses: Course[];
  assignments: Assignment[];
  tasks: Task[];
  notes: Note[];
  profile: UserProfile;
  settings: StudyFlowSettings;
}

export const STUDYFLOW_DATA_VERSION = 1;

export const DEFAULT_STUDYFLOW_DATA: StudyFlowData = {
  version: STUDYFLOW_DATA_VERSION,
  courses: [],
  assignments: [],
  tasks: [],
  notes: [],
  profile: { name: "" },
  settings: {
    themePreference: "system",
    weekStartsOn: 1,
    defaultTaskPriority: "medium",
  },
};

export type NewCourse = Omit<Course, "id" | "createdAt" | "updatedAt">;
export type CourseUpdate = Partial<NewCourse>;
export type NewAssignment = Omit<Assignment, "id" | "createdAt" | "updatedAt">;
export type AssignmentUpdate = Partial<NewAssignment>;
export type NewTask = Omit<Task, "id" | "createdAt" | "updatedAt">;
export type TaskUpdate = Partial<NewTask>;
export type NewNote = Omit<Note, "id" | "createdAt" | "updatedAt">;
export type NoteUpdate = Partial<NewNote>;