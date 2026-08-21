export type FeatureIconName = "route" | "timer" | "insights" | "practice";

export function FeatureIcon({ name }: { name: FeatureIconName }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: "h-6 w-6",
    "aria-hidden": true,
  };

  if (name === "route") {
    return (
      <svg {...common}>
        <circle cx="5" cy="18" r="2.25" />
        <circle cx="18.5" cy="5.5" r="2.25" />
        <path d="M7.1 17.1c2.3-.8 2.4-3.3 4.3-4.1 1.7-.7 3.8.1 4.9-1.8" />
        <path d="m14.2 5.5 4.3-2.2 2.2 4.3" />
      </svg>
    );
  }

  if (name === "timer") {
    return (
      <svg {...common}>
        <circle cx="12" cy="13" r="7.5" />
        <path d="M9.5 2.75h5M12 5.5V3M12 9v4l2.8 1.8" />
      </svg>
    );
  }

  if (name === "insights") {
    return (
      <svg {...common}>
        <path d="M4 19V9M10 19V5M16 19v-7M22 19V3" />
        <path d="m3 14 6-5 6 1 6-5" />
        <circle cx="3" cy="14" r="1" fill="currentColor" stroke="none" />
        <circle cx="9" cy="9" r="1" fill="currentColor" stroke="none" />
        <circle cx="15" cy="10" r="1" fill="currentColor" stroke="none" />
        <circle cx="21" cy="5" r="1" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <rect x="3" y="4" width="18" height="16" rx="3" />
      <path d="m7.5 9 2.5 2.5L7.5 14M12.5 14h4" />
    </svg>
  );
}
