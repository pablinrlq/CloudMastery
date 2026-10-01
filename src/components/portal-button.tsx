"use client";

import { useState } from "react";
import { SettingsIcon } from "@/components/ui-icons";

export function PortalButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function openPortal() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/stripe/portal", { method: "POST" });
      const data = (await response.json().catch(() => ({}))) as {
        url?: string;
        error?: string;
      };
      if (response.ok && data.url) {
        window.location.assign(data.url);
        return;
      }
      setError(data.error ?? "Não foi possível abrir o portal da assinatura.");
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={openPortal}
        disabled={loading}
        aria-busy={loading}
        className="ws-btn ws-btn-ghost ws-btn-sm"
      >
        <SettingsIcon className="h-4 w-4" />
        {loading ? "Abrindo portal seguro…" : "Gerenciar assinatura"}
      </button>
      {error && (
        <p role="alert" className="mt-2 text-sm text-ws-danger-ink">
          {error}
        </p>
      )}
    </div>
  );
}
