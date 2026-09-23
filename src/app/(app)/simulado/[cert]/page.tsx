import { notFound } from "next/navigation";
import { CERTIFICATIONS, isValidCert } from "@/lib/learning/content";
import { requireAccess } from "@/lib/dal";
import { SimuladoRunner } from "@/components/simulado-runner";
import { ClockIcon, PracticeIcon, TargetIcon } from "@/components/ui-icons";

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
    <div className="mx-auto max-w-[1180px] px-5 py-8 sm:px-8 sm:py-12">
      <section className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-950 px-6 py-8 text-white shadow-xl shadow-slate-950/10 sm:px-10 sm:py-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(249,115,22,.26),transparent_34%),linear-gradient(135deg,rgba(255,255,255,.06),transparent_45%)]" />
        <div className="relative max-w-3xl">
          <div className="flex items-center gap-2 text-orange-300"><PracticeIcon className="h-4 w-4" /><p className="study-eyebrow !text-orange-300">{certInfo.code} · Centro de prática</p></div>
          <h1 className="mt-4 text-3xl font-bold tracking-[-0.04em] sm:text-4xl">Simulados de {certInfo.name}</h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">Treine decisões sob pressão. As respostas só aparecem após a correção, como na prova real.</p>
          <div className="mt-7 flex flex-wrap gap-3 text-xs font-semibold text-slate-200">
            <span className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2"><ClockIcon className="h-4 w-4 text-orange-300" />{certInfo.examDurationMinutes} min</span>
            <span className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2"><TargetIcon className="h-4 w-4 text-orange-300" />{certInfo.examQuestionCount} questões</span>
          </div>
        </div>
      </section>

      <div className="mt-6">
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
