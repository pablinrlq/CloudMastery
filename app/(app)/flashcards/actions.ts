"use server";

import { createClient } from "@/lib/supabase/server";
import { verifySession } from "@/lib/dal";

export async function markFlashcard(
  flashcardId: string,
  status: "known" | "review_later"
) {
  const { userId } = await verifySession();
  const supabase = await createClient();

  await supabase.from("user_flashcard_progress").upsert(
    {
      user_id: userId,
      flashcard_id: flashcardId,
      status,
      last_reviewed_at: new Date().toISOString(),
    },
    { onConflict: "user_id,flashcard_id" }
  );
}
