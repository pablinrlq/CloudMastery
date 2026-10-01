"use server";

import { db } from "@/lib/db";
import { verifySession } from "@/lib/dal";

export async function markFlashcard(
  flashcardId: string,
  status: "known" | "review_later"
) {
  if (!/^[0-9a-f-]{36}$/i.test(flashcardId)) {
    throw new Error("Flashcard inválido.");
  }
  const { userId } = await verifySession();
  await db.insertInto("user_flashcard_progress").values({
      user_id: userId,
      flashcard_id: flashcardId,
      status,
      last_reviewed_at: new Date().toISOString(),
    }).onConflict((oc) => oc.columns(["user_id", "flashcard_id"]).doUpdateSet({ status, last_reviewed_at: new Date() })).execute();
}
