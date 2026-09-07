import { expect, test } from "@playwright/test";

test("creates and completes a study workflow visible on the dashboard", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.removeItem("studyflow:data"));
  await page.goto("/courses");
  await expect(page.getByRole("heading", { name: "Courses", exact: true })).toBeVisible();
  await expect(page.getByText("No courses yet")).toBeVisible();
  await page.getByRole("button", { name: "Add course", exact: true }).first().click();

  const courseDialog = page.getByRole("dialog");
  await expect(courseDialog).toBeVisible();
  await courseDialog.getByLabel(/Course name/).fill("Software Engineering");
  await courseDialog.getByLabel("Course code").fill("SE401");
  await courseDialog.getByLabel("Instructor").fill("Test Instructor");
  await courseDialog.getByLabel("Semester").fill("Fall 2026");
  await courseDialog.getByRole("button", { name: "Add course", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Software Engineering" })).toBeVisible();
  await expect(page.getByText("SE401", { exact: true })).toBeVisible();

  await page.getByRole("link", { name: "Assignments", exact: true }).first().click();
  await expect(page.getByRole("heading", { name: "Assignments", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Add assignment", exact: true }).click();

  const assignmentDialog = page.getByRole("dialog");
  await expect(assignmentDialog).toBeVisible();
  await assignmentDialog.getByLabel("Course").selectOption({ label: "Software Engineering · SE401" });
  await assignmentDialog.getByLabel("Title").fill("Capstone Report");
  await assignmentDialog.getByLabel("Due date").fill("2030-12-15");
  await assignmentDialog.getByLabel("Priority").selectOption("high");
  await assignmentDialog.getByLabel("Status").selectOption("not-started");
  await assignmentDialog.getByRole("button", { name: "Add assignment", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Capstone Report" })).toBeVisible();
  await expect(page.getByText("Software Engineering", { exact: true })).toBeVisible();

  await page.getByRole("link", { name: "Tasks", exact: true }).first().click();
  await expect(page.getByRole("heading", { name: "Tasks", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Add task", exact: true }).click();

  const taskDialog = page.getByRole("dialog");
  await expect(taskDialog).toBeVisible();
  await taskDialog.getByLabel("Title").fill("Finish introduction");
  await taskDialog.getByLabel("Course").selectOption({ label: "Software Engineering · SE401" });
  await taskDialog.getByLabel("Assignment").selectOption({ label: "Capstone Report" });
  await taskDialog.getByLabel("Priority").selectOption("high");
  await taskDialog.getByRole("button", { name: "Add task", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Finish introduction" })).toBeVisible();
  const taskCard = page.getByRole("article").filter({ hasText: "Finish introduction" });
  await expect(taskCard.getByText("Capstone Report", { exact: true })).toBeVisible();

  await expect.poll(async () => page.evaluate(() => {
    const stored = window.localStorage.getItem("studyflow:data");
    if (!stored) return false;
    const data = JSON.parse(stored) as { tasks?: Array<{ title?: string }> };
    return data.tasks?.some((task) => task.title === "Finish introduction") ?? false;
  })).toBe(true);
  await page.reload();
  await expect(page.getByRole("heading", { name: "Finish introduction" })).toBeVisible();
  await expect(page.getByRole("article").filter({ hasText: "Finish introduction" }).getByText("Capstone Report", { exact: true })).toBeVisible();

  const completionCheckbox = page.getByRole("checkbox", { name: "Mark Finish introduction complete" });
  await completionCheckbox.check();
  await expect(page.getByRole("checkbox", { name: "Mark Finish introduction incomplete" })).toBeChecked();
  await expect(page.getByRole("status")).toHaveText("Finish introduction marked complete.");

  await page.getByRole("link", { name: "Overview", exact: true }).first().click();
  await expect(page.getByRole("heading", { name: /Good (morning|afternoon|evening)\./ })).toBeVisible();
  const overview = page.getByRole("region", { name: "Study overview" });
  await expect(overview).toBeVisible();

  const coursesMetric = overview.getByText("Courses", { exact: true }).locator("..").locator("..");
  const pendingTasksMetric = overview.getByText("Pending tasks", { exact: true }).locator("..").locator("..");
  const upcomingAssignmentsMetric = overview.getByText("Upcoming assignments", { exact: true }).locator("..").locator("..");
  const taskCompletionMetric = overview.getByText("Task completion", { exact: true }).locator("..").locator("..");
  await expect(coursesMetric).toContainText("1");
  await expect(pendingTasksMetric).toContainText("0");
  await expect(upcomingAssignmentsMetric).toContainText("1");
  await expect(taskCompletionMetric).toContainText("100%");
  await expect(page.getByRole("link", { name: /Capstone Report/ })).toBeVisible();
  await expect(page.getByText("Software Engineering", { exact: true })).toBeVisible();
});
