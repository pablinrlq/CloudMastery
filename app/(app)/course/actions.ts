"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { verifySession } from "@/lib/dal";

export async function markModuleCompleted(certId: string, slug: string) {
  const { userId } = await verifySession();
  const supabase = await createClient();

  const { data: mod } = await supabase
    .from("modules")
    .select("id")
    .eq("cert_id", certId)
    .eq("slug", slug)
    .maybeSingle();

  if (!mod) return;

  await supabase.from("user_progress").upsert(
    {
      user_id: userId,
      module_id: mod.id,
      status: "completed",
      last_visited_at: new Date().toISOString(),
    },
    { onConflict: "user_id,module_id" }
  );

  revalidatePath(`/course/${certId}`);
  revalidatePath(`/course/${certId}/${slug}`);
}
