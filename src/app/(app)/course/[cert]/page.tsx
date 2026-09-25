import Link from "next/link";
import { notFound } from "next/navigation";
import { getModules, CERTIFICATIONS, isValidCert, type ModuleMeta } from "@/lib/learning/content";
import { requireAccess } from "@/lib/dal";
import { getProgressForCert } from "@/lib/learning/progress";
import {
  ArrowRightIcon,
  BookIcon,
  CheckIcon,
  ClockIcon,
  PracticeIcon,
  TargetIcon,
} from "@/components/ui-icons";

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
    <div className="mx-auto max-w-[1180px] px-5 py-8 sm:px-8 sm:py-12">
      <div className="grid gap-8 lg:grid-cols-[1fr_320px] lg:items-start">
        <div className="relative overflow-hidden rounded-[2rem] bg-slate-950 px-6 py-8 text-white shadow-xl shadow-slate-950/10 sm:px-9 sm:py-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_90%_0%,rgba(249,115,22,.26),transparent_35%),linear-gradient(145deg,rgba(255,255,255,.06),transparent_42%)]" />
          <div className="relative"><div className="flex items-center gap-2 text-orange-300"><BookIcon className="h-4 w-4" /><p className="study-eyebrow !text-orange-300">{certInfo.code} · Trilha completa</p></div>
          <h1 className="mt-4 max-w-2xl text-3xl font-bold tracking-[-0.04em] sm:text-4xl">{certInfo.name}</h1>
          <p className="mt-4 text-sm leading-6 text-slate-300">
        {modules.length} módulos ({labCount} labs práticos) · ~
        {Math.round(totalMinutes / 60)}h de estudo · {sortedWeeks.length} semanas
        sugeridas
          </p>

          <div className="mt-7 max-w-2xl">
        <div className="flex justify-between text-xs font-semibold text-slate-300">
          <span>
            {completed} de {modules.length} módulos concluídos
          </span>
          <span>{Math.round((completed / modules.length) * 100)}%</span>
        </div>
        <div className="mt-2 h-2.5 rounded-full bg-white/15">
          <div
            className="h-2.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-300 transition-all duration-500"
            style={{ width: `${(completed / modules.length) * 100}%` }}
          />
        </div>
          </div>

      {nextModule && (
        <Link
          href={`/course/${cert}/${nextModule.slug}`}
          className="group mt-7 flex max-w-2xl items-center justify-between rounded-2xl border border-white/15 bg-white/10 p-5 text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/15"
        >
          <span>
            <span className="block text-xs font-semibold text-slate-400 dark:text-orange-100">
              {completed > 0 ? "Continuar de onde parou" : "Começar agora"}
            </span>
            <span className="mt-1 block font-bold">{nextModule.title}</span>
          </span>
          <ArrowRightIcon className="h-5 w-5 transition-transform group-hover:translate-x-1" />
        </Link>
      )}
        </div></div>

      <section className="study-card p-6 lg:mt-0">
        <div className="flex items-center gap-2"><TargetIcon className="h-4 w-4 text-orange-600" /><h2 className="study-eyebrow">
          Domínios do exame
        </h2></div>
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

      <section className="mt-6 grid gap-4 sm:grid-cols-2" aria-label="Ferramentas de prática">
        <div className="study-card relative overflow-hidden p-6">
          <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-[4rem] bg-orange-50 dark:bg-orange-500/10" />
          <div className="relative flex items-center gap-2"><PracticeIcon className="h-4 w-4 text-orange-600" /><p className="study-eyebrow">Praticar</p></div><h2 className="relative mt-3 text-xl font-bold tracking-tight text-slate-950 dark:text-white">Simulados</h2>
          <p className="relative mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
            Formato oficial ({certInfo.examQuestionCount} questões, {certInfo.examDurationMinutes} min), dicas com penalidade e análise de tempo por questão.
          </p>
          <Link href={`/simulado/${cert}`} className="cm-button-primary relative mt-5 min-h-10 px-4">
            <PracticeIcon className="h-4 w-4" />Fazer simulado<ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
        <div className="study-card p-6">
          <div className="flex items-center gap-2"><ClockIcon className="h-4 w-4 text-orange-600" /><p className="study-eyebrow">Revisar</p></div><h2 className="mt-3 text-xl font-bold tracking-tight text-slate-950 dark:text-white">Flashcards</h2>
          <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">Revisão espaçada dos conceitos que mais caem na prova.</p>
          <Link href={`/flashcards/${cert}`} className="cm-button-secondary mt-5 min-h-10 px-4">Revisar flashcards</Link>
        </div>
      </section>

      <div className="mt-12 space-y-12">
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
                      className="study-card-interactive group flex h-full items-start gap-4 p-5"
                    >
                      <span
                        className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-medium ${
                          done
                            ? "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400"
                            : "bg-slate-100 text-slate-500 transition group-hover:bg-orange-50 group-hover:text-orange-600 dark:bg-white/5 dark:text-slate-400"
                        }`}
                      >
                        {done ? <CheckIcon className="h-4 w-4" /> : mod.order}
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
                        <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-slate-600 transition group-hover:text-orange-600 dark:text-slate-300 dark:group-hover:text-orange-300">
                          Ver módulo <ArrowRightIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
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

    </div>
  );
}
