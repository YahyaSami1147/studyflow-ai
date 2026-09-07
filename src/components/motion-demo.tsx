"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { AnimatedSendButton, type SendButtonState } from "@/components/animated-send-button";

type Outcome = "success" | "error" | "random";
const modes: { value: Outcome; label: string }[] = [
  { value: "success", label: "Force Success" },
  { value: "error", label: "Force Error" },
  { value: "random", label: "Random" },
];

// No network calls. Cancellation clears the timer and settles the pending promise.
function simulateSend(outcome: Outcome, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const abort = () => {
      window.clearTimeout(timer);
      reject(new DOMException("Cancelled", "AbortError"));
    };
    const timer = window.setTimeout(() => {
      signal.removeEventListener("abort", abort);
      if (outcome === "error" || (outcome === "random" && Math.random() >= 0.8)) {
        reject(new Error("Demo failure"));
      } else {
        resolve();
      }
    }, 1100);
    signal.addEventListener("abort", abort, { once: true });
    if (signal.aborted) abort();
  });
}

export function MotionDemo() {
  const [state, setState] = useState<SendButtonState>("idle");
  const [outcome, setOutcome] = useState<Outcome>("success");
  const [input, setInput] = useState("Help me plan my next study session.");
  const [result, setResult] = useState("Choose an outcome, then send a practice message.");
  const request = useRef<AbortController | null>(null);

  useEffect(() => () => { request.current?.abort(); request.current = null; }, []);
  useEffect(() => {
    if (state !== "success") return;
    const timer = window.setTimeout(() => setState("idle"), 900);
    return () => window.clearTimeout(timer);
  }, [state]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (request.current || !input.trim()) return;
    const controller = new AbortController();
    request.current = controller;
    setState("loading");
    setResult("Sending your practice message…");
    try {
      await simulateSend(outcome, controller.signal);
      if (request.current !== controller) return;
      setState("success");
      setResult("Practice message sent. You can send again whenever you are ready.");
    } catch {
      if (controller.signal.aborted || request.current !== controller) return;
      setState("error");
      setResult("Practice send failed. Choose an outcome and click Retry to try again.");
    } finally {
      if (request.current === controller) request.current = null;
    }
  }

  function cancel() {
    request.current?.abort();
    request.current = null;
    setState("idle");
    setResult("Practice send cancelled. Ready for another message.");
  }

  return <section className="rounded-[var(--radius-card)] border border-[var(--line)] bg-white p-5 shadow-sm sm:p-6" aria-labelledby="try-button">
    <h2 id="try-button" className="text-lg font-semibold">Try the complete lifecycle</h2>
    <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Each practice request takes 1.1 seconds. Random succeeds 80% of the time. This demo does not contact the AI backend.</p>
    <fieldset className="mt-5">
      <legend className="text-sm font-semibold">Next request outcome</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {modes.map((mode) => <label key={mode.value} className="flex cursor-pointer items-center gap-2 rounded-md border border-[var(--line)] bg-slate-50 px-3 py-2 text-sm has-checked:border-blue-500 has-checked:bg-blue-50 has-checked:text-blue-800">
          <input className="accent-blue-600" type="radio" name="outcome" value={mode.value} checked={outcome === mode.value} onChange={() => setOutcome(mode.value)} />{mode.label}
        </label>)}
      </div>
    </fieldset>
    <p className="mt-2 text-xs text-[var(--muted)]">Changing the outcome during a request applies to the next send or retry.</p>
    <form onSubmit={handleSubmit} className="mt-6">
      <label htmlFor="demo-message" className="text-sm font-semibold">Practice message</label>
      <div className="mt-2 flex flex-wrap items-end gap-3 rounded-lg border border-[var(--line)] bg-slate-50 p-3">
        <textarea id="demo-message" rows={2} value={input} onChange={(event) => setInput(event.target.value)} aria-describedby="demo-help" className="min-w-[8rem] flex-1 resize-y rounded-md border border-[var(--line)] bg-white px-3 py-2 text-sm" />
        <AnimatedSendButton state={state} disabled={!input.trim()} type="submit" />
        {state === "loading" && <button type="button" onClick={cancel} className="h-11 rounded-md border border-[var(--line)] bg-white px-3 text-sm font-semibold">Cancel</button>}
      </div>
      <p id="demo-help" className="mt-2 text-xs leading-5 text-[var(--muted)]">Clear the message to inspect Disabled. Tab to Send, then press Enter or Space. Hover or hold the button to inspect pointer feedback.</p>
    </form>
    <div className="mt-5 rounded-lg border border-[var(--line)] bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Current state: {state === "idle" && !input.trim() ? "disabled" : state}</p>
      <p className="mt-1 text-sm text-slate-700" role="status" aria-live="polite">{result}</p>
    </div>
  </section>;
}
