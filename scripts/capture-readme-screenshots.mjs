import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const baseURL = process.env.STUDYFLOW_REVIEW_URL || "http://127.0.0.1:3006";
const output = "public/readme";
const dates = { createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-10T00:00:00.000Z" };
const courses = [
  { id: "course-systems", name: "Software Systems", code: "SE401", description: "Build reliable software from clear foundations.", color: "#67e8f9", ...dates },
  { id: "course-design", name: "Human-Centered Design", code: "UX210", description: "Design useful, accessible experiences.", color: "#a78bfa", ...dates },
];
const assignments = [
  { id: "assignment-report", courseId: "course-systems", title: "Capstone report", status: "in-progress", priority: "high", ...dates },
  { id: "assignment-research", courseId: "course-design", title: "Research synthesis", status: "completed", priority: "medium", ...dates },
];
const tasks = [
  { id: "task-outline", courseId: "course-systems", title: "Outline implementation", priority: "high", completed: false, ...dates },
  { id: "task-review", courseId: "course-design", title: "Review interview notes", priority: "medium", completed: true, ...dates },
];
const storedData = { version: 1, courses, assignments, tasks, notes: [], profile: { name: "Reviewer" }, settings: { themePreference: "system", weekStartsOn: 1, defaultTaskPriority: "medium" } };

await mkdir(output, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
await page.addInitScript((data) => localStorage.setItem("studyflow:data", JSON.stringify(data)), storedData);
await page.goto(`${baseURL}/dashboard`, { waitUntil: "networkidle" });
await page.screenshot({ path: `${output}/dashboard.webp`, fullPage: true, type: "webp", quality: 82 });
await page.goto(`${baseURL}/courses`, { waitUntil: "networkidle" });
await page.screenshot({ path: `${output}/courses.webp`, fullPage: true, type: "webp", quality: 82 });
await page.goto(`${baseURL}/learning-constellation`, { waitUntil: "networkidle" });
await page.locator("canvas[data-ready='true']").waitFor();
await page.screenshot({ path: `${output}/learning-constellation.webp`, fullPage: true, type: "webp", quality: 82 });
await page.goto(`${baseURL}/ai`, { waitUntil: "networkidle" });
await page.screenshot({ path: `${output}/ai-assistant.webp`, fullPage: true, type: "webp", quality: 82 });
await browser.close();
console.log(`Captured screenshots in ${output}`);
