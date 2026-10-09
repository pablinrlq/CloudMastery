import { certMeta } from "@/lib/learning/cert-meta";
import { ArchitectureIcon, CloudIcon, LockIcon, NeuralIcon } from "@/components/ui-icons";

const SIZES = {
  xs: { box: 28, radius: 9, icon: 15 },
  sm: { box: 36, radius: 11, icon: 18 },
  md: { box: 44, radius: 13, icon: 22 },
  lg: { box: 56, radius: 17, icon: 28 },
  xl: { box: 72, radius: 22, icon: 36 },
} as const;

// Literal class names so Tailwind keeps them (dynamic `ws-emblem-${x}` would be purged).
const TONE_CLASS = {
  ccp: "ws-emblem-ccp",
  saa: "ws-emblem-saa",
  aif: "ws-emblem-aif",
} as const;

const GLYPHS = {
  ccp: CloudIcon,
  saa: ArchitectureIcon,
  aif: NeuralIcon,
} as const;

// App-icon style emblem that gives each track a recognizable identity.
export function CertEmblem({
  certId,
  size = "md",
  locked = false,
  className = "",
}: {
  certId: string;
  size?: keyof typeof SIZES;
  locked?: boolean;
  className?: string;
}) {
  const meta = certMeta(certId);
  const dims = SIZES[size];
  const Glyph = locked ? LockIcon : GLYPHS[meta.tone];

  return (
    <span
      aria-hidden="true"
      className={`ws-emblem ${locked ? "ws-emblem-locked" : TONE_CLASS[meta.tone]} ${className}`}
      style={{ width: dims.box, height: dims.box, borderRadius: dims.radius }}
    >
      <Glyph width={dims.icon} height={dims.icon} strokeWidth={2} />
    </span>
  );
}
