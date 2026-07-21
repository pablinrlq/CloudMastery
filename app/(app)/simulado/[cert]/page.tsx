import { notFound } from "next/navigation";
import { CERTIFICATIONS, isValidCert } from "@/lib/content";
import { requireAccess } from "@/lib/dal";
import { SimuladoRunner } from "@/components/simulado-runner";

export default async function SimuladoPage({
  params,
}: {
  params: Promise<{ cert: string }>;
}) {
  const { cert } = await params;
  if (!isValidCert(cert)) notFound();

  await requireAccess(cert);
  const certInfo = CERTIFICATIONS[cert];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <p className="text-sm text-gray-500 dark:text-gray-400">{certInfo.code}</p>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Simulados — {certInfo.name}
      </h1>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
        As respostas só são reveladas após a correção, como na prova real.
      </p>

      <div className="mt-8">
        <SimuladoRunner
          certId={cert}
          domains={certInfo.domains}
          fullDurationMinutes={certInfo.examDurationMinutes}
          fullQuestionCount={certInfo.examQuestionCount}
        />
      </div>
    </div>
  );
}
