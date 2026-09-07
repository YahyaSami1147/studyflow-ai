import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CourseDetail } from "@/components/courses/course-detail";
import { assignmentA, courseA } from "@/test/fixtures";

const push = vi.fn();
const notes = [{
  id: "note-a",
  courseId: courseA.id,
  title: "Architecture notes",
  content: "Keep boundaries clear between modules.",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-02T00:00:00.000Z",
}];

vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
vi.mock("@/providers/studyflow-provider", () => ({
  useStudyFlow: () => ({
    isHydrated: true,
    getCourseById: () => courseA,
    getAssignmentsForCourse: () => [assignmentA],
    getNotesForCourse: () => notes,
    getTasksForCourse: () => [{ id: "task-a", courseId: courseA.id, title: "Review design", priority: "high", completed: true, createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" }],
    getCourseProgress: () => 100,
    updateCourse: vi.fn(),
    deleteCourse: vi.fn(),
  }),
}));

describe("CourseDetail tabs", () => {
  beforeEach(() => push.mockReset());

  it("switches between real course assignments, notes, and progress", async () => {
    const user = userEvent.setup();
    render(<CourseDetail courseId={courseA.id} />);

    expect(screen.getByRole("tab", { name: "Overview" })).toHaveAttribute("aria-selected", "true");
    await user.click(screen.getByRole("tab", { name: "Assignments" }));
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Architecture review");

    await user.click(screen.getByRole("tab", { name: "Notes" }));
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Architecture notes");
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Keep boundaries clear");

    await user.click(screen.getByRole("tab", { name: "Progress" }));
    expect(screen.getByRole("tabpanel")).toHaveTextContent("100%");
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Tasks complete");
  });
});
