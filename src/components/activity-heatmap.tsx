import { Fragment } from "react";

function level(count: number) {
  if (count <= 0) return "bg-ws-line/[0.07]";
  if (count === 1) return "bg-orange-400/40";
  if (count === 2) return "bg-orange-500/65";
  return "bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,.45)]";
}

// Mapa de consistência: semanas em colunas (domingo no topo). As células
// crescem com a largura disponível, até ~20px.
export function ActivityHeatmap({ activity }: { activity: Array<{ date: string; count: number }> }) {
  if (!activity.length) return null;

  const firstWeekday = new Date(`${activity[0].date}T00:00:00Z`).getUTCDay();
  const cells: Array<{ date: string; count: number } | null> = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...activity,
  ];
  const weeks: Array<typeof cells> = [];
  for (let index = 0; index < cells.length; index += 7) weeks.push(cells.slice(index, index + 7));

  const monthLabels = weeks.map((week, index) => {
    const first = week.find(Boolean);
    if (!first) return null;
    const month = first.date.slice(5, 7);
    const previous = index > 0 ? weeks[index - 1].find(Boolean)?.date.slice(5, 7) : null;
    if (index > 0 && month === previous) return null;
    return new Date(`${first.date}T00:00:00Z`)
      .toLocaleDateString("pt-BR", { month: "short", timeZone: "UTC" })
      .replace(".", "");
  });

  const fmt = (date: string) => `${date.slice(8, 10)}/${date.slice(5, 7)}`;
  const total = activity.reduce((acc, day) => acc + day.count, 0);

  return (
    <div
      role="img"
      aria-label={`${total} atividades nas últimas ${weeks.length} semanas`}
      className="grid gap-[3px]"
      style={{
        gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))`,
        gridTemplateRows: "auto repeat(7, auto)",
        gridAutoFlow: "column",
        maxWidth: weeks.length * 22,
      }}
    >
      {weeks.map((week, weekIndex) => (
        <Fragment key={weekIndex}>
          <span className="h-4 overflow-visible whitespace-nowrap font-mono text-[10px] lowercase leading-3 text-ws-subtle">
            {monthLabels[weekIndex] ?? ""}
          </span>
          {Array.from({ length: 7 }, (_, day) => {
            const cell = week[day];
            if (!cell) return <span key={day} className="aspect-square w-full" />;
            return (
              <span
                key={day}
                title={`${cell.count} ${cell.count === 1 ? "atividade" : "atividades"} em ${fmt(cell.date)}`}
                className={`aspect-square w-full rounded-[4px] ${level(cell.count)}`}
              />
            );
          })}
        </Fragment>
      ))}
    </div>
  );
}

export function HeatmapLegend() {
  return (
    <div className="flex items-center gap-1.5 font-mono text-[10px] text-ws-subtle">
      menos
      {[0, 1, 2, 3].map((count) => (
        <span key={count} className={`h-2.5 w-2.5 rounded-[3px] ${level(count)}`} />
      ))}
      mais
    </div>
  );
}
