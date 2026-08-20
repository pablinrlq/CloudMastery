"use client";

import { useEffect, useState } from "react";
import { LogoIcon } from "@/components/logo";

// Certificado compartilhável. O nome é editável (default = prefixo do e-mail)
// e persiste em localStorage; a impressão usa o diálogo do navegador (Salvar como PDF).
export function Certificate({
  certName,
  certCode,
  emailPrefix,
  bestScore,
  dateStr,
}: {
  certName: string;
  certCode: string;
  emailPrefix: string;
  bestScore: number | null;
  dateStr: string;
}) {
  const [name, setName] = useState(emailPrefix);

  useEffect(() => {
    const saved = localStorage.getItem("cm-cert-name");
    if (saved) queueMicrotask(() => setName(saved));
  }, []);

  function onNameChange(v: string) {
    setName(v);
    localStorage.setItem("cm-cert-name", v);
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-10 sm:px-6 sm:py-14">
      {/* Controles (ocultos na impressão) */}
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4 print:hidden">
        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
            Seu nome no certificado
          </label>
          <input
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            className="cm-input mt-2 w-80 max-w-full"
            placeholder="Nome completo"
          />
        </div>
        <button
          onClick={() => window.print()}
          className="cm-button-primary"
        >
          Baixar / imprimir PDF
        </button>
      </div>

      {/* O certificado */}
      <div className="cm-certificate relative overflow-hidden rounded-[2rem] border border-slate-200 bg-[#fffdf9] p-8 text-center shadow-[0_35px_100px_-50px_rgba(15,23,42,0.45)] sm:p-16">
        <div className="pointer-events-none absolute inset-4 rounded-[1.4rem] border border-orange-200/80" />
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-orange-100/50 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-amber-100/50 blur-2xl" />

        <div className="relative">
          <div className="flex items-center justify-center gap-2">
            <LogoIcon size={40} />
            <span className="text-xl font-bold text-gray-900">
              Cloud
              <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
                Mastery
              </span>
            </span>
          </div>

          <p className="mt-10 text-xs font-bold uppercase tracking-[0.3em] text-orange-500">
            Certificado de Conclusão
          </p>

          <p className="mt-10 text-sm text-slate-500">Este certificado é conferido a</p>
          <p className="mx-auto mt-3 max-w-2xl border-b border-orange-200 pb-4 text-4xl font-bold tracking-[-0.04em] text-slate-950 sm:text-5xl">
            {name || "—"}
          </p>

          <p className="mx-auto mt-9 max-w-lg text-sm leading-7 text-slate-500">
            por concluir integralmente a trilha de preparação e atingir a faixa de
            prontidão para o exame
          </p>
          <p className="mt-4 text-2xl font-bold tracking-[-0.025em] text-slate-950">{certName}</p>
          <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-orange-600">{certCode}</p>

          {bestScore !== null && (
            <p className="mt-7 inline-block rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700">
              Melhor simulado: {bestScore}%
            </p>
          )}

          <div className="mt-12 flex items-center justify-between text-left text-xs text-slate-500">
            <div>
              <p className="border-t border-slate-300 pt-2 font-bold text-slate-700">
                {dateStr}
              </p>
              <p>Data de conclusão</p>
            </div>
            <div className="text-right">
              <p className="border-t border-slate-300 pt-2 font-bold text-slate-700">
                CloudMastery
              </p>
              <p>Plataforma de preparação</p>
            </div>
          </div>

          <p className="mx-auto mt-10 max-w-2xl text-[10px] leading-relaxed text-slate-400">
            Certificado de conclusão da trilha de estudos CloudMastery. Não constitui
            a certificação oficial da AWS, que é emitida exclusivamente pela Amazon Web
            Services após aprovação no exame.
          </p>
        </div>
      </div>
    </div>
  );
}
