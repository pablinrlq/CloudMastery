"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { verifySession } from "@/lib/dal";

export async function markModuleCompleted(certId: string, slug: string) {
  if (!isValidCert(certId) || !/^[a-z0-9-]{1,100}$/.test(slug)) {
    throw new Error("Módulo inválido.");
  }
  const { userId } = await verifySession();
  const mod = await db.selectFrom("modules").select("id").where("cert_id", "=", certId).where("slug", "=", slug).executeTakeFirst();

  if (moduleError) throw new Error("Não foi possível localizar o módulo.");
  if (!mod) throw new Error("Módulo não encontrado.");

  await db.insertInto("user_progress").values({
      user_id: userId,
      module_id: mod.id,
      status: "completed",
      last_visited_at: new Date().toISOString(),
    }).onConflict((oc) => oc.columns(["user_id", "module_id"]).doUpdateSet({ status: "completed", last_visited_at: new Date() })).execute();

  revalidatePath(`/course/${certId}`);
  revalidatePath(`/course/${certId}/${slug}`);
  redirect(`/course/${certId}/${slug}`);
}
