import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export function LandingPage() {
  return (
    <main className="min-h-screen bg-white">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6 lg:px-10">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight text-slate-950">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-600 text-sm font-bold text-white">S</span>
          StudyFlow <span className="text-blue-600">AI</span>
        </Link>
        <div className="flex items-center gap-4 text-sm font-medium">
          <Link href="/login" className="text-slate-600 hover:text-slate-950">Log in</Link>
          <Link href="/register" className="rounded-md bg-blue-700 px-4 py-2 text-white hover:bg-blue-800">Get started</Link>
        </div>
      </header>
      <section className="mx-auto max-w-6xl px-4 pb-20 pt-20 sm:px-6 lg:px-10 lg:pt-28">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-600">A calmer way to study</p>
        <h1 className="mt-5 max-w-3xl text-5xl font-semibold tracking-tight text-slate-950 sm:text-6xl">Make space for the work that moves you forward.</h1>
        <p className="mt-6 max-w-xl text-lg leading-8 text-[var(--muted)]">StudyFlow AI brings your courses, assignments, and study plans into one focused workspace.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-md bg-blue-700 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-800">Open workspace <ArrowRight size={16} aria-hidden="true" /></Link>
          <Link href="/health" className="rounded-md border border-[var(--line)] bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50">System health</Link>
        </div>
        <div className="mt-12 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-500"><span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-blue-600" />One focused workspace</span><span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-blue-600" />Built for steady progress</span></div>
      </section>
    </main>
  );
}
