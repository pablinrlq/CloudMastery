import Link from "next/link";
import type { CSSProperties } from "react";
import { BadgeMedal } from "@/components/badge-medal";
import { ProgressBar } from "@/components/workspace-ui";
import { ArrowRightIcon, AwardIcon, LinkedInIcon, LockIcon, ShareIcon, SparkIcon } from "@/components/ui-icons";
import { CERT_META, type CertKey } from "@/lib/learning/cert-meta";
import type { AchievementStatus } from "@/lib/credentials/catalog";
import { credentialPath, formatIssuedDate } from "@/lib/credentials/share";
import { credentialLinks, type CredentialsState, type IssuedCredential } from "@/lib/credentials/server";

export function shortTitle(item: Pick<AchievementStatus, "title" | "group">) {
  return item.group === "trilhas" ? item.title.split(" · ")[0] : item.title;
}

/** Celebrates credentials issued during this request. */
export function NewCredentialBanner({ state }: { state: CredentialsState }) {
  const [first, ...rest] = state.fresh;
  if (!first) return null;
  const item = state.statuses.find((status) => status.key === first.achievement);
  if (!item) return null;

  return (
    <section
      aria-live="polite"
      aria-label="Nova conquista"
      className="ws-ink ws-pop cm-celebrate relative mb-5 flex flex-col items-start gap-5 overflow-hidden p-5 sm:flex-row sm:items-center sm:p-6"
    >
      <span aria-hidden="true" className="cm-confetti" />
      <BadgeMedal art={item.art} id={`fresh-${item.key}`} size={84} className="cm-medal-pop" />
      <div className="relative min-w-0 flex-1">
        <p className="ws-eyebrow flex items-center gap-2 !text-amber-200/90">
          <SparkIcon className="h-3.5 w-3.5" />
          {first.kind === "certificate" ? "Certificado emitido" : "Nova conquista desbloqueada"}
        </p>
        <h2 className="mt-1.5 text-balance text-xl font-semibold tracking-[-0.025em] text-white sm:text-[1.4rem]">{first.title}</h2>
        <p className="mt-1 text-sm text-slate-400">
          {rest.length
            ? `E mais ${rest.length} ${rest.length === 1 ? "conquista" : "conquistas"}. Todas já têm página pública verificável.`
            : "Já tem página pública verificável e vai para o LinkedIn em um clique."}
        </p>
      </div>
      <div className="relative flex w-full flex-wrap gap-2 sm:w-auto">
        <Link href={credentialPath(first.code)} className="ws-btn ws-btn-primary">
          <ShareIcon className="h-4 w-4" />
          Compartilhar
        </Link>
        {rest.length ? (
          <Link href="/conquistas" className="ws-btn ws-btn-glass">
            Ver todas
          </Link>
        ) : null}
      </div>
    </section>
  );
}

