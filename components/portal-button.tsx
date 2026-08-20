"use client";

import { useState } from "react";

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
    <div className="mt-8 border-t border-gray-200 pt-6 dark:border-gray-800">
      <button
        type="button"
        onClick={openPortal}
        disabled={loading}
        aria-busy={loading}
        className="text-sm font-medium text-gray-600 underline decoration-dotted underline-offset-4 hover:text-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-400 dark:hover:text-orange-400"
      >
        {loading ? "Abrindo portal seguro…" : "Gerenciar ou cancelar assinatura"}
      </button>
      {error && (
        <p role="alert" className="mt-2 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
