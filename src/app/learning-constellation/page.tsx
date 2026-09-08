import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { LearningConstellation } from "@/components/learning-constellation/learning-constellation";

export const metadata: Metadata = {
  title: "Learning Constellation",
  description: "Explore your learning progress, discover connections, and find your next study step.",
};

export default function LearningConstellationPage() {
  return <AppShell><LearningConstellation /></AppShell>;
}
