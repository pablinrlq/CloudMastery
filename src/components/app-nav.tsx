"use client";

import { verifySession } from "@/lib/dal";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookIcon, DashboardIcon } from "@/components/ui-icons";

const links = [
  { href: "/dashboard", label: "Visão geral", shortLabel: "Início", code: "", icon: DashboardIcon },
  { href: "/course/ccp", label: "Cloud Practitioner", shortLabel: "CCP", code: "CLF-C02", icon: BookIcon },
  { href: "/course/saa", label: "Solutions Architect", shortLabel: "SAA", code: "SAA-C03", icon: BookIcon },
  { href: "/course/aif", label: "AI Practitioner", shortLabel: "AIF", code: "AIF-C01", icon: BookIcon },
];

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DesktopAppNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Área de estudos" className="hidden flex-1 lg:block">
      <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
        Plataforma
      </p>
      <div className="space-y-1">
      {links.map((link) => {
        const active = isActive(pathname, link.href);
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={`group flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/30 ${
              active
                ? "bg-white text-slate-950 shadow-[0_8px_20px_-12px_rgba(15,23,42,0.8)]"
                : "text-slate-400 hover:bg-white/[0.07] hover:text-white"
            }`}
          >
            <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${active ? "bg-slate-950/10" : "bg-white/5 text-slate-500 group-hover:text-white"}`}>
              <Icon className="h-[17px] w-[17px]" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate">{link.label}</span>
              {link.code && <span className={`mt-0.5 block text-[10px] tracking-[0.08em] ${active ? "text-slate-500" : "text-slate-600"}`}>{link.code}</span>}
            </span>
          </Link>
        );
      })}
      </div>
    </nav>
  );
}

export function MobileAppNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200/80 bg-white/90 px-3 pb-[max(0.6rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-12px_35px_rgba(15,23,42,0.08)] backdrop-blur-xl lg:hidden dark:border-white/10 dark:bg-slate-950/90">
      <div className="mx-auto grid max-w-lg grid-cols-4 gap-1">
        {links.map((link) => {
          const active = isActive(pathname, link.href);
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-bold transition ${
                active
                  ? "bg-orange-50 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300"
                  : "text-slate-400 hover:bg-slate-50 hover:text-slate-700 dark:hover:bg-white/5 dark:hover:text-slate-200"
              }`}
            >
              <span className="text-[10px] font-black tracking-[0.12em]">
                {link.shortLabel}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
