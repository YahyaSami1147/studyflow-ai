import { chromium } from "@playwright/test";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { gzipSync } from "node:zlib";

const baseURL = process.env.STUDYFLOW_REVIEW_URL || "http://127.0.0.1:3000";
const output = path.resolve("test-results/learning-constellation-review");
await mkdir(output, { recursive: true });
const browser = await chromium.launch();

// Counts actual WebGL draw calls grouped by their requestAnimationFrame timestamp.
// This is a diagnostic for this review run, never shipped with the application.
function instrumentRendering() {
  const stats = { frames: [], drawCalls: 0, lastTimestamp: -1, timestamp: 0 };
  Object.defineProperty(window, "__constellationReview", { value: stats });
  const requestFrame = window.requestAnimationFrame.bind(window);
  window.requestAnimationFrame = (callback) => requestFrame((timestamp) => {
    stats.timestamp = timestamp;
    callback(timestamp);
  });
  for (const contextType of [window.WebGLRenderingContext, window.WebGL2RenderingContext]) {
    if (!contextType) continue;
    for (const method of ["drawArrays", "drawElements", "drawArraysInstanced", "drawElementsInstanced"]) {
      if (!Object.hasOwn(contextType.prototype, method)) continue;
      const original = contextType.prototype[method];
      if (typeof original !== "function") continue;
      contextType.prototype[method] = function (...args) {
        stats.drawCalls += 1;
        if (stats.timestamp !== stats.lastTimestamp) {
          stats.frames.push(stats.timestamp);
          stats.lastTimestamp = stats.timestamp;
        }
        return Reflect.apply(original, this, args);
      };
    }
  }
}

async function renderingSnapshot(page) {
  return page.evaluate(() => {
    const stats = window.__constellationReview;
    return { frames: [...stats.frames], drawCalls: stats.drawCalls };
  });
}

function frameSummary(before, after, elapsedMs) {
  const frames = after.frames.slice(before.frames.length);
  const intervals = frames.slice(1).map((timestamp, index) => timestamp - frames[index]);
  const sorted = [...intervals].sort((a, b) => a - b);
  return {
    observedWindowMs: elapsedMs,
    renderedFrames: frames.length,
    drawCalls: after.drawCalls - before.drawCalls,
    medianFrameIntervalMs: sorted.length ? sorted[Math.floor(sorted.length / 2)] : null,
    p95FrameIntervalMs: sorted.length ? sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * 0.95))] : null,
    intervalsOver34ms: intervals.filter((interval) => interval > 34).length,
  };
}

async function metrics(cdp) {
  const result = await cdp.send("Performance.getMetrics");
  return Object.fromEntries(result.metrics.filter(({ name }) => ["JSHeapUsedSize", "JSHeapTotalSize", "TaskDuration", "ScriptDuration", "LayoutCount", "RecalcStyleCount", "Nodes"].includes(name)).map(({ name, value }) => [name, value]));
}

async function routeResources(route) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1.5 });
  const page = await context.newPage();
  try {
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(`${baseURL}${route}`, { waitUntil: "networkidle" });
    if (route === "/learning-constellation") await page.locator("canvas[data-ready='true']").waitFor();
    const resources = await page.evaluate(() => ({
      navigation: performance.getEntriesByType("navigation").map((entry) => entry.toJSON()),
      resources: performance.getEntriesByType("resource").map((entry) => entry.toJSON()),
    }));
    const scripts = resources.resources.filter((resource) => new URL(resource.name).pathname.endsWith(".js")).map((resource) => ({
      path: new URL(resource.name).pathname,
      encodedBodyBytes: resource.encodedBodySize,
      decodedBodyBytes: resource.decodedBodySize,
      transferBytes: resource.transferSize,
      durationMs: resource.duration,
    }));
    return { route, navigation: resources.navigation, scripts, totalJavaScriptEncodedBytes: scripts.reduce((sum, resource) => sum + resource.encodedBodyBytes, 0), totalJavaScriptDecodedBytes: scripts.reduce((sum, resource) => sum + resource.decodedBodyBytes, 0), errors };
  } finally {
    await context.close();
  }
}

