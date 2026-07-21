import Link from "next/link";
import { Logo } from "@/components/logo";
import { logout } from "@/app/(auth)/actions";

const navLinks = [
  { href: "/dashboard", label: "Meus estudos" },
  { href: "/course/ccp", label: "Cloud Practitioner" },
  { href: "/course/saa", label: "Solutions Architect" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50/50">
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/85 backdrop-blur-md">
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Logo size={30} href="/dashboard" />
            <div className="hidden items-center gap-1 sm:flex">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 transition hover:bg-orange-50 hover:text-orange-700"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-lg px-3 py-1.5 text-sm text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
            >
              Sair
            </button>
          </form>
        </nav>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-gray-200 bg-white py-4 text-center text-xs text-gray-400">
        CloudMastery — material de estudo independente, sem afiliação com a AWS.
      </footer>
    </div>
  );
}
