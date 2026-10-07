import type { Metadata } from "next";
import Link from "next/link";
import type { CSSProperties } from "react";
import { verifySession } from "@/lib/dal";
import { getWorkspaceSummary } from "@/lib/learning/workspace";
import { CERT_META, CERT_ORDER } from "@/lib/learning/cert-meta";
import { GROUP_LABELS, type AchievementGroup, type AchievementStatus, type BadgeTier } from "@/lib/credentials/catalog";
import { looksLikeFullName } from "@/lib/credentials/share";
import { trySyncCredentials, type CredentialsState } from "@/lib/credentials/server";
import { BadgeMedal } from "@/components/badge-medal";
import { BadgeTile, CertificateCard, NewCredentialBanner, shortTitle } from "@/components/achievements";
import { HolderNameForm } from "@/components/holder-name-form";
import { CertEmblem } from "@/components/cert-emblem";
import { EmptyState, SectionHeader } from "@/components/workspace-ui";
import { AlertIcon, ArrowRightIcon, AwardIcon, LinkedInIcon, ShieldCheckIcon, SparkIcon } from "@/components/ui-icons";

export const metadata: Metadata = {
  title: "Conquistas",
};

const TIER_RANK: Record<BadgeTier, number> = { bronze: 0, silver: 1, gold: 2, platinum: 3 };

const GROUP_DESCRIPTIONS: Partial<Record<AchievementGroup, string>> = {
  trilhas: "Marcos de cada trilha preparatória: o primeiro módulo, a trilha completa e a aprovação no simulado.",
  habitos: "Consistência também é competência: sequência de estudos, volume de simulados e revisão.",
  niveis: "Cada nível vem do XP que você acumula concluindo módulos e simulados.",
  diagnostico: "O primeiro passo: medir o seu nível antes de estudar.",
};

export default async function ConquistasPage() {
  const [{ userId, user }, summary] = await Promise.all([verifySession(), getWorkspaceSummary()]);
  const state = await trySyncCredentials(userId, summary.premium);

  return (
    <div className="mx-auto w-full max-w-[1240px] px-4 py-5 sm:px-8 sm:py-8 xl:px-10 xl:py-10">
      {state ? (
        <Achievements state={state} premium={summary.premium} unlocked={summary.certs.filter((cert) => cert.unlocked).map((cert) => cert.id)} name={user.name} />
      ) : (
        <EmptyState
          className="mt-8"
          icon={<AlertIcon className="h-5 w-5" />}
          title="Não conseguimos carregar suas conquistas agora"
          text="Seu progresso está salvo. Tente novamente em alguns instantes."
          action={<Link href="/conquistas" className="ws-btn ws-btn-secondary ws-btn-sm">Tentar de novo</Link>}
        />
      )}
    </div>
  );
}

