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
    <div className="mx-auto max-w-4xl px-5 py-10 sm:px-6 sm:py-14">
      <Link href={`/course/${cert}`} className="inline-flex items-center rounded-lg text-sm font-semibold text-slate-500 transition hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/30 dark:text-slate-400 dark:hover:text-white">
        ← Voltar para a trilha
      </Link>

      <div className="mt-8 border-b border-slate-200 pb-8 dark:border-white/10"><p className="cm-kicker">
        {mod.domain}
      </p><h1 className="mt-4 text-balance text-4xl font-bold tracking-[-0.045em] text-slate-950 sm:text-5xl dark:text-white">{mod.title}</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">{mod.description}</p><p className="mt-4 inline-flex rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-500 dark:bg-white/5 dark:text-slate-400">~{mod.durationMinutes} min de estudo</p></div>

      <article className="prose prose-slate mt-10 max-w-none prose-headings:scroll-mt-24 prose-headings:tracking-tight prose-a:text-orange-600 prose-a:decoration-orange-300 prose-a:underline-offset-4 prose-blockquote:rounded-r-xl prose-blockquote:border-orange-400 prose-blockquote:bg-orange-50/60 prose-blockquote:py-1 prose-blockquote:not-italic prose-code:rounded prose-code:bg-slate-100 prose-code:px-1 prose-code:py-0.5 prose-table:text-sm dark:prose-invert dark:prose-a:text-orange-400 dark:prose-blockquote:bg-orange-500/10 dark:prose-code:bg-white/10 dark:prose-headings:text-white dark:prose-th:text-slate-200 dark:prose-td:text-slate-300">
        <MDXRemote
          source={mod.body}
          options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
        />
      </article>

      <div className="mt-12 grid gap-3 border-t border-slate-200 pt-7 sm:grid-cols-[1fr_auto_1fr] sm:items-center dark:border-white/10">
        {prev ? (
          <Link
            href={`/course/${cert}/${prev.slug}`}
            className="text-sm font-semibold text-slate-500 transition hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
          >
            ← {prev.title}
          </Link>
        ) : (
          <span />
        )}

        {isCompleted ? (
          <span className="inline-flex min-h-11 items-center justify-center rounded-xl bg-emerald-50 px-4 text-sm font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
            Módulo concluído
          </span>
        ) : (
          <form action={markCompletedAction}>
            <button
              type="submit"
              className="cm-button-primary min-h-11"
            >
              Marcar como concluído
            </button>
          </form>
        )}

        {next ? (
          <Link
            href={`/course/${cert}/${next.slug}`}
            className="text-right text-sm font-semibold text-slate-500 transition hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
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
