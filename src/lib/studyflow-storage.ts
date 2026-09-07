import { z } from "zod";
import {
  DEFAULT_STUDYFLOW_DATA,
  STUDYFLOW_DATA_VERSION,
  type StudyFlowData,
} from "@/types/studyflow";

export const STUDYFLOW_STORAGE_KEY = "studyflow:data";

const isoDateSchema = z.string().datetime({ offset: true });
const optionalText = z.union([
  z.string().transform((value) => (value.trim() === "" ? undefined : value)),
  z.undefined(),
]).optional();

const optionalId = z.union([
  z.string().transform((value) => (value.trim() === "" ? undefined : value)),
  z.undefined(),
]).optional();

const optionalDate = z.union([
  z.string().transform((value) => (value.trim() === "" ? undefined : value)),
  z.undefined(),
]).optional().refine((value) => !value || !Number.isNaN(new Date(value).getTime()), {
  message: "Invalid date",
});

const courseSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  code: optionalText,
  instructor: optionalText,
  description: z.string().optional(),
  color: optionalText,
  semester: optionalText,
  createdAt: isoDateSchema,
  updatedAt: isoDateSchema,
});

const assignmentSchema = z.object({
  id: z.string().min(1),
  courseId: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  dueDate: optionalDate,
  status: z.enum(["not-started", "in-progress", "completed"]),
  priority: z.enum(["low", "medium", "high"]),
  estimatedMinutes: z.number().int().positive().optional(),
  createdAt: isoDateSchema,
  updatedAt: isoDateSchema,
});

const taskSchema = z.object({
  id: z.string().min(1),
  courseId: optionalId,
  assignmentId: optionalId,
  title: z.string().min(1),
  description: z.string().optional(),
  dueDate: optionalDate,
  priority: z.enum(["low", "medium", "high"]),
  completed: z.boolean(),
  createdAt: isoDateSchema,
  updatedAt: isoDateSchema,
});

const noteSchema = z.object({
  id: z.string().min(1),
  courseId: optionalId,
  title: z.string().min(1),
  content: z.string(),
  createdAt: isoDateSchema,
  updatedAt: isoDateSchema,
});

const profileSchema = z.object({
  name: z.string(),
  program: z.string().optional(),
  semester: z.string().optional(),
  university: z.string().optional(),
});

const settingsSchema = z.object({
  themePreference: z.enum(["system", "light", "dark"]),
  weekStartsOn: z.union([z.literal(0), z.literal(1)]),
  defaultTaskPriority: z.enum(["low", "medium", "high"]),
});

export const studyFlowDataSchema = z.object({
  version: z.literal(STUDYFLOW_DATA_VERSION),
  courses: z.array(courseSchema),
  assignments: z.array(assignmentSchema),
  tasks: z.array(taskSchema),
  notes: z.array(noteSchema),
  profile: profileSchema,
  settings: settingsSchema,
});

function cloneDefaults(): StudyFlowData {
  return {
    ...DEFAULT_STUDYFLOW_DATA,
    courses: [],
    assignments: [],
    tasks: [],
    notes: [],
    profile: { ...DEFAULT_STUDYFLOW_DATA.profile },
    settings: { ...DEFAULT_STUDYFLOW_DATA.settings },
  };
}

function normalizeStoredData(value: unknown): StudyFlowData {
  const parsed = studyFlowDataSchema.safeParse(value);
  if (parsed.success) return parsed.data;

  if (!value || typeof value !== "object") return cloneDefaults();

  const candidate = value as Record<string, unknown>;
  if (candidate.version !== STUDYFLOW_DATA_VERSION) return cloneDefaults();

  const defaults = cloneDefaults();
  const courses = Array.isArray(candidate.courses)
    ? candidate.courses.flatMap((item) => {
        const result = courseSchema.safeParse(item);
        return result.success ? [result.data] : [];
      })
    : defaults.courses;
  const assignments = Array.isArray(candidate.assignments)
    ? candidate.assignments.flatMap((item) => {
        const result = assignmentSchema.safeParse(item);
        return result.success ? [result.data] : [];
      })
    : defaults.assignments;
  const tasks = Array.isArray(candidate.tasks)
    ? candidate.tasks.flatMap((item) => {
        const result = taskSchema.safeParse(item);
        return result.success ? [result.data] : [];
      })
    : defaults.tasks;
  const notes = Array.isArray(candidate.notes)
    ? candidate.notes.flatMap((item) => {
        const result = noteSchema.safeParse(item);
        return result.success ? [result.data] : [];
      })
    : defaults.notes;
  const profile = profileSchema.safeParse(candidate.profile);
  const settings = settingsSchema.safeParse(candidate.settings);

  return {
    version: STUDYFLOW_DATA_VERSION,
    courses,
    assignments,
    tasks,
    notes,
    profile: profile.success ? profile.data : defaults.profile,
    settings: settings.success ? settings.data : defaults.settings,
  };
}

export function loadStudyFlowData(): StudyFlowData {
  if (typeof window === "undefined") return cloneDefaults();

  try {
    const stored = window.localStorage.getItem(STUDYFLOW_STORAGE_KEY);
    return stored ? normalizeStoredData(JSON.parse(stored)) : cloneDefaults();
  } catch {
    return cloneDefaults();
  }
}

export function saveStudyFlowData(data: StudyFlowData): void {
  if (typeof window === "undefined") return;

  const parsed = studyFlowDataSchema.safeParse(data);
  if (!parsed.success) return;

  try {
    window.localStorage.setItem(STUDYFLOW_STORAGE_KEY, JSON.stringify(parsed.data));
  } catch {
    // Storage can be unavailable or full; product state remains usable in memory.
  }
}

export function clearStudyFlowData(): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(STUDYFLOW_STORAGE_KEY);
  } catch {
    // Ignore unavailable storage so reset remains safe during SSR/private browsing.
  }
}