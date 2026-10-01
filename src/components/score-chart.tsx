import type { CSSProperties } from "react";

export type ScoreSeries = {
  id: string;
  label: string;
  color: string;
  points: Array<{ score: number; completedAt: string }>;
};

const PASS_SCORE = 72;

// Evolução das notas (várias trilhas no mesmo eixo de tempo). Linhas e áreas
// em SVG esticável; rótulos e pontos em HTML para ficarem nítidos em qualquer
// largura. Renderizado no servidor.
export function ScoreChart({ series, height = 220 }: { series: ScoreSeries[]; height?: number }) {
  const visible = series.filter((item) => item.points.length > 0);
  const all = visible.flatMap((item) => item.points);
  if (all.length === 0) return null;

  const times = all.map((point) => Date.parse(point.completedAt));
  let minT = Math.min(...times);
  let maxT = Math.max(...times);
  if (minT === maxT) {
    minT -= 86_400_000;
    maxT += 86_400_000;
  }
  const lowest = Math.min(...all.map((point) => point.score));
  const minY = Math.max(0, Math.min(50, Math.floor((lowest - 8) / 10) * 10));
  const ticks = [100, 90, 80, 70, 60, 50, 40, 30, 20, 10, 0].filter((tick) => tick >= minY && (tick - minY) % 10 === 0);
  const labelTicks = ticks.filter((_, index) => index % (ticks.length > 6 ? 2 : 1) === 0);

  const x = (time: number) => 3 + ((time - minT) / (maxT - minT)) * 94;
  const y = (score: number) => 6 + (1 - (score - minY) / (100 - minY)) * 88;

  const firstDate = new Date(minT);
  const lastDate = new Date(maxT);
  const fmt = (date: Date) => date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", timeZone: "UTC" }).replace(".", "");

  const latest = visible
    .map((item) => `${item.label}: ${item.points[item.points.length - 1].score}%`)
    .join(", ");

  return (
    <figure className="w-full" role="img" aria-label={`Evolução das notas nos simulados completos. Últimas notas — ${latest}.`}>
      <div className="relative" style={{ height }}>
        {labelTicks.map((tick) => (
          <div key={tick} className="absolute inset-x-0 flex items-center gap-2" style={{ top: `${y(tick)}%` }}>
            <span className="w-7 -translate-y-px text-right font-mono text-[10px] text-ws-subtle">{tick}</span>
            <span className="h-px flex-1 bg-ws-line/[0.07]" />
          </div>
        ))}

        <div className="absolute bottom-0 left-9 right-0 top-0">
          <div
            className="absolute inset-x-0 border-t border-dashed border-ws-success/70"
            style={{ top: `${y(PASS_SCORE)}%` }}
          >
            <span className="absolute -top-5 right-0 rounded-md bg-ws-success/10 px-1.5 py-0.5 font-mono text-[10px] font-medium text-ws-success-ink">
              aprovação {PASS_SCORE}%
            </span>
          </div>

          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
            <defs>
              {visible.map((item) => (
                <linearGradient key={item.id} id={`score-area-${item.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={item.color} stopOpacity="0.22" />
                  <stop offset="100%" stopColor={item.color} stopOpacity="0" />
                </linearGradient>
              ))}
            </defs>
            {visible.map((item) => {
              const pts = item.points.map((point) => [x(Date.parse(point.completedAt)), y(point.score)] as const);
              if (pts.length < 2) return null;
              const line = pts.map(([px, py], index) => `${index ? "L" : "M"}${px},${py}`).join(" ");
              const area = `${line} L${pts[pts.length - 1][0]},100 L${pts[0][0]},100 Z`;
              return (
                <g key={item.id}>
                  <path d={area} fill={`url(#score-area-${item.id})`} />
                  <path
                    d={line}
                    fill="none"
                    stroke={item.color}
                    strokeWidth="2.25"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                  />
                </g>
              );
            })}
          </svg>

          {visible.map((item) =>
            item.points.map((point, index) => {
              const last = index === item.points.length - 1;
              return (
                <span
                  key={`${item.id}-${index}`}
                  title={`${item.label} · ${point.score}% · ${fmt(new Date(point.completedAt))}`}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-ws-surface ${last ? "h-3 w-3" : "h-2 w-2"}`}
                  style={{ left: `${x(Date.parse(point.completedAt))}%`, top: `${y(point.score)}%`, background: item.color } as CSSProperties}
                >
                  {last ? (
                    <span className="absolute bottom-full left-1/2 mb-1.5 -translate-x-1/2 rounded-md bg-ws-ink px-1.5 py-0.5 font-mono text-[10px] font-semibold text-ws-canvas shadow-sm">
                      {point.score}%
                    </span>
                  ) : null}
                </span>
              );
            })
          )}
        </div>
      </div>
      <figcaption className="ml-9 mt-2 flex justify-between font-mono text-[10px] uppercase tracking-wide text-ws-subtle">
        <span>{fmt(firstDate)}</span>
        <span>{fmt(lastDate)}</span>
      </figcaption>
    </figure>
  );
}
