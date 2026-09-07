"use client";

import { useEffect, useRef, type RefObject } from "react";

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  onCancel,
  onConfirm,
  returnFocusRef,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
  returnFocusRef?: RefObject<HTMLButtonElement | null>;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      confirmRef.current?.focus();
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    if (!open) returnFocusRef?.current?.focus();
  }, [open, returnFocusRef]);

  function cancel(event?: React.SyntheticEvent) {
    event?.preventDefault();
    onCancel();
  }

  return (
    <dialog
      ref={dialogRef}
      onCancel={cancel}
      onClick={(event) => {
        if (event.target === event.currentTarget) cancel();
      }}
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
      className="w-[calc(100%-2rem)] max-w-md rounded-[var(--radius-card)] border border-[var(--line)] bg-white p-0 text-slate-950 shadow-[0_24px_60px_rgba(16,24,40,0.2)] backdrop:bg-slate-950/40"
    >
      <div className="p-6 sm:p-7">
        <h2 id="confirm-dialog-title" className="text-lg font-semibold tracking-tight">{title}</h2>
        <p id="confirm-dialog-description" className="mt-2 text-sm leading-6 text-[var(--muted)]">{description}</p>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={() => cancel()} className="h-10 rounded-md border border-[var(--line)] px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">Cancel</button>
          <button ref={confirmRef} type="button" onClick={onConfirm} className="h-10 rounded-md bg-red-700 px-4 text-sm font-semibold text-white transition-colors hover:bg-red-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700">{confirmLabel}</button>
        </div>
      </div>
    </dialog>
  );
}
