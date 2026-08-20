import Link from "next/link";
import { notFound } from "next/navigation";
import { getModules, CERTIFICATIONS, isValidCert, type ModuleMeta } from "@/lib/content";
import { requireAccess } from "@/lib/dal";
import { getProgressForCert } from "@/lib/progress";

const TYPE_BADGE: Record<string, { label: string; className: string }> = {
  teoria: { label: "Teoria", className: "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300" },
  lab: { label: "Lab", className: "bg-purple-50 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300" },
  revisao: { label: "Revisão", className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300" },
};

export default async function CoursePage({
  params,
}: {
  params: Promise<{ cert: string }>;
}) {
  const { cert } = await params;
  if (!isValidCert(cert)) notFound();

  await requireAccess(cert);

  const certInfo = CERTIFICATIONS[cert];
  const modules = getModules(cert);
  const progress = await getProgressForCert(cert);

  const isDone = (m: ModuleMeta) => progress[`${cert}/${m.slug}`] === "completed";
  const completed = modules.filter(isDone).length;
  const nextModule = modules.find((m) => !isDone(m));

  // Agrupa por semana do mapa de estudos
  const weeks = new Map<number, ModuleMeta[]>();
  for (const mod of modules) {
    const week = mod.week ?? 1;
    if (!weeks.has(week)) weeks.set(week, []);
    weeks.get(week)!.push(mod);
  }
  const sortedWeeks = [...weeks.entries()].sort(([a], [b]) => a - b);

  // Progresso por domínio (para a tabela de domínios)
  const domainStats = certInfo.domains.map((domain) => {
    const domainModules = modules.filter((m) => m.domain === domain);
    const done = domainModules.filter(isDone).length;
    return { domain, total: domainModules.length, done };
  });

  const labCount = modules.filter((m) => m.type === "lab").length;
  const totalMinutes = modules.reduce((acc, m) => acc + m.durationMinutes, 0);

  return (
    <div className="cm-container py-10 sm:py-14">
      <div className="grid gap-8 lg:grid-cols-[1fr_320px] lg:items-start">
        <div>
          <p className="cm-kicker">{certInfo.code} · Trilha completa</p>
          <h1 className="cm-title mt-3 max-w-2xl">{certInfo.name}</h1>
          <p className="mt-4 text-sm leading-6 text-slate-500 dark:text-slate-400">
        {modules.length} módulos ({labCount} labs práticos) · ~
        {Math.round(totalMinutes / 60)}h de estudo · {sortedWeeks.length} semanas
        sugeridas
          </p>

          <div className="mt-7 max-w-2xl">
        <div className="flex justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
          <span>
            {completed} de {modules.length} módulos concluídos
          </span>
          <span>{Math.round((completed / modules.length) * 100)}%</span>
        </div>
        <div className="mt-2 h-2.5 rounded-full bg-slate-200/70 dark:bg-white/10">
          <div
            className="h-2.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-300 transition-all duration-500"
            style={{ width: `${(completed / modules.length) * 100}%` }}
          />
        </div>
          </div>

      {nextModule && (
        <Link
          href={`/course/${cert}/${nextModule.slug}`}
          className="group mt-7 flex max-w-2xl items-center justify-between rounded-2xl bg-slate-950 p-5 text-white shadow-[0_20px_45px_-28px_rgba(15,23,42,0.7)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-900 hover:shadow-[0_25px_55px_-28px_rgba(15,23,42,0.8)] dark:bg-orange-500 dark:hover:bg-orange-400"
        >
          <span>
            <span className="block text-xs font-semibold text-slate-400 dark:text-orange-100">
              {completed > 0 ? "Continuar de onde parou" : "Começar agora"}
            </span>
            <span className="mt-1 block font-bold">{nextModule.title}</span>
          </span>
          <span className="text-xl transition-transform group-hover:translate-x-1" aria-hidden>→</span>
        </Link>
      )}
        </div>

      <section className="cm-panel p-6 lg:mt-0">
        <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
          Domínios do exame
        </h2>
        <div className="mt-5 grid gap-4 text-sm text-slate-800 dark:text-slate-200">
          {domainStats.map(({ domain, total, done }) => (
            <div key={domain} className="border-b border-slate-100 pb-3 last:border-0 last:pb-0 dark:border-white/5">
              <div className="flex items-center justify-between gap-3"><span className="font-medium">{domain}</span>
              <span className="shrink-0 text-xs text-slate-400 dark:text-slate-500">
                {done}/{total} módulos
              </span></div>
              <div className="mt-2 h-1 rounded-full bg-slate-100 dark:bg-white/10"><div className="h-1 rounded-full bg-orange-400" style={{ width: total ? `${(done / total) * 100}%` : "0%" }} /></div>
            </div>
          ))}
        </div>
        <p className="mt-5 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-400 dark:bg-white/[0.035] dark:text-slate-500">
          Formato oficial: {certInfo.examQuestionCount} questões ·{" "}
          {certInfo.examDurationMinutes} minutos
        </p>
      </section>
      </div>

      <div className="mt-14 space-y-12">
        {sortedWeeks.map(([week, weekModules]) => (
          <section key={week}>
            <div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-xs font-bold text-white dark:bg-white dark:text-slate-950">{week}</span><h2 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
              Semana {week}
            </h2></div>
            <ol className="mt-4 grid gap-3 lg:grid-cols-2">
              {weekModules.map((mod) => {
                const done = isDone(mod);
                const badge = TYPE_BADGE[mod.type ?? "teoria"];
                return (
                  <li key={mod.slug}>
                    <Link
                      href={`/course/${cert}/${mod.slug}`}
                      className="group flex h-full items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.02)] transition-all duration-200 hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-[0_16px_36px_-28px_rgba(15,23,42,0.4)] dark:border-white/10 dark:bg-slate-900 dark:hover:border-orange-500/30"
                    >
                      <span
                        className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-medium ${
                          done
                            ? "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400"
                            : "bg-slate-100 text-slate-500 transition group-hover:bg-orange-50 group-hover:text-orange-600 dark:bg-white/5 dark:text-slate-400"
                        }`}
                      >
                        {done ? "OK" : mod.order}
                      </span>
                      <span className="min-w-0">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="font-bold tracking-tight text-slate-900 dark:text-white">
                            {mod.title}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${badge.className}`}
                          >
                            {badge.label}
                          </span>
                        </span>
                        <span className="mt-2 block text-sm leading-6 text-slate-500 dark:text-slate-400">
                          {mod.description}
                        </span>
                        <span className="mt-2 block text-xs font-medium text-slate-400 dark:text-slate-500">
                          {mod.domain} · ~{mod.durationMinutes} min
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ol>
          </section>
        ))}
      </div>

      <div className="mt-14 grid gap-4 sm:grid-cols-2">
        <div className="cm-panel p-7">
          <p className="cm-kicker">Praticar</p><h2 className="mt-3 text-xl font-bold tracking-tight text-slate-950 dark:text-white">Simulados</h2>
          <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
            Formato oficial ({certInfo.examQuestionCount} questões,{" "}
            {certInfo.examDurationMinutes} min), dicas com penalidade e análise de
            tempo por questão.
          </p>
          <Link
            href={`/simulado/${cert}`}
            className="cm-button-primary mt-5 min-h-10 px-4"
          >
            Fazer simulado
          </Link>
        </div>
        <div className="cm-panel p-7">
          <p className="cm-kicker">Revisar</p><h2 className="mt-3 text-xl font-bold tracking-tight text-slate-950 dark:text-white">Flashcards</h2>
          <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
            Revisão espaçada dos conceitos que mais caem na prova.
          </p>
          <Link
            href={`/flashcards/${cert}`}
            className="cm-button-secondary mt-5 min-h-10 px-4"
          >
            Revisar flashcards
          </Link>
        </div>
      </div>
    </div>
  );
}
