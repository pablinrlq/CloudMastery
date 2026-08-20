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
      };
      if (res.ok && data.url) {
        window.location.assign(data.url);
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
        <p role="alert" className="mt-2 text-sm font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
