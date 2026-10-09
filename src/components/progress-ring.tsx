import type { CSSProperties, ReactNode } from "react";

export type RingTone = "accent" | "indigo" | "success" | "danger" | "white";

const TONES: Record<RingTone, [string, string]> = {
  accent: ["#fcd34d", "#f97316"],
  indigo: ["#c4b5fd", "#6366f1"],
  success: ["#6ee7b7", "#059669"],
  danger: ["#fda4af", "#e11d48"],
  white: ["#ffffff", "#cbd5e1"],
};

type Ring = {
  value: number;
  tone: RingTone;
  width?: number;
  /** Optional goal tick (0-100), e.g. the readiness target. */
  marker?: number;
};

// Concentric SVG progress rings (outer → inner). Server-renderable; the draw
// animation is pure CSS (`.ws-ring-value`). `id` must be unique per page
// because it namespaces the gradients.
export function ProgressRing({
  id,
  size,
  rings,
  gap = 4,
  glass = false,
  delay = 0,
  label,
  children,
  className = "",
}: {
  id: string;
  size: number;
  rings: Ring[];
  gap?: number;
  glass?: boolean;
  delay?: number;
  label: string;
  children?: ReactNode;
  className?: string;
}) {
  const center = size / 2;
  // Each ring sits inside the previous one: outer edge minus the widths (and
  // gaps) of every ring drawn before it.
  const geometry = rings.map((ring, index) => {
    const width = ring.width ?? 8;
    const consumed = rings.slice(0, index).reduce((acc, previous) => acc + (previous.width ?? 8) + gap, 0);
    const radius = center - 3 - consumed - width / 2;
    return { ...ring, width, radius, circumference: 2 * Math.PI * radius };
  });

  return (
    <div className={`relative inline-flex shrink-0 items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={label}>
        <defs>
          {geometry.map((ring, index) => (
            <linearGradient key={index} id={`${id}-g${index}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={TONES[ring.tone][0]} />
              <stop offset="100%" stopColor={TONES[ring.tone][1]} />
            </linearGradient>
          ))}
        </defs>
        <g transform={`rotate(-90 ${center} ${center})`}>
          {geometry.map((ring, index) => {
            const value = Math.max(0, Math.min(100, ring.value));
            return (
              <g key={index}>
                <circle
                  cx={center}
                  cy={center}
                  r={ring.radius}
                  fill="none"
                  strokeWidth={ring.width}
                  className={glass ? "ws-ring-track-glass" : "ws-ring-track"}
                />
                {value > 0 ? (
                  <circle
                    cx={center}
                    cy={center}
                    r={ring.radius}
                    fill="none"
                    stroke={`url(#${id}-g${index})`}
                    strokeWidth={ring.width}
                    strokeLinecap="round"
                    strokeDasharray={ring.circumference}
                    strokeDashoffset={ring.circumference * (1 - value / 100)}
                    className="ws-ring-value"
                    style={{ "--ring-c": ring.circumference, "--d": delay + index } as CSSProperties}
                  />
                ) : null}
                {ring.marker !== undefined ? (
                  <RingMarker center={center} radius={ring.radius} width={ring.width} value={ring.marker} glass={glass} />
                ) : null}
              </g>
            );
          })}
        </g>
      </svg>
      {children ? <div className="absolute inset-0 flex flex-col items-center justify-center text-center">{children}</div> : null}
    </div>
  );
}

function RingMarker({ center, radius, width, value, glass }: { center: number; radius: number; width: number; value: number; glass: boolean }) {
  const angle = (value / 100) * 2 * Math.PI;
  const inner = radius - width / 2 - 1.5;
  const outer = radius + width / 2 + 1.5;
  return (
    <line
      x1={center + inner * Math.cos(angle)}
      y1={center + inner * Math.sin(angle)}
      x2={center + outer * Math.cos(angle)}
      y2={center + outer * Math.sin(angle)}
      strokeWidth={2}
      strokeLinecap="round"
      className={glass ? "stroke-white/70" : "stroke-ws-ink/55"}
    />
  );
}
