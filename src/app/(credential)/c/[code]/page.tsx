import type { Metadata } from "next";
import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/dal";
import { CERT_META, type CertKey } from "@/lib/learning/cert-meta";
import { CERTIFICATIONS } from "@/lib/learning/certifications";
import { describeAchievement, describeEvidence } from "@/lib/credentials/catalog";
import { credentialPath, formatIssuedDate } from "@/lib/credentials/share";
import { credentialLinks, getPublicCredential } from "@/lib/credentials/server";
import { qrSvg } from "@/lib/credentials/qr";
import { BadgeMedal } from "@/components/badge-medal";
import { Certificate } from "@/components/certificate";
import { CredentialShare } from "@/components/credential-share";
import { PrintButton } from "@/components/print-button";
import {
  AlertIcon,
  ArrowRightIcon,
  AwardIcon,
  CheckCircleIcon,
  CheckIcon,
  LayersIcon,
  ShieldCheckIcon,
  SparkIcon,
} from "@/components/ui-icons";

type Props = { params: Promise<{ code: string }> };

const TONE_GLOW: Record<string, string> = {
  ccp: "#f97316",
  saa: "#3b82f6",
  aif: "#a855f7",
  habit: "#10b981",
  level: "#6366f1",
  diagnostic: "#06b6d4",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  const credential = await getPublicCredential(code);
  if (!credential) return { title: "Credencial não encontrada", robots: { index: false, follow: false } };

  const title = `${credential.title} · ${credential.holderName}`;
  const description = `${credential.holderName} conquistou “${credential.title}” na CloudMastery em ${formatIssuedDate(credential.issuedAt)}. Credencial verificável · ID ${credential.code}.`;
  return {
    title,
    description,
    // Shared by its holder, not meant for search engines.
    robots: { index: false, follow: false },
    alternates: { canonical: credentialPath(credential.code) },
    openGraph: { type: "website", title, description, siteName: "CloudMastery", locale: "pt_BR", url: credentialPath(credential.code) },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function CredentialPage({ params }: Props) {
  const { code } = await params;
  const credential = await getPublicCredential(code);
  if (!credential) notFound();

  const achievement = describeAchievement(credential.achievement, {
    certId: credential.certId,
    modulesTotal: Number(credential.evidence.modulesTotal) || 0,
  });
  if (!achievement) notFound();

  const links = credentialLinks(credential);
  const [session, qr] = await Promise.all([getSession(), qrSvg(links.url)]);
  const owner = session?.userId === credential.userId;
  const revoked = credential.revokedAt !== null;
  const evidence = describeEvidence(credential.achievement, credential.evidence);
  const certId = credential.certId && credential.certId in CERT_META ? (credential.certId as CertKey) : null;
  const meta = certId ? CERT_META[certId] : null;
  const isCertificate = credential.kind === "certificate";
  const glow = TONE_GLOW[achievement.art.tone] ?? "#f97316";
  const issuedOn = formatIssuedDate(credential.issuedAt);

  return (
    <div className="mx-auto w-full max-w-[1120px] px-4 pb-10 pt-2 sm:px-8 sm:pt-4">
      <section className="ws-ink ws-rise overflow-hidden p-6 sm:p-10" aria-labelledby="credential-title">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -left-24 -top-24 h-[30rem] w-[30rem] rounded-full blur-[90px]"
          style={{ background: `${glow}33` }}
        />
        <div className="relative grid grid-cols-1 items-center gap-10 lg:grid-cols-[19rem_minmax(0,1fr)]">
          <div className="flex flex-col items-center">
            <span className="cm-medal-float">
              <BadgeMedal art={achievement.art} id={`public-${achievement.key}`} size={250} locked={revoked} title={credential.title} />
            </span>
            <span
              className={`mt-4 inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold ${
                revoked ? "border-rose-400/30 bg-rose-500/10 text-rose-200" : "border-emerald-400/30 bg-emerald-500/10 text-emerald-200"
              }`}
            >
              {revoked ? <AlertIcon className="h-3.5 w-3.5" /> : <ShieldCheckIcon className="h-3.5 w-3.5" />}
              {revoked ? "Credencial revogada" : "Credencial verificada"}
            </span>
          </div>

          <div className="min-w-0">
            <p className="ws-eyebrow flex flex-wrap items-center gap-2 !text-slate-400">
              {isCertificate ? <AwardIcon className="h-3.5 w-3.5 text-amber-300" /> : <SparkIcon className="h-3.5 w-3.5 text-orange-300" />}
              {isCertificate ? "Certificado" : "Badge"} · emitido pela CloudMastery
            </p>
            <h1 id="credential-title" className="mt-3 text-balance text-[1.9rem] font-semibold leading-[1.08] tracking-[-0.04em] text-white sm:text-[2.6rem]">
              {credential.title}
            </h1>
            <p className="mt-5 text-sm text-slate-400">Emitida para</p>
            <p className="mt-0.5 break-words text-[1.6rem] font-semibold tracking-[-0.03em] text-white sm:text-[2rem]">{credential.holderName}</p>
            <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-slate-400">
              <span>{issuedOn}</span>
              <span aria-hidden="true" className="h-1 w-1 rounded-full bg-slate-600" />
              <span className="ws-chip ws-chip-glass font-mono !text-[11px]">{credential.code}</span>
            </p>

            <div className="mt-7 max-w-xl">
              {owner && !revoked ? (
                <CredentialShare
                  tone="ink"
                  url={links.url}
                  title={credential.title}
                  kind={credential.kind}
                  linkedInAddUrl={links.linkedInAddUrl}
                  imageUrl={links.imageUrl}
                />
              ) : (
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                  <p className="text-sm font-semibold text-white">Também está se preparando para a AWS?</p>
                  <p className="mt-1 text-sm leading-6 text-slate-400">
                    Descubra seu nível com um diagnóstico gratuito de 30 questões no formato da prova.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link href="/signup" className="ws-btn ws-btn-primary ws-btn-sm">
                      Fazer o diagnóstico grátis
                      <ArrowRightIcon className="h-4 w-4" />
                    </Link>
                    <Link href="/" className="ws-btn ws-btn-glass ws-btn-sm">
                      Conhecer a CloudMastery
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <section className="ws-card ws-rise p-6 sm:p-7" aria-labelledby="proof-title" style={{ "--d": 1 } as CSSProperties}>
          <p className="ws-eyebrow">O que comprova</p>
          <h2 id="proof-title" className="ws-h2 mt-1.5">{achievement.description}</h2>
          {evidence.length ? (
            <ul className="mt-5 space-y-3">
              {evidence.map((line) => (
                <li key={line} className="flex items-start gap-3 text-[15px] text-ws-text">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ws-success/15 text-ws-success-ink">
                    <CheckIcon className="h-3.5 w-3.5" strokeWidth={2.6} />
                  </span>
                  {line}
                </li>
              ))}
            </ul>
          ) : null}
          <div className="mt-6 rounded-2xl bg-ws-sunken px-4 py-3.5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ws-subtle">Critério de emissão</p>
            <p className="mt-1 text-sm leading-6 text-ws-muted">{achievement.criteria}</p>
          </div>
          {achievement.skills.length ? (
            <div className="mt-6">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-ws-subtle">
                <LayersIcon className="h-3.5 w-3.5" />
                Domínios {meta ? `da prova ${meta.code}` : "avaliados"}
              </p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {achievement.skills.map((skill) => (
                  <li key={skill} className="ws-chip">{skill}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>

        <section className="ws-card ws-rise flex flex-col p-6 sm:p-7" aria-labelledby="verify-title" style={{ "--d": 2 } as CSSProperties}>
          <p className="ws-eyebrow">Verificação</p>
          <h2 id="verify-title" className="ws-h2 mt-1.5">Esta é a página oficial da credencial</h2>
          <dl className="mt-5 divide-y divide-ws-line/[0.07] text-sm">
            <Row label="Status">
              {revoked ? (
                <span className="font-semibold text-ws-danger-ink">Revogada</span>
              ) : (
                <span className="inline-flex items-center gap-1.5 font-semibold text-ws-success-ink">
                  <CheckCircleIcon className="h-4 w-4" />
                  Válida
                </span>
              )}
            </Row>
            <Row label="Titular">{credential.holderName}</Row>
            <Row label="Emitida em">{issuedOn}</Row>
            <Row label="ID">
              <span className="font-mono text-[13px]">{credential.code}</span>
            </Row>
            <Row label="Emissor">CloudMastery</Row>
            {meta && certId ? <Row label="Trilha">{CERTIFICATIONS[certId].name.replace("AWS Certified ", "")} ({meta.code})</Row> : null}
          </dl>
          <div className="mt-auto flex items-center gap-4 pt-6">
            <span
              aria-hidden="true"
              className="block h-20 w-20 shrink-0 rounded-xl border border-ws-line/10 bg-white p-2 [&>svg]:h-full [&>svg]:w-full"
              dangerouslySetInnerHTML={{ __html: qr }}
            />
            <p className="text-xs leading-5 text-ws-subtle">
              Aponte a câmera para abrir esta página. O ID e o endereço identificam a credencial de forma única.
            </p>
          </div>
        </section>
      </div>

      {isCertificate && meta && certId ? (
        <section className="mt-10" aria-labelledby="certificate-title">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 print:hidden">
            <h2 id="certificate-title" className="ws-h2">Certificado</h2>
            <PrintButton />
          </div>
          <Certificate
            holderName={credential.holderName}
            certName={CERTIFICATIONS[certId].name}
            certCode={meta.code}
            credentialCode={credential.code}
            issuedOn={issuedOn}
            verifyUrl={links.url}
            qrSvg={qr}
            recentAverage={Number(credential.evidence.recentAverage) || null}
            modulesTotal={Number(credential.evidence.modulesTotal) || null}
          />
        </section>
      ) : null}

      <p className="mx-auto mt-10 max-w-2xl text-center text-xs leading-5 text-ws-subtle">
        Credencial de preparação emitida pela CloudMastery. Não é uma certificação oficial da AWS, que é concedida exclusivamente pela Amazon Web Services após aprovação no exame.
      </p>
    </div>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2.5">
      <dt className="shrink-0 text-ws-subtle">{label}</dt>
      <dd className="min-w-0 text-right font-medium text-ws-ink">{children}</dd>
    </div>
  );
}
