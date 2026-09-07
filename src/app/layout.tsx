import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { StudyFlowProvider } from "@/providers/studyflow-provider";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  weight: "600",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-ui",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "StudyFlow AI",
    template: "%s | StudyFlow AI",
  },
  description: "A focused workspace for planning, learning, and making progress.",
  icons: {
    icon: "/logo.jpg",
    apple: "/logo.jpg",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${fraunces.variable} ${ibmPlexMono.variable} font-ui`}><StudyFlowProvider>{children}</StudyFlowProvider></body>
    </html>
  );
}
