import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Disclosure } from "@/components/ui/disclosure";

describe("Disclosure", () => {
  it("starts collapsed and expands with a click", async () => {
    const user = userEvent.setup();
    render(<Disclosure label="Why is this correct?">Because the answer matches the definition.</Disclosure>);

    const trigger = screen.getByRole("button", { name: "Why is this correct?" });
    const panelId = trigger.getAttribute("aria-controls");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(panelId).toBeTruthy();
    expect(screen.queryByText("Because the answer matches the definition.")).not.toBeVisible();

    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Because the answer matches the definition.")).toBeVisible();
    expect(screen.getByRole("region")).toHaveAttribute("id", panelId);

    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("supports native keyboard activation", async () => {
    const user = userEvent.setup();
    render(<Disclosure label="Show details">Additional details</Disclosure>);
    const trigger = screen.getByRole("button", { name: "Show details" });

    trigger.focus();
    await user.keyboard("{Enter}");
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    await user.keyboard(" ");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });
});
