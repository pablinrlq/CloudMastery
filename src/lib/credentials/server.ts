import "server-only";
import { cache } from "react";
import { db } from "@/lib/db";
import { getModules } from "@/lib/learning/content";
import { CERT_ORDER, type CertKey } from "@/lib/learning/cert-meta";
import { computeXp } from "@/lib/learning/levels";
import { longestStreak } from "@/lib/learning/study-format";
import { siteUrl } from "@/lib/site-url";
import { evaluateAchievements, type AchievementStatus, type Evidence, type StudyStats } from "@/lib/credentials/catalog";
import {
  credentialPath,
  generateCredentialCode,
  linkedInAddToProfileUrl,
  normalizeCredentialCode,
} from "@/lib/credentials/share";

export type IssuedCredential = {
  code: string;
  kind: "badge" | "certificate";
  achievement: string;
  certId: string | null;
  title: string;
  evidence: Evidence;
  issuedAt: string;
  revokedAt: string | null;
};

export type CredentialsState = {
  statuses: AchievementStatus[];
  /** Issued credentials by achievement key. */
  issued: Map<string, IssuedCredential>;
  /** Issued during this request — the page celebrates them. */
  fresh: IssuedCredential[];
};

const COLUMNS = ["code", "kind", "achievement", "cert_id", "title", "evidence", "issued_at", "revoked_at"] as const;

type CredentialRow = {
  code: string;
  kind: "badge" | "certificate";
  achievement: string;
  cert_id: string | null;
  title: string;
  evidence: unknown;
  issued_at: Date | string;
  revoked_at: Date | string | null;
};

function toIssued(row: CredentialRow): IssuedCredential {
  return {
    code: row.code,
    kind: row.kind,
    achievement: row.achievement,
    certId: row.cert_id,
    title: row.title,
    evidence: (row.evidence && typeof row.evidence === "object" ? row.evidence : {}) as Evidence,
    issuedAt: new Date(row.issued_at).toISOString(),
    revokedAt: row.revoked_at ? new Date(row.revoked_at).toISOString() : null,
  };
}

/** Absolute, shareable URL of a credential's public page. */
export function credentialUrl(code: string) {
  return siteUrl(credentialPath(code)).toString();
}

export type CredentialLinks = { url: string; imageUrl: string; linkedInAddUrl: string };

/** Public page, share image and LinkedIn "Add to profile" link for a credential. */
export function credentialLinks(credential: Pick<IssuedCredential, "code" | "title" | "issuedAt">): CredentialLinks {
  const url = credentialUrl(credential.code);
  return {
    url,
    imageUrl: `${url}/imagem`,
    linkedInAddUrl: linkedInAddToProfileUrl({
      title: credential.title,
      issuedAt: credential.issuedAt,
      url,
      code: credential.code,
      // Optional: the CloudMastery company page id, so LinkedIn shows its logo.
      organizationId: process.env.LINKEDIN_ORGANIZATION_ID || null,
    }),
  };
}

/** Aggregates everything the achievement rules need, in three queries. */
export async function loadStudyStats(userId: string, premium: boolean): Promise<StudyStats> {
  const [completed, attempts, flashcards] = await Promise.all([
    db.selectFrom("user_progress as up")
      .innerJoin("modules as m", "m.id", "up.module_id")
      .select(["m.cert_id", "m.slug", "up.last_visited_at"])
      .where("up.user_id", "=", userId)
      .where("up.status", "=", "completed")
      .execute(),
    db.selectFrom("simulado_attempts")
      .select(["cert_id", "mode", "score", "completed_at"])
      .where("user_id", "=", userId)
      .where("completed_at", "is not", null)
      .orderBy("completed_at", "desc")
      .execute(),
    db.selectFrom("user_flashcard_progress")
      .select((eb) => eb.fn.countAll<string>().as("known"))
      .where("user_id", "=", userId)
      .where("status", "=", "known")
      .executeTakeFirst(),
  ]);

  const certs = {} as StudyStats["certs"];
  for (const certId of CERT_ORDER) {
    // Same identity as readiness: a module counts only if its content file exists.
    const slugs = new Set(getModules(certId).map((module) => module.slug));
    certs[certId] = {
      modulesCompleted: completed.filter((row) => row.cert_id === certId && slugs.has(row.slug)).length,
      modulesTotal: slugs.size,
      fullScores: attempts
        .filter((attempt) => attempt.cert_id === certId && attempt.mode === "full")
        .map((attempt) => Number(attempt.score))
        .filter((score) => Number.isFinite(score)),
    };
  }

  const fullAttempts = attempts.filter((attempt) => attempt.mode === "full");
  const diagnostic = attempts.find(
    (attempt) => attempt.mode === "diagnostic" && (CERT_ORDER as string[]).includes(attempt.cert_id)
  );
  const activity = [
    ...completed.map((row) => row.last_visited_at),
    ...attempts.map((attempt) => attempt.completed_at),
  ]
    .filter(Boolean)
    .map((value) => new Date(value!).toISOString());

  return {
    premium,
    certs,
    // Same formula as the workspace's XP (all completed modules + full exams).
    totalXp: computeXp({ modulesCompleted: completed.length, fullScores: fullAttempts.map((attempt) => Number(attempt.score)) }),
    longestStreak: longestStreak(activity),
    fullSimulados: fullAttempts.length,
    flashcardsKnown: Number(flashcards?.known ?? 0),
    diagnostic: diagnostic
      ? { certId: diagnostic.cert_id as CertKey, score: Math.round(Number(diagnostic.score) || 0) }
      : null,
  };
}

