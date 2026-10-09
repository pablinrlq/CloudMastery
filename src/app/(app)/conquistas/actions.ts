"use server";

import { db } from "@/lib/db";
import { verifySession } from "@/lib/dal";
import { normalizeHolderName } from "@/lib/credentials/share";

/** `value` echoes a rejected input so the form can keep what was typed. */
export type HolderNameState = { error?: string; value?: string; success?: string; name?: string } | undefined;

// The account name is what certificates and public credential pages print.
export async function updateHolderName(_prev: HolderNameState, formData: FormData): Promise<HolderNameState> {
  const { userId } = await verifySession();
  const raw = String(formData.get("name") ?? "").slice(0, 200);
  const result = normalizeHolderName(raw);
  if (!result.ok) return { error: result.error, value: raw };

  try {
    // Written directly rather than through auth.api.updateUser, which also
    // re-sets the session cookie: sessions are database-backed (no cookie
    // cache), so the name is all that needs to change.
    await db.updateTable("user").set({ name: result.value, updatedAt: new Date() }).where("id", "=", userId).execute();
  } catch (error) {
    console.error("[profile] name update failed:", error instanceof Error ? `${error.name}: ${error.message}` : "unknown error");
    return { error: "Não foi possível salvar agora. Tente novamente.", value: raw };
  }

  return { success: "Nome atualizado em todos os seus certificados.", name: result.value };
}
