import Link from "next/link";
import { describeAchievement, type Achievement } from "@/lib/credentials/catalog";
import { BadgeMedal } from "@/components/badge-medal";
import { Reveal } from "@/components/reveal";
import { CheckIcon, LinkedInIcon, ShieldCheckIcon } from "@/components/ui-icons";

const PERKS = [
  "Página pública que qualquer recrutador confere pelo ID ou QR code",
  "“Adicionar ao perfil” abre o LinkedIn com nome, emissor, data e ID preenchidos",
  "Imagem pronta para o post, com o seu nome e a medalha",
  "Certificado para imprimir ou salvar em PDF, com QR de verificação",
];

function art(key: string, certId: string | null = null): Achievement["art"] {
  const found = describeAchievement(key, { certId, modulesTotal: 26 });
  if (!found) throw new Error(`Unknown achievement ${key}`);
  return found.art;
}

// Landing showcase for the verifiable credentials: the medals are the real
// ones from the catalog, and the post preview mirrors the share image.
export function LandingCredentials() {
  const certificate = art("ready:ccp", "ccp");
  const trail = [
    { key: "exam-pass:saa", art: art("exam-pass:saa", "saa") },
    { key: "streak-7", art: art("streak-7") },
    { key: "level-5", art: art("level-5") },
  ];

  return (
    <section className="relative overflow-hidden bg-[#080b12] py-24 text-white sm:py-32" aria-labelledby="credenciais-titulo">
      <div className="cm-grid-bg absolute inset-0 opacity-40" />
      <div className="pointer-events-none absolute -left-40 top-10 h-[420px] w-[420px] rounded-full bg-orange-500/15 blur-[120px]" />
      <div className="pointer-events-none absolute -right-40 bottom-0 h-[380px] w-[380px] rounded-full bg-[#0a66c2]/20 blur-[120px]" />

      <div className="cm-container relative grid items-center gap-16 lg:grid-cols-[1fr_1.05fr]">
        <Reveal>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-400">Conquistas verificáveis</p>
          <h2 id="credenciais-titulo" className="mt-4 text-balance text-4xl font-bold tracking-[-0.045em] sm:text-5xl">
            Seu progresso vira credencial. <span className="text-slate-400">Direto no LinkedIn.</span>
          </h2>
          <p className="mt-5 max-w-xl text-lg leading-8 text-slate-400">
            Cada marco da preparação gera uma medalha com ID único. Ao atingir a prontidão, você recebe um certificado que
            qualquer pessoa pode verificar, pronto para o seu perfil.
          </p>
          <ul className="mt-8 space-y-3.5">
            {PERKS.map((perk) => (
              <li key={perk} className="flex items-start gap-3 text-[15px] leading-6 text-slate-300">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-300">
                  <CheckIcon className="h-3.5 w-3.5" strokeWidth={2.6} />
                </span>
                {perk}
              </li>
            ))}
          </ul>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link href="/signup" className="cm-button-primary min-w-48 px-7">
              Começar a conquistar
              <span className="ml-2" aria-hidden>→</span>
            </Link>
            <p className="text-xs leading-5 text-slate-500 sm:max-w-[16rem]">
              Credenciais de preparação da CloudMastery. Não substituem as certificações oficiais da AWS.
            </p>
          </div>
        </Reveal>

        <Reveal delay={120} className="relative mx-auto w-full max-w-[34rem]">
          <figure className="relative z-10 overflow-hidden rounded-[1.6rem] border border-white/10 bg-white text-slate-900 shadow-[0_50px_120px_-40px_rgba(0,0,0,0.9)]">
            <figcaption className="sr-only">Exemplo de publicação de um certificado da CloudMastery no LinkedIn</figcaption>
            <div className="flex items-center gap-3 px-5 pb-3 pt-5">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-orange-300 to-orange-500 text-sm font-bold text-[#1a0d03]">
                MS
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold leading-5">Marina Souza</p>
                <p className="truncate text-xs text-slate-500">Analista de infraestrutura · agora</p>
              </div>
              <LinkedInIcon className="h-5 w-5 text-[#0a66c2]" />
            </div>
            <p className="px-5 pb-4 text-[13.5px] leading-6 text-slate-700">
              Trilha do Cloud Practitioner concluída e prontidão atingida nos simulados. Próximo passo: agendar a prova.
            </p>

            <div className="relative flex items-center gap-4 overflow-hidden bg-[#070a12] px-5 py-6 text-white sm:gap-6 sm:px-7">
              <div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-orange-500/30 blur-[60px]" />
              <BadgeMedal art={certificate} id="landing-certificate" size={118} className="relative" />
              <div className="relative min-w-0">
                <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
                  <ShieldCheckIcon className="h-3.5 w-3.5" />
                  Certificado verificável
                </p>
                <p className="mt-2 text-lg font-semibold leading-tight tracking-[-0.02em] sm:text-xl">
                  Certificado de prontidão · Cloud Practitioner
                </p>
                <p className="mt-2 text-xs text-slate-400">Emitida para</p>
                <p className="text-sm font-semibold">Marina Souza</p>
                <p className="mt-2 font-mono text-[11px] tracking-wide text-slate-500">CM-7K2Q-M4XD-9HTA</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-4">
              <p className="min-w-0 truncate font-mono text-[11px] text-slate-500">cloudmastery · /c/CM-7K2Q-M4XD-9HTA</p>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0a66c2] px-3 py-1.5 text-xs font-semibold text-white">
                <LinkedInIcon className="h-3.5 w-3.5" />
                Adicionar ao perfil
              </span>
            </div>
          </figure>

          <div className="relative z-10 mt-4 flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5 backdrop-blur sm:px-5">
            <div className="flex shrink-0 -space-x-3" aria-hidden="true">
              {trail.map((medal) => (
                <BadgeMedal key={medal.key} art={medal.art} id={`landing-${medal.key}`} size={56} />
              ))}
            </div>
            <p className="text-sm leading-6 text-slate-400">
              <span className="font-semibold text-white">E um badge a cada marco:</span> trilha concluída, aprovação no
              simulado, sequência de estudos e níveis.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
