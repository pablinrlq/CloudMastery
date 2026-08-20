"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard", label: "Visão geral", shortLabel: "Início" },
  { href: "/course/ccp", label: "Cloud Practitioner", shortLabel: "CCP" },
  { href: "/course/saa", label: "Solutions Architect", shortLabel: "SAA" },
  { href: "/course/aif", label: "AI Practitioner", shortLabel: "AIF" },
];

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DesktopAppNav() {
  const pathname = usePathname();

  return (
    <div className="hidden items-center gap-1 lg:flex">
      {links.map((link) => {
        const active = isActive(pathname, link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={`rounded-xl px-3.5 py-2 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/30 ${
              active
                ? "bg-slate-950 text-white shadow-sm dark:bg-white dark:text-slate-950"
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </div>
  );
}

export function MobileAppNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200/80 bg-white/90 px-3 pb-[max(0.6rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-12px_35px_rgba(15,23,42,0.08)] backdrop-blur-xl lg:hidden dark:border-white/10 dark:bg-slate-950/90">
      <div className="mx-auto grid max-w-lg grid-cols-4 gap-1">
        {links.map((link) => {
          const active = isActive(pathname, link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-xl text-[11px] font-bold transition ${
                active
                  ? "bg-orange-50 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300"
                  : "text-slate-400 hover:bg-slate-50 hover:text-slate-700 dark:hover:bg-white/5 dark:hover:text-slate-200"
              }`}
            >
              <span className="text-[10px] font-black tracking-[0.12em]">{link.shortLabel}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
