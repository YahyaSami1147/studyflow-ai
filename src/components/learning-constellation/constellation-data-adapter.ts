import { getCourseProgress, getTasksForCourse } from "@/lib/studyflow-selectors";
import type { Assignment, Course, StudyFlowData, Task } from "@/types/studyflow";
import type { KnowledgeNodeData, NodeStatus, Position3D } from "./types";

const subjectColors = ["#67e8f9", "#a78bfa", "#fbbf24", "#34d399", "#f9a8d4", "#fb7185"];

function hash(value: string): number {
  let result = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, 16777619);
  }
  return result >>> 0;
}

function positionFor(id: string, radius: number, verticalScale = 0.72): Position3D {
  const seed = hash(id);
  const angle = (seed % 360) * Math.PI / 180;
  const depth = ((seed >>> 8) % 1000) / 1000 - 0.5;
  return [Math.cos(angle) * radius, Math.sin(angle) * radius * verticalScale, depth * 2.4];
}

function subjectPosition(id: string): Position3D {
  const base = positionFor(`subject:${id}`, 3.35, 0.72);
  return [base[0], base[1], base[2] * 0.45];
}

function topicPosition(subjectId: string, id: string): Position3D {
  const base = positionFor(`topic:${subjectId}:${id}`, 1.35, 0.82);
  return base;
}

function itemProgress(item: Assignment | Task): number {
  if ("completed" in item) return item.completed ? 100 : 0;
  if (item.status === "completed") return 100;
  if (item.status === "in-progress") return 50;
  return 0;
}

function isOverdue(item: Assignment | Task, now: Date): boolean {
  if (!item.dueDate || itemProgress(item) === 100) return false;
  const due = new Date(item.dueDate);
  return !Number.isNaN(due.getTime()) && due.getTime() < now.getTime();
}

function itemStatus(item: Assignment | Task, now: Date): NodeStatus {
  if (isOverdue(item, now)) return "needs-review";
  if ("completed" in item) return item.completed ? "completed" : "in-progress";
  if (item.status === "completed") return "completed";
  if (item.status === "in-progress") return "in-progress";
  return "not-started";
}

function itemDescription(item: Assignment | Task): string {
  return item.description?.trim() || ("status" in item ? "Assignment activity from your StudyFlow workspace." : "Task activity from your StudyFlow workspace.");
}

function itemNextStep(item: Assignment | Task, status: NodeStatus): string {
  if (status === "needs-review") return `Review ${item.title}${item.dueDate ? ` and its ${new Date(item.dueDate).toLocaleDateString() } deadline` : ""}.`;
  if (status === "completed") return `Practice or revisit ${item.title}.`;
  if (status === "in-progress") return `Continue studying ${item.title}.`;
  return `Start ${item.title}.`;
}

function topicNode(course: Course, item: Assignment | Task, color: string, now: Date): KnowledgeNodeData {
  const status = itemStatus(item, now);
  const id = "completed" in item ? `task:${item.id}` : `assignment:${item.id}`;
  return {
    id,
    label: item.title,
    kind: "topic",
    subject: course.name,
    parentId: `course:${course.id}`,
    progress: itemProgress(item),
    mastery: null,
    status,
    position: topicPosition(course.id, id),
    importance: item.priority === "high" ? 0.75 : item.priority === "medium" ? 0.58 : 0.45,
    color,
    description: itemDescription(item),
    nextStep: itemNextStep(item, status),
    relatedIds: [],
  };
}

function subjectStatus(items: KnowledgeNodeData[], progress: number, now: Date, course: Course, data: StudyFlowData): NodeStatus {
  const courseAssignments = data.assignments.filter((assignment) => assignment.courseId === course.id);
  const courseTasks = getTasksForCourse(data, course.id);
  if (items.length === 0) return "not-started";
  if (items.some((item) => item.status === "needs-review") || courseAssignments.some((item) => isOverdue(item, now)) || courseTasks.some((item) => isOverdue(item, now))) return "needs-review";
  if (progress >= 100) return "completed";
  if (progress > 0) return "in-progress";
  return "not-started";
}

function subjectNextStep(course: Course, items: KnowledgeNodeData[]): string {
  const review = items.find((item) => item.status === "needs-review");
  if (review) return review.nextStep;
  const active = items.find((item) => item.status === "in-progress");
  if (active) return active.nextStep;
  if (items.length === 0) return `Add assignments or tasks to ${course.name} to start building this course.`;
  if (items.every((item) => item.status === "completed")) return `Practice or revisit your completed work in ${course.name}.`;
  return `Start studying ${course.name}.`;
}

export function buildConstellationFromStudyData(data: StudyFlowData, now = new Date()): KnowledgeNodeData[] {
  const subjects: KnowledgeNodeData[] = [];
  const topics: KnowledgeNodeData[] = [];

  for (const [index, course] of data.courses.entries()) {
    const color = course.color || subjectColors[index % subjectColors.length];
    const subjectId = `course:${course.id}`;
    const assignments = data.assignments.filter((assignment) => assignment.courseId === course.id);
    const tasks = getTasksForCourse(data, course.id);
    const children = [...assignments, ...tasks].map((item) => topicNode(course, item, color, now));
    const progress = getCourseProgress(data, course.id);
    const subject: KnowledgeNodeData = {
      id: subjectId,
      label: course.name,
      shortLabel: course.name,
      kind: "subject",
      subject: course.name,
      parentId: "core",
      progress,
      mastery: null,
      status: subjectStatus(children, progress, now, course, data),
      position: subjectPosition(course.id),
      importance: 1,
      color,
      description: course.description?.trim() || `Your StudyFlow work for ${course.name}.`,
      nextStep: subjectNextStep(course, children),
      relatedIds: children.map((child) => child.id),
    };
    subjects.push(subject);
    topics.push(...children);
  }

  const allChildren = [...subjects, ...topics];
  const progress = topics.length === 0 ? 0 : Math.round(topics.reduce((sum, node) => sum + node.progress, 0) / topics.length);
  const status: NodeStatus = subjects.length === 0 ? "not-started" : subjects.every((subject) => subject.status === "completed") ? "completed" : subjects.some((subject) => subject.status === "needs-review") ? "needs-review" : progress > 0 ? "in-progress" : "not-started";
  return [{
    id: "core",
    label: "StudyFlow",
    kind: "core",
    subject: "Your learning",
    parentId: null,
    progress,
    mastery: null,
    status,
    position: [0, 0, 0],
    importance: 1.4,
    color: "#38bdf8",
    description: subjects.length === 0 ? "Your learning map will appear here as you add courses, assignments, or tasks." : `A connected view of ${subjects.length} course${subjects.length === 1 ? "" : "s"} from your StudyFlow workspace.`,
    nextStep: subjects.length === 0 ? "Add a course, assignment, or task to start building your constellation." : "Select a course to see the work that shapes its progress.",
    relatedIds: allChildren.filter((node) => node.kind === "subject").map((node) => node.id),
  }, ...subjects, ...topics];
}