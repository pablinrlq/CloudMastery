"use client";

import { useEffect, useState } from "react";
import { Instrument_Serif } from "next/font/google";
import { LogoIcon } from "@/components/logo";
import { PrinterIcon } from "@/components/ui-icons";

const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], display: "swap" });

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
    <div>
      {/* Controles (ocultos na impressão) */}
      <div className="ws-card mb-6 flex flex-col gap-4 p-4 sm:flex-row sm:items-end sm:justify-between sm:p-5 print:hidden">
        <label className="block min-w-0 flex-1 sm:max-w-md">
          <span className="text-sm font-semibold text-ws-ink">Seu nome no certificado</span>
          <input
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            className="mt-2 h-11 w-full rounded-xl border border-ws-line/15 bg-ws-raised px-3.5 text-[15px] text-ws-ink outline-none transition-colors placeholder:text-ws-subtle focus:border-ws-accent focus:ring-4 focus:ring-ws-accent/15"
            placeholder="Nome completo"
          />
        </label>
        <button onClick={() => window.print()} className="ws-btn ws-btn-primary">
          <PrinterIcon className="h-4 w-4" />
          Baixar / imprimir PDF
        </button>
      </div>

      {/* O certificado (papel claro em qualquer tema) */}
      <div className="cm-certificate relative overflow-hidden rounded-[1.75rem] border border-[#ecdcc6] bg-[#fffcf6] p-3 text-center shadow-[0_40px_100px_-50px_rgba(15,23,42,0.55)] sm:p-5">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.5]"
          style={{
            backgroundImage:
              "repeating-radial-gradient(circle at 0 0, transparent 0 18px, rgb(234 88 12 / 0.05) 18px 19px), repeating-radial-gradient(circle at 100% 100%, transparent 0 18px, rgb(234 88 12 / 0.05) 18px 19px)",
          }}
        />
        <div className="relative rounded-[1.25rem] border border-[#f0c9a0] px-6 py-10 sm:px-14 sm:py-14">
          <div aria-hidden="true" className="pointer-events-none absolute inset-2 rounded-[0.9rem] border border-dashed border-[#f3d8bb]" />

          <div className="relative">
            <div className="flex items-center justify-center gap-2.5">
              <LogoIcon size={38} />
              <span className="text-xl font-bold tracking-[-0.03em] text-slate-900">
                Cloud<span className="text-orange-600">Mastery</span>
              </span>
            </div>

            <p className="mt-10 font-mono text-[11px] font-semibold uppercase tracking-[0.35em] text-orange-600">Certificado de conclusão</p>

            <p className="mt-9 text-sm text-slate-500">Este certificado é conferido a</p>
            <p className={`${serif.className} mx-auto mt-2 max-w-3xl break-words text-5xl leading-tight text-slate-950 sm:text-7xl`}>
              {name || "—"}
            </p>
            <div className="mx-auto mt-4 h-px max-w-md bg-gradient-to-r from-transparent via-orange-300 to-transparent" />

            <p className="mx-auto mt-8 max-w-lg text-sm leading-7 text-slate-500">
              por concluir integralmente a trilha de preparação e atingir a faixa de prontidão para o exame
            </p>
            <p className={`${serif.className} mt-3 text-3xl text-slate-950 sm:text-4xl`}>{certName}</p>
            <p className="mt-2 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-orange-600">{certCode}</p>

            <div className="mt-10 grid grid-cols-1 items-end gap-8 text-left sm:grid-cols-[1fr_auto_1fr]">
              <div>
                <p className="border-t border-slate-300 pt-2 text-sm font-semibold text-slate-800">{dateStr}</p>
                <p className="text-xs text-slate-500">Data de conclusão</p>
              </div>

              <div className="relative mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 via-orange-400 to-orange-600 shadow-[0_14px_30px_-12px_rgba(234,88,12,.8)]">
                <div className="absolute inset-1.5 rounded-full border border-dashed border-white/60" />
                <div className="flex flex-col items-center text-white">
                  <span className="font-mono text-[9px] uppercase tracking-[0.25em] opacity-90">Prontidão</span>
                  <span className="text-2xl font-bold tracking-[-0.04em]">{bestScore !== null ? `${bestScore}%` : "✓"}</span>
                  <span className="font-mono text-[9px] uppercase tracking-[0.2em] opacity-90">{bestScore !== null ? "melhor nota" : "atingida"}</span>
                </div>
              </div>

              <div className="sm:text-right">
                <p className="border-t border-slate-300 pt-2 text-sm font-semibold text-slate-800">CloudMastery</p>
                <p className="text-xs text-slate-500">Plataforma de preparação</p>
              </div>
            </div>

            <p className="mx-auto mt-10 max-w-2xl text-[10px] leading-relaxed text-slate-400">
              Certificado de conclusão da trilha de estudos CloudMastery. Não constitui a certificação oficial da AWS, que é emitida exclusivamente pela Amazon Web Services após aprovação no exame.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