export async function listCredentials(userId: string): Promise<IssuedCredential[]> {
  const rows = await db.selectFrom("credentials")
    .select([...COLUMNS])
    .where("user_id", "=", userId)
    .orderBy("issued_at", "desc")
    .execute();
  return rows.map(toIssued);
}

function isCodeCollision(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as { code?: string }).code === "23505" &&
    (error as { constraint?: string }).constraint === "credentials_code_key"
  );
}

async function issue(userId: string, item: AchievementStatus): Promise<{ credential: IssuedCredential; created: boolean } | null> {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const row = await db.insertInto("credentials")
        .values({
          code: generateCredentialCode(),
          user_id: userId,
          kind: item.kind,
          achievement: item.key,
          cert_id: item.certId,
          title: item.title,
          evidence: JSON.stringify(item.evidence),
        })
        .onConflict((conflict) => conflict.columns(["user_id", "achievement"]).doNothing())
        .returning([...COLUMNS])
        .executeTakeFirst();
      if (row) return { credential: toIssued(row), created: true };

      // A concurrent request issued it first: keep that one.
      const existing = await db.selectFrom("credentials")
        .select([...COLUMNS])
        .where("user_id", "=", userId)
        .where("achievement", "=", item.key)
        .executeTakeFirst();
      return existing ? { credential: toIssued(existing), created: false } : null;
    } catch (error) {
      // 60 random bits make a code collision astronomically rare; retry anyway.
      if (isCodeCollision(error) && attempt < 2) continue;
      throw error;
    }
  }
  return null;
}

/**
 * Evaluates every achievement and issues the newly earned ones. Idempotent and
 * safe under concurrency ((user_id, achievement) is unique); cached per request
 * so the layout and the page share one run.
 */
export const syncCredentials = cache(async (userId: string, premium: boolean): Promise<CredentialsState> => {
  const [stats, existing] = await Promise.all([loadStudyStats(userId, premium), listCredentials(userId)]);
  const statuses = evaluateAchievements(stats);
  const issued = new Map(existing.map((credential) => [credential.achievement, credential]));
  const fresh: IssuedCredential[] = [];

  for (const item of statuses) {
    if (!item.earned || issued.has(item.key)) continue;
    const result = await issue(userId, item);
    if (!result) continue;
    issued.set(result.credential.achievement, result.credential);
    if (result.created) fresh.push(result.credential);
  }

  return { statuses, issued, fresh };
});

/** Credentials are a bonus: a failure here must never take a study page down. */
export async function trySyncCredentials(userId: string, premium: boolean): Promise<CredentialsState | null> {
  try {
    return await syncCredentials(userId, premium);
  } catch (error) {
    console.error("[credentials] sync failed:", error instanceof Error ? `${error.name}: ${error.message}` : "unknown error");
    return null;
  }
}

export type PublicCredential = IssuedCredential & {
  holderName: string;
  userId: string;
};

export const getPublicCredential = cache(async (rawCode: string): Promise<PublicCredential | null> => {
  const code = normalizeCredentialCode(rawCode);
  if (!code) return null;
  const row = await db.selectFrom("credentials as c")
    .innerJoin("user as u", "u.id", "c.user_id")
    .select([
      "c.code",
      "c.kind",
      "c.achievement",
      "c.cert_id",
      "c.title",
      "c.evidence",
      "c.issued_at",
      "c.revoked_at",
      "c.user_id",
      "u.name as holder_name",
    ])
    .where("c.code", "=", code)
    .executeTakeFirst();
  if (!row) return null;
  return { ...toIssued(row), holderName: row.holder_name, userId: row.user_id };
});
