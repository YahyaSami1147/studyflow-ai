"use client";

import { useEffect, useRef, type ReactNode, type RefObject } from "react";

export function Modal({ open, title, children, onClose, returnFocusRef }: { open: boolean; title: string; children: ReactNode; onClose: () => void; returnFocusRef?: RefObject<HTMLButtonElement | null> }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      openerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      dialog.showModal();
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    if (!open) (returnFocusRef?.current ?? openerRef.current)?.focus();
  }, [open, returnFocusRef]);

  return <dialog ref={dialogRef} onCancel={(event) => { event.preventDefault(); onClose(); }} onKeyDown={(event) => { if (event.key === "Escape") { event.preventDefault(); onClose(); } }} onClick={(event) => { if (event.target === event.currentTarget) onClose(); }} aria-labelledby="form-modal-title" className="w-[calc(100%-2rem)] max-w-2xl rounded-[var(--radius-card)] border border-[var(--line)] bg-white p-0 text-slate-950 shadow-[0_24px_60px_rgba(16,24,40,0.2)] backdrop:bg-slate-950/40"><div className="p-6 sm:p-8"><div className="mb-6"><h2 id="form-modal-title" className="text-2xl font-semibold tracking-tight text-slate-950">{title}</h2></div>{children}</div></dialog>;
}
