import assert from "node:assert/strict";
import test from "node:test";
import { describeAchievement, describeEvidence, emptyStats, evaluateAchievements } from "../src/lib/credentials/catalog.ts";
import { badgeSvg } from "../src/lib/credentials/badge-art.ts";
import {
  generateCredentialCode,
  linkedInAddToProfileUrl,
  linkedInShareUrl,
  looksLikeFullName,
  normalizeCredentialCode,
  normalizeHolderName,
} from "../src/lib/credentials/share.ts";

function status(stats: ReturnType<typeof emptyStats>, key: string) {
  const found = evaluateAchievements(stats).find((item) => item.key === key);
  assert.ok(found, `missing achievement ${key}`);
  return found;
}

test("certificate requires the full track and a 75% average over the last 3 full exams", () => {
  const base = emptyStats({ premium: true });
  base.certs.ccp = { modulesCompleted: 26, modulesTotal: 26, fullScores: [79, 81, 76, 58] };
  assert.equal(status(base, "ready:ccp").earned, true);
  assert.equal(status(base, "ready:ccp").kind, "certificate");
  assert.deepEqual(status(base, "ready:ccp").evidence, { modulesCompleted: 26, modulesTotal: 26, recentAverage: 79, bestScore: 81 });

  const twoExams = emptyStats({ premium: true });
  twoExams.certs.ccp = { modulesCompleted: 26, modulesTotal: 26, fullScores: [90, 90] };
  assert.equal(status(twoExams, "ready:ccp").earned, false);

  const lowAverage = emptyStats({ premium: true });
  // 74.33% rounds to 74 (the dashboard's readiness rounds the same way).
  lowAverage.certs.ccp = { modulesCompleted: 26, modulesTotal: 26, fullScores: [74, 74, 75, 99] };
  assert.equal(status(lowAverage, "ready:ccp").earned, false, "only the 3 most recent exams count");

  const missingModule = emptyStats({ premium: true });
  missingModule.certs.ccp = { modulesCompleted: 25, modulesTotal: 26, fullScores: [90, 90, 90] };
  assert.equal(status(missingModule, "ready:ccp").earned, false);
  assert.ok(status(missingModule, "ready:ccp").progress > 0.9);
});

test("track badges follow module progress and the pass mark", () => {
  const stats = emptyStats({ premium: true });
  stats.certs.saa = { modulesCompleted: 14, modulesTotal: 46, fullScores: [63, 55] };
  assert.equal(status(stats, "track-start:saa").earned, true);
  assert.equal(status(stats, "track-complete:saa").earned, false);
  assert.equal(status(stats, "track-complete:saa").progressLabel, "14 de 46 módulos");
  assert.equal(status(stats, "exam-pass:saa").earned, false);
  stats.certs.saa.fullScores = [72];
  assert.equal(status(stats, "exam-pass:saa").earned, true, "72% is the pass mark");
  // A track with no modules can never be complete.
  assert.equal(status(emptyStats(), "track-complete:aif").earned, false);
});

test("habit, level and diagnostic badges", () => {
  const stats = emptyStats({ premium: true, longestStreak: 7, fullSimulados: 9, flashcardsKnown: 50, totalXp: 1800 });
  assert.equal(status(stats, "streak-7").earned, true);
  assert.equal(status(stats, "streak-30").earned, false);
  assert.equal(status(stats, "simulados-10").progressLabel, "9 de 10 simulados");
  assert.equal(status(stats, "flashcards-50").earned, true);
  assert.equal(status(stats, "level-5").earned, true, "1.800 XP is Cloud Architect");
  assert.equal(status(stats, "level-6").earned, false);
  assert.equal(status(stats, "level-5").art.label, "CM-05");

  // Premium accounts never see the free diagnostic until they have one.
  assert.equal(status(stats, "diagnostic").visible, false);
  const free = emptyStats({ premium: false, diagnostic: { certId: "saa", score: 64 } });
  assert.equal(status(free, "diagnostic").earned, true);
  assert.equal(status(free, "diagnostic").title, "Diagnóstico de nível · SAA-C03");
});

test("catalog keys are unique and every achievement can be described from its key", () => {
  const all = evaluateAchievements(emptyStats());
  assert.equal(new Set(all.map((item) => item.key)).size, all.length);
  assert.equal(all.filter((item) => item.kind === "certificate").length, 3);
  for (const item of all) {
    const described = describeAchievement(item.key, { certId: item.certId });
    assert.ok(described, item.key);
    assert.equal(described.kind, item.kind);
  }
  assert.equal(describeAchievement("diagnostic", { certId: "aif" })?.art.label, "AIF-C01");
  assert.equal(describeAchievement("nope"), null);
});

