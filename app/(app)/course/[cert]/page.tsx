import Link from "next/link";
import { notFound } from "next/navigation";
import { getModules, CERTIFICATIONS, isValidCert, type ModuleMeta } from "@/lib/content";
import { requireAccess } from "@/lib/dal";
import { getProgressForCert } from "@/lib/progress";

const TYPE_BADGE: Record<string, { label: string; className: string }> = {
  teoria: { label: "Teoria", className: "bg-blue-50 text-blue-700" },
  lab: { label: "Lab", className: "bg-purple-50 text-purple-700" },
  revisao: { label: "Revisão", className: "bg-emerald-50 text-emerald-700" },
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
    <div className="mx-auto max-w-3xl px-4 py-10">
      <p className="text-sm text-gray-500">{certInfo.code}</p>
      <h1 className="text-2xl font-bold">{certInfo.name}</h1>
      <p className="mt-2 text-sm text-gray-600">
        {modules.length} módulos ({labCount} labs práticos) · ~
        {Math.round(totalMinutes / 60)}h de estudo · {sortedWeeks.length} semanas
        sugeridas
      </p>

      <div className="mt-5">
        <div className="flex justify-between text-sm text-gray-600">
          <span>
            {completed} de {modules.length} módulos concluídos
          </span>
          <span>{Math.round((completed / modules.length) * 100)}%</span>
        </div>
        <div className="mt-1 h-2 rounded-full bg-gray-100">
          <div
            className="h-2 rounded-full bg-orange-500 transition-all"
            style={{ width: `${(completed / modules.length) * 100}%` }}
          />
        </div>
      </div>

      {nextModule && (
        <Link
          href={`/course/${cert}/${nextModule.slug}`}
          className="mt-5 flex items-center justify-between rounded-xl bg-gray-900 p-4 text-white hover:bg-gray-800"
        >
          <span>
            <span className="block text-xs text-gray-300">
              {completed > 0 ? "Continuar de onde parou" : "Começar agora"}
            </span>
            <span className="font-medium">{nextModule.title}</span>
          </span>
          <span aria-hidden>→</span>
        </Link>
      )}

      <section className="mt-8 rounded-xl border border-gray-200 p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          Domínios do exame
        </h2>
        <div className="mt-3 grid gap-2 text-sm">
          {domainStats.map(({ domain, total, done }) => (
            <div key={domain} className="flex items-center justify-between gap-3">
              <span>{domain}</span>
              <span className="shrink-0 text-xs text-gray-500">
                {done}/{total} módulos
              </span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-gray-400">
          Formato oficial: {certInfo.examQuestionCount} questões ·{" "}
          {certInfo.examDurationMinutes} minutos
        </p>
      </section>

      <div className="mt-8 space-y-8">
        {sortedWeeks.map(([week, weekModules]) => (
          <section key={week}>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Semana {week}
            </h2>
            <ol className="mt-3 space-y-3">
              {weekModules.map((mod) => {
                const done = isDone(mod);
                const badge = TYPE_BADGE[mod.type ?? "teoria"];
                return (
                  <li key={mod.slug}>
                    <Link
                      href={`/course/${cert}/${mod.slug}`}
                      className="flex items-start gap-4 rounded-xl border border-gray-200 p-4 hover:border-orange-300 hover:bg-orange-50/40"
                    >
                      <span
                        className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-medium ${
                          done
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {done ? "✓" : mod.order}
                      </span>
                      <span className="min-w-0">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="font-medium">{mod.title}</span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${badge.className}`}
                          >
                            {badge.label}
                          </span>
                        </span>
                        <span className="mt-0.5 block text-sm text-gray-500">
                          {mod.description}
                        </span>
                        <span className="mt-1 block text-xs text-gray-400">
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

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl bg-gray-50 p-6">
          <h2 className="font-semibold">Simulados</h2>
          <p className="mt-1 text-sm text-gray-600">
            Formato oficial ({certInfo.examQuestionCount} questões,{" "}
            {certInfo.examDurationMinutes} min), dicas com penalidade e análise de
            tempo por questão.
          </p>
          <Link
            href={`/simulado/${cert}`}
            className="mt-3 inline-block rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
          >
            Fazer simulado
          </Link>
        </div>
        <div className="rounded-xl bg-gray-50 p-6">
          <h2 className="font-semibold">Flashcards</h2>
          <p className="mt-1 text-sm text-gray-600">
            Revisão espaçada dos conceitos que mais caem na prova.
          </p>
          <Link
            href={`/flashcards/${cert}`}
            className="mt-3 inline-block rounded-md border border-gray-300 px-4 py-2 text-sm font-medium hover:border-orange-400"
          >
            Revisar flashcards
          </Link>
        </div>
      </div>
    </div>
  );
}
