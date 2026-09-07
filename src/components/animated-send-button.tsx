"use client";

import { Check, LoaderCircle, RefreshCw, Send } from "lucide-react";
import type { MouseEventHandler } from "react";

export type SendButtonState = "idle" | "loading" | "success" | "error";

type AnimatedSendButtonProps = {
  state: SendButtonState;
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  type?: "button" | "submit";
  ariaLabel?: string;
};

const feedback = {
  idle: { label: "Send", announcement: "", Icon: Send },
  loading: { label: "Sending…", announcement: "Sending message. Please wait.", Icon: LoaderCircle },
  success: { label: "Sent", announcement: "Message sent successfully.", Icon: Check },
  error: { label: "Retry", announcement: "Sending failed. Retry is available.", Icon: RefreshCw },
} satisfies Record<SendButtonState, unknown>;

/** Controlled presentation only; the parent owns requests, locking and reset timing. */
export function AnimatedSendButton({ state, disabled = false, onClick, type = "button", ariaLabel }: AnimatedSendButtonProps) {
  const blocked = disabled || state === "loading";

  return <>
    <button
      type={type}
      className="animated-send"
      data-state={state}
      disabled={blocked}
      aria-busy={state === "loading"}
      aria-label={ariaLabel ?? (state === "idle" ? "Send message" : feedback[state].label)}
      onClick={(event) => {
        if (blocked) { event.preventDefault(); return; }
        onClick?.(event);
      }}
    >
      <span className="animated-send__disabled" aria-hidden="true" />
      {(Object.keys(feedback) as SendButtonState[]).map((phase) => {
        const { label, Icon } = feedback[phase];
        return <span key={phase} className="animated-send__layer" data-phase={phase} data-visible={phase === state} aria-hidden="true">
          {phase === "idle" ? <span className="animated-send__flight"><span className="animated-send__roll"><Icon size={16} className="animated-send__icon" /></span></span> : <Icon size={16} className={phase === "loading" ? "animated-send__spinner" : "animated-send__icon"} />}
          <span className="animated-send__label">{label}</span>
          {phase === "idle" && <span className="animated-send__trail" aria-hidden="true">
            <i /><i /><i /><i /><i /><i />
          </span>}
        </span>;
      })}
    </button>
    <span className="sr-only" role="status" aria-live="polite" aria-atomic="true">{feedback[state].announcement}</span>
  </>;
}
