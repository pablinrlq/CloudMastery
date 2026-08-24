import "server-only";
import { db } from "@/lib/db";
import { verifySession } from "@/lib/dal";

export type ProgressMap = Record<string, "not_started" | "in_progress" | "completed">;

// Returns { "<certId>/<slug>": status } for the signed-in user.
// Module identity is cert+slug (mirrors content files); the DB modules table
// keeps ids for relational integrity, seeded from the same slugs.
export async function getProgressForCert(certId: string): Promise<ProgressMap> {
  const { userId } = await verifySession();
  const data = await db.selectFrom("user_progress as up")
    .innerJoin("modules as m", "m.id", "up.module_id")
    .select(["up.status", "m.cert_id", "m.slug"])
    .where("up.user_id", "=", userId).where("m.cert_id", "=", certId).execute();

  const map: ProgressMap = {};
  for (const row of data ?? []) {
    map[`${row.cert_id}/${row.slug}`] = row.status as ProgressMap[string];
  }
  return map;
}
