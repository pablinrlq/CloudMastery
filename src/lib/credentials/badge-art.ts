// Medal artwork for badges and certificates, generated as an SVG string so the
// same art renders inline in the app, on the public page and inside the Open
// Graph image. Deliberately a round medal with a ribbon — never the hexagon of
// the official AWS badges — so nobody mistakes it for an AWS certification.
import type { BadgeArt, BadgeGlyph, BadgeTier, BadgeTone } from "./catalog.ts";

const GLYPHS: Record<BadgeGlyph, string> = {
  cloud: '<path d="M7 18.5h10.5a4.5 4.5 0 0 0 .6-8.96A6.5 6.5 0 0 0 5.6 11.4 3.6 3.6 0 0 0 7 18.5Z"/>',
  architecture:
    '<rect x="9" y="3" width="6" height="5" rx="1.2"/><rect x="3" y="16" width="6" height="5" rx="1.2"/><rect x="15" y="16" width="6" height="5" rx="1.2"/><path d="M12 8v4M6 16v-2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2"/>',
  neural:
    '<circle cx="5" cy="7" r="2"/><circle cx="5" cy="17" r="2"/><circle cx="19" cy="12" r="2"/><circle cx="12" cy="5" r="1.6"/><circle cx="12" cy="19" r="1.6"/><path d="M7 7.6 10.5 5.5M7 16.4l3.6 2M13.5 5.8 17.3 10.8M13.5 18.2l3.8-5M7 7.8l10 3.6M7 16.2l10-3.6"/>',
  flag: '<path d="M5 21V4"/><path d="M5 4h11.5l-2 4 2 4H5"/>',
  check: '<circle cx="12" cy="12" r="9"/><path d="m8 12.4 2.8 2.8L16.4 9.6"/>',
  flame:
    '<path d="M12 21c-3.9 0-7-2.7-7-6.6 0-2.6 1.4-4.6 3-6.1.4 1.6 1.3 2.7 2.4 3.1C10 7.6 11.8 4.6 14.6 3c-.3 2.8.8 4.6 2.3 6.2 1.3 1.4 2.1 3 2.1 5.2 0 3.9-3.1 6.6-7 6.6Z"/><path d="M12 21c-1.7 0-3-1.2-3-2.9 0-1.6 1.1-2.6 2.2-3.5.2 1 .8 1.6 1.5 1.8.4-1 .9-1.8 1.8-2.5.3 1.2 1.5 2.1 1.5 4.2 0 1.7-1.3 2.9-3 2.9Z"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  cards: '<rect x="3" y="7" width="14" height="14" rx="2"/><path d="m7 7 1-3a2 2 0 0 1 2.5-1.3l8.8 2.7a2 2 0 0 1 1.3 2.5L17 21"/>',
  bolt: '<path d="M13 2 4.5 13.5H11L10 22l8.5-11.5H12L13 2Z"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="m15.6 8.4-2.1 5.1-5.1 2.1 2.1-5.1 5.1-2.1Z"/>',
};

// light, mid, dark, deep
const TONES: Record<BadgeTone, [string, string, string, string]> = {
  ccp: ["#fed7aa", "#fb923c", "#c2410c", "#6c2410"],
  saa: ["#bfdbfe", "#3b82f6", "#1d4ed8", "#172554"],
  aif: ["#e9d5ff", "#a855f7", "#7e22ce", "#3b0764"],
  habit: ["#a7f3d0", "#10b981", "#047857", "#022c22"],
  level: ["#c7d2fe", "#6366f1", "#4338ca", "#1e1b4b"],
  diagnostic: ["#a5f3fc", "#06b6d4", "#0e7490", "#083344"],
};

type TierStyle = { ring: string[]; edge: string; ribbon: [string, string]; ink: string; stars: number; star: string };

