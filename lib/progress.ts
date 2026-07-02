import "server-only";
import { createClient } from "@/lib/supabase/server";
import { verifySession } from "@/lib/dal";

export type ProgressMap = Record<string, "not_started" | "in_progress" | "completed">;

// Returns { "<certId>/<slug>": status } for the signed-in user.
// Module identity is cert+slug (mirrors content files); the DB modules table
// keeps ids for relational integrity, seeded from the same slugs.
export async function getProgressForCert(certId: string): Promise<ProgressMap> {
  const { userId } = await verifySession();
  const supabase = await createClient();

  const { data } = await supabase
    .from("user_progress")
    .select("status, modules!inner(cert_id, slug)")
    .eq("user_id", userId)
    .eq("modules.cert_id", certId);

  const map: ProgressMap = {};
  for (const row of data ?? []) {
    const mod = row.modules as unknown as { cert_id: string; slug: string };
    map[`${mod.cert_id}/${mod.slug}`] = row.status as ProgressMap[string];
  }
  return map;
}
