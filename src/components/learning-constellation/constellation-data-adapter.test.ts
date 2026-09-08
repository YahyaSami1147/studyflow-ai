import { describe, expect, it } from "vitest";
import { loadStudyFlowData, STUDYFLOW_STORAGE_KEY } from "@/lib/studyflow-storage";
import type { StudyFlowData } from "@/types/studyflow";
import { buildConstellationFromStudyData } from "./constellation-data-adapter";

const now = new Date("2026-01-15T12:00:00.000Z");
const dates = { createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-10T00:00:00.000Z" };

function studyData(overrides: Partial<StudyFlowData> = {}): StudyFlowData {
  return {
    version: 1,
    courses: [],
    assignments: [],
    tasks: [],
    notes: [],
    profile: { name: "" },
    settings: { themePreference: "system", weekStartsOn: 1, defaultTaskPriority: "medium" },
    ...overrides,
  };
}

const course = { id: "course-1", name: "Biology", description: "Cells and systems.", color: "#22c55e", ...dates };

describe("buildConstellationFromStudyData", () => {
  it("returns only the honest synthetic root for empty data", () => {
    const nodes = buildConstellationFromStudyData(studyData(), now);
    expect(nodes).toHaveLength(1);
    expect(nodes[0]).toMatchObject({ id: "core", progress: 0, status: "not-started", mastery: null });
  });

  it("creates a subject even when a course has no topics", () => {
    const nodes = buildConstellationFromStudyData(studyData({ courses: [course] }), now);
    expect(nodes).toHaveLength(2);
    expect(nodes[1]).toMatchObject({ id: "course:course-1", label: "Biology", progress: 0, status: "not-started", mastery: null });
  });

  it("maps assignments and standalone tasks to real child nodes", () => {
    const nodes = buildConstellationFromStudyData(studyData({
      courses: [course],
      assignments: [{ id: "assignment-1", courseId: course.id, title: "Lab report", status: "completed", priority: "medium", ...dates }],
      tasks: [{ id: "task-1", courseId: course.id, title: "Read chapter 2", priority: "high", completed: false, ...dates }],
    }), now);
    expect(nodes.filter((node) => node.kind === "topic")).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: "assignment:assignment-1", label: "Lab report", progress: 100, status: "completed" }),
      expect.objectContaining({ id: "task:task-1", label: "Read chapter 2", progress: 0, status: "in-progress" }),
    ]));
    expect(nodes.find((node) => node.id === "course:course-1")?.progress).toBe(50);
  });

  it("derives needs-review only from a real overdue item", () => {
    const nodes = buildConstellationFromStudyData(studyData({
      courses: [course],
      assignments: [{ id: "assignment-1", courseId: course.id, title: "Missed lab", status: "in-progress", priority: "high", dueDate: "2026-01-10T00:00:00.000Z", ...dates }],
    }), now);
    expect(nodes.find((node) => node.kind === "topic")).toMatchObject({ status: "needs-review" });
    expect(nodes.find((node) => node.kind === "subject")).toMatchObject({ status: "needs-review" });
  });

  it("keeps positions stable for the same data and does not require optional descriptions", () => {
    const minimalCourse = { id: "course-2", name: "Chemistry", ...dates };
    const data = studyData({ courses: [minimalCourse] });
    const first = buildConstellationFromStudyData(data, now);
    const second = buildConstellationFromStudyData(data, now);
    expect(first).toEqual(second);
    expect(first.find((node) => node.kind === "subject")?.description).toBe("Your StudyFlow work for Chemistry.");
  });

  it("does not throw when the shared storage contains invalid JSON", () => {
    window.localStorage.setItem(STUDYFLOW_STORAGE_KEY, "{not-json");
    expect(loadStudyFlowData()).toMatchObject({ courses: [], assignments: [], tasks: [] });
  });
});
