import Link from "next/link";
import { verifySession, getSubscription, hasAccess } from "@/lib/dal";
import { CERTIFICATIONS, type CertId } from "@/lib/content";
import { getReadiness } from "@/lib/readiness";
import { getGamificationProfile } from "@/lib/gamification";
import { ScoreChart } from "@/components/score-chart";
import { StatsBar } from "@/components/stats-bar";

export default async function DashboardPage() {
  const { email } = await verifySession();
  const subscription = await getSubscription();

  const hasAnyAccess = hasAccess(subscription, "ccp") || hasAccess(subscription, "saa");
  const profile = hasAnyAccess ? await getGamificationProfile() : null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Meus estudos</h1>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{email}</p>

      {!hasAnyAccess ? (
        <div className="mt-8 rounded-xl border border-orange-200 bg-orange-50 p-6 dark:border-orange-500/30 dark:bg-orange-500/10">
          <h2 className="font-semibold text-gray-900 dark:text-white">
            Assine para desbloquear as trilhas
          </h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
            Acesso completo às trilhas, simulados cronometrados, flashcards e
            diagnóstico de prontidão.
          </p>
          <Link
            href="/pricing"
            className="mt-3 inline-block rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
          >
            Ver planos
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-8">
          {profile && <StatsBar profile={profile} />}
          {(Object.keys(CERTIFICATIONS) as CertId[])
            .filter((certId) => hasAccess(subscription, certId))
            .map((certId) => (
              <CertPanel key={certId} certId={certId} />
            ))}
        </div>
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
    <section className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">{cert.code}</p>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {cert.name}
          </h2>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            readiness.ready
              ? "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400"
              : "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400"
          }`}
        >
          {readiness.ready ? "Pronto para a prova" : "Em preparação"}
        </span>
      </div>

      <p className="mt-3 rounded-lg bg-gray-50 p-3 text-sm text-gray-700 dark:bg-gray-800 dark:text-gray-300">
        {readiness.advice}
      </p>

      {readiness.ready && (
        <Link
          href={`/certificado/${certId}`}
          className="mt-3 flex items-center justify-between rounded-lg border border-orange-300 bg-gradient-to-r from-orange-50 to-amber-50 p-3 text-sm font-medium text-orange-800 hover:border-orange-400 dark:border-orange-500/40 dark:from-orange-500/10 dark:to-amber-500/10 dark:text-orange-300"
        >
          <span>🏆 Você desbloqueou o certificado de conclusão!</span>
          <span aria-hidden>→</span>
        </Link>
      )}

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
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
          <div className="mt-2 rounded-lg border border-gray-100 bg-white p-3 dark:border-gray-800 dark:bg-gray-950">
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

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href={`/course/${certId}`}
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
        >
          Continuar estudando
        </Link>
        <Link
          href={`/simulado/${certId}`}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:border-orange-400 dark:border-gray-700 dark:text-gray-300 dark:hover:border-orange-500"
        >
          Fazer simulado
        </Link>
        <Link
          href={`/flashcards/${certId}`}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:border-orange-400 dark:border-gray-700 dark:text-gray-300 dark:hover:border-orange-500"
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
    <div>
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400">{children}</p>
    </div>
  );
}
