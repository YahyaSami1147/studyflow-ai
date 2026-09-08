import { expect, test, type Locator, type Page } from "@playwright/test";

const route = "/learning-constellation";

function sceneCanvas(page: Page) {
  return page.getByTestId("constellation-webgl").locator("canvas");
}

async function openScene(page: Page, options: { requireWebGL?: boolean } = {}) {
  const { requireWebGL = false } = options;
  await seedStudyFlowData(page);
  await page.goto(route);
  await expect(page.getByRole("heading", { name: /^Learning Constellation/ })).toBeVisible();

  const canvas = sceneCanvas(page);
  const fallback = page.getByText("Explore your knowledge in 2D", { exact: true });

  await expect.poll(async () => {
    const canvasCount = await canvas.count();
    const ready = canvasCount > 0 && (await canvas.getAttribute("data-ready").catch(() => null)) === "true";
    const fallbackVisible = await fallback.isVisible().catch(() => false);
    return ready || fallbackVisible;
  }, { timeout: 15000 }).toBeTruthy();

  const fallbackVisible = await fallback.isVisible().catch(() => false);
  if (fallbackVisible) {
    if (requireWebGL) {
      return null;
    }
    return null;
  }

  await expect(canvas).toHaveAttribute("data-ready", "true", { timeout: 15000 });
  await expect(canvas).toHaveAttribute("data-camera-position", /\d/, { timeout: 15000 });
  return canvas;
}

async function open3DScene(page: Page) {
  const canvas = await openScene(page, { requireWebGL: true });
  if (!canvas) {
    test.skip(true, "WebGL is unavailable in this browser/CI environment; the app correctly rendered the supported fallback.");
  }
  return canvas as Locator;
}