function Achievements({
  state,
  premium,
  unlocked,
  name,
}: {
  state: CredentialsState;
  premium: boolean;
  unlocked: string[];
  name: string;
}) {
  const visible = state.statuses.filter((status) => status.visible);
  const certificates = visible.filter((status) => status.kind === "certificate");
  const badges = visible.filter((status) => status.kind === "badge");
  const earnedBadges = badges.filter((status) => state.issued.has(status.key)).length;
  const earnedCertificates = certificates.filter((status) => state.issued.has(status.key)).length;
  // Hero showcase: certificates first, then the rarest tiers, then the newest.
  const showcase = [...state.issued.values()]
    .sort((a, b) => (a.issuedAt < b.issuedAt ? 1 : -1))
    .map((credential) => visible.find((status) => status.key === credential.achievement))
    .filter((status): status is AchievementStatus => Boolean(status))
    .sort((a, b) => Number(b.kind === "certificate") - Number(a.kind === "certificate") || TIER_RANK[b.art.tier] - TIER_RANK[a.art.tier])
    .slice(0, 3);
  // Fan order: the top medal goes in the middle, in front.
  const fan = showcase.length === 3 ? [showcase[1], showcase[0], showcase[2]] : showcase;
  // Suggest something the learner can actually earn now (the free diagnostic
  // for free accounts, never a track they haven't unlocked).
  const pending = visible.filter((status) => !state.issued.has(status.key));
  const reachable = pending.filter((status) => status.certId === null || unlocked.includes(status.certId));
  const nextUp =
    (!premium ? pending.find((status) => status.group === "diagnostico") : undefined) ??
    [...reachable].sort((a, b) => b.progress - a.progress)[0] ??
    pending[0];
  const groups: AchievementGroup[] = premium
    ? ["trilhas", "habitos", "niveis", "diagnostico"]
    : ["diagnostico", "trilhas", "habitos", "niveis"];

  return (
    <>
      <NewCredentialBanner state={state} />

      <section className="ws-ink ws-rise p-6 sm:p-8 xl:p-10" aria-labelledby="achievements-title">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="min-w-0">
            <p className="ws-eyebrow flex items-center gap-2 !text-orange-200/80">
              <ShieldCheckIcon className="h-3.5 w-3.5" />
              Conquistas verificáveis
            </p>
            <h1 id="achievements-title" className="mt-4 text-balance text-[2rem] font-semibold leading-[1.06] tracking-[-0.045em] text-white sm:text-[2.6rem]">
              Seu progresso, com prova.
              <span className="block text-slate-400">Pronto para o LinkedIn.</span>
            </h1>
            <p className="mt-4 max-w-xl text-[15px] leading-7 text-slate-400">
              Cada badge e certificado tem um ID único e uma página pública que qualquer recrutador pode verificar. Adicione ao seu perfil em um clique.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="ws-chip ws-chip-glass">
                <AwardIcon className="h-3.5 w-3.5 text-amber-300" />
                <span className="font-mono">{earnedCertificates}/{certificates.length}</span> certificados
              </span>
              <span className="ws-chip ws-chip-glass">
                <SparkIcon className="h-3.5 w-3.5 text-orange-300" />
                <span className="font-mono">{earnedBadges}/{badges.length}</span> badges
              </span>
              <span className="ws-chip ws-chip-glass">
                <LinkedInIcon className="h-3.5 w-3.5 text-sky-300" />
                Integração com LinkedIn
              </span>
            </div>
          </div>

          <div className="relative mx-auto flex h-56 w-full max-w-[22rem] items-center justify-center" aria-hidden="true">
            <span className="absolute inset-x-10 top-6 h-44 rounded-full bg-orange-500/25 blur-[60px]" />
            {fan.length ? (
              fan.map((item, index) => {
                const offset = index - (fan.length - 1) / 2;
                return (
                  <span
                    key={item.key}
                    className="absolute"
                    style={{
                      transform: `translateX(${offset * 92}px) rotate(${offset * 9}deg) scale(${offset === 0 ? 1 : 0.84})`,
                      zIndex: offset === 0 ? 2 : 1,
                    }}
                  >
                    <span className="cm-medal-float" style={{ "--d": index } as CSSProperties}>
                      <BadgeMedal art={item.art} id={`hero-${item.key}`} size={148} />
                    </span>
                  </span>
                );
              })
            ) : nextUp ? (
              <span className="relative flex flex-col items-center">
                <BadgeMedal art={nextUp.art} id={`hero-${nextUp.key}`} size={150} locked />
                <span className="mt-3 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs text-slate-300">
                  Primeira: {shortTitle(nextUp)}
                </span>
              </span>
            ) : null}
          </div>
        </div>
      </section>

      <div className="mt-5">
        <HolderNameForm initialName={name} needsAttention={!looksLikeFullName(name)} />
      </div>

      <section className="mt-12" aria-labelledby="certificates-title">
        <SectionHeader
          id="certificates-title"
          eyebrow={GROUP_LABELS.certificados}
          title="Prontidão por certificação"
          description="Emitido quando você conclui a trilha e mantém média de 75% ou mais nos 3 últimos simulados completos. Inclui QR code de verificação."
        />
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
          {certificates.map((item, index) => (
            <CertificateCard
              key={item.key}
              item={item}
              credential={state.issued.get(item.key)}
              unlocked={item.certId !== null && unlocked.includes(item.certId)}
              delay={index}
            />
          ))}
        </div>
      </section>

      {groups.map((group) => {
        const items = badges.filter((status) => status.group === group);
        if (!items.length) return null;
        const earned = items.filter((status) => state.issued.has(status.key)).length;
        return (
          <section key={group} className="mt-12" aria-labelledby={`group-${group}`}>
            <SectionHeader
              id={`group-${group}`}
              eyebrow={GROUP_LABELS[group]}
              title={
                group === "trilhas"
                  ? "Marcos das trilhas"
                  : group === "habitos"
                    ? "Hábitos de quem passa"
                    : group === "niveis"
                      ? "Níveis da jornada"
                      : "Diagnóstico de nível"
              }
              description={GROUP_DESCRIPTIONS[group]}
              action={<span className="ws-chip font-mono">{earned}/{items.length}</span>}
            />
            {group === "trilhas" ? (
              <div className="mt-5 space-y-6">
                {CERT_ORDER.map((certId) => {
                  const certItems = items.filter((status) => status.certId === certId);
                  if (!certItems.length) return null;
                  const locked = !unlocked.includes(certId);
                  return (
                    <div key={certId}>
                      <div className="mb-3 flex items-center gap-2.5">
                        <CertEmblem certId={certId} size="sm" locked={locked && premium} />
                        <p className="text-sm font-semibold text-ws-ink">{CERT_META[certId].short}</p>
                        <span className="font-mono text-[11px] text-ws-subtle">{CERT_META[certId].code}</span>
                        {locked ? (
                          <Link href={`/pricing?cert=${certId}`} className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-ws-accent-ink">
                            Desbloquear no Premium
                            <ArrowRightIcon className="h-3.5 w-3.5" />
                          </Link>
                        ) : null}
                      </div>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        {certItems.map((item, index) => (
                          <BadgeTile key={item.key} item={item} credential={state.issued.get(item.key)} delay={index} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {items.map((item, index) => (
                  <BadgeTile key={item.key} item={item} credential={state.issued.get(item.key)} delay={index} />
                ))}
              </div>
            )}
          </section>
        );
      })}

      <p className="mt-12 text-center text-xs leading-5 text-ws-subtle">
        Credenciais de preparação emitidas pela CloudMastery. Não substituem as certificações oficiais da AWS, emitidas exclusivamente pela Amazon Web Services.
      </p>
    </>
  );
}
