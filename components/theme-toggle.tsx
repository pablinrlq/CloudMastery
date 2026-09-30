"use client";

import { useEffect, useState } from "react";
import { MoonIcon, SunIcon } from "@/components/ui-icons";

type Theme = "light" | "dark";

function applyTheme(next: Theme) {
  localStorage.setItem("cm-theme", next);
  document.documentElement.classList.toggle("dark", next === "dark");
}

// O tema é aplicado antes da hidratação pelo script do layout raiz; aqui só
// refletimos o estado. Até montar, nenhum botão aparece ativo (sem mismatch).
export function ThemeToggle({ variant = "icon" }: { variant?: "icon" | "segmented" }) {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const stored =
      (localStorage.getItem("cm-theme") as Theme | null) ??
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    queueMicrotask(() => setTheme(stored));
  }, []);

  function choose(next: Theme) {
    setTheme(next);
    applyTheme(next);
  }

  if (variant === "segmented") {
    return (
      <div role="radiogroup" aria-label="Aparência" className="grid grid-cols-2 gap-1 rounded-xl border border-white/10 bg-black/25 p-1">
        {([
          ["light", "Claro", SunIcon],
          ["dark", "Escuro", MoonIcon],
        ] as const).map(([value, label, Icon]) => {
          const active = theme === value;
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => choose(value)}
              className={`flex h-8 items-center justify-center gap-1.5 rounded-lg text-xs font-semibold transition-colors ${
                active ? "bg-white/[0.12] text-white shadow-[inset_0_1px_0_rgba(255,255,255,.08)]" : "text-slate-400 hover:text-white"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          );
        })}
      </div>
    );
  }

  const dark = theme === "dark";
  return (
    <button
      type="button"
      onClick={() => choose(dark ? "light" : "dark")}
      aria-label={dark ? "Ativar modo claro" : "Ativar modo escuro"}
      className="ws-btn ws-btn-ghost ws-btn-sm h-9 w-9 !px-0"
    >
      {theme === null ? <span className="h-4 w-4" /> : dark ? <SunIcon className="h-[18px] w-[18px]" /> : <MoonIcon className="h-[18px] w-[18px]" />}
    </button>
  );
}
