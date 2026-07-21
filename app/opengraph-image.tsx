import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "CloudMastery — Certificações AWS com método";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Open Graph image usada em links compartilhados (WhatsApp, LinkedIn, X).
export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #0a0a0a 0%, #1a1206 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        {/* marca */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 18,
              background: "linear-gradient(135deg, #F97316, #FBBF24)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 40,
            }}
          >
            ☁️
          </div>
          <div style={{ fontSize: 40, fontWeight: 800, display: "flex" }}>
            <span>Cloud</span>
            <span style={{ color: "#FBBF24" }}>Mastery</span>
          </div>
        </div>

        {/* headline */}
        <div
          style={{
            marginTop: 50,
            fontSize: 68,
            fontWeight: 800,
            lineHeight: 1.1,
            maxWidth: 900,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <span>Domine a nuvem.</span>
          <span
            style={{
              background: "linear-gradient(90deg, #F97316, #FBBF24)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            Conquiste sua certificação AWS.
          </span>
        </div>

        {/* rodapé de features */}
        <div style={{ marginTop: 50, display: "flex", gap: 40, fontSize: 26, color: "#9CA3AF" }}>
          <span>46 módulos</span>
          <span>·</span>
          <span>Simulados oficiais</span>
          <span>·</span>
          <span>100% em português</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
