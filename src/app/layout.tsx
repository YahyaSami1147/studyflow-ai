import type { Metadata } from "next";
import "./globals.css";
import { StudyFlowProvider } from "@/providers/studyflow-provider";

export const metadata: Metadata = {
  title: {
    default: "StudyFlow AI",
    template: "%s | StudyFlow AI",
  },
  description: "A focused workspace for planning, learning, and making progress.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body><StudyFlowProvider>{children}</StudyFlowProvider></body>
    </html>
  );
}
