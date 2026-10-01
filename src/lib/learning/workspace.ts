import "server-only";
import { cache } from "react";
import { getSubscription, hasAccess, verifySession } from "@/lib/dal";
import { CERTIFICATIONS, getModules, type CertId } from "@/lib/learning/content";
import { getProgressForCert } from "@/lib/learning/progress";
import { getGamificationProfile, type GamificationProfile } from "@/lib/learning/gamification";
import { displayNameFromEmail, initialsFromEmail } from "@/lib/learning/study-format";

export type WorkspaceCert = {
  id: CertId;
  unlocked: boolean;
  completed: number;
  total: number;
  pct: number;
};

export type WorkspaceSummary = {
  email: string;
  name: string | null;
  initials: string;
  premium: boolean;
  planLabel: string | null;
  profile: GamificationProfile | null;
  certs: WorkspaceCert[];
};

const PLAN_LABELS: Record<string, string> = {
  monthly: "Premium mensal",
  annual: "Premium anual",
  lifetime: "Premium vitalício",
};

// Identity, plan and per-track progress for the workspace shell. Cached per
// request, so pages that read the same data (dashboard, course) reuse it.
export const getWorkspaceSummary = cache(async (): Promise<WorkspaceSummary> => {
  const [{ email }, subscription] = await Promise.all([verifySession(), getSubscription()]);
  const certIds = Object.keys(CERTIFICATIONS) as CertId[];
  const unlockedIds = certIds.filter((certId) => hasAccess(subscription, certId));
  const premium = unlockedIds.length > 0;

  const [profile, progressMaps] = premium
    ? await Promise.all([
        getGamificationProfile(),
        Promise.all(unlockedIds.map((certId) => getProgressForCert(certId))),
      ])
    : [null, []];

  const certs = certIds.map((certId) => {
    const modules = getModules(certId);
    const progress = progressMaps[unlockedIds.indexOf(certId)] ?? {};
    const completed = modules.filter((m) => progress[`${certId}/${m.slug}`] === "completed").length;
    return {
      id: certId,
      unlocked: unlockedIds.includes(certId),
      completed,
      total: modules.length,
      pct: modules.length ? Math.round((completed / modules.length) * 100) : 0,
    };
  });

  return {
    email,
    name: displayNameFromEmail(email),
    initials: initialsFromEmail(email),
    premium,
    planLabel: premium ? (PLAN_LABELS[subscription?.plan ?? ""] ?? "Premium") : null,
    profile,
    certs,
  };
});
