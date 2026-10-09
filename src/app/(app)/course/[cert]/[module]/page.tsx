import Link from "next/link";
import { isValidElement, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { getModule, getModules, isValidCert } from "@/lib/learning/content";
import { requireAccess } from "@/lib/dal";
import { getProgressForCert } from "@/lib/learning/progress";
import { CERT_META } from "@/lib/learning/cert-meta";
import { extractHeadings, slugifyHeading } from "@/lib/learning/study-format";
import { markModuleCompleted } from "../../actions";
import { CertEmblem } from "@/components/cert-emblem";
import { ModuleToc } from "@/components/module-toc";
import { ProgressBar } from "@/components/workspace-ui";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  BoltIcon,
  BookIcon,
  CheckCircleIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ClockIcon,
  LayersIcon,
  RotateIcon,
} from "@/components/ui-icons";

const TYPE_META = {
  teoria: { label: "Teoria", icon: BookIcon },
  lab: { label: "Lab prático", icon: LayersIcon },
  revisao: { label: "Revisão", icon: RotateIcon },
} as const;

function textOf(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (isValidElement(node)) return textOf((node.props as { children?: ReactNode }).children);
  return "";
}

const mdxComponents = {
  h2: ({ children, ...props }: ComponentPropsWithoutRef<"h2">) => (
    <h2 id={slugifyHeading(textOf(children))} {...props}>
      {children}
    </h2>
  ),
};

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
  const completedCount = modules.filter((m) => progress[`${cert}/${m.slug}`] === "completed").length;

  const markCompletedAction = markModuleCompleted.bind(null, cert, slug);
  const headings = extractHeadings(mod.body);
  const type = TYPE_META[mod.type ?? "teoria"];
  const TypeIcon = type.icon;
  const meta = CERT_META[cert];

  return (
    <>
      <div className="ws-reading-progress" aria-hidden="true" />
      <div className="mx-auto w-full max-w-[1240px] px-4 py-5 sm:px-8 sm:py-8 xl:px-10 xl:py-10">
        <nav aria-label="Trilha" className="flex flex-wrap items-center gap-2 text-sm">
          <Link href={`/course/${cert}`} className="ws-btn ws-btn-secondary ws-btn-sm !pl-2.5">
            <ArrowLeftIcon className="h-4 w-4" />
            <CertEmblem certId={cert} size="xs" className="!h-5 !w-5 !rounded-md [&>svg]:!h-3 [&>svg]:!w-3" />
            {meta.code}
          </Link>
          <ChevronRightIcon className="h-4 w-4 text-ws-subtle" />
          <span className="text-ws-muted">Semana {mod.week ?? 1}</span>
          <ChevronRightIcon className="h-4 w-4 text-ws-subtle" />
          <span className="font-mono text-xs text-ws-subtle">Módulo {index + 1} de {modules.length}</span>
        </nav>

        <div className="mt-8 grid grid-cols-1 gap-10 xl:grid-cols-[minmax(0,1fr)_16rem]">
          <div className="min-w-0 max-w-[48rem]">
            <header className="ws-rise">
              <p className="ws-eyebrow ws-eyebrow-accent">{mod.domain}</p>
              <h1 className="ws-h1 mt-3 !text-[clamp(2rem,4vw,3rem)]">{mod.title}</h1>
              <p className="mt-4 text-pretty text-lg leading-8 text-ws-muted">{mod.description}</p>
              <div className="mt-6 flex flex-wrap gap-2">
                <span className="ws-chip"><TypeIcon className="h-3.5 w-3.5" />{type.label}</span>
                <span className="ws-chip"><ClockIcon className="h-3.5 w-3.5" />~{mod.durationMinutes} min</span>
                {isCompleted ? (
                  <span className="ws-chip ws-chip-success"><CheckCircleIcon className="h-3.5 w-3.5" />Concluído</span>
                ) : (
                  <span className="ws-chip ws-chip-accent"><BoltIcon className="h-3.5 w-3.5" />+50 XP ao concluir</span>
                )}
              </div>
            </header>

            {headings.length > 1 ? (
              <details className="ws-card group mt-8 xl:hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 text-sm font-semibold text-ws-ink [&::-webkit-details-marker]:hidden">
                  Neste módulo · {headings.length} seções
                  <ChevronDownIcon className="h-4 w-4 text-ws-subtle transition-transform group-open:rotate-180" />
                </summary>
                <div className="px-5 pb-5">
                  <ModuleToc headings={headings} />
                </div>
              </details>
            ) : null}

            <article className="ws-card ws-prose prose mt-8 max-w-none p-6 sm:p-10">
              <MDXRemote
                source={mod.body}
                components={mdxComponents}
                options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
              />
            </article>

            <section
              aria-label="Conclusão do módulo"
              className={`ws-ink mt-6 flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:p-7 ${isCompleted ? "ws-ink-success" : ""}`}
            >
              <span
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                  isCompleted
                    ? "bg-gradient-to-br from-emerald-300 to-emerald-500 text-[#03170f]"
                    : "bg-gradient-to-br from-orange-300 to-orange-500 text-[#1a0d03]"
                }`}
              >
                {isCompleted ? <CheckIcon className="h-5 w-5" strokeWidth={2.6} /> : <BoltIcon className="h-5 w-5" />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-lg font-semibold tracking-[-0.02em] text-white">
                  {isCompleted ? "Módulo concluído. Mandou bem!" : "Terminou a leitura?"}
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  {isCompleted
                    ? next
                      ? `Siga o ritmo: próximo é “${next.title}”.`
                      : "Você chegou ao fim da trilha. Hora dos simulados completos."
                    : "Marque como concluído para somar +50 XP e avançar na trilha."}
                </p>
              </div>
              {isCompleted ? (
                next ? (
                  <Link href={`/course/${cert}/${next.slug}`} className="ws-btn ws-btn-primary shrink-0">
                    Próximo módulo
                    <ArrowRightIcon className="h-4 w-4" />
                  </Link>
                ) : (
                  <Link href={`/simulado/${cert}`} className="ws-btn ws-btn-primary shrink-0">
                    Fazer simulado
                    <ArrowRightIcon className="h-4 w-4" />
                  </Link>
                )
              ) : (
                <form action={markCompletedAction} className="shrink-0">
                  <button type="submit" className="ws-btn ws-btn-primary w-full sm:w-auto">
                    <CheckIcon className="h-4 w-4" strokeWidth={2.4} />
                    Marcar como concluído
                  </button>
                </form>
              )}
            </section>

            <nav aria-label="Navegação entre módulos" className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {prev ? (
                <Link href={`/course/${cert}/${prev.slug}`} className="ws-card ws-card-hover group flex items-center gap-3 p-4">
                  <ArrowLeftIcon className="h-4 w-4 shrink-0 text-ws-subtle transition-transform group-hover:-translate-x-0.5" />
                  <span className="min-w-0">
                    <span className="block font-mono text-[10px] uppercase tracking-wider text-ws-subtle">Anterior</span>
                    <span className="mt-0.5 block truncate text-sm font-medium text-ws-ink">{prev.title}</span>
                  </span>
                </Link>
              ) : (
                <span className="hidden sm:block" />
              )}
              {next ? (
                <Link href={`/course/${cert}/${next.slug}`} className="ws-card ws-card-hover group flex items-center justify-end gap-3 p-4 text-right">
                  <span className="min-w-0">
                    <span className="block font-mono text-[10px] uppercase tracking-wider text-ws-subtle">Próximo</span>
                    <span className="mt-0.5 block truncate text-sm font-medium text-ws-ink">{next.title}</span>
                  </span>
                  <ArrowRightIcon className="h-4 w-4 shrink-0 text-ws-subtle transition-transform group-hover:translate-x-0.5" />
                </Link>
              ) : null}
            </nav>
          </div>

          <aside className="hidden xl:block">
            <div className="sticky top-8 space-y-6">
              {headings.length > 1 ? (
                <div>
                  <p className="ws-eyebrow mb-3">Neste módulo</p>
                  <ModuleToc headings={headings} />
                </div>
              ) : null}
              <div className="ws-card p-4">
                <p className="ws-eyebrow">Progresso da trilha</p>
                <p className="mt-2 flex items-baseline gap-1">
                  <span className="ws-num text-2xl text-ws-ink">{completedCount}</span>
                  <span className="text-sm text-ws-subtle">/ {modules.length} módulos</span>
                </p>
                <div className="mt-3">
                  <ProgressBar value={(completedCount / modules.length) * 100} label="Progresso da trilha" />
                </div>
                {!isCompleted ? (
                  <form action={markCompletedAction} className="mt-4">
                    <button type="submit" className="ws-btn ws-btn-secondary ws-btn-sm w-full">
                      <CheckIcon className="h-4 w-4" />
                      Marcar como concluído
                    </button>
                  </form>
                ) : (
                  <p className="mt-4 flex items-center gap-2 text-sm font-medium text-ws-success-ink">
                    <CheckCircleIcon className="h-4 w-4" />
                    Módulo concluído
                  </p>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
