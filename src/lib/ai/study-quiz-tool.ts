import { z } from "zod";

const optionSchema = z.object({
  id: z.string().min(1).max(40),
  text: z.string().min(1).max(240),
});

const questionSchema = z.object({
  id: z.string().min(1).max(60),
  question: z.string().min(1).max(500),
  options: z.array(optionSchema).length(4),
  correctOptionId: z.string().min(1).max(40),
  explanation: z.string().max(500).optional(),
}).superRefine((question, context) => {
  const optionIds = new Set(question.options.map((option) => option.id));
  if (optionIds.size !== 4) context.addIssue({ code: "custom", path: ["options"], message: "Each question must have four unique options." });
  if (!optionIds.has(question.correctOptionId)) context.addIssue({ code: "custom", path: ["correctOptionId"], message: "The correct option must be one of the four options." });
});

export const studyQuizInputSchema = z.object({
  title: z.string().min(1).max(120),
  topic: z.string().min(1).max(160),
  questions: z.array(questionSchema).min(1).max(10),
}).superRefine((quiz, context) => {
  const questionIds = new Set(quiz.questions.map((question) => question.id));
  if (questionIds.size !== quiz.questions.length) context.addIssue({ code: "custom", path: ["questions"], message: "Question ids must be unique." });
});

export type StudyQuiz = z.infer<typeof studyQuizInputSchema>;

export type StudyFlowTools = {
  analyzeStudyProgress: {
    input: import("@/lib/ai/study-progress-tool").StudyProgressInput;
    output: import("@/lib/ai/study-progress-tool").StudyProgressAnalysis;
  };
  createStudyQuiz: {
    input: StudyQuiz;
    output: StudyQuiz;
  };
};

export const createStudyQuiz = {
  description: "Create an interactive multiple-choice quiz when the user explicitly asks for a quiz, MCQs, practice questions, or to be tested. Use exactly four options and one correct option per question. Use StudyFlow course context when relevant, but do not claim unavailable course materials.",
  inputSchema: studyQuizInputSchema,
  execute: async (input: StudyQuiz): Promise<StudyQuiz> => studyQuizInputSchema.parse(input),
};
