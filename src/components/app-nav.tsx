"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { logout } from "@/app/(auth)/actions";
import { CERT_META, CERT_ORDER, type CertKey } from "@/lib/learning/cert-meta";
import { CertEmblem } from "@/components/cert-emblem";
import { ProgressRing } from "@/components/progress-ring";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  AwardIcon,
  BookIcon,
  CardsIcon,
  DashboardIcon,
  FlameIcon,
  LockIcon,
  LogoutIcon,
  PracticeIcon,
} from "@/components/ui-icons";

export type NavCert = {
  id: CertKey;
  unlocked: boolean;
  completed: number;
  total: number;
  pct: number;
};

const CERT_ROUTE = /^\/(course|simulado|flashcards|certificado)\/(ccp|saa|aif)(?:\/|$)/;

function activeCertFrom(pathname: string): CertKey | null {
  return (CERT_ROUTE.exec(pathname)?.[2] as CertKey | undefined) ?? null;
}

function certSections(certId: CertKey) {
  return [
    { href: `/course/${certId}`, label: "Trilha", icon: BookIcon },
    { href: `/simulado/${certId}`, label: "Simulados", icon: PracticeIcon },
    { href: `/flashcards/${certId}`, label: "Flashcards", icon: CardsIcon },
    { href: `/certificado/${certId}`, label: "Certificado", icon: AwardIcon },
  ];
}

function isSectionActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function certHref(cert: NavCert) {
  return cert.unlocked ? `/course/${cert.id}` : `/simulado/${cert.id}`;
}