async function seedStudyFlowData(page: Page) {
  await page.addInitScript(() => {
    const dates = { createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-10T00:00:00.000Z" };
    localStorage.setItem("studyflow:data", JSON.stringify({
      version: 1,
      courses: [{ id: "course-math", name: "Mathematics", description: "Real course data", color: "#67e8f9", ...dates }],
      assignments: [
        { id: "assignment-algebra", courseId: "course-math", title: "Algebra", status: "completed", priority: "medium", ...dates },
        { id: "assignment-calculus", courseId: "course-math", title: "Calculus", status: "in-progress", priority: "medium", ...dates },
        { id: "assignment-probability", courseId: "course-math", title: "Probability", status: "in-progress", priority: "high", dueDate: "2025-12-01T00:00:00.000Z", ...dates },
      ],
      tasks: [],
      notes: [],
      profile: { name: "Reviewer" },
      settings: { themePreference: "system", weekStartsOn: 1, defaultTaskPriority: "medium" },
    }));
  });
}

async function cameraPosition(canvas: Locator) {
  return canvas.getAttribute("data-camera-position");
}

async function tap(page: Page, target: Locator) {
  await target.scrollIntoViewIfNeeded();
  const bounds = await target.boundingBox();
  if (!bounds) throw new Error("Touch target is missing its bounds");
  await page.touchscreen.tap(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
}

test("real 3D selection focuses a subject, expands topics, and updates study guidance", async ({ page, browserName }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });

  const canvas = await open3DScene(page);
  const initialCamera = await cameraPosition(canvas);
  const selected = page.getByRole("complementary", { name: "Selected knowledge" });
  await expect(selected.getByRole("heading", { name: "Your learning", exact: true })).toBeVisible();

  const webgl = await canvas.evaluate((element) => {
    const context = (element as HTMLCanvasElement).getContext("webgl2");
    return context ? { width: context.drawingBufferWidth, height: context.drawingBufferHeight, lost: context.isContextLost() } : null;
  });
  expect(webgl).not.toBeNull();
  expect(webgl?.lost).toBe(false);
  expect(webgl?.width).toBeGreaterThan(100);

  await page.getByRole("button", { name: "Select Mathematics", exact: true }).click({ force: browserName === "webkit" });
  await expect(selected.getByRole("heading", { name: "Mathematics", exact: true })).toBeVisible();
  await expect(selected).toContainText("33%");
  await expect.poll(() => cameraPosition(canvas)).not.toBe(initialCamera);
  await expect(page.getByRole("button", { name: "Select Probability", exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Select Probability", exact: true }).click({ force: browserName === "webkit" });
  await expect(selected.getByRole("heading", { name: "Probability", exact: true })).toBeVisible();
  await expect(selected).toContainText(/review/i);
  await expect(selected.getByRole("link").first()).toHaveAttribute("href", /^\/(tasks|notes|ai|courses|progress|calendar)/);

  await page.getByRole("button", { name: "Reset view", exact: true }).click();
  await expect(selected.getByRole("heading", { name: "Your learning", exact: true })).toBeVisible();
  await expect.poll(() => cameraPosition(canvas)).not.toBe(initialCamera);
  await expect(canvas).toHaveAttribute("data-camera-moving", "false");
  const resetCamera = await cameraPosition(canvas);
  if (browserName !== "webkit") await expect.poll(() => cameraPosition(canvas)).toBe(resetCamera);
  expect(errors).toEqual([]);
});

test("manual orbit and zoom continue to work after automatic focus", async ({ page, browserName, isMobile }) => {
  test.skip(isMobile && browserName === "webkit", "Mobile WebKit does not support page.mouse.wheel(); the touch/pinch coverage exercises the equivalent interaction path.");
  const canvas = await open3DScene(page);
  const initialTarget = await canvas.getAttribute("data-camera-target");
  const selectMath = page.getByRole("button", { name: "Select Mathematics", exact: true });
  await expect(selectMath).toBeVisible({ timeout: 20000 });
  await selectMath.click({ force: browserName === "webkit" || browserName === "firefox" });
  await expect(page.getByRole("complementary", { name: "Selected knowledge" })).toContainText("Mathematics");
  await expect(canvas).toHaveAttribute("data-camera-target", /\d/);
  // The snapshot updates at the end of the focus transition.
  await expect.poll(async () => canvas.getAttribute("data-camera-target")).not.toBe(initialTarget);
  const focusedCamera = await cameraPosition(canvas);
  const bounds = await canvas.boundingBox();
  if (!bounds) throw new Error("Canvas is missing its bounds");
  await page.mouse.move(bounds.x + bounds.width * 0.3, bounds.y + bounds.height * 0.7);
  await page.mouse.down();
  await page.mouse.move(bounds.x + bounds.width * 0.55, bounds.y + bounds.height * 0.65, { steps: 12 });
  await page.mouse.up();
  await expect.poll(() => cameraPosition(canvas)).not.toBe(focusedCamera);
  const orbitedCamera = await cameraPosition(canvas);
  await page.mouse.wheel(0, -160);
  await expect.poll(() => cameraPosition(canvas)).not.toBe(orbitedCamera);
});

test("keyboard users can inspect and filter the same knowledge in 2D", async ({ page }) => {
  await openScene(page);
  await page.getByRole("button", { name: "2D view", exact: true }).click();
  await expect(page.getByText("Explore your knowledge in 2D", { exact: true })).toBeVisible();
  const browse = page.getByRole("region", { name: "Browse knowledge" });
  const mathematics = browse.getByRole("button", { name: /Mathematics/ });
  await mathematics.focus();
  await page.keyboard.press("Enter");
  await expect(mathematics).toHaveAttribute("aria-pressed", "true");
  const probability = browse.getByRole("button", { name: /Probability/ });
  await probability.focus();
  await page.keyboard.press("Space");
  await expect(page.getByRole("complementary", { name: "Selected knowledge" }).getByRole("heading", { name: "Probability", exact: true })).toBeVisible();
  await page.getByRole("button", { name: /^Needs review/ }).click();
  await expect(page.getByRole("button", { name: /^Needs review/ })).toHaveAttribute("aria-pressed", "true");
  await expect(probability).toBeVisible();
  await expect(browse.getByRole("button", { name: /Algebra/ })).toHaveCount(0);
  await expect(browse.getByRole("button", { name: /Calculus/ })).toHaveCount(0);
  await page.getByRole("button", { name: /^All topics/ }).click();
  await expect(browse.getByRole("button", { name: /Algebra/ })).toBeVisible();
  await page.getByRole("button", { name: "3D view", exact: true }).click();
  await expect(sceneCanvas(page)).toHaveAttribute("data-ready", "true");
});

for (const width of [375, 390, 430]) {
  test(`touch selection, orbit, pinch, and page navigation work at ${width}px`, async ({ browser, browserName }) => {
    const context = await browser.newContext({ viewport: { width, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
    const page = await context.newPage();
    try {
      const canvas = await open3DScene(page);
      const initialTarget = await canvas.getAttribute("data-camera-target");
      const stage = page.getByTestId("constellation-stage");
      await stage.scrollIntoViewIfNeeded();
      const enableTouch = page.getByRole("button", { name: "Enable touch exploration", exact: true });
      const selectMath = page.getByRole("button", { name: "Select Mathematics", exact: true });
      await expect(enableTouch).toBeVisible({ timeout: 20000 });
      await tap(page, enableTouch);
      await expect(selectMath).toBeVisible({ timeout: 20000 });
      await tap(page, selectMath);
      const selected = page.getByRole("complementary", { name: "Selected knowledge" });
      await expect(selected.getByRole("heading", { name: "Mathematics", exact: true })).toBeVisible();
      await expect.poll(async () => canvas.getAttribute("data-camera-target")).not.toBe(initialTarget);
      const subjectTarget = await canvas.getAttribute("data-camera-target");
      await tap(page, page.getByRole("button", { name: "Select Probability", exact: true }));
      await expect(selected.getByRole("heading", { name: "Probability", exact: true })).toBeVisible();
      await expect.poll(async () => canvas.getAttribute("data-camera-target")).not.toBe(subjectTarget);
      if (browserName !== "chromium") {
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
        expect((await selected.boundingBox())?.width).toBeLessThanOrEqual(width);
        return;
      }
      await canvas.scrollIntoViewIfNeeded();
      const bounds = await canvas.boundingBox();
      if (!bounds) throw new Error("Canvas is missing its bounds");
      const x = bounds.x + bounds.width / 2;
      const y = bounds.y + bounds.height * 0.7;
      const cdp = await context.newCDPSession(page);
      const initial = await cameraPosition(canvas);
      await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: x - 40, y, id: 1 }] });
      for (let step = 1; step <= 8; step++) {
        await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: x - 40 + step * 10, y: y - step * 3, id: 1 }] });
      }
      await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
      await expect.poll(() => cameraPosition(canvas)).not.toBe(initial);

      const beforePinch = await cameraPosition(canvas);
      await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: x - 30, y, id: 1 }, { x: x + 30, y, id: 2 }] });
      for (let step = 1; step <= 6; step++) {
        await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: x - 30 - step * 5, y, id: 1 }, { x: x + 30 + step * 5, y, id: 2 }] });
      }
      await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
      await expect.poll(() => cameraPosition(canvas)).not.toBe(beforePinch);
      await tap(page, page.getByRole("button", { name: "Finish exploring", exact: true }));
      await expect(page.getByRole("button", { name: "Enable touch exploration", exact: true })).toBeVisible();
      await canvas.scrollIntoViewIfNeeded();
      const scrollBounds = await canvas.boundingBox();
      if (!scrollBounds) throw new Error("Canvas is missing its bounds");
      const scrollBefore = await page.evaluate(() => window.scrollY);
      const scrollX = scrollBounds.x + scrollBounds.width * 0.1;
      const scrollY = scrollBounds.y + scrollBounds.height * 0.7;
      await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: scrollX, y: scrollY, id: 1 }] });
      for (let step = 1; step <= 8; step++) {
        await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: scrollX, y: scrollY - step * 15, id: 1 }] });
      }
      await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
      await expect.poll(() => page.evaluate(() => window.scrollY)).not.toBe(scrollBefore);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      const panelBounds = await selected.boundingBox();
      expect(panelBounds?.width).toBeLessThanOrEqual(width);
      await page.evaluate(() => window.scrollTo(0, 0));
      await expect(page.getByRole("link", { name: "Profile", exact: true }).first()).toBeVisible();
      await cdp.detach();
    } finally {
      await context.close();
    }
  });
}

