import Link from "next/link";
import { notFound } from "next/navigation";
import { CERTIFICATIONS, isValidCert } from "@/lib/content";
import { requireAccess, verifySession } from "@/lib/dal";
import { getReadiness } from "@/lib/readiness";

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
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <p className="text-5xl">🔒</p>
        <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
          Certificado ainda bloqueado
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Conclua todos os módulos da trilha e alcance média ≥ 75% em 3 simulados
          completos para desbloquear o certificado de {certInfo.name}.
        </p>
        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-4 text-left text-sm dark:border-gray-800 dark:bg-gray-900">
          <p className="text-gray-700 dark:text-gray-300">{readiness.advice}</p>
        </div>
        <Link
          href={`/course/${cert}`}
          className="mt-6 inline-block rounded-lg bg-orange-500 px-5 py-2.5 font-medium text-white hover:bg-orange-600"
        >
          Continuar estudando
        </Link>
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
