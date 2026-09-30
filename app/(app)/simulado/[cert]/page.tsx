import { notFound } from "next/navigation";
import { CERTIFICATIONS, isValidCert } from "@/lib/content";
import { getSubscription, hasAccess, verifySession } from "@/lib/dal";
import { getReadiness, READY_SCORE } from "@/lib/readiness";
import { CERT_META } from "@/lib/cert-meta";
import { SimuladoRunner } from "@/components/simulado-runner";

export default async function SimuladoPage({
  params,
}: {
  params: Promise<{ cert: string }>;
}) {
  const { cert } = await params;
  if (!isValidCert(cert)) notFound();

  await verifySession();
  const subscription = await getSubscription();
  const premium = hasAccess(subscription, cert);
  const certInfo = CERTIFICATIONS[cert];
  const readiness = premium ? await getReadiness(cert) : null;

  return (
    <div className="mx-auto w-full max-w-[1240px] px-4 py-5 sm:px-8 sm:py-8 xl:px-10 xl:py-10">
      <SimuladoRunner
        certId={cert}
        certCode={CERT_META[cert].code}
        certShort={CERT_META[cert].short}
        domains={certInfo.domains}
        fullDurationMinutes={certInfo.examDurationMinutes}
        fullQuestionCount={certInfo.examQuestionCount}
        premium={premium}
        history={readiness?.scoreHistory ?? []}
        average={readiness?.avgRecentScore ?? null}
        readyScore={READY_SCORE}
        domainStats={readiness?.domainStats.map(({ domain, pct }) => ({ domain, pct })) ?? []}
      />
    </div>
  );
}
