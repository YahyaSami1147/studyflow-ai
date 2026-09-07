import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LandingPage } from "@/components/landing-page";

function mockMatchMedia(matches: boolean) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

describe("LandingPage", () => {
  beforeEach(() => {
    mockMatchMedia(false);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders the StudyFlow AI hero content and a decorative shader canvas", () => {
    render(<LandingPage />);

    expect(screen.getByRole("heading", { name: /StudyFlow AI/i })).toBeInTheDocument();
    expect(screen.getByText("Plan smarter. Study with clarity.")).toBeInTheDocument();

    const canvas = document.querySelector("canvas");
    expect(canvas).toBeInTheDocument();
    expect(canvas).toHaveAttribute("aria-hidden", "true");
    expect(canvas).not.toHaveAttribute("tabindex");
  });

  it("uses a static background fallback when reduced motion is preferred", () => {
    mockMatchMedia(true);
    render(<LandingPage />);

    expect(document.querySelector('[data-reduced-motion="true"]')).toBeInTheDocument();
    expect(document.querySelector("canvas")).not.toBeInTheDocument();
  });
});