test("reduced motion retains 3D selection without continuous animation", async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  try {
    const canvas = await open3DScene(page);
    const initialTarget = await canvas.getAttribute("data-camera-target");
    await expect(page.getByTestId("constellation-webgl")).toHaveAttribute("data-motion", "reduced");
    await page.getByRole("button", { name: "Select Mathematics", exact: true }).click();
    await expect(page.getByRole("button", { name: "Select Probability", exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Select Probability", exact: true }).click();
    await expect(page.getByRole("complementary", { name: "Selected knowledge" }).getByRole("heading", { name: "Probability", exact: true })).toBeVisible();
    await expect.poll(async () => canvas.getAttribute("data-camera-target")).not.toBe(initialTarget);
    await expect(canvas).toHaveAttribute("data-camera-moving", "false");
    const settled = await canvas.screenshot();
    await page.waitForTimeout(350);
    expect(await canvas.screenshot()).toEqual(settled);
  } finally {
    await context.close();
  }
});

test("unsupported WebGL retains progress and selection in an accessible fallback", async ({ page }) => {
  await seedStudyFlowData(page);
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
      value(this: HTMLCanvasElement, contextId: string, ...args: unknown[]) {
        if (contextId === "webgl2" || contextId === "webgl" || contextId === "experimental-webgl") return null;
        return Reflect.apply(original, this, [contextId, ...args]);
      },
    });
  });
  await page.goto(route);
  await expect(page.getByText("Explore your knowledge in 2D", { exact: true })).toBeVisible();
  await page.getByRole("region", { name: "Browse knowledge" }).getByRole("button", { name: /Mathematics/ }).click();
  await expect(page.getByRole("complementary", { name: "Selected knowledge" })).toContainText("33%");
  await page.getByRole("region", { name: "Browse knowledge" }).getByRole("button", { name: /Probability/ }).click();
  await expect(page.getByRole("complementary", { name: "Selected knowledge" }).getByRole("heading", { name: "Probability", exact: true })).toBeVisible();
});

