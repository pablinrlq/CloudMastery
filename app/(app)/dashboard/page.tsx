import Link from "next/link";
import { verifySession, getSubscription, hasAccess } from "@/lib/dal";
import { CERTIFICATIONS, type CertId } from "@/lib/content";
import { getReadiness, type Readiness } from "@/lib/readiness";
import { getGamificationProfile } from "@/lib/gamification";
import { ScoreChart } from "@/components/score-chart";
import { StatsBar } from "@/components/stats-bar";
import { PortalButton } from "@/components/portal-button";
import { ArrowRightIcon, BookIcon, CardsIcon, CheckIcon, LockIcon, PracticeIcon, TargetIcon } from "@/components/ui-icons";

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ checkout?: string }> }) {
  const [{ checkout }, { email }, subscription] = await Promise.all([
    searchParams,
    verifySession(),
    getSubscription(),
  ]);

  const accessibleCerts = (Object.keys(CERTIFICATIONS) as CertId[]).filter((certId) => hasAccess(subscription, certId));
  const hasAnyAccess = accessibleCerts.length > 0;
  const hasStripeManagedPlan = subscription?.plan === "monthly" || subscription?.plan === "annual";
  const [profile, readinessList] = hasAnyAccess
    ? await Promise.all([getGamificationProfile(), Promise.all(accessibleCerts.map((certId) => getReadiness(certId)))])
    : [null, []];

  return (
    <div className="mx-auto w-full max-w-[1180px] px-5 py-8 sm:px-8 sm:py-10 xl:px-10 xl:py-12">
      <header className="flex flex-col justify-between gap-5 border-b border-slate-200/70 pb-8 sm:flex-row sm:items-end dark:border-white/10">
        <div>
          <p className="study-eyebrow">Seu centro de estudos</p>
          <h1 className="study-title mt-3">Visão geral</h1>
          <p className="study-muted mt-3 max-w-2xl">Acompanhe seu preparo, escolha a próxima atividade e mantenha o ritmo até a prova.</p>
        </div>
        <span className="inline-flex max-w-fit items-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-500 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-400">{email}</span>
      </header>

      {checkout === "success" ? (
        <div role="status" className="mt-7 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
          <CheckIcon className="mt-0.5 h-5 w-5 shrink-0" /> Assinatura confirmada. Seu acesso já está disponível.
        </div>
      ) : null}

      {!hasAnyAccess ? <FreeDashboard /> : (
        <>
          <div className="mt-8">{profile ? <StatsBar profile={profile} /> : null}</div>
          <div className="mt-10 flex items-end justify-between gap-4">
            <div>
              <p className="study-eyebrow">Suas certificações</p>
              <h2 className="mt-2 text-2xl font-bold tracking-[-0.035em] text-slate-950 dark:text-white">Continue de onde parou</h2>
            </div>
            <span className="hidden text-xs font-semibold text-slate-400 sm:block">{accessibleCerts.length} {accessibleCerts.length === 1 ? "trilha ativa" : "trilhas ativas"}</span>
          </div>
          <div className="mt-5 grid gap-5 xl:grid-cols-2">
            {readinessList.map((readiness) => <CertPanel key={readiness.certId} readiness={readiness} />)}
          </div>
          {hasStripeManagedPlan ? <PortalButton /> : null}
        </>
      )}
    </div>
  );
}

function FreeDashboard() {
  return (
    <section className="study-card relative mt-8 overflow-hidden bg-[#101722] p-7 text-white sm:p-10 dark:bg-[#0d121c]">
      <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-orange-500/15 blur-[80px]" />
      <div className="relative max-w-2xl">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.07] text-orange-400"><LockIcon /></span>
        <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-orange-400">Comece com um diagnóstico</p>
        <h2 className="mt-3 text-3xl font-bold tracking-[-0.045em]">Descubra seu nível antes de escolher o plano de estudo.</h2>
        <p className="mt-4 text-sm leading-7 text-slate-400">Faça um diagnóstico gratuito para cada certificação. O Premium libera trilhas completas, simulados, revisão detalhada e flashcards.</p>
      </div>
      <div className="relative mt-8 grid gap-3 md:grid-cols-3">
        {(Object.keys(CERTIFICATIONS) as CertId[]).map((certId) => (
          <Link key={certId} href={`/simulado/${certId}`} className="group rounded-xl border border-white/10 bg-white/[0.055] p-4 transition hover:border-orange-400/40 hover:bg-orange-500/10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-500/20">
            <span className="text-xs font-bold tracking-[0.12em] text-orange-400">{CERTIFICATIONS[certId].code}</span>
            <span className="mt-2 flex items-center justify-between gap-3 text-sm font-bold text-white">Iniciar diagnóstico <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" /></span>
          </Link>
        ))}
      </div>
      <Link href="/pricing" className="cm-button-primary relative mt-6">Conhecer o Premium</Link>
    </section>
  );
}