const TIERS: Record<BadgeTier, TierStyle> = {
  bronze: { ring: ["#fde4cc", "#d99a62", "#9a5525", "#e3a774"], edge: "#6b3412", ribbon: ["#b8692f", "#6f3311"], ink: "#fff5ea", stars: 1, star: "#ffe2c4" },
  silver: { ring: ["#ffffff", "#d7dee8", "#7c8a9e", "#e9eef5"], edge: "#475569", ribbon: ["#64748b", "#273449"], ink: "#f8fafc", stars: 2, star: "#ffffff" },
  gold: { ring: ["#fff8d6", "#f6c949", "#a86b0c", "#ffe48a"], edge: "#713f12", ribbon: ["#c0841f", "#6b3a0c"], ink: "#fffbeb", stars: 3, star: "#fff1b0" },
  platinum: { ring: ["#ffffff", "#c7c3ff", "#7dd3fc", "#f5d0fe"], edge: "#4338ca", ribbon: ["#4f46e5", "#1e1b4b"], ink: "#eef2ff", stars: 3, star: "#ffffff" },
};

const SANS = "var(--font-geist, ui-sans-serif), ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
const MONO = "var(--font-geist-mono, ui-monospace), ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

function escapeXml(value: string) {
  return value.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
}

function star(cx: number, cy: number, r: number) {
  const points: string[] = [];
  for (let i = 0; i < 10; i++) {
    const radius = i % 2 === 0 ? r : r * 0.45;
    const angle = (Math.PI / 5) * i - Math.PI / 2;
    points.push(`${(cx + radius * Math.cos(angle)).toFixed(2)},${(cy + radius * Math.sin(angle)).toFixed(2)}`);
  }
  return `<polygon points="${points.join(" ")}"/>`;
}

function rays(cx: number, cy: number, r: number) {
  const out: string[] = [];
  for (let i = 0; i < 24; i++) {
    const a1 = (Math.PI * 2 * i) / 24;
    const a2 = a1 + Math.PI / 48;
    out.push(
      `<path d="M${cx} ${cy}L${(cx + r * Math.cos(a1)).toFixed(2)} ${(cy + r * Math.sin(a1)).toFixed(2)}L${(cx + r * Math.cos(a2)).toFixed(2)} ${(cy + r * Math.sin(a2)).toFixed(2)}Z"/>`
    );
  }
  return out.join("");
}

/**
 * Medal SVG (viewBox 200×200). `id` keeps gradient ids unique per badge when
 * several medals share one page; identical badges may share it safely.
 * `text: false` drops the label and ribbon caption (for renderers without fonts).
 */
