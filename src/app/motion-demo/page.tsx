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
        <li>Hover and press use 160ms ease-out transitions for responsive feedback. Press scales to 0.98.</li>
        <li>Labels, icons and state overlays transition over 280ms with ease-out, responding quickly and settling smoothly. Success stays visible for 900ms.</li>
        <li>Transform and opacity animate within a fixed-width button to keep the composer stable.</li>
        <li>Reduced motion removes movement and spinner rotation, with immediate text, icon and color feedback. The keyboard focus outline remains visible.</li>
      </ul>
    </section>
  </AppShell>;
}
