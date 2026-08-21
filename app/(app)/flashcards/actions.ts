"use server";

import { createClient } from "@/lib/supabase/server";
import { getSubscription, hasAccess, verifySession } from "@/lib/dal";

export async function markFlashcard(
  flashcardId: string,
  status: "known" | "review_later"
) {
  if (!/^[0-9a-f-]{36}$/i.test(flashcardId)) {
    throw new Error("Flashcard inválido.");
  }
  const { userId } = await verifySession();
  const supabase = await createClient();

  const { data: card, error: cardError } = await supabase
    .from("flashcards")
    .select("cert_id")
    .eq("id", flashcardId)
    .maybeSingle();
  if (cardError || !card) throw new Error("Flashcard não encontrado.");
  const subscription = await getSubscription();
  if (!hasAccess(subscription, card.cert_id)) throw new Error("Acesso Premium necessário.");

  const { error } = await supabase.from("user_flashcard_progress").upsert(
    {
      user_id: userId,
      flashcard_id: flashcardId,
      status,
      last_reviewed_at: new Date().toISOString(),
    },
    { onConflict: "user_id,flashcard_id" }
  );
  if (error) throw new Error("Não foi possível salvar a revisão.");
}
