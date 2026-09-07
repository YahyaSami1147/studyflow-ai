import Link from "next/link";
import Image from "next/image";
import { LockKeyhole, Mail } from "lucide-react";

export function AuthPage({ mode }: { mode: "login" | "register" }) {
  const isLogin = mode === "login";
  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.14),_transparent_34%),var(--background)] px-4 py-10">
      <section className="w-full max-w-md rounded-[var(--radius-card)] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_20px_60px_rgba(2,6,23,0.4)] sm:p-8">
        <Link href="/" className="flex items-center gap-3 font-semibold tracking-tight text-white">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white p-1 ring-1 ring-cyan-300/70 shadow-[0_0_22px_rgba(56,189,248,0.35)]"><Image src="/logo.jpg" alt="" width={48} height={48} className="h-full w-full rounded-md object-contain" /></span>
          StudyFlow <span className="text-cyan-300">AI</span>
        </Link>
        <h1 className="mt-10 text-2xl font-semibold tracking-tight text-slate-950">{isLogin ? "Welcome back" : "Create your workspace"}</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{isLogin ? "Sign in to continue to your study workspace." : "Your focused study workspace starts here."}</p>
        <div className="mt-6 rounded-lg border border-cyan-300/20 bg-cyan-400/10 p-4" role="note">
          <p className="text-sm font-semibold text-cyan-100">Local Mode</p>
          <p className="mt-1 text-sm leading-6 text-slate-300">Authentication is planned for a future version. For now, StudyFlow data is stored only in this browser.</p>
        </div>
        <div className="mt-7 space-y-4">
          <div><label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">Email</label><div className="relative"><Mail size={16} className="absolute left-3 top-3 text-slate-400" aria-hidden="true" /><input id="email" type="email" placeholder="you@example.com" className="h-11 w-full rounded-md border border-[var(--line)] pl-10 pr-3 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-500" /></div></div>
          <div><label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-700">Password</label><div className="relative"><LockKeyhole size={16} className="absolute left-3 top-3 text-slate-400" aria-hidden="true" /><input id="password" type="password" placeholder="Enter your password" className="h-11 w-full rounded-md border border-[var(--line)] pl-10 pr-3 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-500" /></div></div>
          <button type="button" className="h-11 w-full rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition-colors hover:bg-[var(--primary-hover)]">{isLogin ? "Log in" : "Create account"}</button>
        </div>
        <p className="mt-6 text-center text-sm text-[var(--muted)]">{isLogin ? "New to StudyFlow?" : "Already have an account?"} <Link href={isLogin ? "/register" : "/login"} className="font-semibold text-cyan-300">{isLogin ? "Register" : "Log in"}</Link></p>
      </section>
    </main>
  );
}
