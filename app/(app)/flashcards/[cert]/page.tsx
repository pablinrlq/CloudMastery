import { notFound } from "next/navigation";
import { CERTIFICATIONS, isValidCert } from "@/lib/content";
import { requireAccess, verifySession } from "@/lib/dal";
import { createClient } from "@/lib/supabase/server";
import { CERT_META } from "@/lib/cert-meta";
import { CertEmblem } from "@/components/cert-emblem";
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
  const meta = CERT_META[cert];

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

  const counts = {
    known: deck.filter((card) => card.status === "known").length,
    review: deck.filter((card) => card.status === "review_later").length,
    fresh: deck.filter((card) => card.status === "new").length,
  };
  const total = deck.length || 1;

  return (
    <div className="mx-auto w-full max-w-[1240px] px-4 py-5 sm:px-8 sm:py-8 xl:px-10 xl:py-10">
      <section className="ws-ink ws-rise p-6 sm:p-8" aria-labelledby="flashcards-title">
        <div className="grid grid-cols-1 gap-7 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-center">
          <div>
            <div className="flex items-center gap-3">
              <CertEmblem certId={cert} size="md" />
              <p className="ws-eyebrow !text-orange-200/80">{meta.code} · Flashcards</p>
            </div>
            <h1 id="flashcards-title" className="mt-5 text-balance text-[1.9rem] font-semibold leading-[1.08] tracking-[-0.04em] text-white sm:text-[2.4rem]">
              Revisão ativa.
              <span className="block text-slate-400">Os conceitos que mais caem em {certInfo.name.replace("AWS Certified ", "")}.</span>
            </h1>
            <p className="mt-4 max-w-xl text-[15px] leading-7 text-slate-400">
              Tente lembrar antes de virar o cartão. Os marcados como “revisar depois” voltam primeiro na próxima sessão.
            </p>
          </div>

          <div className="ws-glass p-4">
            <p className="ws-eyebrow !text-slate-400">Seu baralho · {deck.length} cartões</p>
            <div className="mt-4 flex h-2.5 overflow-hidden rounded-full bg-white/10" aria-hidden="true">
              <span className="bg-gradient-to-r from-emerald-500 to-emerald-300" style={{ width: `${(counts.known / total) * 100}%` }} />
              <span className="bg-gradient-to-r from-amber-500 to-amber-300" style={{ width: `${(counts.review / total) * 100}%` }} />
            </div>
            <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
              {[
                ["Dominados", counts.known, "text-emerald-300"],
                ["Revisar", counts.review, "text-amber-300"],
                ["Novos", counts.fresh, "text-slate-200"],
              ].map(([label, value, color]) => (
                <div key={label as string} className="rounded-xl bg-black/20 px-2 py-2.5">
                  <dd className={`ws-num text-2xl ${color}`}>{value}</dd>
                  <dt className="mt-1 text-[11px] text-slate-400">{label}</dt>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <div className="mt-10">
        <FlashcardDeck cards={deck} />
      </div>
    </div>
  );
}
