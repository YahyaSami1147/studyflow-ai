import { z } from "zod";
import { getAssignmentsDueToday, getCourseProgress, getOverdueAssignments, getOverdueTasks, getTaskCompletionPercentage, getTasksDueToday } from "@/lib/studyflow-selectors";
import type { StudyFlowData } from "@/types/studyflow";

const MAX_COURSES = 20;
const MAX_ASSIGNMENTS = 30;
const MAX_TASKS = 40;
const MAX_NOTES = 20;
const MAX_TEXT = 160;
const MAX_PREVIEW = 240;

const optionalBoundedText = z.string().max(MAX_TEXT).optional();
const id = z.string().min(1).max(80);
const date = z.string().datetime({ offset: true }).optional();
const priority = z.enum(["low", "medium", "high"]);

const contextCourseSchema = z.object({
  id,
  name: z.string().min(1).max(MAX_TEXT),
  code: optionalBoundedText,
  semester: optionalBoundedText,
  progress: z.number().int().min(0).max(100),
  completedWork: z.number().int().min(0),
  totalWork: z.number().int().min(0),
});

const contextAssignmentSchema = z.object({
  id,
  title: z.string().min(1).max(MAX_TEXT),
  courseId: id,
  courseName: z.string().min(1).max(MAX_TEXT),
  dueDate: date,
  status: z.enum(["not-started", "in-progress", "completed"]),
  priority,
  estimatedMinutes: z.number().int().positive().max(10000).optional(),
});

const contextTaskSchema = z.object({
  id,
  title: z.string().min(1).max(MAX_TEXT),
  courseId: id.optional(),
  courseName: optionalBoundedText,
  assignmentId: id.optional(),
  assignmentTitle: optionalBoundedText,
  dueDate: date,
  priority,
  completed: z.boolean(),
});

const contextNoteSchema = z.object({
  id,
  title: z.string().min(1).max(MAX_TEXT),
  courseId: id.optional(),
  courseName: optionalBoundedText,
  preview: z.string().max(MAX_PREVIEW),
});

export const studyFlowContextSchema = z.object({
  generatedAt: z.string().datetime({ offset: true }),
  profile: z.object({
    name: optionalBoundedText,
    program: optionalBoundedText,
    semester: optionalBoundedText,
    university: optionalBoundedText,
  }),
  courses: z.array(contextCourseSchema).max(MAX_COURSES),
  assignments: z.array(contextAssignmentSchema).max(MAX_ASSIGNMENTS),
  tasks: z.array(contextTaskSchema).max(MAX_TASKS),
  notes: z.array(contextNoteSchema).max(MAX_NOTES),
  progress: z.object({
    taskCompletionPercentage: z.number().int().min(0).max(100),
    assignmentCompletionPercentage: z.number().int().min(0).max(100),
    pendingTasks: z.number().int().min(0),
    pendingAssignments: z.number().int().min(0),
    overdueTasks: z.number().int().min(0),
    overdueAssignments: z.number().int().min(0),
    tasksDueToday: z.number().int().min(0),
    assignmentsDueToday: z.number().int().min(0),
  }),
});

export type StudyFlowContext = z.infer<typeof studyFlowContextSchema>;

const EMPTY_CONTEXT: StudyFlowContext = {
  generatedAt: new Date(0).toISOString(),
  profile: {},
  courses: [],
  assignments: [],
  tasks: [],
  notes: [],
  progress: {
    taskCompletionPercentage: 0,
    assignmentCompletionPercentage: 0,
    pendingTasks: 0,
    pendingAssignments: 0,
    overdueTasks: 0,
    overdueAssignments: 0,
    tasksDueToday: 0,
    assignmentsDueToday: 0,
  },
};

function text(value: string | undefined, limit = MAX_TEXT): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed.slice(0, limit) : undefined;
}

function rankDueDate(value: string | undefined): number {
  return value ? new Date(value).getTime() : Number.MAX_SAFE_INTEGER;
}

