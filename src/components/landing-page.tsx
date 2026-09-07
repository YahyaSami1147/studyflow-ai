import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { ShaderHero } from "@/components/hero/shader-hero";

export function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--background)] text-white">
      <ShaderHero />

      <div className="relative z-10">
        <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6 lg:px-10">
          <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight text-white/90">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white p-1 ring-1 ring-cyan-300/70 shadow-[0_0_24px_rgba(56,189,248,0.4)]"><Image src="/logo.jpg" alt="" width={40} height={40} className="h-full w-full rounded-md object-contain" /></span>
            StudyFlow <span className="text-cyan-300">AI</span>
          </Link>
          <div className="flex items-center gap-4 text-sm font-medium text-slate-200">
            <Link href="/login" className="transition-opacity hover:text-white">Log in</Link>
            <Link href="/register" className="rounded-md border border-cyan-300/30 bg-cyan-400/10 px-4 py-2 text-cyan-100 ring-1 ring-cyan-300/10 backdrop-blur-sm transition-colors hover:bg-cyan-400/20">Get started</Link>
          </div>
        </header>

        <section className="mx-auto flex max-w-6xl flex-col justify-center px-4 pb-20 pt-16 sm:px-6 lg:px-10 lg:pb-28 lg:pt-28">
          <div className="max-w-3xl rounded-2xl border border-white/10 bg-slate-950/20 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.35)] backdrop-blur-[2px] sm:p-6 lg:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300">A calmer way to study</p>
            <h1 className="font-display mt-5 max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-7xl">StudyFlow AI</h1>
            <p className="mt-4 max-w-xl text-lg leading-8 text-slate-200/90 sm:text-xl">Plan smarter. Study with clarity.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-md bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 shadow-[0_0_24px_rgba(34,211,238,0.3)] transition-colors hover:bg-cyan-300">Open workspace <ArrowRight size={16} aria-hidden="true" /></Link>
              <Link href="/health" className="rounded-md border border-[var(--line)] bg-[var(--surface-subtle)] px-5 py-3 text-sm font-semibold text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-elevated)]">System health</Link>
            </div>
            <div className="mt-12 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-200/80">
              <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-cyan-300" />One focused workspace</span>
              <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-cyan-300" />Built for steady progress</span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
