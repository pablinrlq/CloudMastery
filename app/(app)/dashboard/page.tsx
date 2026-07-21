import Link from "next/link";
import { verifySession, getSubscription, hasAccess } from "@/lib/dal";
import { CERTIFICATIONS, type CertId } from "@/lib/content";
import { getReadiness } from "@/lib/readiness";
import { ScoreChart } from "@/components/score-chart";

export default async function DashboardPage() {
  const { email } = await verifySession();
  const subscription = await getSubscription();

  const hasAnyAccess = hasAccess(subscription, "ccp") || hasAccess(subscription, "saa");

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-bold">Meus estudos</h1>
      <p className="mt-1 text-sm text-gray-500">{email}</p>

      {!hasAnyAccess ? (
        <div className="mt-8 rounded-xl border border-orange-200 bg-orange-50 p-6">
          <h2 className="font-semibold">Assine para desbloquear as trilhas</h2>
          <p className="mt-1 text-sm text-gray-600">
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
    <section className="rounded-2xl border border-gray-200 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs text-gray-500">{cert.code}</p>
          <h2 className="text-lg font-semibold">{cert.name}</h2>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            readiness.ready
              ? "bg-green-100 text-green-700"
              : "bg-amber-100 text-amber-700"
          }`}
        >
          {readiness.ready ? "Pronto para a prova" : "Em preparação"}
        </span>
      </div>

      <p className="mt-3 rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
        {readiness.advice}
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <div>
          <p className="text-xs text-gray-500">Trilha de estudo</p>
          <p className="mt-1 text-2xl font-bold">{modulePct}%</p>
          <p className="text-xs text-gray-500">
            {readiness.modulesCompleted}/{readiness.modulesTotal} módulos
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Média (últimos 3 completos)</p>
          <p className="mt-1 text-2xl font-bold">
            {readiness.avgRecentScore !== null ? `${readiness.avgRecentScore}%` : "—"}
          </p>
          <p className="text-xs text-gray-500">
            {readiness.fullAttempts} simulado(s) completo(s)
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Meta de prontidão</p>
          <p className="mt-1 text-2xl font-bold">≥ 75%</p>
          <p className="text-xs text-gray-500">média em 3 simulados + trilha 100%</p>
        </div>
      </div>

      {readiness.scoreHistory.length >= 2 && (
        <div className="mt-5">
          <p className="text-sm font-medium">Sua evolução nos simulados</p>
          <div className="mt-2 rounded-lg border border-gray-100 bg-white p-3">
            <ScoreChart history={readiness.scoreHistory} />
          </div>
        </div>
      )}

      {readiness.weakestDomains.length > 0 && (
        <div className="mt-5">
          <p className="text-sm font-medium">Onde focar agora</p>
          <div className="mt-2 space-y-2">
            {readiness.weakestDomains.map((d) => (
              <div key={d.domain} className="flex items-center gap-3">
                <div className="h-2 flex-1 rounded-full bg-gray-100">
                  <div
                    className={`h-2 rounded-full ${d.pct < 72 ? "bg-red-400" : "bg-green-500"}`}
                    style={{ width: `${d.pct}%` }}
                  />
                </div>
                <span className="w-44 truncate text-xs text-gray-600">{d.domain}</span>
                <span
                  className={`w-10 text-right text-xs font-medium ${
                    d.pct < 72 ? "text-red-600" : "text-gray-600"
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
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white"
        >
          Continuar estudando
        </Link>
        <Link
          href={`/simulado/${certId}`}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium hover:border-orange-400"
        >
          Fazer simulado
        </Link>
        <Link
          href={`/flashcards/${certId}`}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium hover:border-orange-400"
        >
          Flashcards
        </Link>
      </div>
    </section>
  );
}
