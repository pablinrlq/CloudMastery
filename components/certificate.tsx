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
    if (saved) setName(saved);
  }, []);

  function onNameChange(v: string) {
    setName(v);
    localStorage.setItem("cm-cert-name", v);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      {/* Controles (ocultos na impressão) */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4 print:hidden">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Seu nome no certificado
          </label>
          <input
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            className="mt-1 w-72 rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            placeholder="Nome completo"
          />
        </div>
        <button
          onClick={() => window.print()}
          className="rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-3 font-semibold text-white shadow-lg shadow-orange-500/25 transition hover:scale-[1.02]"
        >
          Baixar / imprimir PDF
        </button>
      </div>

      {/* O certificado */}
      <div className="cm-certificate relative overflow-hidden rounded-3xl border-4 border-orange-400 bg-white p-10 text-center shadow-2xl sm:p-14">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-orange-100/60" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-amber-100/60" />

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

          <p className="mt-8 text-sm uppercase tracking-[0.3em] text-gray-400">
            Certificado de Conclusão
          </p>

          <p className="mt-8 text-sm text-gray-500">Este certificado é conferido a</p>
          <p className="mt-2 border-b-2 border-orange-200 pb-2 text-4xl font-extrabold text-gray-900">
            {name || "—"}
          </p>

          <p className="mx-auto mt-8 max-w-lg text-gray-600">
            por concluir integralmente a trilha de preparação e atingir a faixa de
            prontidão para o exame
          </p>
          <p className="mt-3 text-2xl font-bold text-gray-900">{certName}</p>
          <p className="text-sm font-medium text-orange-600">{certCode}</p>

          {bestScore !== null && (
            <p className="mt-6 inline-block rounded-full bg-green-100 px-4 py-1.5 text-sm font-semibold text-green-700">
              Melhor simulado: {bestScore}%
            </p>
          )}

          <div className="mt-10 flex items-center justify-between text-left text-xs text-gray-500">
            <div>
              <p className="border-t border-gray-300 pt-1 font-medium text-gray-700">
                {dateStr}
              </p>
              <p>Data de conclusão</p>
            </div>
            <div className="text-right">
              <p className="border-t border-gray-300 pt-1 font-medium text-gray-700">
                CloudMastery
              </p>
              <p>Plataforma de preparação</p>
            </div>
          </div>

          <p className="mt-8 text-[10px] leading-relaxed text-gray-400">
            Certificado de conclusão da trilha de estudos CloudMastery. Não constitui
            a certificação oficial da AWS, que é emitida exclusivamente pela Amazon Web
            Services após aprovação no exame.
          </p>
        </div>
      </div>
    </div>
  );
}
