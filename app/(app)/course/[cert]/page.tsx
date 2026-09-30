import Link from "next/link";
import type { CSSProperties } from "react";
import { notFound } from "next/navigation";
import { getModules, CERTIFICATIONS, isValidCert, type ModuleMeta } from "@/lib/content";
import { requireAccess } from "@/lib/dal";
import { getProgressForCert } from "@/lib/progress";
import { getReadiness, READY_SCORE } from "@/lib/readiness";
import { CERT_META } from "@/lib/cert-meta";
import { formatMinutes } from "@/lib/study-format";
import { CertEmblem } from "@/components/cert-emblem";
import { ProgressRing } from "@/components/progress-ring";
import { ProgressBar, SectionHeader } from "@/components/workspace-ui";
import {
  ArrowRightIcon,
  AwardIcon,
  BoltIcon,
  BookIcon,
  CardsIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ClockIcon,
  LayersIcon,
  LockIcon,
  PracticeIcon,
  RotateIcon,
  TargetIcon,
} from "@/components/ui-icons";

const TYPE_BADGE = {
  teoria: { label: "Teoria", className: "", icon: BookIcon },
  lab: { label: "Lab", className: "ws-chip-indigo", icon: LayersIcon },
  revisao: { label: "Revisão", className: "ws-chip-warn", icon: RotateIcon },
} as const;

