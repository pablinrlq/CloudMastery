"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "@/components/logo";

export function SiteHeader({ loggedIn }: { loggedIn: boolean }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        setProgress(max > 0 ? Math.min(1, y / max) : 0);
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className="sticky top-0 z-50 border-b border-white/10 backdrop-blur-xl"
      style={{ backgroundColor: "rgba(8,11,18,0.9)" }}
    >
      <nav className="cm-container flex h-[72px] items-center justify-between">
        <Logo dark size={34} />
        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/pricing"
            className="hidden rounded-xl px-3 py-2 text-sm font-semibold text-slate-400 transition hover:bg-white/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/40 sm:inline-flex"
          >
            Planos
          </Link>

          {loggedIn ? (
            <Link
              href="/dashboard"
              className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/40"
            >
              DashBoard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/40"
              >
                Entrar
              </Link>
              <Link
                href="/signup"
                className="inline-flex min-h-10 items-center rounded-xl bg-orange-500 px-4 text-sm font-bold text-white shadow-[0_8px_24px_rgba(249,115,22,0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-orange-400 hover:shadow-[0_12px_28px_rgba(249,115,22,0.3)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-400/25 active:translate-y-0"
              >
                Criar conta
              </Link>
            </>
          )}
        </div>
      </nav>
      <div className="h-px w-full bg-white/5">
        <div className="h-full bg-gradient-to-r from-orange-400 to-amber-300 transition-[width] duration-150 ease-out" style={{ width: `${progress * 100}%` }} />
      </div>
    </header>
  );
}
