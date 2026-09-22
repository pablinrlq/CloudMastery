import { notFound } from "next/navigation";
import { CERTIFICATIONS, isValidCert } from "@/lib/content";
import { requireAccess, verifySession } from "@/lib/dal";
import { createClient } from "@/lib/supabase/server";
import { FlashcardDeck, type Flashcard } from "@/components/flashcard-deck";
import { CardsIcon, TargetIcon } from "@/components/ui-icons";

export default async function FlashcardsPage({
  params,
}: {
  params: Promise<{ cert: string }>;
}) {
  const { cert } = await params;
  if (!isValidCert(cert)) notFound();

  await requireAccess(cert);
  const { userId } = await verifySession();
  const certInfo = CERTIFICATIONS[cert];

  const supabase = await createClient();

  // RLS: flashcards select is gated by has_active_access()
  const [{ data: cards }, { data: progress }] = await Promise.all([
    supabase
      .from("flashcards")
      .select("id, domain, front, back")
      .eq("cert_id", cert),
    supabase
      .from("user_flashcard_progress")
      .select("flashcard_id, status")
      .eq("user_id", userId),
  ]);

  const statusById = new Map(
    (progress ?? []).map((p) => [p.flashcard_id, p.status as Flashcard["status"]])
  );

  const deck: Flashcard[] = (cards ?? []).map((c) => ({
    ...c,
    status: statusById.get(c.id) ?? "new",
  }));

  return (
    <div className="mx-auto max-w-[960px] px-5 py-8 sm:px-8 sm:py-12">
      <section className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-7 shadow-[0_20px_60px_-45px_rgba(15,23,42,.4)] dark:border-white/10 dark:bg-slate-900 sm:p-9">
        <div className="absolute right-0 top-0 h-40 w-40 rounded-bl-[6rem] bg-orange-50 dark:bg-orange-500/10" />
        <div className="relative"><div className="flex items-center gap-2"><CardsIcon className="h-4 w-4 text-orange-600" /><p className="study-eyebrow">{certInfo.code} · Revisão ativa</p></div>
        <h1 className="mt-4 text-3xl font-bold tracking-[-0.04em] text-slate-950 dark:text-white sm:text-4xl">Flashcards de {certInfo.name}</h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">Cartões marcados como &quot;revisar depois&quot; voltam primeiro na próxima sessão.</p>
        <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600 dark:bg-white/5 dark:text-slate-300"><TargetIcon className="h-4 w-4 text-orange-600" />Revele a resposta antes de classificar seu domínio</p></div>
      </section>

      <div className="mt-6">
        <FlashcardDeck cards={deck} />
      </div>
    </div>
  );
}
