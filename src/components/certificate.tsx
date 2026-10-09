import { Instrument_Serif } from "next/font/google";
import { LogoIcon } from "@/components/logo";
import { HolderName } from "@/components/holder-name";

const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], display: "swap" });

// Printable certificate (light paper in any theme). The name comes from the
// account and the ID/QR point to the public verification page, so a printed
// or shared copy can always be checked.
export function Certificate({
  holderName,
  certName,
  certCode,
  credentialCode,
  issuedOn,
  verifyUrl,
  qrSvg,
  recentAverage,
  modulesTotal,
}: {
  holderName: string;
  certName: string;
  certCode: string;
  credentialCode: string;
  issuedOn: string;
  verifyUrl: string;
  qrSvg: string;
  recentAverage: number | null;
  modulesTotal: number | null;
}) {
  const verifyLabel = verifyUrl.replace(/^https?:\/\//, "");

  return (
    <div className="cm-certificate relative overflow-hidden rounded-[1.75rem] border border-[#ecdcc6] bg-[#fffcf6] p-3 text-center shadow-[0_40px_100px_-50px_rgba(15,23,42,0.55)] sm:p-5">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage:
            "repeating-radial-gradient(circle at 0 0, transparent 0 18px, rgb(234 88 12 / 0.05) 18px 19px), repeating-radial-gradient(circle at 100% 100%, transparent 0 18px, rgb(234 88 12 / 0.05) 18px 19px)",
        }}
      />
      <div className="relative rounded-[1.25rem] border border-[#f0c9a0] px-6 py-10 sm:px-14 sm:py-12">
        <div aria-hidden="true" className="pointer-events-none absolute inset-2 rounded-[0.9rem] border border-dashed border-[#f3d8bb]" />

        <div className="relative">
          <div className="flex items-center justify-center gap-2.5">
            <LogoIcon size={38} />
            <span className="text-xl font-bold tracking-[-0.03em] text-slate-900">
              Cloud<span className="text-orange-600">Mastery</span>
            </span>
          </div>

          <p className="mt-9 font-mono text-[11px] font-semibold uppercase tracking-[0.35em] text-orange-600">Certificado de prontidão</p>

          <p className="mt-8 text-sm text-slate-500">Este certificado é conferido a</p>
          <p className={`${serif.className} mx-auto mt-2 max-w-3xl break-words text-5xl leading-tight text-slate-950 sm:text-7xl`}>
            <HolderName initial={holderName} />
          </p>
          <div className="mx-auto mt-4 h-px max-w-md bg-gradient-to-r from-transparent via-orange-300 to-transparent" />

          <p className="mx-auto mt-7 max-w-lg text-sm leading-7 text-slate-500">
            por concluir integralmente a trilha preparatória{modulesTotal ? ` (${modulesTotal} módulos)` : ""} e atingir a faixa de prontidão para o exame
          </p>
          <p className={`${serif.className} mt-3 text-3xl text-slate-950 sm:text-4xl`}>{certName}</p>
          <p className="mt-2 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-orange-600">{certCode}</p>

          <div className="mt-10 grid grid-cols-1 items-end gap-8 text-left sm:grid-cols-[1fr_auto_1fr]">
            <div>
              <p className="border-t border-slate-300 pt-2 text-sm font-semibold text-slate-800">{issuedOn}</p>
              <p className="text-xs text-slate-500">Data de emissão</p>
            </div>

            <div className="relative mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 via-orange-400 to-orange-600 shadow-[0_14px_30px_-12px_rgba(234,88,12,.8)]">
              <div className="absolute inset-1.5 rounded-full border border-dashed border-white/60" />
              <div className="flex flex-col items-center text-white">
                <span className="font-mono text-[9px] uppercase tracking-[0.25em] opacity-90">Média</span>
                <span className="text-2xl font-bold tracking-[-0.04em]">{recentAverage !== null ? `${recentAverage}%` : "✓"}</span>
                <span className="font-mono text-[9px] uppercase tracking-[0.2em] opacity-90">{recentAverage !== null ? "3 simulados" : "prontidão"}</span>
              </div>
            </div>

            <div className="sm:text-right">
              <p className="border-t border-slate-300 pt-2 text-sm font-semibold text-slate-800">CloudMastery</p>
              <p className="text-xs text-slate-500">Plataforma de preparação</p>
            </div>
          </div>

          <div className="mx-auto mt-10 flex max-w-xl items-center gap-4 rounded-2xl border border-[#f0dcc4] bg-white/70 p-3 text-left">
            <span
              aria-hidden="true"
              className="block h-[72px] w-[72px] shrink-0 rounded-lg bg-white p-1.5 [&>svg]:h-full [&>svg]:w-full"
              dangerouslySetInnerHTML={{ __html: qrSvg }}
            />
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Verifique a autenticidade</p>
              <p className="mt-1 break-all font-mono text-[12px] font-semibold text-slate-900">{verifyLabel}</p>
              <p className="mt-0.5 font-mono text-[11px] text-slate-500">ID da credencial {credentialCode}</p>
            </div>
          </div>

          <p className="mx-auto mt-8 max-w-2xl text-[10px] leading-relaxed text-slate-400">
            Certificado de prontidão da trilha preparatória CloudMastery. Não constitui a certificação oficial da AWS, que é emitida exclusivamente pela Amazon Web Services após aprovação no exame.
          </p>
        </div>
      </div>
    </div>
  );
}