export function SidebarNav({ certs, premium }: { certs: NavCert[]; premium: boolean }) {
  const pathname = usePathname();
  const activeCert = activeCertFrom(pathname);
  const ordered = CERT_ORDER.map((id) => certs.find((cert) => cert.id === id)).filter(Boolean) as NavCert[];

  return (
    <nav aria-label="Área de estudos" className="space-y-7">
      <div>
        <p className="ws-eyebrow mb-2 px-2.5 !text-slate-500">Navegação</p>
        <Link href="/dashboard" aria-current={pathname === "/dashboard" ? "page" : undefined} className="ws-nav-link">
          <span className="flex h-7 w-7 items-center justify-center rounded-[9px] bg-white/[0.06] text-slate-300">
            <DashboardIcon className="h-4 w-4" />
          </span>
          Visão geral
        </Link>
      </div>

      <div>
        <p className="ws-eyebrow mb-2 px-2.5 !text-slate-500">{premium ? "Suas trilhas" : "Diagnóstico gratuito"}</p>
        <ul className="space-y-1">
          {ordered.map((cert) => {
            const meta = CERT_META[cert.id];
            const open = activeCert === cert.id;
            return (
              <li key={cert.id}>
                <Link
                  href={certHref(cert)}
                  aria-current={open && pathname === certHref(cert) ? "page" : undefined}
                  className={`ws-nav-link ${open ? "text-white" : ""}`}
                >
                  <CertEmblem certId={cert.id} size="xs" locked={!cert.unlocked && premium} />
                  <span className="min-w-0 flex-1 leading-tight">
                    <span className="block truncate text-[13px] font-medium">{meta.short}</span>
                    <span className="mt-0.5 block font-mono text-[10px] tracking-wide text-slate-500">
                      {meta.code}
                      {cert.unlocked ? ` · ${cert.pct}%` : premium ? " · bloqueada" : " · 30 questões"}
                    </span>
                  </span>
                  {cert.unlocked ? (
                    <ProgressRing
                      id={`nav-ring-${cert.id}`}
                      size={24}
                      rings={[{ value: cert.pct, tone: cert.pct >= 100 ? "success" : "accent", width: 3 }]}
                      glass
                      label={`${cert.pct}% da trilha concluída`}
                    />
                  ) : premium ? (
                    <LockIcon className="h-3.5 w-3.5 text-slate-500" />
                  ) : null}
                </Link>

                {open && cert.unlocked ? (
                  <ul className="relative ml-[1.35rem] mt-1 space-y-0.5 border-l border-white/10 pb-1 pl-3">
                    {certSections(cert.id).map((section) => {
                      const active = isSectionActive(pathname, section.href);
                      const Icon = section.icon;
                      return (
                        <li key={section.href}>
                          <Link
                            href={section.href}
                            aria-current={active ? "page" : undefined}
                            className={`flex h-8 items-center gap-2.5 rounded-lg px-2.5 text-[13px] transition-colors ${
                              active ? "bg-white/[0.08] font-medium text-white" : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
                            }`}
                          >
                            <Icon className={`h-3.5 w-3.5 ${active ? "text-orange-400" : ""}`} />
                            {section.label}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}

export function MobileTabBar({ certs }: { certs: NavCert[] }) {
  const pathname = usePathname();
  const activeCert = activeCertFrom(pathname);
  const ordered = CERT_ORDER.map((id) => certs.find((cert) => cert.id === id)).filter(Boolean) as NavCert[];

  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-50 lg:hidden"
    >
      <div className="ws-tabbar mx-auto grid max-w-md grid-cols-4 gap-1 p-1.5">
        <Link href="/dashboard" aria-current={pathname === "/dashboard" ? "page" : undefined} className="ws-tab">
          <DashboardIcon className="h-[18px] w-[18px]" />
          Início
        </Link>
        {ordered.map((cert) => (
          <Link
            key={cert.id}
            href={certHref(cert)}
            aria-current={activeCert === cert.id ? "page" : undefined}
            className="ws-tab"
          >
            <span className="relative">
              <CertEmblem certId={cert.id} size="xs" className="!h-[22px] !w-[22px] !rounded-[7px] [&>svg]:!h-3 [&>svg]:!w-3" />
            </span>
            {CERT_META[cert.id].tag}
          </Link>
        ))}
      </div>
    </nav>
  );
}

// Seções da certificação no mobile (no desktop, ficam na sidebar).
export function MobileCertTabs({ certs }: { certs: NavCert[] }) {
  const pathname = usePathname();
  const activeCert = activeCertFrom(pathname);
  const cert = certs.find((item) => item.id === activeCert);
  if (!cert || !cert.unlocked) return null;

  return (
    <div className="ws-scrollbar-none -mb-px flex gap-1 overflow-x-auto px-4 pb-2 sm:px-6">
      {certSections(cert.id).map((section) => {
        const active = isSectionActive(pathname, section.href);
        const Icon = section.icon;
        return (
          <Link
            key={section.href}
            href={section.href}
            aria-current={active ? "page" : undefined}
            className={`flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-[13px] font-medium transition-colors ${
              active
                ? "bg-ws-ink text-ws-canvas"
                : "text-ws-muted hover:bg-ws-line/5 hover:text-ws-ink"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {section.label}
          </Link>
        );
      })}
    </div>
  );
}

export function AccountMenu({
  initials,
  name,
  email,
  planLabel,
  streakDays,
}: {
  initials: string;
  name: string | null;
  email: string;
  planLabel: string | null;
  streakDays: number | null;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointer(event: PointerEvent) {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative flex items-center gap-2">
      {streakDays !== null ? (
        <span className="ws-chip ws-chip-accent" title="Sequência de estudos">
          <FlameIcon className="h-3.5 w-3.5" />
          <span className="font-mono">{streakDays}</span>
        </span>
      ) : null}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Abrir menu da conta"
        className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-amber-500 text-xs font-bold text-[#1a0d03] shadow-[inset_0_1px_0_rgba(255,255,255,.4)]"
      >
        {initials}
      </button>
      {open ? (
        <div role="menu" className="ws-card ws-pop absolute right-0 top-12 z-50 w-72 origin-top-right p-2">
          <div className="px-3 pb-3 pt-2">
            <p className="text-sm font-semibold text-ws-ink">{name ?? "Sua conta"}</p>
            <p className="truncate text-xs text-ws-subtle">{email}</p>
            <span className={`ws-chip mt-3 ${planLabel ? "ws-chip-accent" : ""}`}>{planLabel ?? "Plano gratuito"}</span>
          </div>
          <div className="ws-divider mx-1 border-t" />
          <div className="flex items-center justify-between px-3 py-2.5">
            <span className="text-sm text-ws-muted">Aparência</span>
            <ThemeToggle />
          </div>
          <form action={logout}>
            <button type="submit" role="menuitem" className="flex h-10 w-full items-center gap-2.5 rounded-xl px-3 text-sm font-medium text-ws-muted transition-colors hover:bg-ws-line/5 hover:text-ws-ink">
              <LogoutIcon className="h-4 w-4" />
              Sair da conta
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
