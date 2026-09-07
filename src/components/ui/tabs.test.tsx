import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Tabs } from "@/components/ui/tabs";

const items = [
  { id: "overview", label: "Overview", content: <p>Overview content</p> },
  { id: "assignments", label: "Assignments", content: <p>Assignment content</p> },
  { id: "progress", label: "Progress", content: <p>Progress content</p> },
];

describe("Tabs", () => {
  it("renders accessible tabs with an associated active panel", () => {
    render(<Tabs items={items} ariaLabel="Course views" />);

    const tablist = screen.getByRole("tablist", { name: "Course views" });
    const overview = screen.getByRole("tab", { name: "Overview" });
    const panel = screen.getByRole("tabpanel");

    expect(tablist).toBeInTheDocument();
    expect(overview).toHaveAttribute("aria-selected", "true");
    expect(overview).toHaveAttribute("aria-controls", panel.id);
    expect(panel).toHaveAttribute("aria-labelledby", overview.id);
    expect(screen.getByText("Overview content")).toBeInTheDocument();
  });

  it("moves focus and selection with ArrowRight and wraps with ArrowLeft", async () => {
    const user = userEvent.setup();
    render(<Tabs items={items} />);
    const overview = screen.getByRole("tab", { name: "Overview" });
    const assignments = screen.getByRole("tab", { name: "Assignments" });
    const progress = screen.getByRole("tab", { name: "Progress" });

    overview.focus();
    await user.keyboard("{ArrowRight}");
    expect(assignments).toHaveFocus();
    expect(assignments).toHaveAttribute("aria-selected", "true");
    await user.keyboard("{ArrowRight}");
    expect(progress).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(overview).toHaveFocus();
    await user.keyboard("{ArrowLeft}");
    expect(progress).toHaveFocus();
  });

  it("moves to the first and last tabs with Home and End", async () => {
    const user = userEvent.setup();
    render(<Tabs items={items} />);
    const overview = screen.getByRole("tab", { name: "Overview" });
    const progress = screen.getByRole("tab", { name: "Progress" });

    overview.focus();
    await user.keyboard("{End}");
    expect(progress).toHaveFocus();
    expect(progress).toHaveAttribute("aria-selected", "true");
    await user.keyboard("{Home}");
    expect(overview).toHaveFocus();
    expect(overview).toHaveAttribute("aria-selected", "true");
    expect(screen.getAllByRole("tab").filter((tab) => tab.getAttribute("tabindex") === "0")).toHaveLength(1);
  });
});
