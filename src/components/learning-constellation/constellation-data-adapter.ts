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

export interface CourseLayoutInput {
  id: string;
  childCount: number;
}

function clusterRadius(childCount: number): number {
  return 1.35 + Math.sqrt(Math.max(childCount, 1)) * 0.55;
}

function pushApart(positions: Position3D[], minimumDistance: (first: number, second: number) => number, iterations = 14): Position3D[] {
  const resolved = positions.map((position) => [...position] as Position3D);
  for (let iteration = 0; iteration < iterations; iteration += 1) {
    for (let first = 0; first < resolved.length; first += 1) {
      for (let second = first + 1; second < resolved.length; second += 1) {
        const left = resolved[first];
        const right = resolved[second];
        const delta: Position3D = [left[0] - right[0], left[1] - right[1], left[2] - right[2]];
        const actual = Math.hypot(delta[0], delta[1], delta[2]);
        const required = minimumDistance(first, second);
        if (actual >= required) continue;
        const fallbackAngle = (hash(`${first}:${second}`) % 360) * Math.PI / 180;
        const direction: Position3D = actual > 0.001 ? [delta[0] / actual, delta[1] / actual, delta[2] / actual] : [Math.cos(fallbackAngle), Math.sin(fallbackAngle) * 0.75, 0.2];
        const amount = (required - Math.max(actual, 0.001)) * 0.52;
        left[0] += direction[0] * amount;
        left[1] += direction[1] * amount;
        left[2] += direction[2] * amount;
        right[0] -= direction[0] * amount;
        right[1] -= direction[1] * amount;
        right[2] -= direction[2] * amount;
      }
    }
  }
  return resolved;
}

export function layoutCoursePositions(inputs: CourseLayoutInput[]): Map<string, Position3D> {
  const count = inputs.length;
  const candidates = inputs.map((input) => {
    const seed = hash(`course:${input.id}`);
    const angle = (seed % 360) * Math.PI / 180;
    const layer = count < 7 ? 0 : (seed >>> 8) % Math.max(2, Math.ceil(Math.sqrt(count / 3)));
    const radius = 5.8 + layer * 2.25 + ((seed >>> 16) % 100) / 100 * 0.45;
    const depth = (((seed >>> 24) % 1000) / 1000 - 0.5) * 3.6;
    return [Math.cos(angle) * radius, Math.sin(angle) * radius * 0.78, depth] as Position3D;
  });
  const resolved = pushApart(candidates, (first, second) => clusterRadius(inputs[first].childCount) + clusterRadius(inputs[second].childCount) + 0.85);
  return new Map(inputs.map((input, index) => [input.id, resolved[index]]));
}

export function layoutChildPositions(courseId: string, childIds: string[]): Map<string, Position3D> {
  if (childIds.length === 0) return new Map();
  const ringCount = Math.max(1, Math.ceil(Math.sqrt(childIds.length / 3)));
  const perRing = Math.ceil(childIds.length / ringCount);
  const candidates = childIds.map((id, index) => {
    const ring = Math.floor(index / perRing);
    const start = ring * perRing;
    const ringSize = Math.min(perRing, childIds.length - start);
    const seed = hash(`topic:${courseId}:${id}`);
    const phase = (seed % 360) * Math.PI / 180;
    const angle = phase + (index - start) * Math.PI * 2 / Math.max(ringSize, 1);
    const radius = 1.35 + ring * 0.9 + Math.sqrt(childIds.length) * 0.08;
    return [Math.cos(angle) * radius, Math.sin(angle) * radius * 0.78, Math.sin(angle * 1.7) * 0.9] as Position3D;
  });
  const resolved = pushApart(candidates, () => 0.58, 8);
  return new Map(childIds.map((id, index) => [id, resolved[index]]));
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

function topicNode(course: Course, item: Assignment | Task, color: string, now: Date, position: Position3D): KnowledgeNodeData {
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
    position,
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
  const courseItems = data.courses.map((course) => {
    const assignments = data.assignments.filter((assignment) => assignment.courseId === course.id);
    const tasks = getTasksForCourse(data, course.id);
    return { course, assignments, tasks, childCount: assignments.length + tasks.length };
  });
  const coursePositions = layoutCoursePositions(courseItems.map(({ course, childCount }) => ({ id: course.id, childCount })));

  for (const [index, { course, assignments, tasks }] of courseItems.entries()) {
    const color = course.color || subjectColors[index % subjectColors.length];
    const subjectId = `course:${course.id}`;
    const items = [...assignments, ...tasks];
    const childIds = items.map((item) => "completed" in item ? `task:${item.id}` : `assignment:${item.id}`);
    const childPositions = layoutChildPositions(course.id, childIds);
    const coursePosition = coursePositions.get(course.id) ?? [0, 0, 0];
    const children = items.map((item) => {
      const id = "completed" in item ? `task:${item.id}` : `assignment:${item.id}`;
      const offset = childPositions.get(id) ?? [0, 0, 0];
      return topicNode(course, item, color, now, offset);
    });
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
      position: coursePosition,
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