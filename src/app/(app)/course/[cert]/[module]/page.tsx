import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { getModule, getModules, isValidCert } from "@/lib/learning/content";
import { requireAccess } from "@/lib/dal";
import { getProgressForCert } from "@/lib/learning/progress";
import { markModuleCompleted } from "../../actions";
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon, ClockIcon } from "@/components/ui-icons";

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
    <div className="mx-auto max-w-[960px] px-5 py-8 sm:px-8 sm:py-12">
      <Link href={`/course/${cert}`} className="inline-flex items-center gap-2 rounded-lg text-sm font-semibold text-slate-500 transition hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/30 dark:text-slate-400 dark:hover:text-white">
        <ArrowLeftIcon className="h-4 w-4" />Voltar para a trilha
      </Link>

      <div className="study-card mt-6 p-7 sm:p-9"><p className="study-eyebrow">
        {mod.domain}
      </p><h1 className="mt-4 text-balance text-3xl font-bold tracking-[-0.045em] text-slate-950 sm:text-5xl dark:text-white">{mod.title}</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">{mod.description}</p><p className="mt-5 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-500 dark:bg-white/5 dark:text-slate-400"><ClockIcon className="h-4 w-4 text-orange-600" />~{mod.durationMinutes} min de estudo</p></div>

      <article className="prose prose-slate mt-6 max-w-none rounded-[1.75rem] border border-slate-200 bg-white p-7 prose-headings:scroll-mt-24 prose-headings:tracking-tight prose-a:text-orange-600 prose-a:decoration-orange-300 prose-a:underline-offset-4 prose-blockquote:rounded-r-xl prose-blockquote:border-orange-400 prose-blockquote:bg-orange-50/60 prose-blockquote:py-1 prose-blockquote:not-italic prose-code:rounded prose-code:bg-slate-100 prose-code:px-1 prose-code:py-0.5 prose-table:text-sm dark:prose-invert dark:border-white/10 dark:bg-slate-900 dark:prose-a:text-orange-400 dark:prose-blockquote:bg-orange-500/10 dark:prose-code:bg-white/10 dark:prose-headings:text-white dark:prose-th:text-slate-200 dark:prose-td:text-slate-300 sm:p-10">
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
            <ArrowLeftIcon className="mr-1 inline h-4 w-4" />{prev.title}
          </Link>
        ) : (
          <span />
        )}

        {isCompleted ? (
          <span className="inline-flex min-h-11 items-center justify-center rounded-xl bg-emerald-50 px-4 text-sm font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
            <CheckIcon className="mr-2 h-4 w-4" />Módulo concluído
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
            {next.title}<ArrowRightIcon className="ml-1 inline h-4 w-4" />
          </Link>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
}
