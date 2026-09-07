import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import { NavLinks } from "@/components/nav-links";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.12),_transparent_25%)] lg:flex">
      <aside className="hidden w-64 shrink-0 border-r border-[var(--line)] bg-slate-950/70 px-5 py-6 shadow-[inset_-1px_0_0_rgba(148,163,184,0.12)] backdrop-blur-md lg:flex lg:flex-col">
        <Brand />
        <div className="mt-10 flex-1">
          <NavLinks />
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="border-b border-[var(--line)] bg-slate-950/70 px-4 py-4 backdrop-blur-md sm:px-6 lg:hidden">
          <div className="flex items-center justify-between gap-4">
            <Brand />
            <Link href="/profile" className="text-sm font-medium text-slate-300 transition-colors hover:text-white">Profile</Link>
          </div>
          <div className="mt-4 -mx-1 overflow-x-auto scroll-smooth scroll-px-1 snap-x snap-mandatory pb-1 [scrollbar-width:none]">
            <NavLinks />
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-10">{children}</main>
      </div>
    </div>
  );
}

function Brand() {
  return (
    <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-lg tracking-tight text-white">
      <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-white p-1 ring-1 ring-cyan-300/70 shadow-[0_0_22px_rgba(56,189,248,0.35)]">
        <Image src="/logo.jpg" alt="" width={64} height={64} className="h-full w-full rounded-md object-contain" />
      </span>
      <span>StudyFlow <span className="text-cyan-300">AI</span></span>
    </Link>
  );
}
