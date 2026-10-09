import Link from "next/link";
import type { CSSProperties } from "react";
import { getSubscription, verifySession } from "@/lib/dal";
import { CERTIFICATIONS, type CertId } from "@/lib/learning/content";
import { getReadiness, READY_SCORE, type Readiness } from "@/lib/learning/readiness";
import { getWorkspaceSummary, type WorkspaceSummary } from "@/lib/learning/workspace";
import { LEVELS, type GamificationProfile } from "@/lib/learning/gamification";
import { CERT_META } from "@/lib/learning/cert-meta";
import { CertEmblem } from "@/components/cert-emblem";
import { ProgressRing } from "@/components/progress-ring";
import { ScoreChart } from "@/components/score-chart";
import { ActivityHeatmap, HeatmapLegend } from "@/components/activity-heatmap";
import { PortalButton } from "@/components/portal-button";
import { AchievementsStrip, NewCredentialBanner } from "@/components/achievements";
import { trySyncCredentials } from "@/lib/credentials/server";
import { EmptyState, ProgressBar, SectionHeader, StatTile } from "@/components/workspace-ui";
import {
  ArrowRightIcon,
  ArrowUpRightIcon,
  AwardIcon,
  BookIcon,
  BoltIcon,
  CardsIcon,
  ChartIcon,
  CheckCircleIcon,
  CheckIcon,
  FlameIcon,
  LayersIcon,
  LightbulbIcon,
  LockIcon,
  PracticeIcon,
  SparkIcon,
  TargetIcon,
  TrophyIcon,
} from "@/components/ui-icons";

const TYPE_LABEL = { teoria: "Teoria", lab: "Lab prático", revisao: "Revisão" } as const;

