import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Modal } from "@/components/modal";

describe("Modal keyboard behavior", () => {
  it("closes when Escape is pressed", () => {
    const onClose = vi.fn();
    render(<Modal open={false} title="Edit course" onClose={onClose}>Form content</Modal>);

    fireEvent.keyDown(screen.getByRole("dialog", { hidden: true }), { key: "Escape" });

    expect(onClose).toHaveBeenCalledOnce();
  });
});