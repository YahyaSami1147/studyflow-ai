import { AppShell } from "@/components/app-shell";
import { fetchHealthData } from "@/lib/health";
import { CheckCircle2, Server } from "lucide-react";

export default async function HealthPage() {
  const health = await fetchHealthData();

  return (
    <AppShell>
      <div className="border-b border-[var(--line)] pb-8">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-blue-600">System</p>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Health check</h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted)]">StudyFlow infrastructure status and server fetch verification.</p>
      </div>
      <div className="mt-8 max-w-2xl overflow-hidden rounded-[var(--radius-card)] border border-[var(--line)] bg-white shadow-[0_8px_24px_rgba(16,24,40,0.04)]">
        <div className="flex items-center gap-3 border-b border-[var(--line)] px-5 py-5"><span className="flex h-9 w-9 items-center justify-center rounded-md bg-blue-50 text-blue-600"><Server size={18} aria-hidden="true" /></span><div><p className="text-sm font-semibold text-slate-950">Application</p><p className="text-xs text-[var(--muted)]">Live server status</p></div><span className="ml-auto flex items-center gap-1.5 text-sm font-semibold text-[var(--success)]"><CheckCircle2 size={16} aria-hidden="true" />{health.status}</span></div>
        <dl className="divide-y divide-[var(--line)]">
          <HealthRow label="Environment" value={health.environment} />
          <HealthRow label="Data fetch" value="Server fetch" />
          <HealthRow label="Checked" value={health.checkedAt} />
        </dl>
      </div>
    </AppShell>
  );
}

function HealthRow({ label, value, valueClass = "text-slate-950" }: { label: string; value: string; valueClass?: string }) {
  return <div className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"><dt className="text-sm text-[var(--muted)]">{label}</dt><dd className={`break-all text-sm font-medium ${valueClass}`}>{value}</dd></div>;
}
