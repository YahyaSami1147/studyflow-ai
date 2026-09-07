"use client";

import { ChevronDown } from "lucide-react";
import { useId, useState, type ReactNode } from "react";

export function Disclosure({ label, children }: { label: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const instanceId = useId();
  const triggerId = `${instanceId}-trigger`;
  const panelId = `${instanceId}-panel`;

  return <div className="border-t border-[var(--line)] pt-3">
    <button
      type="button"
      id={triggerId}
      aria-expanded={open}
      aria-controls={panelId}
      onClick={() => setOpen((current) => !current)}
      className="inline-flex min-h-10 w-full items-center justify-between gap-3 rounded-md text-left text-xs font-semibold text-cyan-300 hover:text-cyan-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
    >
      <span>{label}</span>
      <ChevronDown size={16} aria-hidden="true" className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
    </button>
    <div id={panelId} role="region" aria-labelledby={triggerId} hidden={!open} className="pt-2 text-xs leading-5 text-slate-300">{children}</div>
  </div>;
}
