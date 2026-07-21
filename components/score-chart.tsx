// Gráfico de evolução das notas (SVG puro, renderizado no servidor).
// Linha de aprovação em 72% e gradiente da marca na série.
export function ScoreChart({
  history,
  width = 560,
  height = 120,
}: {
  history: Array<{ score: number; completedAt: string }>;
  width?: number;
  height?: number;
}) {
  if (history.length < 2) return null;

  const pad = { top: 10, right: 8, bottom: 18, left: 30 };
  const w = width - pad.left - pad.right;
  const h = height - pad.top - pad.bottom;

  const x = (i: number) => pad.left + (i / (history.length - 1)) * w;
  const y = (score: number) => pad.top + (1 - score / 100) * h;

  const points = history.map((p, i) => `${x(i)},${y(p.score)}`).join(" ");
  const areaPath = `M ${x(0)},${y(history[0].score)} ${history
    .slice(1)
    .map((p, i) => `L ${x(i + 1)},${y(p.score)}`)
    .join(" ")} L ${x(history.length - 1)},${pad.top + h} L ${x(0)},${pad.top + h} Z`;

  const passY = y(72);
  const last = history[history.length - 1];
  const gradientId = "score-grad";

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full"
      role="img"
      aria-label={`Evolução das notas: última nota ${last.score}%`}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F97316" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#F97316" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* linhas de referência */}
      {[0, 50, 100].map((v) => (
        <g key={v}>
          <line
            x1={pad.left}
            x2={width - pad.right}
            y1={y(v)}
            y2={y(v)}
            stroke="#E5E7EB"
            strokeWidth="1"
          />
          <text x={0} y={y(v) + 3.5} fontSize="9" fill="#9CA3AF">
            {v}%
          </text>
        </g>
      ))}

      {/* linha de aprovação (~72%) */}
      <line
        x1={pad.left}
        x2={width - pad.right}
        y1={passY}
        y2={passY}
        stroke="#22C55E"
        strokeWidth="1"
        strokeDasharray="4 3"
      />
      <text x={width - pad.right} y={passY - 4} fontSize="9" fill="#16A34A" textAnchor="end">
        aprovação
      </text>

      {/* série */}
      <path d={areaPath} fill={`url(#${gradientId})`} />
      <polyline
        points={points}
        fill="none"
        stroke="#F97316"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {history.map((p, i) => (
        <circle
          key={i}
          cx={x(i)}
          cy={y(p.score)}
          r={i === history.length - 1 ? 4 : 3}
          fill={p.score >= 72 ? "#22C55E" : "#F97316"}
          stroke="#fff"
          strokeWidth="1.5"
        />
      ))}

      {/* rótulo da última nota */}
      <text
        x={x(history.length - 1)}
        y={y(last.score) - 8}
        fontSize="11"
        fontWeight="700"
        fill="#111827"
        textAnchor="end"
      >
        {last.score}%
      </text>
    </svg>
  );
}