/** Compact showcase for the dashboard: latest medals, then the closest ones. */
export function AchievementsStrip({ state }: { state: CredentialsState }) {
  const visible = state.statuses.filter((status) => status.visible);
  const earned = visible
    .filter((status) => state.issued.has(status.key))
    .sort((a, b) => (state.issued.get(b.key)!.issuedAt > state.issued.get(a.key)!.issuedAt ? 1 : -1));
  const next = visible
    .filter((status) => !state.issued.has(status.key))
    .sort((a, b) => b.progress - a.progress);
  const shown = [...earned.slice(0, 6), ...next].slice(0, 6);
  const certificates = earned.filter((status) => status.kind === "certificate").length;
  const closest = next[0];

  return (
    <section className="ws-card ws-rise overflow-hidden p-5 sm:p-6" aria-labelledby="achievements-strip-title">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="ws-eyebrow">Conquistas</p>
          <h2 id="achievements-strip-title" className="ws-h2 mt-1.5">Sua vitrine verificável</h2>
          <p className="mt-1.5 max-w-xl text-sm leading-6 text-ws-muted">
            {earned.length
              ? `${earned.length} ${earned.length === 1 ? "conquista" : "conquistas"}${certificates ? ` · ${certificates} ${certificates === 1 ? "certificado" : "certificados"}` : ""}. Cada uma tem página pública e vai para o LinkedIn em um clique.`
              : "Badges e certificados com página pública e ID de verificação, prontos para o LinkedIn."}
          </p>
        </div>
        <Link href="/conquistas" className="ws-btn ws-btn-secondary ws-btn-sm">
          <AwardIcon className="h-4 w-4" />
          Ver conquistas
        </Link>
      </div>

      <ul className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-6">
        {shown.map((item, index) => {
          const credential = state.issued.get(item.key);
          const medal = (
            <BadgeMedal art={item.art} id={`strip-${item.key}`} size={76} locked={!credential} className="transition-transform duration-500 group-hover:-translate-y-1 group-hover:-rotate-3" />
          );
          return (
            <li key={item.key} className="ws-rise flex min-w-0 flex-col items-center text-center" style={{ "--d": index } as CSSProperties}>
              {credential ? (
                <Link href={credentialPath(credential.code)} className="group flex flex-col items-center rounded-2xl p-1 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ws-accent/20" title={item.title}>
                  {medal}
                </Link>
              ) : (
                <span className="group flex flex-col items-center p-1" title={`${item.title} · ${item.criteria}`}>{medal}</span>
              )}
              <span className="mt-1 line-clamp-2 text-[11px] font-medium leading-4 text-ws-muted">{shortTitle(item)}</span>
            </li>
          );
        })}
      </ul>

      {closest ? (
        <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl bg-ws-sunken px-4 py-3">
          <LockIcon className="h-4 w-4 shrink-0 text-ws-subtle" />
          <p className="min-w-0 flex-1 text-sm text-ws-muted">
            Próxima: <span className="font-medium text-ws-ink">{closest.title}</span>
            <span className="text-ws-subtle"> · {closest.progressLabel}</span>
          </p>
          <span className="w-24 shrink-0">
            <ProgressBar value={closest.progress * 100} />
          </span>
        </div>
      ) : null}
    </section>
  );
}

