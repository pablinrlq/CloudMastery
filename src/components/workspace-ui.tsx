import type { CSSProperties, ReactNode } from "react";

// Small presentational primitives shared by the workspace pages.

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  id,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  action?: ReactNode;
  id?: string;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
      <div className="min-w-0">
        <p className="ws-eyebrow">{eyebrow}</p>
        <h2 id={id} className="ws-h2 mt-1.5">{title}</h2>
        {description ? <p className="mt-1.5 max-w-2xl text-sm leading-6 text-ws-muted">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  text,
  action,
  className = "",
}: {
  icon: ReactNode;
  title: string;
  text: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col items-center justify-center rounded-2xl border border-dashed border-ws-line/15 px-6 py-10 text-center ${className}`}>
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-ws-accent/10 text-ws-accent-ink">{icon}</span>
      <p className="mt-4 text-sm font-semibold text-ws-ink">{title}</p>
      <p className="mt-1.5 max-w-sm text-sm leading-6 text-ws-muted">{text}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function StatTile({
  label,
  value,
  unit,
  icon,
  children,
  delay = 0,
}: {
  label: string;
  value: string;
  unit?: string;
  icon: ReactNode;
  children?: ReactNode;
  delay?: number;
}) {
  return (
    <div className="ws-card ws-rise flex flex-col p-5" style={{ "--d": delay } as CSSProperties}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-[13px] font-medium text-ws-muted">{label}</span>
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-ws-accent/10 text-ws-accent-ink">{icon}</span>
      </div>
      <p className="mt-3 flex items-baseline gap-1.5">
        <span className="ws-num text-[2rem] text-ws-ink">{value}</span>
        {unit ? <span className="text-sm font-medium text-ws-subtle">{unit}</span> : null}
      </p>
      {children ? <div className="mt-auto pt-3">{children}</div> : null}
    </div>
  );
}

const BAR_TONE = {
  accent: "",
  indigo: "ws-bar-indigo",
  success: "ws-bar-success",
  danger: "ws-bar-danger",
  neutral: "ws-bar-neutral",
} as const;

export function ProgressBar({
  value,
  tone = "accent",
  size = "md",
  glass = false,
  delay = 0,
  label,
}: {
  value: number;
  tone?: "accent" | "indigo" | "success" | "danger" | "neutral";
  size?: "md" | "lg";
  glass?: boolean;
  delay?: number;
  label?: string;
}) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div
      className={`ws-bar ${size === "lg" ? "ws-bar-lg" : ""} ${BAR_TONE[tone]} ${glass ? "ws-bar-glass" : ""}`}
      role={label ? "progressbar" : undefined}
      aria-label={label}
      aria-valuenow={label ? Math.round(pct) : undefined}
      aria-valuemin={label ? 0 : undefined}
      aria-valuemax={label ? 100 : undefined}
    >
      {pct > 0 ? <span style={{ width: `${pct}%`, "--d": delay } as CSSProperties} /> : null}
    </div>
  );
}
