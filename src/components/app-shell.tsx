import Link from "next/link";
import type { ReactNode } from "react";
import { NavLinks } from "@/components/nav-links";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen lg:flex">
      <aside className="hidden w-64 shrink-0 border-r border-[var(--line)] bg-white px-5 py-6 lg:flex lg:flex-col">
        <Brand />
        <div className="mt-10 flex-1">
          <NavLinks />
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="border-b border-[var(--line)] bg-white px-4 py-4 sm:px-6 lg:hidden">
          <div className="flex items-center justify-between gap-4">
            <Brand />
            <Link href="/profile" className="text-sm font-medium text-slate-600">Profile</Link>
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
    <Link href="/dashboard" className="flex items-center gap-2 font-semibold tracking-tight text-slate-950">
      <span className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-600 text-sm font-bold text-white">S</span>
      <span>StudyFlow <span className="text-blue-600">AI</span></span>
    </Link>
  );
}
