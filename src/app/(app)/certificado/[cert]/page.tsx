import Link from "next/link";
import type { CSSProperties } from "react";
import { notFound } from "next/navigation";
import { CERTIFICATIONS, isValidCert } from "@/lib/learning/content";
import { requireAccess, verifySession } from "@/lib/dal";
import { getReadiness, READY_SCORE } from "@/lib/learning/readiness";
import { CERT_META } from "@/lib/learning/cert-meta";
import { ProgressBar } from "@/components/workspace-ui";
import { BadgeMedal } from "@/components/badge-medal";
import { Certificate } from "@/components/certificate";
import { CredentialShare } from "@/components/credential-share";
import { HolderNameForm } from "@/components/holder-name-form";
import { HolderNameProvider } from "@/components/holder-name";
import { PrintButton } from "@/components/print-button";
import { EmptyState } from "@/components/workspace-ui";
import { credentialLinks, trySyncCredentials } from "@/lib/credentials/server";
import { qrSvg } from "@/lib/credentials/qr";
import { credentialPath, formatIssuedDate, looksLikeFullName } from "@/lib/credentials/share";
import { AlertIcon, ArrowRightIcon, AwardIcon, BookIcon, CheckIcon, LockIcon, PracticeIcon, ShieldCheckIcon, TargetIcon } from "@/components/ui-icons";

