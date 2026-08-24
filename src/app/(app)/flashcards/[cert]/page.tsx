import { notFound } from "next/navigation";
import { CERTIFICATIONS, isValidCert } from "@/lib/learning/content";
import { requireAccess, verifySession } from "@/lib/dal";
import { db } from "@/lib/db";
import { FlashcardDeck, type Flashcard } from "@/components/flashcard-deck";

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

  const [cards, progress] = await Promise.all([
    db.selectFrom("flashcards").select(["id", "domain", "front", "back"]).where("cert_id", "=", cert).execute(),
    db.selectFrom("user_flashcard_progress").select(["flashcard_id", "status"]).where("user_id", "=", userId).execute(),
  ]);

  const statusById = new Map(
    progress.map((p) => [p.flashcard_id, p.status as Flashcard["status"]])
  );

  const deck: Flashcard[] = cards.map((c) => ({
    ...c,
    status: statusById.get(c.id) ?? "new",
  }));

  return (
    <div className="mx-auto max-w-3xl px-5 py-10 sm:px-6 sm:py-14">
      <p className="cm-kicker">{certInfo.code} · Revisão ativa</p>
      <h1 className="cm-title mt-3">
        Flashcards — {certInfo.name}
      </h1>
      <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
        Cartões marcados como &quot;revisar depois&quot; voltam primeiro na próxima sessão.
      </p>

      <div className="mt-10">
        <FlashcardDeck cards={deck} />
      </div>
    </div>
  );
}
