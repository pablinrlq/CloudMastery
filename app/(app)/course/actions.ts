"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAccess, verifySession } from "@/lib/dal";
import { isValidCert } from "@/lib/content";

export async function markModuleCompleted(certId: string, slug: string) {
  if (!isValidCert(certId) || !/^[a-z0-9-]{1,100}$/.test(slug)) {
    throw new Error("Módulo inválido.");
  }
  const { userId } = await verifySession();
  await requireAccess(certId);
  const supabase = await createClient();

  const { data: mod, error: moduleError } = await supabase
    .from("modules")
    .select("id")
    .eq("cert_id", certId)
    .eq("slug", slug)
    .maybeSingle();

  if (moduleError) throw new Error("Não foi possível localizar o módulo.");
  if (!mod) throw new Error("Módulo não encontrado.");

  const { error } = await supabase.from("user_progress").upsert(
    {
      user_id: userId,
      module_id: mod.id,
      status: "completed",
      last_visited_at: new Date().toISOString(),
    },
    { onConflict: "user_id,module_id" }
  );
  if (error) throw new Error("Não foi possível salvar o progresso.");

  revalidatePath(`/course/${certId}`);
  revalidatePath(`/course/${certId}/${slug}`);
}
