import { createOpenAI } from "@ai-sdk/openai";

export const STUDYFLOW_MODEL = "nvidia/nemotron-3.5-lightning-30b-a3b";
export const NVIDIA_BASE_URL = "https://integrate.api.nvidia.com/v1";

export const STUDYFLOW_SYSTEM_PROMPT = `You are StudyFlow AI, a helpful academic and study assistant.
Help users with study planning, exam preparation, course and topic explanations, task prioritization, study schedules, organizing academic work, productivity advice, and understanding notes or concepts shared in the conversation.
Be concise, practical, friendly, and academically useful. Ask a focused follow-up question when important context is missing, and avoid inventing details about the user's courses or deadlines.`;

export function getStudyFlowModel() {
  const apiKey = process.env.NVIDIA_API_KEY;

  if (!apiKey) {
    throw new Error("NVIDIA_API_KEY is not configured");
  }

  const nvidia = createOpenAI({
    apiKey,
    baseURL: NVIDIA_BASE_URL,
  });

  return nvidia.chat(STUDYFLOW_MODEL);
}