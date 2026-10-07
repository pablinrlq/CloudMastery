import { badgeSvg } from "@/lib/credentials/badge-art";
import type { BadgeArt } from "@/lib/credentials/catalog";

// Inline medal artwork. The SVG is generated from our own catalog strings
// (escaped in badgeSvg), never from user input.
export function BadgeMedal({
  art,
  id,
  size = 96,
  locked = false,
  title,
  className = "",
}: {
  art: BadgeArt;
  id: string;
  size?: number;
  locked?: boolean;
  title?: string;
  className?: string;
}) {
  return (
    <span
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      className={`cm-medal inline-block shrink-0 ${className}`}
      style={{ width: size, height: size }}
      dangerouslySetInnerHTML={{ __html: badgeSvg(art, { id, locked }) }}
    />
  );
}
