import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { getModule, getModules, isValidCert } from "@/lib/content";
import { requireAccess } from "@/lib/dal";
import { getProgressForCert } from "@/lib/progress";
import { markModuleCompleted } from "../../actions";

export default async function ModulePage({
  params,
}: {
  params: Promise<{ cert: string; module: string }>;
}) {
  const { cert, module: slug } = await params;
  if (!isValidCert(cert)) notFound();

  await requireAccess(cert);

  const mod = getModule(cert, slug);
  if (!mod) notFound();

  const modules = getModules(cert);
  const index = modules.findIndex((m) => m.slug === slug);
  const prev = index > 0 ? modules[index - 1] : null;
  const next = index < modules.length - 1 ? modules[index + 1] : null;

  const progress = await getProgressForCert(cert);
  const isCompleted = progress[`${cert}/${slug}`] === "completed";

  const markCompletedAction = markModuleCompleted.bind(null, cert, slug);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link href={`/course/${cert}`} className="text-sm text-gray-500 hover:text-gray-800">
        ← Voltar para a trilha
      </Link>

      <p className="mt-4 text-xs font-medium uppercase tracking-wide text-orange-600">
        {mod.domain}
      </p>
      <h1 className="mt-1 text-3xl font-bold">{mod.title}</h1>
      <p className="mt-2 text-gray-600">{mod.description}</p>
      <p className="mt-1 text-sm text-gray-400">~{mod.durationMinutes} min de estudo</p>

      <article className="prose prose-gray mt-8 max-w-none prose-headings:scroll-mt-20 prose-table:text-sm">
        <MDXRemote
          source={mod.body}
          options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
        />
      </article>

      <div className="mt-10 flex items-center justify-between border-t border-gray-200 pt-6">
        {prev ? (
          <Link
            href={`/course/${cert}/${prev.slug}`}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            ← {prev.title}
          </Link>
        ) : (
          <span />
        )}

        {isCompleted ? (
          <span className="rounded-md bg-green-100 px-4 py-2 text-sm font-medium text-green-700">
            ✓ Módulo concluído
          </span>
        ) : (
          <form action={markCompletedAction}>
            <button
              type="submit"
              className="rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
            >
              Marcar como concluído
            </button>
          </form>
        )}

        {next ? (
          <Link
            href={`/course/${cert}/${next.slug}`}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            {next.title} →
          </Link>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
}
