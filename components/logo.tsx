import Link from "next/link";

/**
 * Identidade CloudMastery: nuvem branca com seta de ascensão (domínio/maestria)
 * sobre um badge com gradiente laranja→âmbar. Funciona de 16px a 512px.
 */
export function LogoIcon({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <linearGradient id="cm-badge" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F97316" />
          <stop offset="1" stopColor="#FBBF24" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="15" fill="url(#cm-badge)" />
      {/* nuvem */}
      <path
        d="M22.5 46a9.5 9.5 0 0 1-1.7-18.85A13.5 13.5 0 0 1 47 31.5 8.25 8.25 0 0 1 45.5 46h-23Z"
        fill="#fff"
      />
      {/* seta de ascensão vazada na nuvem */}
      <path
        d="M32 24.5 24.8 33h4.4v8h5.6v-8h4.4L32 24.5Z"
        fill="url(#cm-badge)"
      />
    </svg>
  );
}

export function Logo({
  size = 30,
  dark = false,
  href = "/",
}: {
  size?: number;
  /** true quando o fundo é escuro (wordmark fica branca) */
  dark?: boolean;
  href?: string | null;
}) {
  const mark = (
    <span className="inline-flex items-center gap-2">
      <LogoIcon size={size} />
      <span
        className={`font-bold tracking-tight ${dark ? "text-white" : "text-gray-900"}`}
        style={{ fontSize: Math.round(size * 0.62) }}
      >
        Cloud
        <span className="bg-gradient-to-r from-orange-500 to-amber-400 bg-clip-text text-transparent">
          Mastery
        </span>
      </span>
    </span>
  );

  if (href === null) return mark;
  return (
    <Link href={href} className="inline-flex items-center" aria-label="CloudMastery">
      {mark}
    </Link>
  );
}
