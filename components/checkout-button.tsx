"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
  const router = useRouter();

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      if (res.redirected) {
        router.push(res.url);
        return;
      }

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setLoading(false);
        alert(data.error ?? "Erro ao iniciar o checkout. Tente novamente.");
      }
    } catch {
      setLoading(false);
      alert("Erro ao iniciar o checkout. Tente novamente.");
    }
  }

  return (
    <button onClick={handleClick} disabled={loading} className={className}>
      {loading ? "Carregando..." : children}
    </button>
  );
}
