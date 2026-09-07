import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TaskForm } from "@/components/tasks/task-form";
import { assignmentA, assignmentB, courseA, courseB } from "@/test/fixtures";

describe("TaskForm", () => {
  it("filters assignments to the selected course", async () => {
    const user = userEvent.setup();
    render(<TaskForm courses={[courseA, courseB]} assignments={[assignmentA, assignmentB]} defaultPriority="medium" onSubmit={vi.fn()} onCancel={vi.fn()} />);

    await user.selectOptions(screen.getByLabelText("Course"), courseA.id);

    expect(screen.getByRole("option", { name: "Architecture review" })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "Kernel worksheet" })).not.toBeInTheDocument();
  });
});
