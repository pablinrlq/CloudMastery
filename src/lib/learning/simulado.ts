/** One free, resumable exam per new account — certification is chosen by the student. */
export const DIAGNOSTIC_QUESTION_COUNT = 30;
export const DIAGNOSTIC_DURATION_MINUTES = 45;

export type SimuladoMode = "diagnostic" | "full" | "domain";

export function isSimuladoMode(value: unknown): value is SimuladoMode {
  return value === "diagnostic" || value === "full" || value === "domain";
}

export function shuffledCopy<T>(items: readonly T[], random = Math.random): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index--) {
    const swapIndex = Math.floor(random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

/**
 * How many questions each domain gets out of `count`, proportional to `weights`
 * (largest remainder). A domain never gets more than it has; its shortfall goes
 * to the domains with questions left, so the exam stays full whenever possible.
 */
export function domainQuotas(
  available: Readonly<Record<string, number>>,
  weights: Readonly<Record<string, number>>,
  count: number
): Record<string, number> {
  const quotas: Record<string, number> = Object.fromEntries(Object.keys(available).map((domain) => [domain, 0]));
  let remaining = Math.min(count, Object.values(available).reduce((sum, size) => sum + size, 0));

  while (remaining > 0) {
    const open = Object.keys(available).filter((domain) => quotas[domain] < available[domain]);
    const weighted = open.filter((domain) => (weights[domain] ?? 0) > 0);
    // Domains outside the exam guide only fill what the weighted ones cannot.
    const pool = weighted.length ? weighted : open;
    const weightOf = (domain: string) => (weighted.length ? weights[domain] : 1);
    const total = pool.reduce((sum, domain) => sum + weightOf(domain), 0);
    const shares = pool.map((domain) => {
      const exact = (remaining * weightOf(domain)) / total;
      return { domain, whole: Math.floor(exact), fraction: exact - Math.floor(exact) };
    });
    let leftover = remaining - shares.reduce((sum, share) => sum + share.whole, 0);
    for (const share of [...shares].sort((a, b) => b.fraction - a.fraction)) {
      if (leftover === 0) break;
      share.whole += 1;
      leftover -= 1;
    }
    for (const share of shares) {
      const granted = Math.min(share.whole, available[share.domain] - quotas[share.domain]);
      quotas[share.domain] += granted;
      remaining -= granted;
    }
  }
  return quotas;
}

/**
 * Builds a simulado: questions spread by the official domain weights and, inside
 * each domain, the ones the student saw least recently first. `recentAttempts`
 * holds the question ids of the student's latest attempts, newest first.
 */
export function selectSimuladoQuestions<T extends { id: string; domain: string }>(
  questions: readonly T[],
  options: {
    count: number;
    weights: Readonly<Record<string, number>>;
    recentAttempts?: readonly (readonly string[])[];
    random?: () => number;
  }
): T[] {
  const random = options.random ?? Math.random;
  const recent = options.recentAttempts ?? [];
  const lastSeen = new Map<string, number>();
  recent.forEach((ids, age) => {
    for (const id of ids) if (!lastSeen.has(id)) lastSeen.set(id, age);
  });
  // Never seen ranks above anything seen; among seen, older attempts first.
  const freshness = (question: T) => lastSeen.get(question.id) ?? recent.length;

  const byDomain = new Map<string, T[]>();
  for (const question of shuffledCopy(questions, random)) {
    const group = byDomain.get(question.domain);
    if (group) group.push(question);
    else byDomain.set(question.domain, [question]);
  }
  const quotas = domainQuotas(
    Object.fromEntries([...byDomain].map(([domain, group]) => [domain, group.length])),
    options.weights,
    options.count
  );

  const picked = [...byDomain].flatMap(([domain, group]) =>
    // Array#sort is stable, so ties keep the shuffled order.
    [...group].sort((a, b) => freshness(b) - freshness(a)).slice(0, quotas[domain])
  );
  return shuffledCopy(picked, random);
}