type Mission = {
  certId: CertId;
  eyebrow: string;
  title: string;
  meta: string[];
  href: string;
  cta: string;
  xp: number | null;
  headline: string;
};

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ checkout?: string }> }) {
  const [{ checkout }, summary, subscription, { userId }] = await Promise.all([
    searchParams,
    getWorkspaceSummary(),
    getSubscription(),
    verifySession(),
  ]);
  const hasStripeManagedPlan = subscription?.plan === "monthly" || subscription?.plan === "annual";
  // Issues newly earned badges/certificates; a failure only hides the showcase.
  const credentials = await trySyncCredentials(userId, summary.premium);

  if (!summary.premium || !summary.profile) {
    return (
      <PageShell>
        {checkout === "success" ? <CheckoutBanner /> : null}
        {credentials ? <NewCredentialBanner state={credentials} /> : null}
        <FreeDashboard summary={summary} />
        {credentials ? (
          <div className="mt-4">
            <AchievementsStrip state={credentials} />
          </div>
        ) : null}
      </PageShell>
    );
  }

  const unlocked = summary.certs.filter((cert) => cert.unlocked).map((cert) => cert.id);
  const readinessList = await Promise.all(unlocked.map((certId) => getReadiness(certId)));
  const profile = summary.profile;
  const mission = pickMission(readinessList);

  const weakDomains = readinessList
    .flatMap((readiness) => readiness.weakestDomains.map((domain) => ({ ...domain, certId: readiness.certId })))
    .sort((a, b) => a.pct - b.pct)
    .slice(0, 4);
  const series = readinessList
    .filter((readiness) => readiness.scoreHistory.length > 0)
    .map((readiness) => ({
      id: readiness.certId,
      label: CERT_META[readiness.certId].tag,
      color: CERT_META[readiness.certId].color,
      points: readiness.scoreHistory,
    }));
  const modulesTotal = summary.certs.filter((cert) => cert.unlocked).reduce((acc, cert) => acc + cert.total, 0);
  const last7 = profile.activity.slice(-7);
  const activeDays = profile.activity.filter((day) => day.count > 0).length;

  return (
    <PageShell>
      {checkout === "success" ? <CheckoutBanner /> : null}
      {credentials ? <NewCredentialBanner state={credentials} /> : null}

      <section className="ws-ink ws-rise p-6 sm:p-8 xl:p-10" aria-labelledby="dashboard-title">
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_17rem] xl:items-center xl:gap-10">
          <div className="min-w-0">
            <p className="ws-eyebrow flex items-center gap-2 !text-orange-200/80">
              <span className="ws-dot ws-dot-live text-orange-400" />
              Painel de estudos
            </p>
            <h1 id="dashboard-title" className="mt-4 text-balance text-[2rem] font-semibold leading-[1.06] tracking-[-0.045em] text-white sm:text-[2.6rem]">
              {summary.name ? `Olá, ${summary.name}.` : "Olá!"}
              <span className="block text-slate-400">{mission.headline}</span>
            </h1>
            <MissionCard mission={mission} />
          </div>
          <LevelGauge profile={profile} />
        </div>
      </section>

      <section aria-label="Resumo" className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatTile label="Sequência" value={String(profile.streakDays)} unit={profile.streakDays === 1 ? "dia" : "dias"} icon={<FlameIcon className="h-4 w-4" />} delay={1}>
          <WeekStrip days={last7} />
        </StatTile>
        <StatTile label="Módulos" value={String(profile.modulesCompleted)} unit={`/ ${modulesTotal}`} icon={<BookIcon className="h-4 w-4" />} delay={2}>
          <ProgressBar value={modulesTotal ? (profile.modulesCompleted / modulesTotal) * 100 : 0} delay={2} />
        </StatTile>
        <StatTile label="Simulados" value={String(profile.simuladosCompleted)} unit="completos" icon={<PracticeIcon className="h-4 w-4" />} delay={3}>
          <p className="text-xs text-ws-subtle">
            {profile.bestScore !== null ? (
              <>Melhor nota <span className="font-mono font-semibold text-ws-ink">{profile.bestScore}%</span></>
            ) : (
              "Nenhum simulado ainda"
            )}
          </p>
        </StatTile>
        <StatTile label="Recorde" value={String(profile.longestStreak)} unit={profile.longestStreak === 1 ? "dia" : "dias"} icon={<TrophyIcon className="h-4 w-4" />} delay={4}>
          <p className="text-xs text-ws-subtle">Sua maior sequência de estudos</p>
        </StatTile>
      </section>

      <section className="mt-12" aria-labelledby="tracks-title">
        <SectionHeader
          id="tracks-title"
          eyebrow="Suas trilhas"
          title="Onde você está em cada certificação"
          action={<span className="ws-chip"><LayersIcon className="h-3.5 w-3.5" />{readinessList.length} {readinessList.length === 1 ? "trilha ativa" : "trilhas ativas"}</span>}
        />
        <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2 min-[1360px]:grid-cols-3">
          {readinessList.map((readiness, index) => (
            <CertCard key={readiness.certId} readiness={readiness} delay={index} />
          ))}
        </div>
      </section>

      {credentials ? (
        <div className="mt-4">
          <AchievementsStrip state={credentials} />
        </div>
      ) : null}

      <section className="mt-12 grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]" aria-label="Desempenho">
        <div className="ws-card p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="ws-eyebrow">Evolução</p>
              <h2 className="ws-h2 mt-1.5">Notas nos simulados completos</h2>
            </div>
            {series.length ? (
              <div className="flex flex-wrap gap-3">
                {series.map((item) => (
                  <span key={item.id} className="flex items-center gap-1.5 font-mono text-[11px] text-ws-muted">
                    <span className="h-2 w-2 rounded-full" style={{ background: item.color }} />
                    {item.label}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
          <div className="mt-6">
            {series.length ? (
              <ScoreChart series={series} />
            ) : (
              <EmptyState
                icon={<ChartIcon className="h-5 w-5" />}
                title="Sua curva começa no primeiro simulado"
                text="Cada simulado completo vira um ponto aqui, com a linha de aprovação como referência."
                action={<Link href={`/simulado/${mission.certId}`} className="ws-btn ws-btn-secondary ws-btn-sm">Fazer um simulado<ArrowRightIcon className="h-4 w-4" /></Link>}
              />
            )}
          </div>
        </div>

        <div className="ws-card flex flex-col p-5 sm:p-6">
          <p className="ws-eyebrow">Foco de revisão</p>
          <h2 className="ws-h2 mt-1.5">Seus domínios mais fracos</h2>
          {weakDomains.length ? (
            <ul className="mt-5 space-y-4">
              {weakDomains.map((domain, index) => (
                <li key={`${domain.certId}-${domain.domain}`}>
                  <div className="mb-2 flex items-center gap-2.5">
                    <CertEmblem certId={domain.certId} size="xs" />
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-ws-ink">{domain.domain}</span>
                    <span className={`font-mono text-sm font-semibold ${domain.pct < 72 ? "text-ws-danger-ink" : "text-ws-success-ink"}`}>{domain.pct}%</span>
                  </div>
                  <div className="relative">
                    <ProgressBar value={domain.pct} tone={domain.pct < 72 ? "danger" : "success"} delay={index} />
                    <span className="absolute -top-1 bottom-[-4px] w-px bg-ws-ink/40" style={{ left: "72%" }} title="Linha de aprovação (72%)" />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              className="mt-5 flex-1"
              icon={<TargetIcon className="h-5 w-5" />}
              title="Nenhum ponto fraco mapeado ainda"
              text="Os simulados completos revelam os domínios que mais precisam de atenção."
            />
          )}
          {weakDomains.length ? (
            <Link href={`/simulado/${weakDomains[0].certId}`} className="ws-btn ws-btn-secondary ws-btn-sm mt-auto max-w-full self-start whitespace-normal py-2 text-left">
              <TargetIcon className="h-4 w-4 shrink-0" />
              Treinar {weakDomains[0].domain.toLowerCase()}
            </Link>
          ) : null}
        </div>
      </section>

      <section className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]" aria-label="Ritmo e progressão">
        <div className="ws-card flex flex-col p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="ws-eyebrow">Ritmo</p>
              <h2 className="ws-h2 mt-1.5">Consistência nas últimas 16 semanas</h2>
            </div>
            <HeatmapLegend />
          </div>
          <dl className="mt-5 grid grid-cols-3 gap-2.5">
            <RhythmStat label="Dias ativos" value={activeDays} />
            <RhythmStat label="Sequência atual" value={profile.streakDays} />
            <RhythmStat label="Recorde" value={profile.longestStreak} />
          </dl>
          <div className="mt-6">
            <ActivityHeatmap activity={profile.activity} />
          </div>
          <p className="mt-auto pt-4 text-xs text-ws-subtle">Módulos concluídos e simulados completos contam como atividade.</p>
        </div>
        <LevelLadder profile={profile} />
      </section>

      {hasStripeManagedPlan ? (
        <div className="mt-8 flex justify-end">
          <PortalButton />
        </div>
      ) : null}
    </PageShell>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-[1240px] px-4 py-5 sm:px-8 sm:py-8 xl:px-10 xl:py-10">{children}</div>;
}

function CheckoutBanner() {
  return (
    <div role="status" className="ws-card ws-pop mb-5 flex items-center gap-3 border-ws-success/30 p-4">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-ws-success/15 text-ws-success-ink">
        <CheckCircleIcon className="h-5 w-5" />
      </span>
      <div>
        <p className="text-sm font-semibold text-ws-ink">Assinatura confirmada. Bem-vindo ao Premium!</p>
        <p className="text-sm text-ws-muted">Todas as trilhas, simulados e flashcards já estão liberados.</p>
      </div>
    </div>
  );
}

function pct(readiness: Readiness) {
  return readiness.modulesTotal ? readiness.modulesCompleted / readiness.modulesTotal : 0;
}

function pickMission(list: Readiness[]): Mission {
  const inProgress = list
    .filter((readiness) => readiness.nextModule && readiness.modulesCompleted > 0)
    .sort((a, b) => pct(b) - pct(a))[0];
  const needsExam = list.find((readiness) => !readiness.nextModule && !readiness.ready);
  const fresh = list.find((readiness) => readiness.nextModule && readiness.modulesCompleted === 0);
  const ready = list.find((readiness) => readiness.ready);
  const target = inProgress ?? needsExam ?? fresh ?? ready ?? list[0];

  const certId = target.certId;
  const cert = CERTIFICATIONS[certId];
  const meta = CERT_META[certId];
  const next = target.nextModule;

  if (next) {
    const remaining = target.modulesTotal - target.modulesCompleted;
    return {
      certId,
      eyebrow: `${meta.code} · Módulo ${next.position} de ${target.modulesTotal}`,
      title: next.title,
      meta: [TYPE_LABEL[next.type ?? "teoria"], `${next.durationMinutes} min`, next.week ? `Semana ${next.week}` : next.domain],
      href: `/course/${certId}/${next.slug}`,
      cta: target.modulesCompleted > 0 ? "Continuar" : "Começar",
      xp: 50,
      headline:
        target.modulesCompleted > 0
          ? `Faltam ${remaining} ${remaining === 1 ? "módulo" : "módulos"} para fechar a trilha ${meta.short}.`
          : `Sua jornada em ${meta.short} começa agora.`,
    };
  }

  if (!target.ready) {
    const missing = Math.max(0, 3 - target.recentScores.length);
    return {
      certId,
      eyebrow: `${meta.code} · Simulado completo`,
      title: missing > 0 ? `Faça mais ${missing} ${missing === 1 ? "simulado" : "simulados"} para medir sua prontidão` : `Leve sua média de ${target.avgRecentScore}% para ${READY_SCORE}%`,
      meta: [`${cert.examQuestionCount} questões`, `${cert.examDurationMinutes} min`, "Formato oficial"],
      href: `/simulado/${certId}`,
      cta: "Iniciar simulado",
      xp: 100,
      headline:
        missing > 0
          ? `Trilha ${meta.short} concluída. Hora de medir sua prontidão.`
          : `Sua média em ${meta.short} está em ${target.avgRecentScore}%. A meta é ${READY_SCORE}%.`,
    };
  }

  return {
    certId,
    eyebrow: `${meta.code} · Prontidão atingida`,
    title: "Emita seu certificado e agende a prova oficial",
    meta: [`Média ${target.avgRecentScore}%`, "Trilha 100%"],
    href: `/certificado/${certId}`,
    cta: "Ver certificado",
    xp: null,
    headline: `Você está pronto para a prova ${meta.code}.`,
  };
}

function MissionCard({ mission }: { mission: Mission }) {
  return (
    <div className="ws-glass mt-7 p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex min-w-0 flex-1 items-start gap-4">
          <CertEmblem certId={mission.certId} size="lg" className="hidden sm:inline-flex" />
          <div className="min-w-0 flex-1">
            <p className="ws-eyebrow !text-slate-400">Próxima missão · {mission.eyebrow}</p>
            <p className="mt-1.5 text-lg font-semibold leading-snug tracking-[-0.02em] text-white">{mission.title}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {mission.meta.map((item) => (
                <span key={item} className="ws-chip-glass">{item}</span>
              ))}
              {mission.xp ? (
                <span className="ws-chip-glass !border-orange-400/30 !bg-orange-500/15 !text-orange-200">
                  <BoltIcon className="h-3 w-3" />+{mission.xp} XP
                </span>
              ) : null}
            </div>
          </div>
        </div>
        <Link href={mission.href} className="ws-btn ws-btn-primary ws-btn-lg shrink-0">
          {mission.cta}
          <ArrowRightIcon className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

function LevelGauge({ profile }: { profile: GamificationProfile }) {
  const levelNumber = String(profile.level.index + 1).padStart(2, "0");
  return (
    <div className="flex items-center gap-5 border-t border-white/10 pt-6 xl:flex-col xl:border-l xl:border-t-0 xl:pl-10 xl:pt-0 xl:text-center">
      <ProgressRing
        id="level-gauge"
        size={168}
        rings={[{ value: profile.progressToNext, tone: "accent", width: 10 }]}
        glass
        delay={2}
        label={`Nível ${profile.level.index + 1}: ${profile.progressToNext}% até o próximo nível`}
        className="hidden sm:inline-flex"
      >
        <span className="ws-eyebrow !text-slate-500">Nível</span>
        <span className="ws-num mt-1 text-[3.25rem] text-white">{levelNumber}</span>
        <span className="mt-1 font-mono text-[11px] text-orange-300/80">{profile.level.code}</span>
      </ProgressRing>
      <ProgressRing
        id="level-gauge-sm"
        size={84}
        rings={[{ value: profile.progressToNext, tone: "accent", width: 7 }]}
        glass
        label={`Nível ${profile.level.index + 1}`}
        className="sm:hidden"
      >
        <span className="ws-num text-2xl text-white">{levelNumber}</span>
      </ProgressRing>
      <div className="min-w-0">
        <p className="text-lg font-semibold tracking-[-0.02em] text-white">{profile.level.name}</p>
        {profile.xpForNextLevel !== null && profile.nextLevel ? (
          <>
            <p className="mt-1 font-mono text-xs text-slate-400">
              {profile.xpIntoLevel.toLocaleString("pt-BR")} / {profile.xpForNextLevel.toLocaleString("pt-BR")} XP
            </p>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              Faltam {(profile.xpForNextLevel - profile.xpIntoLevel).toLocaleString("pt-BR")} XP para <span className="text-slate-300">{profile.nextLevel.name}</span>
            </p>
          </>
        ) : (
          <p className="mt-1 text-sm text-orange-300">Nível máximo alcançado.</p>
        )}
      </div>
    </div>
  );
}

function WeekStrip({ days }: { days: Array<{ date: string; count: number }> }) {
  return (
    <div className="flex gap-1" aria-label="Atividade nos últimos 7 dias">
      {days.map((day, index) => {
        const weekday = new Date(`${day.date}T00:00:00Z`).toLocaleDateString("pt-BR", { weekday: "narrow", timeZone: "UTC" });
        const today = index === days.length - 1;
        return (
          <span key={day.date} className="flex flex-1 flex-col items-center gap-1" title={`${day.count} atividade(s) em ${day.date.slice(8, 10)}/${day.date.slice(5, 7)}`}>
            <span
              className={`h-5 w-full rounded-md ${day.count ? "bg-gradient-to-b from-amber-300 to-orange-500 shadow-[0_4px_12px_-4px_rgba(249,115,22,.7)]" : "bg-ws-line/[0.07]"} ${today ? "ring-2 ring-ws-accent/40 ring-offset-1 ring-offset-ws-surface" : ""}`}
            />
            <span className={`font-mono text-[9px] uppercase ${today ? "font-semibold text-ws-ink" : "text-ws-subtle"}`}>{weekday}</span>
          </span>
        );
      })}
    </div>
  );
}

function RhythmStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="ws-inset flex flex-col gap-1 px-3.5 py-3">
      <dt className="text-xs text-ws-muted">{label}</dt>
      <dd className="ws-num text-xl text-ws-ink">{value}</dd>
    </div>
  );
}

function LevelLadder({ profile }: { profile: GamificationProfile }) {
  return (
    <div className="ws-card p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="ws-eyebrow">Jornada</p>
          <h2 className="ws-h2 mt-1.5">Escada de níveis</h2>
        </div>
        <span className="ws-chip ws-chip-accent font-mono">
          <BoltIcon className="h-3.5 w-3.5" />
          {profile.totalXp.toLocaleString("pt-BR")} XP
        </span>
      </div>
      <ol className="relative mt-5 space-y-1 before:absolute before:bottom-5 before:left-[1.625rem] before:top-5 before:w-px before:bg-ws-line/10">
        {LEVELS.map((level, index) => {
          const done = index < profile.level.index;
          const current = index === profile.level.index;
          return (
            <li
              key={level.code}
              aria-current={current ? "step" : undefined}
              className={`relative flex items-center gap-3 rounded-xl px-3 py-2 ${current ? "bg-ws-accent/10 ring-1 ring-inset ring-ws-accent/25" : ""}`}
            >
              <span
                className={`relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-mono text-[11px] font-semibold ${
                  done
                    ? "bg-gradient-to-br from-amber-300 to-orange-500 text-[#1a0d03]"
                    : current
                      ? "bg-ws-ink text-ws-canvas shadow-[0_0_0_4px_rgb(var(--ws-accent)/0.2)]"
                      : "border border-ws-line/15 bg-ws-surface text-ws-subtle"
                }`}
              >
                {done ? <CheckIcon className="h-3.5 w-3.5" strokeWidth={2.4} /> : index + 1}
              </span>
              <span className={`min-w-0 flex-1 truncate text-sm ${current ? "font-semibold text-ws-ink" : done ? "font-medium text-ws-text" : "text-ws-subtle"}`}>
                {level.name}
              </span>
              {current && profile.xpForNextLevel !== null ? (
                <span className="hidden w-20 sm:block">
                  <ProgressBar value={profile.progressToNext} label={`${profile.progressToNext}% do nível atual`} />
                </span>
              ) : null}
              <span className="w-16 text-right font-mono text-[11px] text-ws-subtle">{level.minXp.toLocaleString("pt-BR")}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function CertCard({ readiness, delay }: { readiness: Readiness; delay: number }) {
  const certId = readiness.certId;
  const cert = CERTIFICATIONS[certId];
  const meta = CERT_META[certId];
  const trailPct = readiness.modulesTotal ? Math.round((readiness.modulesCompleted / readiness.modulesTotal) * 100) : 0;
  const average = readiness.avgRecentScore;
  const untouched = readiness.modulesCompleted === 0 && readiness.fullAttempts === 0;
  const status = readiness.ready
    ? { label: "Pronto para a prova", className: "ws-chip-success" }
    : untouched
      ? { label: "Não iniciada", className: "" }
      : { label: "Em preparação", className: "ws-chip-warn" };

  return (
    <article className="ws-card ws-card-hover ws-rise flex flex-col overflow-hidden" style={{ "--d": delay + 2 } as CSSProperties}>
      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <CertEmblem certId={certId} size="md" />
          <span className={`ws-chip shrink-0 ${status.className}`}>
            {readiness.ready ? <CheckCircleIcon className="h-3.5 w-3.5" /> : <span className="ws-dot" />}
            {status.label}
          </span>
        </div>
        <p className="ws-eyebrow mt-4">{meta.code} · {meta.tier}</p>
        <h3 className="mt-1 text-[1.0625rem] font-semibold leading-snug tracking-[-0.02em] text-ws-ink">{cert.name.replace("AWS Certified ", "")}</h3>

        <div className="mt-5 flex items-center gap-5">
          <ProgressRing
            id={`cert-ring-${certId}`}
            size={104}
            gap={4}
            delay={delay}
            rings={[
              { value: trailPct, tone: trailPct >= 100 ? "success" : "accent", width: 8 },
              { value: average ?? 0, tone: "indigo", width: 8 },
            ]}
            label={`Trilha ${trailPct}% concluída; média recente ${average ?? 0}%`}
          >
            <span className="ws-num text-[1.2rem] text-ws-ink">{trailPct}%</span>
            <span className="font-mono text-[9px] uppercase tracking-wider text-ws-subtle">trilha</span>
          </ProgressRing>
          <dl className="min-w-0 flex-1 space-y-3.5">
            <div>
              <dt className="flex items-center gap-2 text-xs text-ws-muted">
                <span className="h-2 w-2 rounded-full bg-gradient-to-br from-amber-300 to-orange-500" />
                Trilha
              </dt>
              <dd className="mt-1 flex items-baseline gap-1">
                <span className="ws-num text-lg text-ws-ink">{readiness.modulesCompleted}</span>
                <span className="text-xs text-ws-subtle">/ {readiness.modulesTotal} módulos</span>
              </dd>
            </div>
            <div>
              <dt className="flex items-center gap-2 text-xs text-ws-muted">
                <span className="h-2 w-2 rounded-full bg-gradient-to-br from-violet-300 to-indigo-500" />
                Média recente
              </dt>
              <dd className="mt-1 flex items-baseline gap-1">
                <span className="ws-num text-lg text-ws-ink">{average === null ? "—" : `${average}%`}</span>
                <span className="text-xs text-ws-subtle">meta {READY_SCORE}%</span>
              </dd>
            </div>
          </dl>
        </div>

        <NextStep readiness={readiness} examMinutes={cert.examDurationMinutes} />
      </div>

      <div className="mt-auto grid grid-cols-3 border-t border-ws-line/[0.07] bg-ws-raised/60">
        <CardAction href={`/course/${certId}`} icon={<BookIcon className="h-4 w-4" />} label="Trilha" />
        <CardAction href={`/simulado/${certId}`} icon={<PracticeIcon className="h-4 w-4" />} label="Simulados" />
        <CardAction href={`/flashcards/${certId}`} icon={<CardsIcon className="h-4 w-4" />} label="Flashcards" />
      </div>
    </article>
  );
}

function NextStep({ readiness, examMinutes }: { readiness: Readiness; examMinutes: number }) {
  const certId = readiness.certId;
  const next = readiness.nextModule;
  const step = readiness.ready
    ? { href: `/certificado/${certId}`, label: "Certificado liberado", title: "Emitir certificado de conclusão", icon: <AwardIcon className="h-4 w-4" /> }
    : next
      ? { href: `/course/${certId}/${next.slug}`, label: `Próximo · ${next.durationMinutes} min`, title: next.title, icon: <BookIcon className="h-4 w-4" /> }
      : { href: `/simulado/${certId}`, label: `Próximo · ${examMinutes} min`, title: "Simulado completo no formato oficial", icon: <PracticeIcon className="h-4 w-4" /> };

  return (
    <Link href={step.href} className="group mt-6 flex items-center gap-3 rounded-2xl border border-ws-line/[0.07] bg-ws-raised px-3.5 py-3 transition-colors hover:border-ws-accent/40">
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${readiness.ready ? "bg-ws-success/15 text-ws-success-ink" : "bg-ws-accent/10 text-ws-accent-ink"}`}>{step.icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block font-mono text-[10px] uppercase tracking-wider text-ws-subtle">{step.label}</span>
        <span className="mt-0.5 line-clamp-2 text-sm font-medium text-ws-ink">{step.title}</span>
      </span>
      <ArrowRightIcon className="h-4 w-4 shrink-0 text-ws-subtle transition-transform group-hover:translate-x-0.5 group-hover:text-ws-accent-ink" />
    </Link>
  );
}

function CardAction({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className="flex min-h-12 items-center justify-center gap-2 border-r border-ws-line/[0.07] text-[13px] font-medium text-ws-muted transition-colors last:border-r-0 hover:bg-ws-surface hover:text-ws-ink"
    >
      {icon}
      {label}
    </Link>
  );
}

/* ------------------------------------------------------------------ free */

const PREMIUM_FEATURES = [
  { icon: BookIcon, title: "3 trilhas completas", text: "89 módulos com teoria, labs e revisão guiada por semana." },
  { icon: PracticeIcon, title: "Simulados ilimitados", text: "Formato oficial, por domínio, com dicas e análise de tempo." },
  { icon: ChartIcon, title: "Diagnóstico por domínio", text: "Saiba exatamente onde errou e o que estudar em seguida." },
  { icon: CardsIcon, title: "Flashcards de revisão", text: "Os conceitos que mais caem, com revisão ativa." },
  { icon: TrophyIcon, title: "Níveis, XP e sequência", text: "Gamificação que mantém o ritmo até o dia da prova." },
  { icon: AwardIcon, title: "Certificado de conclusão", text: "Liberado quando você atinge a faixa de prontidão." },
];

function FreeDashboard({ summary }: { summary: WorkspaceSummary }) {
  const certIds = Object.keys(CERTIFICATIONS) as CertId[];
  return (
    <>
      <section className="ws-ink ws-rise p-6 sm:p-8 xl:p-10" aria-labelledby="free-title">
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_18rem] xl:items-end">
          <div>
            <p className="ws-eyebrow flex items-center gap-2 !text-orange-200/80">
              <span className="ws-dot ws-dot-live text-orange-400" />
              Diagnóstico gratuito
            </p>
            <h1 id="free-title" className="mt-4 max-w-3xl text-balance text-[2rem] font-semibold leading-[1.06] tracking-[-0.045em] text-white sm:text-[2.6rem]">
              {summary.name ? `Olá, ${summary.name}.` : "Olá!"} <span className="text-slate-400">Descubra seu nível real em 45 minutos.</span>
            </h1>
            <p className="mt-4 max-w-2xl text-[15px] leading-7 text-slate-400">
              Escolha a certificação que você quer conquistar e faça um simulado diagnóstico de 30 questões. A pontuação sai na hora.
            </p>
          </div>
          <dl className="ws-glass grid grid-cols-3 divide-x divide-white/10 p-1 xl:grid-cols-1 xl:divide-x-0 xl:divide-y">
            {[
              ["Questões", "30"],
              ["Tempo", "45 min"],
              ["Tentativa", "1 por conta"],
            ].map(([label, value]) => (
              <div key={label} className="px-4 py-3 xl:flex xl:items-center xl:justify-between">
                <dt className="text-xs text-slate-400">{label}</dt>
                <dd className="mt-1 font-mono text-sm font-semibold text-white xl:mt-0">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-3 md:grid-cols-3">
          {certIds.map((certId) => {
            const meta = CERT_META[certId];
            const cert = CERTIFICATIONS[certId];
            return (
              <Link
                key={certId}
                href={`/simulado/${certId}`}
                className="ws-glass group flex flex-col p-5 transition duration-300 hover:-translate-y-1 hover:border-orange-400/40 hover:bg-white/[0.09]"
              >
                <div className="flex items-center justify-between">
                  <CertEmblem certId={certId} size="md" />
                  <span className="font-mono text-[11px] text-slate-400">{meta.tier}</span>
                </div>
                <p className="mt-5 font-mono text-xs tracking-wider text-orange-300">{meta.code}</p>
                <p className="mt-1 text-lg font-semibold tracking-[-0.02em] text-white">{meta.short}</p>
                <p className="mt-1 text-xs text-slate-500">Prova oficial: {cert.examQuestionCount} questões · {cert.examDurationMinutes} min</p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-white">
                  Fazer diagnóstico
                  <ArrowRightIcon className="h-4 w-4 text-orange-300 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mt-12 grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]" aria-labelledby="premium-title">
        <div className="ws-card p-6 sm:p-8">
          <p className="ws-eyebrow ws-eyebrow-accent flex items-center gap-2"><SparkIcon className="h-3.5 w-3.5" />Premium</p>
          <h2 id="premium-title" className="ws-h2 mt-2 !text-2xl">Tudo o que você precisa até a aprovação</h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-ws-muted">O diagnóstico mostra sua nota. O Premium mostra o caminho: o que estudar, quanto praticar e quando agendar a prova.</p>
          <ul className="mt-7 grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
            {PREMIUM_FEATURES.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-ws-accent/10 text-ws-accent-ink">
                  <Icon className="h-[18px] w-[18px]" />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-ws-ink">{title}</span>
                  <span className="mt-0.5 block text-sm leading-6 text-ws-muted">{text}</span>
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/pricing" className="ws-btn ws-btn-primary ws-btn-lg">
              Ver planos Premium
              <ArrowUpRightIcon className="h-4 w-4" />
            </Link>
            <span className="text-xs text-ws-subtle">Plano mensal ou anual · sem fidelidade</span>
          </div>
        </div>

        <PremiumPreview />
      </section>
    </>
  );
}

function PremiumPreview() {
  const rows = [
    ["Conceitos de Nuvem", 84],
    ["Segurança e Conformidade", 71],
    ["Tecnologia e Serviços", 63],
  ] as const;
  return (
    <div className="ws-card relative overflow-hidden p-6 sm:p-8" aria-label="Prévia ilustrativa da análise Premium">
      <div className="pointer-events-none select-none blur-[2px]" aria-hidden="true">
        <div className="flex items-center gap-5">
          <ProgressRing
            id="preview-ring"
            size={112}
            rings={[
              { value: 74, tone: "accent", width: 9 },
              { value: 68, tone: "indigo", width: 9 },
            ]}
            label="Prévia"
          >
            <span className="ws-num text-xl text-ws-ink">74%</span>
          </ProgressRing>
          <div className="space-y-2">
            <p className="text-sm font-semibold text-ws-ink">Prontidão CLF-C02</p>
            <p className="text-xs text-ws-muted">Média recente 68% · meta 75%</p>
          </div>
        </div>
        <div className="mt-7 space-y-4">
          {rows.map(([label, value]) => (
            <div key={label}>
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-ws-muted">{label}</span>
                <span className="font-mono font-semibold text-ws-ink">{value}%</span>
              </div>
              <ProgressBar value={value} tone={value < 72 ? "danger" : "success"} />
            </div>
          ))}
        </div>
        <div className="mt-6 rounded-2xl bg-ws-accent/10 p-4">
          <p className="text-xs font-semibold text-ws-accent-ink">Próxima melhor ação</p>
          <p className="mt-1 text-sm text-ws-ink">Revisar Tecnologia e Serviços · 3 módulos</p>
        </div>
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-ws-surface/30 via-ws-surface/75 to-ws-surface/95 p-6 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ws-ink text-ws-canvas shadow-lg">
          <LockIcon className="h-5 w-5" />
        </span>
        <p className="mt-4 text-base font-semibold text-ws-ink">Análise completa no Premium</p>
        <p className="mt-1 max-w-xs text-sm leading-6 text-ws-muted">Prontidão, desempenho por domínio e plano de recuperação personalizado.</p>
        <p className="mt-3 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-ws-subtle">
          <LightbulbIcon className="h-3 w-3" />
          Prévia ilustrativa
        </p>
      </div>
    </div>
  );
}
