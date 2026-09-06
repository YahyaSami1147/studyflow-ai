"use client";

import { AlertCircle, RefreshCw } from "lucide-react";

export default function AiError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section className="flex min-h-[28rem] items-center justify-center rounded-[var(--radius-card)] border border-red-200 bg-white p-6 text-center shadow-[0_12px_32px_rgba(16,24,40,0.05)]">
      <div className="max-w-md">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-700">
          <AlertCircle size={23} aria-hidden="true" />
        </span>
        <h2 className="mt-4 text-xl font-semibold tracking-tight text-slate-950">
          StudyFlow couldn’t load this page
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Something unexpected happened while loading the chat. Your study
          workspace is still here—please try again.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-5 inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
        >
          <RefreshCw size={16} aria-hidden="true" />
          Try again
        </button>
      </div>
    </section>
  );
}