export function buildStudyFlowContext(data: StudyFlowData, now = new Date()): StudyFlowContext {
  const courseById = new Map(data.courses.map((course) => [course.id, course]));
  const assignmentById = new Map(data.assignments.map((assignment) => [assignment.id, assignment]));
  const overdueAssignmentIds = new Set(getOverdueAssignments(data, now).map((assignment) => assignment.id));
  const dueTodayAssignmentIds = new Set(getAssignmentsDueToday(data, now).map((assignment) => assignment.id));
  const overdueTaskIds = new Set(getOverdueTasks(data, now).map((task) => task.id));
  const dueTodayTaskIds = new Set(getTasksDueToday(data, now).map((task) => task.id));

  const courses = [...data.courses]
    .sort((first, second) => getCourseProgress(data, second.id) - getCourseProgress(data, first.id))
    .slice(0, MAX_COURSES)
    .map((course) => ({
      ...(() => {
        const assignments = data.assignments.filter((assignment) => assignment.courseId === course.id);
        const assignmentIds = new Set(assignments.map((assignment) => assignment.id));
        const tasks = data.tasks.filter((task) => task.courseId === course.id || (task.assignmentId ? assignmentIds.has(task.assignmentId) : false));
        return {
          completedWork: assignments.filter((assignment) => assignment.status === "completed").length + tasks.filter((task) => task.completed).length,
          totalWork: assignments.length + tasks.length,
        };
      })(),
      id: course.id,
      name: course.name.slice(0, MAX_TEXT),
      code: text(course.code),
      semester: text(course.semester),
      progress: getCourseProgress(data, course.id),
    }));

  const assignments = [...data.assignments]
    .sort((first, second) => Number(overdueAssignmentIds.has(second.id)) - Number(overdueAssignmentIds.has(first.id)) || Number(dueTodayAssignmentIds.has(second.id)) - Number(dueTodayAssignmentIds.has(first.id)) || Number(second.status !== "completed") - Number(first.status !== "completed") || rankDueDate(first.dueDate) - rankDueDate(second.dueDate))
    .slice(0, MAX_ASSIGNMENTS)
    .map((assignment) => ({
      id: assignment.id,
      title: assignment.title.slice(0, MAX_TEXT),
      courseId: assignment.courseId,
      courseName: (courseById.get(assignment.courseId)?.name ?? "Unknown course").slice(0, MAX_TEXT),
      dueDate: assignment.dueDate,
      status: assignment.status,
      priority: assignment.priority,
      estimatedMinutes: assignment.estimatedMinutes,
    }));

  const tasks = [...data.tasks]
    .sort((first, second) => Number(overdueTaskIds.has(second.id)) - Number(overdueTaskIds.has(first.id)) || Number(dueTodayTaskIds.has(second.id)) - Number(dueTodayTaskIds.has(first.id)) || Number(second.completed) - Number(first.completed) || rankDueDate(first.dueDate) - rankDueDate(second.dueDate))
    .slice(0, MAX_TASKS)
    .map((task) => {
      const assignment = task.assignmentId ? assignmentById.get(task.assignmentId) : undefined;
      return {
        id: task.id,
        title: task.title.slice(0, MAX_TEXT),
        courseId: task.courseId,
        courseName: text(task.courseId ? courseById.get(task.courseId)?.name : undefined),
        assignmentId: task.assignmentId,
        assignmentTitle: text(assignment?.title),
        dueDate: task.dueDate,
        priority: task.priority,
        completed: task.completed,
      };
    });

  const notes = [...data.notes]
    .sort((first, second) => second.updatedAt.localeCompare(first.updatedAt))
    .slice(0, MAX_NOTES)
    .map((note) => ({
      id: note.id,
      title: note.title.slice(0, MAX_TEXT),
      courseId: note.courseId,
      courseName: text(note.courseId ? courseById.get(note.courseId)?.name : undefined),
      preview: note.content.trim().slice(0, MAX_PREVIEW),
    }));

  const completedAssignments = data.assignments.filter((assignment) => assignment.status === "completed").length;
  return studyFlowContextSchema.parse({
    generatedAt: now.toISOString(),
    profile: {
      name: text(data.profile.name),
      program: text(data.profile.program),
      semester: text(data.profile.semester),
      university: text(data.profile.university),
    },
    courses,
    assignments,
    tasks,
    notes,
    progress: {
      taskCompletionPercentage: getTaskCompletionPercentage(data),
      assignmentCompletionPercentage: data.assignments.length ? Math.round((completedAssignments / data.assignments.length) * 100) : 0,
      pendingTasks: data.tasks.filter((task) => !task.completed).length,
      pendingAssignments: data.assignments.filter((assignment) => assignment.status !== "completed").length,
      overdueTasks: overdueTaskIds.size,
      overdueAssignments: overdueAssignmentIds.size,
      tasksDueToday: dueTodayTaskIds.size,
      assignmentsDueToday: dueTodayAssignmentIds.size,
    },
  });
}

export function parseStudyFlowContext(value: unknown): StudyFlowContext {
  const result = studyFlowContextSchema.safeParse(value);
  return result.success ? result.data : EMPTY_CONTEXT;
}

export function formatStudyFlowContext(context: StudyFlowContext): string {
  return [
    "Current StudyFlow context (local browser state, may be empty):",
    JSON.stringify(context),
  ].join("\n");
}

export const STUDYFLOW_CONTEXT_LIMITS = {
  courses: MAX_COURSES,
  assignments: MAX_ASSIGNMENTS,
  tasks: MAX_TASKS,
  notes: MAX_NOTES,
  textLength: MAX_TEXT,
  notePreviewLength: MAX_PREVIEW,
} as const;
