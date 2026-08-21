import { notFound } from "next/navigation";
import { CERTIFICATIONS, isValidCert } from "@/lib/content";
import { getSubscription, hasAccess, verifySession } from "@/lib/dal";
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

  return (
    <div className="mx-auto max-w-4xl px-5 py-10 sm:px-6 sm:py-14">
      <p className="cm-kicker">{certInfo.code} · Centro de prática</p>
      <h1 className="cm-title mt-3">
        Simulados — {certInfo.name}
      </h1>
      <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
        Treine decisões sob pressão. As respostas só aparecem após a correção, como na prova real.
      </p>

      <div className="mt-10">
        <SimuladoRunner
          certId={cert}
          domains={certInfo.domains}
          fullDurationMinutes={certInfo.examDurationMinutes}
          fullQuestionCount={certInfo.examQuestionCount}
          premium={premium}
        />
      </div>
    </div>
  );
}