async function sceneReview({ name, width, mobile = false, reducedMotion = "no-preference" }) {
  const context = await browser.newContext({ viewport: { width, height: mobile ? 844 : 1000 }, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: mobile ? 2 : 1.5, reducedMotion });
  await context.addInitScript(instrumentRendering);
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  try {
    await cdp.send("Performance.enable");
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(`${baseURL}/learning-constellation`, { waitUntil: "networkidle" });
    const canvas = page.locator("canvas[data-ready='true']");
    await canvas.waitFor();
    await page.waitForTimeout(1500);
    await cdp.send("HeapProfiler.collectGarbage");
    const initialMetrics = await metrics(cdp);
    await canvas.scrollIntoViewIfNeeded();
    const settledBefore = await renderingSnapshot(page);
    const idleStart = performance.now();
    await page.waitForTimeout(1500);
    const idle = frameSummary(settledBefore, await renderingSnapshot(page), performance.now() - idleStart);
    const interactionBefore = await renderingSnapshot(page);
    const interactionStart = performance.now();
    await page.getByRole("button", { name: "Select Mathematics", exact: true }).click();
    await page.waitForTimeout(1800);
    const subjectFocus = frameSummary(interactionBefore, await renderingSnapshot(page), performance.now() - interactionStart);
    await page.screenshot({ path: path.join(output, `${name}-mathematics.png`), fullPage: true });
    await page.getByRole("button", { name: "Select Probability", exact: true }).click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(output, `${name}-probability.png`), fullPage: true });
    for (let iteration = 0; iteration < 8; iteration++) {
      await page.getByRole("button", { name: "Reset view", exact: true }).click();
      await page.getByRole("region", { name: "Browse knowledge" }).getByRole("button", { name: /Mathematics/ }).click();
      await page.getByRole("region", { name: "Browse knowledge" }).getByRole("button", { name: /Probability/ }).click();
    }
    await page.waitForTimeout(1800);
    await cdp.send("HeapProfiler.collectGarbage");
    const afterInteractions = await metrics(cdp);
    const dimensions = await canvas.evaluate((element) => ({
      cssWidth: element.getBoundingClientRect().width,
      cssHeight: element.getBoundingClientRect().height,
      bufferWidth: element.width,
      bufferHeight: element.height,
      noHorizontalOverflow: document.documentElement.scrollWidth <= innerWidth,
    }));
    const renderer = await canvas.evaluate((element) => {
      const gl = element.getContext("webgl2");
      if (!gl) return null;
      const info = gl.getExtension("WEBGL_debug_renderer_info");
      return { vendor: gl.getParameter(gl.VENDOR), renderer: info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER) };
    });
    const finalIdleBefore = await renderingSnapshot(page);
    await page.waitForTimeout(1000);
    const finalIdle = frameSummary(finalIdleBefore, await renderingSnapshot(page), 1000);
    return { name, width, mobileEmulation: mobile, reducedMotion, renderer, dimensions, idle, subjectFocus, finalIdle, initialMetrics, afterInteractions, errors };
  } finally {
    await cdp.detach();
    await context.close();
  }
}

try {
  const dashboard = await routeResources("/dashboard");
  const constellation = await routeResources("/learning-constellation");
  const dashboardChunks = new Set(dashboard.scripts.map((script) => script.path));
  const featureChunks = [];
  for (const script of constellation.scripts.filter((script) => !dashboardChunks.has(script.path))) {
    const local = path.resolve(".next", script.path.replace("/_next/", ""));
    let disk = {};
    try {
      const bytes = await readFile(local);
      disk = { rawBytes: bytes.byteLength, gzipBytes: gzipSync(bytes).byteLength, containsThreeRenderer: bytes.includes(Buffer.from("WebGLRenderer")) };
    } catch {
      // A remote review URL can supply network measurements without local chunks.
    }
    featureChunks.push({ ...script, ...disk });
  }
  const scenes = [];
  for (const profile of [{ name: "desktop", width: 1440 }, { name: "mobile-375", width: 375, mobile: true }, { name: "reduced-motion", width: 1440, reducedMotion: "reduce" }]) {
    scenes.push(await sceneReview(profile));
  }
  const report = {
    observedAt: new Date().toISOString(),
    environment: { browser: browser.version(), headless: true, platform: process.platform, baseURL },
    caveats: [
      "Run against npm run start after npm run build for production results.",
      "Mobile results emulate viewport, touch, and DPR on this computer; they are not physical-phone measurements.",
      "Frame intervals count actual WebGL rendering, not display/compositor FPS. Demand rendering intentionally stops when idle.",
      "GPU utilization is not measured; the recorded renderer identifies hardware or software rendering.",
      "JavaScript heap is a point-in-time observation after eight repeated selection cycles and garbage collection, not a long-term leak proof.",
      "Feature-only chunks are relative to dashboard; this includes route UI and does not isolate the dependency tree exactly.",
    ],
    dashboard,
    constellation,
    featureChunks,
    scenes,
  };
  await writeFile(path.join(output, "report.json"), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
} finally {
  await browser.close();
}
