import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CourseForm } from "@/components/courses/course-form";
import { courseA } from "@/test/fixtures";

describe("CourseForm", () => {
  it("rejects a whitespace-only course name", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<CourseForm onSubmit={onSubmit} onCancel={vi.fn()} />);

    await user.type(screen.getByLabelText(/Course name/), "   ");
    fireEvent.submit(screen.getByRole("button", { name: "Add course" }).closest("form")!);

    expect(screen.getByRole("alert")).toHaveTextContent("Enter a course name to continue");
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits a valid course with trimmed values", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<CourseForm onSubmit={onSubmit} onCancel={vi.fn()} />);

    await user.type(screen.getByLabelText(/Course name/), "  Software Engineering  ");
    await user.type(screen.getByLabelText("Course code"), " CS 301 ");
    await user.click(screen.getByRole("button", { name: "Add course" }));

    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ name: "Software Engineering", code: "CS 301" }));
  });

  it("loads existing values in edit mode", () => {
    render(<CourseForm initialCourse={{ ...courseA, instructor: "Dr. Morgan", semester: "Fall 2026" }} onSubmit={vi.fn()} onCancel={vi.fn()} />);

    expect(screen.getByLabelText(/Course name/)).toHaveValue("Software Engineering");
    expect(screen.getByLabelText("Course code")).toHaveValue("CS 301");
    expect(screen.getByLabelText("Instructor")).toHaveValue("Dr. Morgan");
    expect(screen.getByLabelText("Semester")).toHaveValue("Fall 2026");
    expect(screen.getByRole("button", { name: "Save changes" })).toBeInTheDocument();
  });
});