export function CertificateCard({
  item,
  credential,
  unlocked,
  delay,
}: {
  item: AchievementStatus;
  credential: IssuedCredential | undefined;
  unlocked: boolean;
  delay: number;
}) {
  const certId = item.certId as CertKey;
  const meta = CERT_META[certId];
  const links = credential ? credentialLinks(credential) : null;

  return (
    <article className="ws-card ws-card-hover ws-rise group flex flex-col overflow-hidden" style={{ "--d": delay } as CSSProperties}>
      <div
        className="relative flex items-center gap-4 overflow-hidden p-5 text-white"
        style={{ background: `radial-gradient(120% 140% at 0% 0%, ${meta.color}55, transparent 58%), linear-gradient(160deg, #0d1322, #070a12)` }}
      >
        <span aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:radial-gradient(#fff_1px,transparent_1px)] [background-size:14px_14px]" />
        <BadgeMedal art={item.art} id={`cert-${item.key}`} size={92} locked={!credential} className="relative transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-[1.04]" />
        <div className="relative min-w-0">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-slate-400">
            {meta.code} · {meta.tier}
          </p>
          <h3 className="mt-1 text-[17px] font-semibold tracking-[-0.02em]">{meta.short}</h3>
          <p className="mt-0.5 text-xs text-slate-400">Certificado de prontidão</p>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        {credential && links ? (
          <>
            <p className="text-sm text-ws-muted">
              Emitido em <span className="font-medium text-ws-ink">{formatIssuedDate(credential.issuedAt)}</span>
            </p>
            <p className="mt-2">
              <span className="ws-chip font-mono !text-[11px] !tracking-wide">{credential.code}</span>
            </p>
            <div className="mt-auto flex flex-wrap gap-2 pt-5">
              <Link href={`/certificado/${certId}`} className="ws-btn ws-btn-secondary ws-btn-sm">
                Ver certificado
              </Link>
              <a
                href={links.linkedInAddUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ws-btn ws-btn-sm !bg-[#0a66c2] !text-white hover:!bg-[#0b5cad]"
              >
                <LinkedInIcon className="h-4 w-4" />
                Adicionar
              </a>
              <Link href={credentialPath(credential.code)} className="ws-btn ws-btn-ghost ws-btn-sm">
                Página pública
              </Link>
            </div>
          </>
        ) : !unlocked ? (
          <>
            <p className="text-sm leading-6 text-ws-muted">Trilha, simulados e certificado fazem parte do Premium.</p>
            <Link href={`/pricing?cert=${certId}`} className="group/cta mt-auto inline-flex items-center gap-1.5 self-start pt-5 text-sm font-semibold text-ws-accent-ink">
              Desbloquear {meta.tag}
              <ArrowRightIcon className="h-4 w-4 transition-transform group-hover/cta:translate-x-0.5" />
            </Link>
          </>
        ) : (
          <>
            <ProgressBar value={item.progress * 100} delay={delay} label={`${Math.round(item.progress * 100)}% do certificado`} />
            <p className="mt-2 font-mono text-[11px] leading-5 text-ws-subtle">{item.progressLabel}</p>
            <p className="mt-3 text-sm leading-6 text-ws-muted">{item.criteria}</p>
            <Link href={`/certificado/${certId}`} className="group/cta mt-auto inline-flex items-center gap-1.5 self-start pt-5 text-sm font-semibold text-ws-accent-ink">
              Ver requisitos
              <ArrowRightIcon className="h-4 w-4 transition-transform group-hover/cta:translate-x-0.5" />
            </Link>
          </>
        )}
      </div>
    </article>
  );
}

export function BadgeTile({
  item,
  credential,
  delay,
}: {
  item: AchievementStatus;
  credential: IssuedCredential | undefined;
  delay: number;
}) {
  const links = credential ? credentialLinks(credential) : null;
  const name = shortTitle(item);

  return (
    <article
      className={`ws-card ws-rise group relative flex flex-col items-center p-5 text-center ${credential ? "ws-card-hover" : ""}`}
      style={{ "--d": delay } as CSSProperties}
    >
      <BadgeMedal
        art={item.art}
        id={`tile-${item.key}`}
        size={108}
        locked={!credential}
        title={credential ? item.title : `${item.title} (bloqueada)`}
        className="transition-transform duration-500 group-hover:-translate-y-1 group-hover:-rotate-3"
      />
      <h3 className="mt-3 text-[14px] font-semibold tracking-[-0.01em] text-ws-ink">{name}</h3>
      <p className="mt-1 text-xs leading-5 text-ws-muted">{credential ? item.description : item.criteria}</p>
      <div className="mt-auto w-full pt-4">
        {credential && links ? (
          <>
            <p className="font-mono text-[11px] text-ws-subtle">Conquistado em {formatIssuedDate(credential.issuedAt)}</p>
            <div className="mt-3 flex justify-center gap-2">
              <Link href={credentialPath(credential.code)} className="ws-btn ws-btn-secondary ws-btn-sm">
                <ShareIcon className="h-4 w-4" />
                Compartilhar
              </Link>
              <a
                href={links.linkedInAddUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Adicionar "${item.title}" ao LinkedIn`}
                title="Adicionar ao perfil do LinkedIn"
                className="ws-btn ws-btn-sm !w-9 !px-0 !bg-[#0a66c2] !text-white hover:!bg-[#0b5cad]"
              >
                <LinkedInIcon className="h-4 w-4" />
              </a>
            </div>
          </>
        ) : (
          <>
            <ProgressBar value={item.progress * 100} tone="neutral" delay={delay} />
            <p className="mt-2 font-mono text-[11px] text-ws-subtle">{item.progressLabel}</p>
          </>
        )}
      </div>
    </article>
  );
}
