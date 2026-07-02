import Link from "next/link";
import { logout } from "@/app/(auth)/actions";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-gray-200">
        <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="font-semibold">
              Meus estudos
            </Link>
            <Link href="/course/ccp" className="text-sm text-gray-600 hover:text-gray-900">
              Cloud Practitioner
            </Link>
            <Link href="/course/saa" className="text-sm text-gray-600 hover:text-gray-900">
              Solutions Architect
            </Link>
          </div>
          <form action={logout}>
            <button type="submit" className="text-sm text-gray-600 hover:text-gray-900">
              Sair
            </button>
          </form>
        </nav>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
