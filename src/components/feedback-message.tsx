import { AlertCircle, CheckCircle2, Info, TriangleAlert, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type FeedbackVariant = "success" | "info" | "warning" | "error";

const variantStyles: Record<FeedbackVariant, { icon: LucideIcon; className: string; role: "status" | "alert" }> = {
  success: { icon: CheckCircle2, className: "border-emerald-400/20 bg-emerald-500/10 text-emerald-100", role: "status" },
  info: { icon: Info, className: "border-cyan-300/20 bg-cyan-400/10 text-cyan-100", role: "status" },
  warning: { icon: TriangleAlert, className: "border-amber-300/25 bg-amber-400/10 text-amber-100", role: "status" },
  error: { icon: AlertCircle, className: "border-red-400/25 bg-red-500/10 text-red-100", role: "alert" },
};

export function FeedbackMessage({ variant, title, children }: { variant: FeedbackVariant; title?: string; children: ReactNode }) {
  const { icon: Icon, className, role } = variantStyles[variant];
  return (
    <div role={role} aria-live={role === "status" ? "polite" : undefined} className={`feedback-message ${className}`}>
      <Icon size={16} aria-hidden="true" />
      <div className="min-w-0">
        {title ? <p className="font-semibold">{title}</p> : null}
        <div className={title ? "mt-1" : undefined}>{children}</div>
      </div>
    </div>
  );
}