test("credential codes are Crockford base32 and validated on the way in", () => {
  const code = generateCredentialCode();
  assert.match(code, /^CM-[0-9A-HJKMNP-TV-Z]{4}-[0-9A-HJKMNP-TV-Z]{4}-[0-9A-HJKMNP-TV-Z]{4}$/);
  assert.equal(generateCredentialCode(() => new Uint8Array(12)), "CM-0000-0000-0000");
  assert.equal(generateCredentialCode(() => new Uint8Array(12).fill(255)), "CM-ZZZZ-ZZZZ-ZZZZ");
  assert.equal(normalizeCredentialCode(" cm-7k3q-9xwd-pt4m "), "CM-7K3Q-9XWD-PT4M");
  assert.equal(normalizeCredentialCode("CM-7K3Q-9XWD-PT4I"), null, "I is not in the alphabet");
  assert.equal(normalizeCredentialCode("../../etc"), null);
  const codes = new Set(Array.from({ length: 2000 }, () => generateCredentialCode()));
  assert.equal(codes.size, 2000);
});

test("LinkedIn links carry the certification fields", () => {
  const url = new URL(
    linkedInAddToProfileUrl({
      title: "Certificado de prontidão · Cloud Practitioner (CLF-C02)",
      issuedAt: "2026-10-04T12:00:00Z",
      url: "https://cloudmastery.com.br/c/CM-7K3Q-9XWD-PT4M",
      code: "CM-7K3Q-9XWD-PT4M",
    })
  );
  assert.equal(url.origin + url.pathname, "https://www.linkedin.com/profile/add");
  assert.equal(url.searchParams.get("startTask"), "CERTIFICATION_NAME");
  assert.equal(url.searchParams.get("name"), "Certificado de prontidão · Cloud Practitioner (CLF-C02)");
  assert.equal(url.searchParams.get("organizationName"), "CloudMastery");
  assert.equal(url.searchParams.get("issueYear"), "2026");
  assert.equal(url.searchParams.get("issueMonth"), "10");
  assert.equal(url.searchParams.get("certId"), "CM-7K3Q-9XWD-PT4M");
  assert.equal(url.searchParams.get("certUrl"), "https://cloudmastery.com.br/c/CM-7K3Q-9XWD-PT4M");

  const withOrg = new URL(linkedInAddToProfileUrl({ title: "x", issuedAt: "2026-01-31T23:00:00Z", url: "https://a.b/c", code: "CM-0000-0000-0000", organizationId: "12345" }));
  assert.equal(withOrg.searchParams.get("organizationId"), "12345");
  assert.equal(withOrg.searchParams.get("organizationName"), null);

  assert.equal(
    linkedInShareUrl("https://cloudmastery.com.br/c/CM-7K3Q-9XWD-PT4M"),
    "https://www.linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Fcloudmastery.com.br%2Fc%2FCM-7K3Q-9XWD-PT4M"
  );
});

test("holder names are normalized and validated", () => {
  assert.deepEqual(normalizeHolderName("  Maria   Eduarda  da Silva "), { ok: true, value: "Maria Eduarda da Silva" });
  assert.deepEqual(normalizeHolderName("José D'Ávila-Neto Jr."), { ok: true, value: "José D'Ávila-Neto Jr." });
  assert.equal(normalizeHolderName("ab").ok, false);
  assert.equal(normalizeHolderName("pablinho<script>").ok, false);
  assert.equal(normalizeHolderName("joao123").ok, false);
  assert.equal(normalizeHolderName("x".repeat(81)).ok, false);
  assert.equal(looksLikeFullName("Marina Souza"), true);
  assert.equal(looksLikeFullName("pablinhomoi2"), false);
  assert.equal(looksLikeFullName("Zoë"), false);
});

test("medal SVG escapes text and keeps ids unique per badge", () => {
  const svg = badgeSvg({ tier: "gold", tone: "ccp", glyph: "cloud", label: "<b>&", caption: "x\"y" }, { id: "track-complete:ccp" });
  assert.ok(svg.includes("&#60;b&#62;&#38;"));
  assert.ok(!svg.includes("<b>"));
  assert.ok(svg.includes('id="m-track-complete-ccp-ring"'));
  const locked = badgeSvg({ tier: "gold", tone: "ccp", glyph: "cloud", label: "A", caption: "B" }, { id: "track-complete:ccp", locked: true });
  assert.ok(locked.includes('id="m-track-complete-ccp-l-ring"'));
  const bare = badgeSvg({ tier: "gold", tone: "ccp", glyph: "cloud", label: "A", caption: "B" }, { id: "x", text: false });
  assert.ok(!bare.includes("<text"));
});

test("evidence lines describe what each credential proves", () => {
  assert.deepEqual(describeEvidence("ready:ccp", { modulesCompleted: 26, modulesTotal: 26, recentAverage: 79, bestScore: 81 }), [
    "26 de 26 módulos da trilha concluídos",
    "Média de 79% nos 3 últimos simulados completos",
    "Melhor nota em simulado completo: 81%",
  ]);
  assert.deepEqual(describeEvidence("exam-pass:saa", { bestScore: 74, examQuestions: 65 }), ["Nota de 74% em simulado completo de 65 questões"]);
  assert.deepEqual(describeEvidence("level-5", { xp: 1800, target: 1800 }), ["1.800 XP acumulados"]);
  assert.deepEqual(describeEvidence("diagnostic", { score: 41 }), ["Diagnóstico de 30 questões concluído"], "the diagnostic score stays private");
  assert.deepEqual(describeEvidence("track-complete:aif", {}), [], "missing fields never print NaN");
});