function CertPanel({ readiness }: { readiness: Readiness }) {
  const certId = readiness.certId;
  const cert = CERTIFICATIONS[certId];
  const modulePct = readiness.modulesTotal ? Math.round((readiness.modulesCompleted / readiness.modulesTotal) * 100) : 0;
  const average = readiness.avgRecentScore;

  return (
    <article className="study-card flex flex-col overflow-hidden">
      <div className="p-6 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div><p className="study-eyebrow">{cert.code}</p><h3 className="mt-2 text-xl font-bold tracking-[-0.03em] text-slate-950 dark:text-white">{cert.name}</h3></div>
          <span className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-bold ${readiness.ready ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300" : "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"}`}>{readiness.ready ? "Pronto para a prova" : "Em preparação"}</span>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <ProgressMetric label="Trilha concluída" value={`${modulePct}%`} caption={`${readiness.modulesCompleted}/${readiness.modulesTotal} módulos`} progress={modulePct} />
          <ProgressMetric label="Média recente" value={average === null ? "—" : `${average}%`} caption={`${readiness.fullAttempts} simulados completos`} progress={average ?? 0} />
        </div>

        <div className="mt-5 rounded-xl bg-slate-50 p-4 dark:bg-white/[0.04]"><div className="flex items-start gap-3"><TargetIcon className="mt-0.5 h-5 w-5 shrink-0 text-orange-500" /><p className="text-sm leading-6 text-slate-600 dark:text-slate-300">{readiness.advice}</p></div></div>

        {readiness.scoreHistory.length >= 2 ? (
          <div className="mt-5 border-t border-slate-100 pt-5 dark:border-white/10"><p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">Evolução das notas</p><ScoreChart history={readiness.scoreHistory} /></div>
        ) : null}

        {readiness.weakestDomains.length > 0 ? (
          <div className="mt-5 border-t border-slate-100 pt-5 dark:border-white/10">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">Prioridade de revisão</p>
            <div className="mt-3 space-y-3">
              {readiness.weakestDomains.slice(0, 2).map((domain) => (
                <div key={domain.domain}>
                  <div className="mb-1.5 flex items-center justify-between gap-4 text-xs"><span className="truncate font-semibold text-slate-600 dark:text-slate-300">{domain.domain}</span><span className="font-bold text-slate-950 dark:text-white">{domain.pct}%</span></div>
                  <div className="study-progress-track"><div className="h-full rounded-full bg-slate-900 dark:bg-slate-200" style={{ width: `${domain.pct}%` }} /></div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <div className="mt-auto grid grid-cols-3 border-t border-slate-100 bg-slate-50/70 dark:border-white/10 dark:bg-white/[0.025]">
        <ActionLink href={`/course/${certId}`} icon={<BookIcon />} label="Trilha" primary />
        <ActionLink href={`/simulado/${certId}`} icon={<PracticeIcon />} label="Simulado" />
        <ActionLink href={`/flashcards/${certId}`} icon={<CardsIcon />} label="Flashcards" />
      </div>
    </article>
  );
}

function ProgressMetric({ label, value, caption, progress }: { label: string; value: string; caption: string; progress: number }) {
  return <div className="rounded-xl border border-slate-100 p-4 dark:border-white/10"><p className="text-xs font-semibold text-slate-400">{label}</p><p className="mt-2 text-2xl font-bold tracking-[-0.035em] text-slate-950 dark:text-white">{value}</p><p className="mt-1 truncate text-[11px] text-slate-400 dark:text-slate-500">{caption}</p><div className="study-progress-track mt-3"><div className="study-progress-value" style={{ width: `${Math.min(100, progress)}%` }} /></div></div>;
}

function ActionLink({ href, icon, label, primary = false }: { href: string; icon: React.ReactNode; label: string; primary?: boolean }) {
  return <Link href={href} className={`flex min-h-16 items-center justify-center gap-2 border-r border-slate-100 px-2 text-xs font-bold transition last:border-r-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-orange-500/30 dark:border-white/10 ${primary ? "text-orange-600 hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-500/10" : "text-slate-500 hover:bg-white hover:text-slate-950 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"}`}>{icon}{label}</Link>;
}
