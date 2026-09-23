import Link from "next/link";

function BrandMark({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <rect width="48" height="48" rx="14" fill="#101722" />
      <rect
        x="0.75"
        y="0.75"
        width="46.5"
        height="46.5"
        rx="13.25"
        stroke="white"
        strokeOpacity="0.12"
        strokeWidth="1.5"
      />
      <path
        d="M13.2 33.2h21.1a6 6 0 0 0 .8-11.95 11.75 11.75 0 0 0-22.28 3.04A4.55 4.55 0 0 0 13.2 33.2Z"
        stroke="white"
        strokeWidth="2.55"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="m14.8 31.3 6.35-6.35 4.45 4.05 8.15-9.2"
        stroke="#FB923C"
        strokeWidth="3.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M29.9 19.8h3.85v3.85"
        stroke="#FDBA74"
        strokeWidth="3.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="21.15" cy="24.95" r="1.7" fill="#FFF7ED" />
    </svg>
  );
}

export function LogoIcon({ size = 32 }: { size?: number }) {
  return <BrandMark size={size} />;
}

export function Logo({
  size = 30,
  dark = false,
  href = "/",
}: {
  size?: number;
  dark?: boolean;
  href?: string | null;
}) {
  const mark = (
    <span className="inline-flex items-center gap-2.5">
      <BrandMark size={size} />
      <span
        className={`whitespace-nowrap text-[1.08rem] font-extrabold tracking-[-0.045em] sm:text-[1.18rem] ${
          dark ? "text-white" : "cm-logo-wordmark text-slate-950 dark:text-white"
        }`}
      >
        Cloud
        <span className={dark ? "text-orange-400" : "text-orange-600 dark:text-orange-400"}>
          Mastery
        </span>
      </span>
    </span>
  );

  if (href === null) return mark;

  return (
    <Link
      href={href}
      className="inline-flex rounded-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-500/25"
      aria-label="CloudMastery"
    >
      {mark}
    </Link>
  );
}