export default async function CertificadoPage({
  params,
}: {
  params: Promise<{ cert: string }>;
}) {
  const { cert } = await params;
  if (!isValidCert(cert)) notFound();

  await requireAccess(cert);
  const { userId, user } = await verifySession();
  const readiness = await getReadiness(cert);
  const certInfo = CERTIFICATIONS[cert];
  const meta = CERT_META[cert];

  // Gate: só quem atingiu a prontidão vê o certificado.
  if (!readiness.ready) {
    const attempts = Math.min(3, readiness.recentScores.length);
    const average = readiness.avgRecentScore;
    const requirements = [
      {
        icon: <BookIcon className="h-5 w-5" />,
        title: "Concluir a trilha completa",
        detail: `${readiness.modulesCompleted} de ${readiness.modulesTotal} módulos`,
        value: readiness.modulesTotal ? (readiness.modulesCompleted / readiness.modulesTotal) * 100 : 0,
        done: readiness.modulesCompleted === readiness.modulesTotal && readiness.modulesTotal > 0,
        href: readiness.nextModule ? `/course/${cert}/${readiness.nextModule.slug}` : `/course/${cert}`,
        cta: "Continuar trilha",
      },
      {
        icon: <PracticeIcon className="h-5 w-5" />,
        title: "Fazer 3 simulados completos",
        detail: `${attempts} de 3 simulados`,
        value: (attempts / 3) * 100,
        done: attempts >= 3,
        href: `/simulado/${cert}`,
        cta: "Fazer simulado",
      },
      {
        icon: <TargetIcon className="h-5 w-5" />,
        title: `Média ≥ ${READY_SCORE}% nos últimos 3`,
        detail: average === null ? "Sem simulados ainda" : `Média atual ${average}%`,
        value: average === null ? 0 : Math.min(100, (average / READY_SCORE) * 100),
        done: attempts >= 3 && average !== null && average >= READY_SCORE,
        href: `/simulado/${cert}`,
        cta: "Treinar domínios",
      },
    ];
    const pending = requirements.filter((item) => !item.done).length;

    return (
      <div className="mx-auto w-full max-w-[1240px] px-4 py-5 sm:px-8 sm:py-8 xl:px-10 xl:py-10">
        <section className="ws-ink ws-rise p-6 sm:p-8 xl:p-10" aria-labelledby="cert-title">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,1fr)_22rem]">
            <div>
              <p className="ws-eyebrow flex items-center gap-2 !text-orange-200/80">
                <LockIcon className="h-3.5 w-3.5" />
                Conquista bloqueada · {meta.code}
              </p>
              <h1 id="cert-title" className="mt-4 text-balance text-[1.9rem] font-semibold leading-[1.08] tracking-[-0.04em] text-white sm:text-[2.5rem]">
                Seu certificado está a {pending} {pending === 1 ? "passo" : "passos"}.
                <span className="block text-slate-400">Complete a trilha e prove sua prontidão.</span>
              </h1>
              <p className="mt-4 max-w-xl text-[15px] leading-7 text-slate-400">{readiness.advice}</p>
              <Link href={requirements.find((item) => !item.done)?.href ?? `/course/${cert}`} className="ws-btn ws-btn-primary ws-btn-lg mt-7">
                {requirements.find((item) => !item.done)?.cta ?? "Continuar estudando"}
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>

            <div className="relative mx-auto w-full max-w-sm" aria-hidden="true">
              <div className="rotate-[-4deg] rounded-2xl border border-white/10 bg-[#fffdf8] p-6 text-center opacity-90 shadow-[0_40px_80px_-30px_rgba(0,0,0,.8)] blur-[1.5px]">
                <div className="rounded-xl border border-orange-200 px-4 py-6">
                  <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-orange-600">Certificado de conclusão</p>
                  <p className="mt-4 text-[10px] text-slate-500">conferido a</p>
                  <div className="mx-auto mt-2 h-4 w-40 rounded bg-slate-200" />
                  <div className="mx-auto mt-5 h-2 w-52 rounded bg-slate-100" />
                  <div className="mx-auto mt-1.5 h-2 w-44 rounded bg-slate-100" />
                  <p className="mt-4 text-xs font-semibold text-slate-800">{meta.short}</p>
                </div>
              </div>
              <span className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl border border-white/15 bg-[#0c111b]/90 text-orange-300 shadow-[0_20px_40px_-12px_rgba(0,0,0,.8)] backdrop-blur">
                <LockIcon className="h-7 w-7" />
              </span>
            </div>
          </div>
        </section>

        <section className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3" aria-label="Requisitos do certificado">
          {requirements.map((item, index) => (
            <div key={item.title} className="ws-card ws-rise flex flex-col p-5 sm:p-6" style={{ "--d": index + 1 } as CSSProperties}>
              <div className="flex items-center justify-between">
                <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${item.done ? "bg-ws-success/15 text-ws-success-ink" : "bg-ws-accent/10 text-ws-accent-ink"}`}>
                  {item.done ? <CheckIcon className="h-5 w-5" strokeWidth={2.4} /> : item.icon}
                </span>
                <span className={`ws-chip ${item.done ? "ws-chip-success" : ""}`}>{item.done ? "Concluído" : `Passo ${index + 1}`}</span>
              </div>
              <h2 className="mt-5 text-[15px] font-semibold tracking-[-0.015em] text-ws-ink">{item.title}</h2>
              <p className="mt-1 font-mono text-xs text-ws-subtle">{item.detail}</p>
              <div className="mt-4">
                <ProgressBar value={item.value} tone={item.done ? "success" : "accent"} delay={index} />
              </div>
              {!item.done ? (
                <Link href={item.href} className="group mt-5 inline-flex items-center gap-1.5 self-start text-sm font-semibold text-ws-accent-ink">
                  {item.cta}
                  <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              ) : null}
            </div>
          ))}
        </section>
      </div>
    );
  }

  const state = await trySyncCredentials(userId, true);
  const credential = state?.issued.get(`ready:${cert}`);
  const achievement = state?.statuses.find((status) => status.key === `ready:${cert}`);

  if (!credential || !achievement) {
    return (
      <div className="mx-auto w-full max-w-[1240px] px-4 py-5 sm:px-8 sm:py-8 xl:px-10 xl:py-10">
        <EmptyState
          className="mt-8"
          icon={<AlertIcon className="h-5 w-5" />}
          title="Estamos emitindo seu certificado"
          text="Você atingiu a prontidão, mas não conseguimos registrar o certificado agora. Seu progresso está salvo; tente de novo em instantes."
          action={<Link href={`/certificado/${cert}`} className="ws-btn ws-btn-secondary ws-btn-sm">Tentar de novo</Link>}
        />
      </div>
    );
  }

  const links = credentialLinks(credential);
  const qr = await qrSvg(links.url);
  const recentAverage = Number(credential.evidence.recentAverage) || readiness.avgRecentScore;
  const modulesTotal = Number(credential.evidence.modulesTotal) || readiness.modulesTotal;

  return (
    <div className="mx-auto w-full max-w-[1240px] px-4 py-5 sm:px-8 sm:py-8 xl:px-10 xl:py-10">
      <section className="ws-ink ws-ink-success ws-rise mb-5 p-6 sm:p-8 print:hidden" aria-labelledby="cert-title">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-center">
            <BadgeMedal art={achievement.art} id={`certificate-${achievement.key}`} size={132} className="cm-medal-pop" />
            <div className="min-w-0">
              <p className="ws-eyebrow flex items-center gap-2 !text-emerald-200/80">
                <ShieldCheckIcon className="h-3.5 w-3.5" />
                Certificado emitido · verificável
              </p>
              <h1 id="cert-title" className="mt-2 text-balance text-2xl font-semibold tracking-[-0.03em] text-white sm:text-[1.9rem]">
                Você atingiu a prontidão para o {meta.code}.
              </h1>
              <p className="mt-1.5 text-sm leading-6 text-slate-400">
                Emitido em {formatIssuedDate(credential.issuedAt)}. Agende a prova oficial nas próximas 1–2 semanas, enquanto o conteúdo está fresco.
              </p>
              <p className="mt-3 flex flex-wrap items-center gap-2">
                <span className="ws-chip ws-chip-glass font-mono !text-[11px]">{credential.code}</span>
                <Link href={credentialPath(credential.code)} className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-200 hover:text-white">
                  Ver página pública
                  <ArrowRightIcon className="h-3.5 w-3.5" />
                </Link>
              </p>
            </div>
          </div>
          <CredentialShare
            tone="ink"
            url={links.url}
            title={credential.title}
            kind="certificate"
            linkedInAddUrl={links.linkedInAddUrl}
            imageUrl={links.imageUrl}
          />
        </div>
      </section>

      <HolderNameProvider>
        <div className="mb-5 print:hidden">
          <HolderNameForm initialName={user.name} needsAttention={!looksLikeFullName(user.name)} />
        </div>

        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <p className="flex items-center gap-2 text-sm font-medium text-ws-muted">
            <AwardIcon className="h-4 w-4 text-ws-accent-ink" />
            Seu certificado, com QR code de verificação
          </p>
          <PrintButton />
        </div>
        <Certificate
          holderName={user.name}
          certName={certInfo.name}
          certCode={certInfo.code}
          credentialCode={credential.code}
          issuedOn={formatIssuedDate(credential.issuedAt)}
          verifyUrl={links.url}
          qrSvg={qr}
          recentAverage={recentAverage}
          modulesTotal={modulesTotal}
        />
      </HolderNameProvider>
    </div>
  );
}
