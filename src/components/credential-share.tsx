"use client";

import { useState } from "react";
import {
  linkedInShareUrl,
  shareCaption,
  whatsappShareUrl,
  xShareUrl,
} from "@/lib/credentials/share";
import { CheckIcon, CopyIcon, DownloadIcon, LinkIcon, LinkedInIcon } from "@/components/ui-icons";

type Copied = "link" | "caption" | null;

// Share actions for a credential. "Adicionar ao perfil" opens LinkedIn's
// Licenses & certifications form prefilled with name, issuer, date, ID and URL.
export function CredentialShare({
  url,
  title,
  kind,
  linkedInAddUrl,
  imageUrl,
  tone = "surface",
}: {
  url: string;
  title: string;
  kind: "badge" | "certificate";
  linkedInAddUrl: string;
  imageUrl: string;
  tone?: "surface" | "ink";
}) {
  const [copied, setCopied] = useState<Copied>(null);
  const caption = shareCaption({ title, url, kind });
  const ink = tone === "ink";

  async function copy(value: string, which: Exclude<Copied, null>) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(which);
      window.setTimeout(() => setCopied((current) => (current === which ? null : current)), 2200);
    } catch {
      window.prompt("Copie o texto:", value);
    }
  }

  const secondary = ink ? "ws-btn ws-btn-glass ws-btn-sm" : "ws-btn ws-btn-secondary ws-btn-sm";

  return (
    <div className="space-y-2.5">
      <a
        href={linkedInAddUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="ws-btn ws-btn-lg w-full !bg-[#0a66c2] !text-white shadow-[0_14px_30px_-14px_rgba(10,102,194,.9)] hover:!bg-[#0b5cad]"
      >
        <LinkedInIcon className="h-[18px] w-[18px]" />
        Adicionar ao perfil do LinkedIn
      </a>
      <div className="grid grid-cols-2 gap-2">
        <a href={linkedInShareUrl(url)} target="_blank" rel="noopener noreferrer" className={secondary}>
          <LinkedInIcon className="h-4 w-4" />
          Publicar
        </a>
        <button type="button" onClick={() => copy(url, "link")} className={secondary} aria-live="polite">
          {copied === "link" ? <CheckIcon className="h-4 w-4" /> : <LinkIcon className="h-4 w-4" />}
          {copied === "link" ? "Link copiado" : "Copiar link"}
        </button>
        <button type="button" onClick={() => copy(caption, "caption")} className={secondary} aria-live="polite">
          {copied === "caption" ? <CheckIcon className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
          {copied === "caption" ? "Texto copiado" : "Texto do post"}
        </button>
        <a href={imageUrl} download className={secondary}>
          <DownloadIcon className="h-4 w-4" />
          Baixar imagem
        </a>
      </div>
      <p className={`flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 text-xs ${ink ? "text-slate-400" : "text-ws-subtle"}`}>
        Também em
        <a href={whatsappShareUrl(caption)} target="_blank" rel="noopener noreferrer" className={`font-semibold underline-offset-4 hover:underline ${ink ? "text-slate-200" : "text-ws-ink"}`}>
          WhatsApp
        </a>
        <a href={xShareUrl(caption.replace(` ${url}`, "").replace(`: ${url}`, ""), url)} target="_blank" rel="noopener noreferrer" className={`font-semibold underline-offset-4 hover:underline ${ink ? "text-slate-200" : "text-ws-ink"}`}>
          X
        </a>
      </p>
    </div>
  );
}
