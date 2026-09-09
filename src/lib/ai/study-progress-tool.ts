import { z } from "zod";

export const studyProgressInputSchema = z.object({
  subject: z.string().min(1).max(80).describe("The course or subject being analysed."),
  completedTopics: z.number().int().min(0).describe("How many topics the student has completed."),
  totalTopics: z.number().int().positive().max(500).describe("The total number of topics in the course."),
  hoursStudied: z.number().min(0).max(10000).default(0).describe("The number of hours already studied, or 0 when StudyFlow has no time-tracking value."),
  simulateFailure: z.boolean().optional().describe("Only set to true when the user explicitly asks to test the tool error state."),
});

export type StudyProgressInput = z.infer<typeof studyProgressInputSchema>;

export type StudyProgressAnalysis = {
  subject: string;
  completionPercentage: number;
  remainingTopics: number;
  progressLevel: "Just starting" | "Building momentum" | "On track" | "Nearly complete" | "Complete";
  recommendedHours: number;
};

export type StudyFlowTools = {
  analyzeStudyProgress: {
    input: StudyProgressInput;
    output: StudyProgressAnalysis;
  };
};

export const analyzeStudyProgress = {
  description:
    "Calculate a student's study progress when they provide a subject, completed topic count, total topic count, and hours studied. Use this for requests to analyse, calculate, or check study progress. Do not estimate missing numbers; ask a focused follow-up question instead.",
  inputSchema: studyProgressInputSchema,
  execute: async ({ simulateFailure, ...input }: StudyProgressInput): Promise<StudyProgressAnalysis> => {
    console.log("[StudyFlow AI] analyzeStudyProgress started", { input });

    try {
      if (simulateFailure) {
        throw new Error("The progress service could not complete this test analysis.");
      }

      if (input.completedTopics > input.totalTopics) {
        throw new Error("Completed topics cannot be greater than total topics.");
      }

      const completionPercentage = Math.round((input.completedTopics / input.totalTopics) * 100);
      const remainingTopics = input.totalTopics - input.completedTopics;
      const recommendedHours = Math.max(0, Math.ceil(remainingTopics * 2));
      const progressLevel: StudyProgressAnalysis["progressLevel"] = completionPercentage === 100
        ? "Complete"
        : completionPercentage >= 75
          ? "Nearly complete"
          : completionPercentage >= 50
            ? "On track"
            : completionPercentage >= 25
              ? "Building momentum"
              : "Just starting";

      const result: StudyProgressAnalysis = { ...input, completionPercentage, remainingTopics, progressLevel, recommendedHours };
      console.log("[StudyFlow AI] analyzeStudyProgress finished", { result });
      return result;
    } catch (error) {
      console.error("[StudyFlow AI] analyzeStudyProgress failed", { input, error });
      throw error;
    }
  },
};