export default async function CoursePage({
  params,
}: {
  params: Promise<{ cert: string }>;
}) {
  const { cert } = await params;
  if (!isValidCert(cert)) notFound();

  await requireAccess(cert);

  const certInfo = CERTIFICATIONS[cert];
  const meta = CERT_META[cert];
  const modules = getModules(cert);
  const [progress, readiness] = await Promise.all([getProgressForCert(cert), getReadiness(cert)]);

  const isDone = (m: ModuleMeta) => progress[`${cert}/${m.slug}`] === "completed";
  const completed = modules.filter(isDone).length;
  const nextIndex = modules.findIndex((m) => !isDone(m));
  const nextModule = nextIndex >= 0 ? modules[nextIndex] : null;
  const pct = modules.length ? Math.round((completed / modules.length) * 100) : 0;
  const position = new Map(modules.map((m, index) => [m.slug, index + 1]));

  // Agrupa por semana do mapa de estudos
  const weeks = new Map<number, ModuleMeta[]>();
  for (const mod of modules) {
    const week = mod.week ?? 1;
    if (!weeks.has(week)) weeks.set(week, []);
    weeks.get(week)!.push(mod);
  }
  const sortedWeeks = [...weeks.entries()].sort(([a], [b]) => a - b);

  const domainStats = certInfo.domains.map((domain) => {
    const domainModules = modules.filter((m) => m.domain === domain);
    const done = domainModules.filter(isDone).length;
    return { domain, total: domainModules.length, done };
  });

  const labCount = modules.filter((m) => m.type === "lab").length;
  const totalMinutes = modules.reduce((acc, m) => acc + m.durationMinutes, 0);
  const remainingMinutes = modules.filter((m) => !isDone(m)).reduce((acc, m) => acc + m.durationMinutes, 0);

  return (
    <div className="mx-auto w-full max-w-[1240px] px-4 py-5 sm:px-8 sm:py-8 xl:px-10 xl:py-10">
      <section className="ws-ink ws-rise p-6 sm:p-8 xl:p-10" aria-labelledby="course-title">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_16rem] lg:items-center xl:gap-12">
          <div className="min-w-0">
            <div className="flex items-center gap-4">
              <CertEmblem certId={cert} size="lg" />
              <div>
                <p className="ws-eyebrow !text-orange-200/80">{meta.code} · {meta.tier}</p>
                <p className="mt-1 text-sm text-slate-400">Trilha de preparação completa</p>
              </div>
            </div>
            <h1 id="course-title" className="mt-6 max-w-3xl text-balance text-[1.9rem] font-semibold leading-[1.08] tracking-[-0.04em] text-white sm:text-[2.5rem]">
              {certInfo.name}
            </h1>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="ws-chip-glass"><BookIcon className="h-3.5 w-3.5 text-orange-300" />{modules.length} módulos</span>
              <span className="ws-chip-glass"><LayersIcon className="h-3.5 w-3.5 text-orange-300" />{labCount} labs práticos</span>
              <span className="ws-chip-glass"><ClockIcon className="h-3.5 w-3.5 text-orange-300" />~{Math.round(totalMinutes / 60)}h de estudo</span>
              <span className="ws-chip-glass"><TargetIcon className="h-3.5 w-3.5 text-orange-300" />{sortedWeeks.length} semanas</span>
            </div>

            {nextModule ? (
              <Link href={`/course/${cert}/${nextModule.slug}`} className="ws-glass group mt-7 flex items-center gap-4 p-4 transition-colors hover:border-orange-400/40 sm:p-5">
                <span className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-300 to-orange-500 text-[#1a0d03] shadow-[0_10px_24px_-10px_rgba(249,115,22,.9)] sm:flex">
                  <ArrowRightIcon className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="ws-eyebrow block !text-slate-400">
                    {completed > 0 ? "Continuar de onde parou" : "Comece por aqui"} · Módulo {nextIndex + 1} de {modules.length}
                  </span>
                  <span className="mt-1 block text-lg font-semibold leading-snug tracking-[-0.02em] text-white">{nextModule.title}</span>
                  <span className="mt-1 block text-xs text-slate-400">
                    {TYPE_BADGE[nextModule.type ?? "teoria"].label} · {nextModule.durationMinutes} min · <span className="text-orange-300">+50 XP</span>
                  </span>
                </span>
                <ChevronRightIcon className="h-5 w-5 shrink-0 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-white" />
              </Link>
            ) : (
              <Link href={`/simulado/${cert}`} className="ws-glass group mt-7 flex items-center gap-4 p-4 transition-colors hover:border-emerald-400/40 sm:p-5">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-300 to-emerald-500 text-[#03170f]">
                  <CheckIcon className="h-5 w-5" strokeWidth={2.4} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="ws-eyebrow block !text-emerald-300/80">Trilha concluída</span>
                  <span className="mt-1 block text-lg font-semibold tracking-[-0.02em] text-white">Hora de consolidar com simulados completos</span>
                </span>
                <ChevronRightIcon className="h-5 w-5 shrink-0 text-slate-400 transition-transform group-hover:translate-x-1" />
              </Link>
            )}
          </div>

          <div className="flex items-center gap-6 border-t border-white/10 pt-6 lg:flex-col lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
            <ProgressRing
              id="course-ring"
              size={168}
              rings={[{ value: pct, tone: pct >= 100 ? "success" : "accent", width: 11 }]}
              glass
              delay={1}
              label={`${pct}% da trilha concluída`}
              className="hidden sm:inline-flex"
            >
              <span className="ws-num text-[2.75rem] text-white">{pct}<span className="text-2xl text-slate-400">%</span></span>
              <span className="mt-1 font-mono text-[11px] text-slate-400">{completed} de {modules.length}</span>
            </ProgressRing>
            <dl className="grid grid-cols-1 flex-1 gap-3 sm:w-full lg:flex-none">
              <HeroStat label="Restante" value={remainingMinutes ? `~${formatMinutes(remainingMinutes)}` : "Nada!"} />
              <HeroStat label="Média recente" value={readiness.avgRecentScore === null ? "—" : `${readiness.avgRecentScore}%`} hint={`meta ${READY_SCORE}%`} />
              <HeroStat label="Prova" value={`${certInfo.examQuestionCount}q · ${certInfo.examDurationMinutes}min`} />
            </dl>
          </div>
        </div>
      </section>

      <section className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]" aria-label="Domínios e prática">
        <div className="ws-card ws-rise p-5 sm:p-6" style={{ "--d": 1 } as CSSProperties}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="ws-eyebrow">Blueprint do exame</p>
              <h2 className="ws-h2 mt-1.5">Cobertura por domínio</h2>
            </div>
            <span className="ws-chip font-mono">{certInfo.domains.length} domínios</span>
          </div>
          <ul className="mt-6 space-y-4">
            {domainStats.map(({ domain, total, done }, index) => {
              const value = total ? (done / total) * 100 : 0;
              return (
                <li key={domain}>
                  <div className="mb-2 flex items-baseline justify-between gap-3">
                    <span className="min-w-0 truncate text-sm font-medium text-ws-ink">{domain}</span>
                    <span className="shrink-0 font-mono text-xs text-ws-subtle">
                      <span className="font-semibold text-ws-ink">{done}</span>/{total}
                    </span>
                  </div>
                  <ProgressBar value={value} tone={value >= 100 ? "success" : "accent"} delay={index} />
                </li>
              );
            })}
          </ul>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <PracticeTile
            href={`/simulado/${cert}`}
            icon={<PracticeIcon className="h-5 w-5" />}
            eyebrow="Praticar"
            title="Simulados no formato oficial"
            text={`${certInfo.examQuestionCount} questões · ${certInfo.examDurationMinutes} min · análise por domínio`}
            primary
            delay={2}
          />
          <PracticeTile
            href={`/flashcards/${cert}`}
            icon={<CardsIcon className="h-5 w-5" />}
            eyebrow="Revisar"
            title="Flashcards de revisão ativa"
            text="Os conceitos que mais caem, em sessões curtas"
            delay={3}
          />
          <PracticeTile
            href={`/certificado/${cert}`}
            icon={readiness.ready ? <AwardIcon className="h-5 w-5" /> : <LockIcon className="h-5 w-5" />}
            eyebrow={readiness.ready ? "Conquista liberada" : "Conquista"}
            title="Certificado de conclusão"
            text={readiness.ready ? "Você atingiu a prontidão. Emita o seu!" : `Trilha 100% + média ≥ ${READY_SCORE}% em 3 simulados`}
            delay={4}
          />
        </div>
      </section>

      <section className="mt-14" aria-labelledby="map-title">
        <SectionHeader
          id="map-title"
          eyebrow="Mapa de estudos"
          title={`${sortedWeeks.length} semanas até a prova`}
          description="Siga a ordem sugerida ou vá direto ao que precisa. Semanas concluídas ficam recolhidas."
        />

        <ol className="relative mt-8">
          {sortedWeeks.map(([week, weekModules], weekIndex) => {
            const weekDone = weekModules.filter(isDone).length;
            const complete = weekDone === weekModules.length;
            const current = !complete && weekModules.some((m) => m.slug === nextModule?.slug);
            const last = weekIndex === sortedWeeks.length - 1;
            return (
              <li key={week} className="relative pl-12 sm:pl-16">
                {!last ? (
                  <span
                    aria-hidden="true"
                    className={`absolute bottom-0 left-[17px] top-10 w-0.5 sm:left-[21px] ${complete ? "bg-gradient-to-b from-orange-400 to-orange-400/40" : "bg-ws-line/10"}`}
                  />
                ) : null}
                <span
                  aria-hidden="true"
                  className={`absolute left-0 top-0 flex h-9 w-9 items-center justify-center rounded-full font-mono text-xs font-semibold sm:h-11 sm:w-11 sm:text-sm ${
                    complete
                      ? "bg-gradient-to-br from-amber-300 to-orange-500 text-[#1a0d03] shadow-[0_8px_20px_-8px_rgba(249,115,22,.8)]"
                      : current
                        ? "bg-ws-ink text-ws-canvas shadow-[0_0_0_5px_rgb(var(--ws-accent)/0.22)]"
                        : "border border-ws-line/15 bg-ws-surface text-ws-subtle"
                  }`}
                >
                  {complete ? <CheckIcon className="h-4 w-4" strokeWidth={2.6} /> : String(week).padStart(2, "0")}
                </span>

                <details className="group pb-10" open={!complete}>
                  <summary className="flex min-h-9 cursor-pointer list-none items-center gap-3 rounded-xl sm:min-h-11 [&::-webkit-details-marker]:hidden">
                    <span className="min-w-0">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="text-base font-semibold tracking-[-0.02em] text-ws-ink">Semana {week}</span>
                        {current ? <span className="ws-chip ws-chip-accent !h-5 !px-2 !text-[11px]">Você está aqui</span> : null}
                        {complete ? <span className="ws-chip ws-chip-success !h-5 !px-2 !text-[11px]">Concluída</span> : null}
                      </span>
                      <span className="mt-0.5 block font-mono text-[11px] text-ws-subtle">
                        {weekDone}/{weekModules.length} módulos · {formatMinutes(weekModules.reduce((acc, m) => acc + m.durationMinutes, 0))}
                      </span>
                    </span>
                    <span className="ml-auto hidden w-32 sm:block">
                      <ProgressBar value={(weekDone / weekModules.length) * 100} tone={complete ? "success" : "accent"} />
                    </span>
                    <ChevronDownIcon className="h-4 w-4 shrink-0 text-ws-subtle transition-transform group-open:rotate-180" />
                  </summary>

                  <ul className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
                    {weekModules.map((mod) => (
                      <li key={mod.slug}>
                        <ModuleTile
                          href={`/course/${cert}/${mod.slug}`}
                          mod={mod}
                          position={position.get(mod.slug) ?? 0}
                          done={isDone(mod)}
                          next={mod.slug === nextModule?.slug}
                        />
                      </li>
                    ))}
                  </ul>
                </details>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}

function HeroStat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3.5 py-2.5">
      <dt className="text-xs text-slate-400">{label}</dt>
      <dd className="text-right font-mono text-sm font-semibold text-white">
        {value}
        {hint ? <span className="ml-1.5 text-[10px] font-normal text-slate-500">{hint}</span> : null}
      </dd>
    </div>
  );
}

function PracticeTile({
  href,
  icon,
  eyebrow,
  title,
  text,
  primary = false,
  delay,
}: {
  href: string;
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  text: string;
  primary?: boolean;
  delay: number;
}) {
  return (
    <Link href={href} className="ws-card ws-card-hover ws-rise group flex items-center gap-4 p-4 sm:p-5" style={{ "--d": delay } as CSSProperties}>
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
          primary
            ? "bg-gradient-to-br from-orange-300 to-orange-500 text-[#1a0d03] shadow-[0_10px_22px_-10px_rgba(249,115,22,.9)]"
            : "bg-ws-accent/10 text-ws-accent-ink"
        }`}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="ws-eyebrow block">{eyebrow}</span>
        <span className="mt-0.5 block text-[15px] font-semibold tracking-[-0.015em] text-ws-ink">{title}</span>
        <span className="mt-0.5 block truncate text-xs text-ws-muted">{text}</span>
      </span>
      <ChevronRightIcon className="h-4 w-4 shrink-0 text-ws-subtle transition-transform group-hover:translate-x-0.5 group-hover:text-ws-accent-ink" />
    </Link>
  );
}

function ModuleTile({
  href,
  mod,
  position,
  done,
  next,
}: {
  href: string;
  mod: ModuleMeta;
  position: number;
  done: boolean;
  next: boolean;
}) {
  const badge = TYPE_BADGE[mod.type ?? "teoria"];
  const BadgeIcon = badge.icon;

  return (
    <Link
      href={href}
      className={`ws-card ws-card-hover group flex h-full gap-4 p-4 sm:p-5 ${
        next ? "!border-ws-accent/60 shadow-[0_0_0_4px_rgb(var(--ws-accent)/0.12),0_20px_40px_-24px_rgb(var(--ws-accent)/0.7)]" : ""
      }`}
    >
      <span
        className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-mono text-xs font-semibold ${
          done
            ? "bg-ws-success/15 text-ws-success-ink"
            : next
              ? "bg-gradient-to-br from-orange-300 to-orange-500 text-[#1a0d03]"
              : "bg-ws-line/[0.06] text-ws-muted"
        }`}
      >
        {done ? <CheckIcon className="h-4 w-4" strokeWidth={2.4} /> : String(position).padStart(2, "0")}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          {next ? <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-ws-accent-ink">Próximo</span> : null}
          {done ? <span className="font-mono text-[10px] uppercase tracking-wider text-ws-success-ink">Concluído</span> : null}
          <span className="font-mono text-[10px] uppercase tracking-wider text-ws-subtle">{mod.durationMinutes} min</span>
        </span>
        <span className="mt-1 block text-[15px] font-semibold leading-snug tracking-[-0.015em] text-ws-ink">{mod.title}</span>
        <span className="mt-1.5 line-clamp-2 block text-[13px] leading-5 text-ws-muted">{mod.description}</span>
        <span className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className={`ws-chip !h-6 !text-[11px] ${badge.className}`}>
            <BadgeIcon className="h-3 w-3" />
            {badge.label}
          </span>
          <span className="ws-chip !h-6 min-w-0 max-w-full !text-[11px]">
            <span className="truncate">{mod.domain}</span>
          </span>
          {next ? (
            <span className="ws-chip ws-chip-accent !h-6 !text-[11px]">
              <BoltIcon className="h-3 w-3" />+50 XP
            </span>
          ) : null}
        </span>
      </span>
      <ChevronRightIcon className="mt-1 h-4 w-4 shrink-0 text-ws-subtle transition-transform group-hover:translate-x-0.5 group-hover:text-ws-accent-ink" />
    </Link>
  );
}
