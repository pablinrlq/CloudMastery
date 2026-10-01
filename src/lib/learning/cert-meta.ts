// Client-safe presentation metadata for each certification track.
// (lib/content.ts reads the filesystem and is server-only.)

export type CertTone = "ccp" | "saa" | "aif";

export const CERT_META = {
  ccp: {
    id: "ccp",
    code: "CLF-C02",
    tag: "CCP",
    short: "Cloud Practitioner",
    tier: "Foundational",
    tone: "ccp",
    color: "#f97316",
  },
  saa: {
    id: "saa",
    code: "SAA-C03",
    tag: "SAA",
    short: "Solutions Architect",
    tier: "Associate",
    tone: "saa",
    color: "#3b82f6",
  },
  aif: {
    id: "aif",
    code: "AIF-C01",
    tag: "AIF",
    short: "AI Practitioner",
    tier: "Foundational",
    tone: "aif",
    color: "#a855f7",
  },
} as const satisfies Record<string, {
  id: string;
  code: string;
  tag: string;
  short: string;
  tier: string;
  tone: CertTone;
  color: string;
}>;

export type CertKey = keyof typeof CERT_META;

export const CERT_ORDER: CertKey[] = ["ccp", "saa", "aif"];

export function certMeta(certId: string) {
  return CERT_META[certId as CertKey] ?? CERT_META.ccp;
}
