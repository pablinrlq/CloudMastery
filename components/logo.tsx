import Image from "next/image";
import Link from "next/link";

const LOGO_SRC = "/cloudmastery-logo.png";

/** Recorte da marca oficial para espaços compactos. */
export function LogoIcon({ size = 32 }: { size?: number }) {
  return (
    <span
      className="relative inline-block shrink-0 overflow-hidden rounded-[22%] bg-white shadow-sm ring-1 ring-slate-200/70"
      style={{
        width: size,
        height: size,
        backgroundImage: `url(${LOGO_SRC})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: `${size * 4}px ${size * 2}px`,
        backgroundPosition: `${size * -0.36}px ${size * -0.48}px`,
      }}
      aria-hidden
    />
  );
}

/** Wordmark oficial, com o excesso de área branca do arquivo original recortado por CSS. */
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
    <span
      className={`relative block shrink-0 overflow-hidden rounded-lg bg-white ${
        dark
          ? "shadow-[0_8px_24px_rgba(0,0,0,0.2)] ring-1 ring-white/15"
          : "ring-1 ring-slate-200/70"
      }`}
      style={{ width: size * 4.35, height: size }}
    >
      <Image
        src={LOGO_SRC}
        alt="CloudMastery"
        fill
        sizes={`${Math.round(size * 4.35)}px`}
        className="object-cover object-center"
      />
    </span>
  );

  if (href === null) return mark;
  return (
    <Link
      href={href}
      className="inline-flex rounded-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-500/25"
      aria-label="CloudMastery"
    >
      {mark}
    </Link>
  );
}
