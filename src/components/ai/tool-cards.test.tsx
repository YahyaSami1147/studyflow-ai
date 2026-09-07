import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { StudyProgressToolCard, StudyQuizToolCard } from "@/components/ai/tool-cards";
import { makeProgressPart, makeQuizPart, quiz } from "@/test/fixtures";

describe("StudyProgressToolCard", () => {
  it("renders a successful structured progress result", () => {
    render(<StudyProgressToolCard part={makeProgressPart()} />);

    expect(screen.getByRole("status")).toHaveTextContent("Software Engineering");
    expect(screen.getByText("50%")).toBeInTheDocument();
    expect(screen.getByText("2/4")).toBeInTheDocument();
    expect(screen.getByText("2 topics")).toBeInTheDocument();
    expect(screen.getByText("4 hrs")).toBeInTheDocument();
  });

  it("shows a progress tool error while exposing an alert", () => {
    render(<StudyProgressToolCard part={makeProgressPart({ state: "output-error", errorText: "Progress service unavailable." })} />);

    expect(screen.getByRole("alert")).toHaveTextContent("Progress analysis unavailable");
  });

  it("shows the pending progress preparation state", () => {
    render(<StudyProgressToolCard part={makeProgressPart({ state: "input-streaming", output: undefined })} />);

    expect(screen.getByRole("status")).toHaveTextContent("Preparing progress analysis");
  });
});

describe("StudyQuizToolCard", () => {
  it("checks the selected answer", async () => {
    const user = userEvent.setup();
    render(<StudyQuizToolCard part={makeQuizPart()} />);

    const answer = screen.getByRole("radio", { name: "useState" });
    await user.click(answer);

    expect(answer).toBeChecked();
  });

  it("rejects an incomplete quiz submission", async () => {
    const user = userEvent.setup();
    render(<StudyQuizToolCard part={makeQuizPart()} />);

    await user.click(screen.getByRole("radio", { name: "useState" }));
    await user.click(screen.getByRole("button", { name: "Submit quiz" }));

    expect(screen.getByRole("alert")).toHaveTextContent("Answer all 2 questions before submitting");
    expect(screen.queryByText("Score: 1/2 · 50%")).not.toBeInTheDocument();
  });

  it("scores a completed quiz deterministically", async () => {
    const user = userEvent.setup();
    render(<StudyQuizToolCard part={makeQuizPart()} />);

    await user.click(screen.getByRole("radio", { name: "useState" }));
    await user.click(screen.getByRole("radio", { name: "render Component" }));
    await user.click(screen.getByRole("button", { name: "Submit quiz" }));

    expect(screen.getByRole("status")).toHaveTextContent("Score: 1/2 · 50%");
    expect(screen.getByRole("status")).toHaveTextContent("Correct: 1 · Incorrect: 1");
    expect(screen.getByText((content) => content.includes("Correct answer:") && content.includes("<Component />"))).toBeInTheDocument();
    expect(screen.getByText(/Incorrect\. Correct answer:/)).toBeInTheDocument();
  });

  it("clears the previous report when the quiz is retaken", async () => {
    const user = userEvent.setup();
    render(<StudyQuizToolCard part={makeQuizPart()} />);

    for (const question of quiz.questions) {
      await user.click(screen.getByRole("radio", { name: question.options[0].text }));
    }
    await user.click(screen.getByRole("button", { name: "Submit quiz" }));
    await user.click(screen.getByRole("button", { name: "Retake quiz" }));

    expect(screen.queryByText(/Score:/)).not.toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "useState" })).not.toBeChecked();
    expect(screen.getByRole("heading", { name: "React Fundamentals" })).toBeInTheDocument();
  });
});
