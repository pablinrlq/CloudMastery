"use client";

import { useEffect, useState } from "react";

// Aplica o tema antes da hidratação para evitar flash (ver script no layout).
export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored =
      (localStorage.getItem("cm-theme") as "light" | "dark" | null) ??
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    queueMicrotask(() => {
      setTheme(stored);
      setMounted(true);
    });
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("cm-theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  }

  // Evita mismatch de hidratação: renderiza um placeholder até montar.
  if (!mounted) {
    return <span className="inline-block h-10 w-10" aria-hidden />;
  }

  return (
    <button
      onClick={toggle}
      aria-label={theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"}
      className="flex h-10 w-10 items-center justify-center rounded-xl border border-transparent text-slate-500 transition-all duration-200 hover:border-slate-200 hover:bg-white hover:text-slate-950 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/30 dark:text-slate-400 dark:hover:border-white/10 dark:hover:bg-white/5 dark:hover:text-white"
    >
      {theme === "dark" ? (
        // sol
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      ) : (
        // lua
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
        </svg>
      )}
    </button>
  );
}
