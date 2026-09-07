import type { StudyFlowMessage } from "@/components/ai/tool-cards";
import type { StudyProgressInput, StudyProgressAnalysis } from "@/lib/ai/study-progress-tool";
import type { StudyQuiz } from "@/lib/ai/study-quiz-tool";
import type { Assignment, Course } from "@/types/studyflow";

type ProgressPart = Extract<StudyFlowMessage["parts"][number], { type: "tool-analyzeStudyProgress" }>;
type QuizPart = Extract<StudyFlowMessage["parts"][number], { type: "tool-createStudyQuiz" }>;

export const progressInput: StudyProgressInput = {
  subject: "Software Engineering",
  completedTopics: 2,
  totalTopics: 4,
  hoursStudied: 8,
};

export const progressOutput: StudyProgressAnalysis = {
  subject: progressInput.subject,
  completionPercentage: 50,
  remainingTopics: 2,
  progressLevel: "On track",
  recommendedHours: 4,
};

export function makeProgressPart(overrides: Partial<ProgressPart> = {}): ProgressPart {
  return {
    type: "tool-analyzeStudyProgress",
    toolCallId: "progress-1",
    state: "output-available",
    input: progressInput,
    output: progressOutput,
    ...overrides,
  } as ProgressPart;
}

export const quiz: StudyQuiz = {
  title: "React Fundamentals",
  topic: "Components",
  questions: [
    {
      id: "q1",
      question: "Which hook stores component state?",
      options: [
        { id: "q1-a", text: "useState" },
        { id: "q1-b", text: "useEffect" },
        { id: "q1-c", text: "useMemo" },
        { id: "q1-d", text: "useRef" },
      ],
      correctOptionId: "q1-a",
      explanation: "useState stores local component state.",
    },
    {
      id: "q2",
      question: "Which syntax renders a component?",
      options: [
        { id: "q2-a", text: "<Component />" },
        { id: "q2-b", text: "render Component" },
        { id: "q2-c", text: "component()" },
        { id: "q2-d", text: "[Component]" },
      ],
      correctOptionId: "q2-a",
    },
  ],
};

export function makeQuizPart(overrides: Partial<QuizPart> = {}): QuizPart {
  return {
    type: "tool-createStudyQuiz",
    toolCallId: "quiz-1",
    state: "output-available",
    input: quiz,
    output: quiz,
    ...overrides,
  } as QuizPart;
}

export const courseA: Course = {
  id: "course-a",
  name: "Software Engineering",
  code: "CS 301",
  color: "#2563eb",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

export const courseB: Course = {
  id: "course-b",
  name: "Operating Systems",
  code: "CS 401",
  color: "#059669",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

export const assignmentA: Assignment = {
  id: "assignment-a",
  courseId: courseA.id,
  title: "Architecture review",
  dueDate: "2026-09-20T12:00:00.000Z",
  status: "not-started",
  priority: "medium",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

export const assignmentB: Assignment = {
  id: "assignment-b",
  courseId: courseB.id,
  title: "Kernel worksheet",
  dueDate: "2026-09-21T12:00:00.000Z",
  status: "not-started",
  priority: "high",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};