export function badgeSvg(
  art: BadgeArt,
  { id, locked = false, text = true }: { id: string; locked?: boolean; text?: boolean }
): string {
  const u = `m-${id.replace(/[^a-zA-Z0-9]+/g, "-")}${locked ? "-l" : ""}`;
  const [light, mid, dark, deep] = TONES[art.tone];
  const tier = TIERS[art.tier];
  const label = escapeXml(art.label);
  const caption = escapeXml(art.caption.toUpperCase());
  const numeric = /^\d{1,3}$/.test(art.label);
  const labelSize = numeric ? 36 : art.label.length > 7 ? 17 : 20;
  const labelY = numeric ? 114 : 108;
  const captionSize = art.caption.length > 15 ? 7.6 : art.caption.length > 11 ? 8.4 : 9.2;
  const captionSpacing = art.caption.length > 15 ? 0.9 : 1.5;
  const starCount = tier.stars;
  const stars = Array.from({ length: starCount }, (_, i) => star(100 + (i - (starCount - 1) / 2) * 13, 156, 5)).join("");

  const body = `
    <ellipse cx="100" cy="190" rx="54" ry="6" fill="#020617" opacity=".22"/>
    <circle cx="100" cy="96" r="86" fill="url(#${u}-ring)"/>
    <circle cx="100" cy="96" r="85" fill="none" stroke="${tier.edge}" stroke-opacity=".55" stroke-width="2"/>
    <circle cx="100" cy="96" r="79.5" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="3.2" stroke-dasharray="1.2 4.05"/>
    <circle cx="100" cy="96" r="74" fill="${deep}"/>
    <circle cx="100" cy="96" r="70" fill="url(#${u}-face)"/>
    <g clip-path="url(#${u}-clip)">
      ${art.tier === "platinum" ? `<g fill="#fff" opacity=".07">${rays(100, 96, 72)}</g>` : ""}
      <g fill="none" stroke="#fff" stroke-opacity=".16" stroke-width="1">
        <ellipse cx="100" cy="96" rx="66" ry="22" transform="rotate(-22 100 96)"/>
        <ellipse cx="100" cy="96" rx="66" ry="22" transform="rotate(22 100 96)"/>
        <circle cx="100" cy="96" r="52" stroke-dasharray="1.5 5"/>
      </g>
      <g fill="#fff" opacity=".55"><circle cx="58" cy="62" r="1.3"/><circle cx="146" cy="70" r="1"/><circle cx="138" cy="48" r="1.4"/><circle cx="64" cy="128" r="1"/></g>
      <ellipse cx="100" cy="166" rx="70" ry="26" fill="${deep}" opacity=".35"/>
    </g>
    <circle cx="100" cy="96" r="70" fill="url(#${u}-shine)"/>
    <circle cx="100" cy="96" r="69.5" fill="none" stroke="${light}" stroke-opacity=".35"/>
    <g transform="translate(80 ${numeric ? 34 : 38}) scale(1.6667)" fill="none" stroke="#fff" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${GLYPHS[art.glyph]}</g>
    ${text ? `<text x="100" y="${labelY}" text-anchor="middle" font-size="${labelSize}" font-weight="700" letter-spacing="${numeric ? -1 : 0.4}" fill="#fff" style="font-family:${SANS}">${label}</text>` : ""}
    <path d="M18 120h12v-6h140v6h12l-8 12 8 12H18l8-12Z" fill="url(#${u}-ribbon)"/>
    <path d="M30 114v6H18l8 12-8 12h12" fill="#000" opacity=".22"/>
    <path d="M170 114v6h12l-8 12 8 12h-12" fill="#000" opacity=".22"/>
    <path d="M30 116h140v26H30Z" fill="url(#${u}-band)"/>
    <path d="M30 116.6h140" stroke="#fff" stroke-opacity=".35"/>
    ${text ? `<text x="100" y="${132.5 + captionSize / 3}" text-anchor="middle" font-size="${captionSize}" font-weight="700" letter-spacing="${captionSpacing}" fill="${tier.ink}" style="font-family:${MONO}">${caption}</text>` : ""}
    <g fill="${tier.star}" stroke="${tier.edge}" stroke-opacity=".35" stroke-width=".6">${stars}</g>`;

  const lock = locked
    ? `<g transform="translate(150 150)">
        <circle r="19" fill="#0b1220" stroke="#fff" stroke-opacity=".28" stroke-width="1.5"/>
        <g transform="translate(-9 -9.5) scale(.75)" fill="none" stroke="#e2e8f0" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></g>
      </g>`
    : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%" aria-hidden="true">
  <defs>
    <linearGradient id="${u}-ring" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${tier.ring[0]}"/><stop offset=".38" stop-color="${tier.ring[1]}"/><stop offset=".72" stop-color="${tier.ring[2]}"/><stop offset="1" stop-color="${tier.ring[3]}"/>
    </linearGradient>
    <radialGradient id="${u}-face" cx=".32" cy=".26" r=".9">
      <stop offset="0" stop-color="${light}"/><stop offset=".34" stop-color="${mid}"/><stop offset=".78" stop-color="${dark}"/><stop offset="1" stop-color="${deep}"/>
    </radialGradient>
    <radialGradient id="${u}-shine" cx=".3" cy=".18" r=".62">
      <stop offset="0" stop-color="#fff" stop-opacity=".42"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="${u}-ribbon" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${tier.ribbon[0]}"/><stop offset="1" stop-color="${tier.ribbon[1]}"/>
    </linearGradient>
    <linearGradient id="${u}-band" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${tier.ribbon[0]}"/><stop offset=".55" stop-color="${tier.ribbon[1]}"/><stop offset="1" stop-color="${tier.ribbon[1]}"/>
    </linearGradient>
    <clipPath id="${u}-clip"><circle cx="100" cy="96" r="70"/></clipPath>
    ${locked ? `<filter id="${u}-gray"><feColorMatrix type="saturate" values="0"/></filter>` : ""}
  </defs>
  ${locked ? `<g filter="url(#${u}-gray)" opacity=".42">${body}</g>${lock}` : body}
</svg>`;
}