test("WebGL context loss fails independently and preserves selected knowledge", async ({ page, browserName }) => {
  const canvas = await open3DScene(page);
  const selectMath = page.getByRole("button", { name: "Select Mathematics", exact: true });
  await expect(selectMath).toBeVisible({ timeout: 20000 });
  await selectMath.click({ force: browserName === "webkit" });
  await canvas.dispatchEvent("webglcontextlost", { cancelable: true });
  await expect(page.getByText("Explore your knowledge in 2D", { exact: true })).toBeVisible();
  await expect(page.getByRole("complementary", { name: "Selected knowledge" }).getByRole("heading", { name: "Mathematics", exact: true })).toBeVisible();
  await page.getByRole("region", { name: "Browse knowledge" }).getByRole("button", { name: /Probability/ }).click();
  await expect(page.getByRole("complementary", { name: "Selected knowledge" }).getByRole("heading", { name: "Probability", exact: true })).toBeVisible();
});

test("loading presents a designed constellation before JavaScript is available", async ({ page }) => {
  await seedStudyFlowData(page);
  let releaseScripts: () => void = () => {};
  const scriptsReleased = new Promise<void>((resolve) => { releaseScripts = resolve; });
  await page.route("**/_next/static/**/*.js", async (request) => {
    await scriptsReleased;
    await request.continue();
  });
  try {
    await page.goto(route, { waitUntil: "commit" });
    await expect(page.getByText("Building your learning constellation…", { exact: true })).toBeVisible();
    await expect(page.getByTestId("constellation-stage")).toBeVisible();
  } finally {
    releaseScripts();
  }
  await expect(sceneCanvas(page)).toHaveAttribute("data-ready", "true");
});
