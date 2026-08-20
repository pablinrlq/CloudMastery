import Link from "next/link";
import { notFound } from "next/navigation";
import { CERTIFICATIONS, isValidCert } from "@/lib/content";
import { requireAccess, verifySession } from "@/lib/dal";
import { getReadiness } from "@/lib/readiness";
import { LogoIcon } from "@/components/logo";

export default async function CertificadoPage({
  params,
}: {
  params: Promise<{ cert: string }>;
}) {
  const { cert } = await params;
  if (!isValidCert(cert)) notFound();

  await requireAccess(cert);
  const { email } = await verifySession();
  const readiness = await getReadiness(cert);
  const certInfo = CERTIFICATIONS[cert];

  // Gate: só quem atingiu a prontidão vê o certificado.
  if (!readiness.ready) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-16 text-center sm:px-6 sm:py-24">
        <div className="cm-panel p-8 sm:p-12">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-white/5"><LogoIcon size={44} /></div>
        <p className="cm-kicker mt-7">Conquista em progresso</p>
        <h1 className="mt-3 text-3xl font-bold tracking-[-0.04em] text-slate-950 dark:text-white">
          Certificado ainda bloqueado
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-slate-500 dark:text-slate-400">
          Conclua todos os módulos da trilha e alcance média ≥ 75% em 3 simulados
          completos para desbloquear o certificado de {certInfo.name}.
        </p>
        <div className="mt-7 rounded-2xl border border-orange-100 bg-orange-50/60 p-5 text-left text-sm dark:border-orange-500/20 dark:bg-orange-500/10">
          <p className="font-semibold leading-6 text-orange-900 dark:text-orange-200">{readiness.advice}</p>
        </div>
        <Link
          href={`/course/${cert}`}
          className="cm-button-primary mt-7"
        >
          Continuar estudando
        </Link></div>
      </div>
    );
  }

  const { Certificate } = await import("@/components/certificate");
  const dateStr = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <Certificate
      certName={certInfo.name}
      certCode={certInfo.code}
      emailPrefix={email.split("@")[0]}
      bestScore={readiness.recentScores.length ? Math.max(...readiness.recentScores) : null}
      dateStr={dateStr}
    />
  );
}
