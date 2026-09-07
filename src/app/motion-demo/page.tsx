import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { MotionDemo } from "@/components/motion-demo";

export default function MotionDemoPage() {
  return <AppShell>
    <header className="mb-6 border-b border-[var(--line)] pb-6">
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-blue-600">Interaction lab</p>
      <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Send button motion</h1>
      <p className="mt-2 text-base leading-7 text-[var(--muted)]">Explore the same button used by StudyFlow AI, with predictable practice outcomes.</p>
      <Link href="/ai" className="mt-3 inline-block text-sm font-semibold text-blue-700">Back to StudyFlow AI →</Link>
    </header>
    <MotionDemo />
    <section className="mt-6 rounded-[var(--radius-card)] border border-[var(--line)] bg-white p-5 sm:p-6" aria-labelledby="motion-decisions">
      <h2 id="motion-decisions" className="text-lg font-semibold">Motion decisions</h2>
      <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-[var(--muted)]">
        <li>Hover uses a 160ms ease-out transform and shifts the plane 2px right; press scales to 0.98 with a 100ms transition.</li>
        <li>The paper plane launches for 1450ms with linear upper-right travel and a separate linear 3D-like 360° roll on the (1, -1, 0) axis.</li>
        <li>Six tail particles use fixed positions with 500ms ease-out fades and staggered delays from 250ms through 850ms; the plane fades quickly during its final 12%.</li>
        <li>Sending appears after a 1120ms delay while the launch is still finishing. The demo fake request lasts 1800ms, then Sent stays visible for 900ms before returning to Idle.</li>
        <li>State layers, color overlays and the flight use transform and opacity so the fixed-width button does not reflow.</li>
        <li>Reduced motion removes travel, roll, particles and spinner rotation while preserving Sending, Sent, Retry/Error, transitions, and the visible focus outline.</li>
      </ul>
    </section>
  </AppShell>;
}
