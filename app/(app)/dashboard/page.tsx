import Link from "next/link";
import { verifySession, getSubscription, hasAccess } from "@/lib/dal";
import { CERTIFICATIONS, type CertId } from "@/lib/content";
import { getReadiness } from "@/lib/readiness";
import { getGamificationProfile } from "@/lib/gamification";
import { ScoreChart } from "@/components/score-chart";
import { StatsBar } from "@/components/stats-bar";
import { PortalButton } from "@/components/portal-button";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>;
}) {
  const { checkout } = await searchParams;
  const { email } = await verifySession();
  const subscription = await getSubscription();

  const hasAnyAccess = hasAccess(subscription, "ccp") || hasAccess(subscription, "saa");
  const profile = hasAnyAccess ? await getGamificationProfile() : null;

  return (
    <div className="cm-container py-10 sm:py-14">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="cm-kicker">Seu espaço de evolução</p>
          <h1 className="cm-title mt-3">Visão geral</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Acompanhe seu ritmo, desempenho e próximos passos.</p>
        </div>
        <span className="inline-flex max-w-fit items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-500 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-400">{email}</span>
      </div>

      {checkout === "success" && (
        <p
          role="status"
          className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800 shadow-sm dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300"
        >
          Assinatura confirmada. Seu acesso já está liberado — bons estudos!
        </p>
      )}

      {!hasAnyAccess ? (
        <div className="relative mt-10 overflow-hidden rounded-[1.75rem] border border-slate-800 bg-[#0d121c] p-7 text-white shadow-[0_28px_70px_-38px_rgba(15,23,42,0.65)] sm:p-10">
          <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-orange-500/15 blur-[80px]" />
          <p className="relative text-xs font-bold uppercase tracking-[0.2em] text-orange-400">Acesso completo</p>
          <h2 className="relative mt-3 max-w-lg text-2xl font-bold tracking-[-0.035em]">Transforme este dashboard no seu plano de aprovação.</h2>
          <p className="relative mt-3 max-w-xl text-sm leading-7 text-slate-400">
            Acesso completo às trilhas, simulados cronometrados, flashcards e
            diagnóstico de prontidão.
          </p>
          <Link
            href="/pricing"
            className="cm-button-primary relative mt-7"
          >
            Ver planos
          </Link>
          {subscription && <PortalButton />}
        </div>
      ) : (
        <>
          <div className="mt-10 space-y-6">
            {profile && <StatsBar profile={profile} />}
            {(Object.keys(CERTIFICATIONS) as CertId[])
              .filter((certId) => hasAccess(subscription, certId))
              .map((certId) => (
                <CertPanel key={certId} certId={certId} />
              ))}
          </div>
          <PortalButton />
        </>
      )}
    </div>
  );
}

async function CertPanel({ certId }: { certId: CertId }) {
  const cert = CERTIFICATIONS[certId];
  const readiness = await getReadiness(certId);
  const modulePct = readiness.modulesTotal
    ? Math.round((readiness.modulesCompleted / readiness.modulesTotal) * 100)
    : 0;

  return (
    <section className="cm-panel overflow-hidden p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="cm-kicker">{cert.code}</p>
          <h2 className="mt-2 text-xl font-bold tracking-[-0.025em] text-slate-950 dark:text-white">
            {cert.name}
          </h2>
        </div>
        <span
          className={`rounded-full border px-3 py-1.5 text-xs font-bold ${
            readiness.ready
              ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400"
              : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400"
          }`}
        >
          {readiness.ready ? "Pronto para a prova" : "Em preparação"}
        </span>
      </div>

      <p className="mt-5 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 text-sm leading-6 text-slate-600 dark:border-white/5 dark:bg-white/[0.035] dark:text-slate-300">
        {readiness.advice}
      </p>

      {readiness.ready && (
        <Link
          href={`/certificado/${certId}`}
          className="mt-4 flex items-center justify-between rounded-2xl border border-orange-200 bg-orange-50 p-4 text-sm font-bold text-orange-800 transition hover:border-orange-300 hover:bg-orange-100/70 dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-300"
        >
          <span>🏆 Você desbloqueou o certificado de conclusão!</span>
          <span aria-hidden>→</span>
        </Link>
      )}

      <div className="mt-6 grid gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 sm:grid-cols-3 dark:border-white/10 dark:bg-white/10">
        <Stat label="Trilha de estudo" value={`${modulePct}%`}>
          {readiness.modulesCompleted}/{readiness.modulesTotal} módulos
        </Stat>
        <Stat
          label="Média (últimos 3 completos)"
          value={readiness.avgRecentScore !== null ? `${readiness.avgRecentScore}%` : "—"}
        >
          {readiness.fullAttempts} simulado(s) completo(s)
        </Stat>
        <Stat label="Meta de prontidão" value="≥ 75%">
          média em 3 simulados + trilha 100%
        </Stat>
      </div>

      {readiness.scoreHistory.length >= 2 && (
        <div className="mt-5">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-200">
            Sua evolução nos simulados
          </p>
          <div className="mt-3 rounded-2xl border border-slate-100 bg-slate-50/60 p-4 dark:border-white/5 dark:bg-black/20">
            <ScoreChart history={readiness.scoreHistory} />
          </div>
        </div>
      )}

      {readiness.weakestDomains.length > 0 && (
        <div className="mt-5">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-200">
            Onde focar agora
          </p>
          <div className="mt-2 space-y-2">
            {readiness.weakestDomains.map((d) => (
              <div key={d.domain} className="flex items-center gap-3">
                <div className="h-2 flex-1 rounded-full bg-gray-100 dark:bg-gray-800">
                  <div
                    className={`h-2 rounded-full ${d.pct < 72 ? "bg-red-400" : "bg-green-500"}`}
                    style={{ width: `${d.pct}%` }}
                  />
                </div>
                <span className="w-44 truncate text-xs text-gray-600 dark:text-gray-400">
                  {d.domain}
                </span>
                <span
                  className={`w-10 text-right text-xs font-medium ${
                    d.pct < 72 ? "text-red-600 dark:text-red-400" : "text-gray-600 dark:text-gray-400"
                  }`}
                >
                  {d.pct}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-7 flex flex-wrap gap-2.5 border-t border-slate-100 pt-6 dark:border-white/10">
        <Link
          href={`/course/${certId}`}
          className="cm-button-primary min-h-10 px-4"
        >
          Continuar estudando
        </Link>
        <Link
          href={`/simulado/${certId}`}
          className="cm-button-secondary min-h-10 px-4"
        >
          Fazer simulado
        </Link>
        <Link
          href={`/flashcards/${certId}`}
          className="cm-button-secondary min-h-10 px-4"
        >
          Flashcards
        </Link>
      </div>
    </section>
  );
}

function Stat({
  label,
  value,
  children,
}: {
  label: string;
  value: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white p-5 dark:bg-slate-900">
      <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold tracking-tight text-slate-950 dark:text-white">{value}</p>
      <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">{children}</p>
    </div>
  );
}
