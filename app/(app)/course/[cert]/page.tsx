import Link from "next/link";
import { notFound } from "next/navigation";
import { getModules, CERTIFICATIONS, isValidCert } from "@/lib/content";
import { requireAccess } from "@/lib/dal";
import { getProgressForCert } from "@/lib/progress";

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

  const completed = modules.filter(
    (m) => progress[`${cert}/${m.slug}`] === "completed"
  ).length;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <p className="text-sm text-gray-500">{certInfo.code}</p>
      <h1 className="text-2xl font-bold">{certInfo.name}</h1>

      <div className="mt-4">
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

      <ol className="mt-8 space-y-3">
        {modules.map((mod, index) => {
          const status = progress[`${cert}/${mod.slug}`] ?? "not_started";
          return (
            <li key={mod.slug}>
              <Link
                href={`/course/${cert}/${mod.slug}`}
                className="flex items-start gap-4 rounded-xl border border-gray-200 p-4 hover:border-orange-300 hover:bg-orange-50/40"
              >
                <span
                  className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-medium ${
                    status === "completed"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {status === "completed" ? "✓" : index + 1}
                </span>
                <span>
                  <span className="block font-medium">{mod.title}</span>
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

      <div className="mt-10 rounded-xl bg-gray-50 p-6">
        <h2 className="font-semibold">Pronto para testar?</h2>
        <p className="mt-1 text-sm text-gray-600">
          Faça um simulado no formato oficial: {certInfo.examQuestionCount}{" "}
          questões em {certInfo.examDurationMinutes} minutos.
        </p>
        <Link
          href={`/simulado/${cert}`}
          className="mt-3 inline-block rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
        >
          Ir para os simulados
        </Link>
      </div>
    </div>
  );
}
