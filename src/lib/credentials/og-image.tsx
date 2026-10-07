import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { describeAchievement } from "@/lib/credentials/catalog";
import { badgeSvg } from "@/lib/credentials/badge-art";
import { formatIssuedDate } from "@/lib/credentials/share";
import { getPublicCredential } from "@/lib/credentials/server";

export const OG_SIZE = { width: 1200, height: 630 };

const ACCENT: Record<string, string> = {
  ccp: "#f97316",
  saa: "#3b82f6",
  aif: "#a855f7",
  habit: "#10b981",
  level: "#6366f1",
  diagnostic: "#06b6d4",
};

async function loadFonts() {
  const dir = join(process.cwd(), "src/assets/fonts");
  const [regular, semibold] = await Promise.all([
    readFile(join(dir, "Geist-Regular.ttf")),
    readFile(join(dir, "Geist-SemiBold.ttf")),
  ]);
  return [
    { name: "Geist", data: regular, weight: 400 as const, style: "normal" as const },
    { name: "Geist", data: semibold, weight: 600 as const, style: "normal" as const },
  ];
}

function BrandMark() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <div
        style={{
          display: "flex",
          width: 44,
          height: 44,
          borderRadius: 13,
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #fb923c, #ea580c)",
          color: "#1a0d03",
          fontSize: 22,
          fontWeight: 600,
        }}
      >
        CM
      </div>
      <div style={{ display: "flex", fontSize: 28, fontWeight: 600, letterSpacing: -0.8 }}>
        <span style={{ color: "#fff" }}>Cloud</span>
        <span style={{ color: "#fb923c" }}>Mastery</span>
      </div>
    </div>
  );
}

/**
 * Share image for a credential (LinkedIn/X/WhatsApp previews). The medal's
 * text is drawn by Satori on top of the SVG, because nested SVG images are
 * rasterized without access to fonts.
 */
export async function renderCredentialImage(code: string) {
  const [fonts, credential] = await Promise.all([loadFonts(), getPublicCredential(code)]);
  const achievement = credential
    ? describeAchievement(credential.achievement, { certId: credential.certId, modulesTotal: Number(credential.evidence.modulesTotal) || 0 })
    : null;

  if (!credential || !achievement) {
    return new ImageResponse(
      (
        <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#070a12", color: "#fff", fontFamily: "Geist", gap: 28 }}>
          <BrandMark />
          <div style={{ fontSize: 40, fontWeight: 600 }}>Credencial não encontrada</div>
        </div>
      ),
      { ...OG_SIZE, fonts }
    );
  }

  const accent = ACCENT[achievement.art.tone] ?? "#f97316";
  const medalSize = 400;
  const scale = medalSize / 200;
  const numeric = /^\d{1,3}$/.test(achievement.art.label);
  const labelSize = (numeric ? 36 : achievement.art.label.length > 7 ? 17 : 20) * scale;
  const labelCenter = 101 * scale; // the label sits at the same optical center in both layouts
  const captionSize = (achievement.art.caption.length > 15 ? 7.6 : achievement.art.caption.length > 11 ? 8.4 : 9.2) * scale;
  const medal = `data:image/svg+xml;base64,${Buffer.from(badgeSvg(achievement.art, { id: "og", text: false })).toString("base64")}`;
  const revoked = credential.revokedAt !== null;
  const titleSize = credential.title.length > 52 ? 44 : credential.title.length > 34 ? 50 : 58;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: "#070a12", color: "#fff", fontFamily: "Geist" }}>
        {/* Canvas-sized layers: Satori clips the background of boxes that start off-canvas. */}
        <div style={{ position: "absolute", left: 0, top: 0, width: OG_SIZE.width, height: OG_SIZE.height, display: "flex", background: `radial-gradient(circle at 19% 37%, ${accent}66 0%, ${accent}1f 25%, transparent 44%)` }} />
        <div style={{ position: "absolute", left: 0, top: 0, width: OG_SIZE.width, height: OG_SIZE.height, display: "flex", background: "radial-gradient(circle at 88% 90%, rgba(251,146,60,.16) 0%, transparent 24%)" }} />

        <div style={{ display: "flex", width: 520, alignItems: "center", justifyContent: "center", position: "relative" }}>
          <div style={{ display: "flex", position: "relative", width: medalSize, height: medalSize }}>
            {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse (Satori) renders plain <img>, not next/image */}
            <img src={medal} width={medalSize} height={medalSize} alt="" />
            <div style={{ position: "absolute", left: 0, top: labelCenter - labelSize * 0.62, width: medalSize, display: "flex", justifyContent: "center", fontSize: labelSize, fontWeight: 600, letterSpacing: numeric ? -2 : 0.6, color: "#fff" }}>
              {achievement.art.label}
            </div>
            <div style={{ position: "absolute", left: 0, top: 132 * scale - captionSize * 0.62, width: medalSize, display: "flex", justifyContent: "center", fontSize: captionSize, fontWeight: 600, letterSpacing: 2.4, color: "#fff" }}>
              {achievement.art.caption.toUpperCase()}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", flex: 1, paddingRight: 80, position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 21, fontWeight: 600, letterSpacing: 3, color: revoked ? "#fda4af" : "#6ee7b7" }}>
            <div style={{ display: "flex", width: 14, height: 14, borderRadius: 9999, background: revoked ? "#fb7185" : "#34d399" }} />
            {revoked ? "CREDENCIAL REVOGADA" : credential.kind === "certificate" ? "CERTIFICADO VERIFICÁVEL" : "BADGE VERIFICÁVEL"}
          </div>
          <div style={{ display: "flex", marginTop: 22, fontSize: titleSize, fontWeight: 600, lineHeight: 1.08, letterSpacing: -1.8 }}>{credential.title}</div>
          <div style={{ display: "flex", marginTop: 30, fontSize: 24, color: "#94a3b8" }}>Emitida para</div>
          <div style={{ display: "flex", marginTop: 4, fontSize: 42, fontWeight: 600, letterSpacing: -1 }}>{credential.holderName}</div>
          <div style={{ display: "flex", marginTop: 26, gap: 16, alignItems: "center", fontSize: 22, color: "#94a3b8" }}>
            <span>{formatIssuedDate(credential.issuedAt)}</span>
            <span style={{ display: "flex", width: 6, height: 6, borderRadius: 9999, background: "#475569" }} />
            <span style={{ letterSpacing: 1.5 }}>{credential.code}</span>
          </div>
          <div style={{ display: "flex", marginTop: 44 }}>
            <BrandMark />
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts }
  );
}
