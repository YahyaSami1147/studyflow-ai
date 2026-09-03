import Link from "next/link";
import { LockKeyhole, Mail } from "lucide-react";

export function AuthPage({ mode }: { mode: "login" | "register" }) {
  const isLogin = mode === "login";
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--canvas)] px-4 py-10">
      <section className="w-full max-w-md rounded-[var(--radius-card)] border border-[var(--line)] bg-white p-6 shadow-[0_12px_32px_rgba(16,24,40,0.06)] sm:p-8">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight text-slate-950">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-600 text-sm font-bold text-white">S</span>
          StudyFlow <span className="text-blue-600">AI</span>
        </Link>
        <h1 className="mt-10 text-2xl font-semibold tracking-tight text-slate-950">{isLogin ? "Welcome back" : "Create your workspace"}</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{isLogin ? "Sign in to continue to your study workspace." : "Your focused study workspace starts here."}</p>
        <div className="mt-7 space-y-4">
          <div><label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">Email</label><div className="relative"><Mail size={16} className="absolute left-3 top-3 text-slate-400" aria-hidden="true" /><input id="email" type="email" placeholder="you@example.com" className="h-11 w-full rounded-md border border-[var(--line)] pl-10 pr-3 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-500" /></div></div>
          <div><label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-700">Password</label><div className="relative"><LockKeyhole size={16} className="absolute left-3 top-3 text-slate-400" aria-hidden="true" /><input id="password" type="password" placeholder="Enter your password" className="h-11 w-full rounded-md border border-[var(--line)] pl-10 pr-3 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-500" /></div></div>
          <button type="button" className="h-11 w-full rounded-md bg-blue-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-blue-700">{isLogin ? "Log in" : "Create account"}</button>
        </div>
        <p className="mt-6 text-center text-sm text-[var(--muted)]">{isLogin ? "New to StudyFlow?" : "Already have an account?"} <Link href={isLogin ? "/register" : "/login"} className="font-semibold text-blue-600">{isLogin ? "Register" : "Log in"}</Link></p>
      </section>
    </main>
  );
}
