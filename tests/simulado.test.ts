import assert from "node:assert/strict";
import test from "node:test";
import { CERTIFICATIONS, domainWeights } from "../src/lib/learning/certifications.ts";
import {
  DIAGNOSTIC_DURATION_MINUTES,
  DIAGNOSTIC_QUESTION_COUNT,
  domainQuotas,
  isSimuladoMode,
  selectSimuladoQuestions,
  shuffledCopy,
} from "../src/lib/learning/simulado.ts";

test("simulado modes reject forged values", () => {
  assert.equal(isSimuladoMode("diagnostic"), true);
  assert.equal(isSimuladoMode("full"), true);
  assert.equal(isSimuladoMode("domain"), true);
  assert.equal(isSimuladoMode("admin"), false);
  assert.equal(isSimuladoMode({}), false);
});

test("free diagnostic has a bounded product allowance", () => {
  assert.equal(DIAGNOSTIC_QUESTION_COUNT, 30);
  assert.equal(DIAGNOSTIC_DURATION_MINUTES, 45);
});

test("shuffle does not mutate the question source", () => {
  const original = [1, 2, 3, 4];
  const shuffled = shuffledCopy(original, () => 0);
  assert.deepEqual(original, [1, 2, 3, 4]);
  assert.deepEqual([...shuffled].sort(), original);
  assert.notDeepEqual(shuffled, original);
});

function seeded(seed: number) {
  return () => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed / 2147483648;
  };
}

function bank(sizes: Record<string, number>) {
  return Object.entries(sizes).flatMap(([domain, size]) =>
    Array.from({ length: size }, (_, index) => ({ id: `${domain}-${index}`, domain }))
  );
}

test("official domain weights add up to 100% for every certification", () => {
  for (const cert of Object.values(CERTIFICATIONS)) {
    assert.equal(cert.domainWeights.length, cert.domains.length, cert.id);
    assert.equal(cert.domainWeights.reduce((sum, weight) => sum + weight, 0), 100, cert.id);
  }
});

test("domain quotas follow the exam weights and fill the exam", () => {
  const quotas = domainQuotas({ a: 50, b: 50, c: 50, d: 50 }, { a: 24, b: 30, c: 34, d: 12 }, 65);
  assert.deepEqual(quotas, { a: 16, b: 19, c: 22, d: 8 });
});

test("a short domain hands its shortfall to the others", () => {
  const quotas = domainQuotas({ a: 50, b: 50, c: 3 }, { a: 1, b: 1, c: 2 }, 40);
  assert.equal(quotas.c, 3);
  assert.equal(quotas.a + quotas.b + quotas.c, 40);
  assert.ok(Math.abs(quotas.a - quotas.b) <= 1);
});

test("quotas never exceed the bank and ignore unweighted domains until needed", () => {
  assert.deepEqual(domainQuotas({ a: 2, b: 3 }, { a: 1, b: 1 }, 65), { a: 2, b: 3 });
  assert.deepEqual(domainQuotas({ a: 10, extra: 10 }, { a: 1 }, 5), { a: 5, extra: 0 });
  assert.deepEqual(domainQuotas({ a: 3, extra: 10 }, { a: 1 }, 5), { a: 3, extra: 2 });
});

test("a full simulado matches the CLF-C02 domain mix", () => {
  const questions = bank({
    "Conceitos de Nuvem": 47,
    "Segurança e Conformidade": 61,
    "Tecnologia e Serviços": 80,
    "Cobrança, Preços e Suporte": 25,
  });
  const picked = selectSimuladoQuestions(questions, { count: 65, weights: domainWeights("ccp"), random: seeded(7) });
  const counts: Record<string, number> = {};
  for (const question of picked) counts[question.domain] = (counts[question.domain] ?? 0) + 1;
  assert.equal(picked.length, 65);
  assert.equal(new Set(picked.map((question) => question.id)).size, 65);
  assert.deepEqual(counts, {
    "Conceitos de Nuvem": 16,
    "Segurança e Conformidade": 19,
    "Tecnologia e Serviços": 22,
    "Cobrança, Preços e Suporte": 8,
  });
});

test("questions from recent attempts come last, the oldest seen first", () => {
  const questions = bank({ a: 6 });
  const weights = { a: 1 };
  const newest = ["a-0", "a-1"];
  const older = ["a-2", "a-3"];
  const picked = selectSimuladoQuestions(questions, {
    count: 4,
    weights,
    recentAttempts: [newest, older],
    random: seeded(3),
  }).map((question) => question.id);
  assert.deepEqual([...picked].sort(), ["a-2", "a-3", "a-4", "a-5"]);

  const repeated = selectSimuladoQuestions(questions, {
    count: 3,
    weights,
    recentAttempts: [newest, older, ["a-4", "a-5"]],
    random: seeded(3),
  }).map((question) => question.id);
  assert.equal(repeated.filter((id) => newest.includes(id)).length, 0);
});

test("three full exams in a row do not repeat questions when the bank allows", () => {
  const questions = bank({ a: 60, b: 60, c: 80 });
  const weights = { a: 30, b: 30, c: 40 };
  const history: string[][] = [];
  const seen = new Set<string>();
  for (let exam = 0; exam < 3; exam++) {
    const ids = selectSimuladoQuestions(questions, {
      count: 65,
      weights,
      recentAttempts: history,
      random: seeded(exam + 11),
    }).map((question) => question.id);
    for (const id of ids) {
      assert.ok(!seen.has(id), `exam ${exam + 1} repeated ${id}`);
      seen.add(id);
    }
    history.unshift(ids);
  }
});
