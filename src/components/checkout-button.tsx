"use client";

import { useState } from "react";

export function CheckoutButton({
  plan,
  children,
  className,
}: {
  plan: "monthly" | "annual";
  children: React.ReactNode;
  className?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      if (res.redirected) {
        window.location.assign(res.url);
        return;
      }

      const data = (await res.json().catch(() => ({}))) as {
        url?: string;
        error?: string;
        redirectTo?: string;
      };
      if (res.ok && data.url) {
        window.location.assign(data.url);
      } else if (data.redirectTo) {
        window.location.assign(data.redirectTo);
      } else {
        setError(data.error ?? "Erro ao iniciar o checkout. Tente novamente.");
      }
    } catch {
      setError("Erro de conexão ao iniciar o checkout. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        aria-busy={loading}
        className={className}
      >
        {loading ? "Abrindo checkout seguro…" : children}
      </button>
      {error && (
        <p role="alert" className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}
