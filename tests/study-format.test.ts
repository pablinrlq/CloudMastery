import assert from "node:assert/strict";
import test from "node:test";
import {
  activityCalendar,
  displayInitials,
  displayName,
  displayNameFromEmail,
  extractHeadings,
  formatMinutes,
  initialsFromEmail,
  longestStreak,
  slugifyHeading,
} from "../src/lib/learning/study-format.ts";

test("display name comes from a name-like email local part", () => {
  assert.equal(displayNameFromEmail("ana.silva@exemplo.com"), "Ana");
  assert.equal(displayNameFromEmail("JOAO_pereira@x.com"), "Joao");
  assert.equal(displayNameFromEmail("maria2024@x.com"), "Maria");
  assert.equal(displayNameFromEmail("x@x.com"), null);
  assert.equal(displayNameFromEmail("123456@x.com"), null);
  assert.equal(displayNameFromEmail("averyveryverylongname@x.com"), null);
});

test("a real account name wins over the e-mail guess", () => {
  assert.equal(displayName("Pablo Moisés Gomes", "pablo@x.com"), "Pablo");
  assert.equal(displayName("maria eduarda", "x@x.com"), "Maria");
  assert.equal(displayName("Zoë", "zoe@x.com"), "Zoë");
  // e-mail sign-ups store the local part as the name: fall back to the e-mail guess
  assert.equal(displayName("ana.silva", "ana.silva@exemplo.com"), "Ana");
  assert.equal(displayName("", "joao.pereira@exemplo.com"), "Joao");
  assert.equal(displayName(null, "42@x.com"), null);
  assert.equal(displayInitials("Pablo Moisés Gomes", "pablo@x.com"), "PG");
  assert.equal(displayInitials("Zoë", "zoe@x.com"), "ZO");
  assert.equal(displayInitials("ana.silva", "ana.silva@exemplo.com"), "AS");
});

test("initials use two name parts when available", () => {
  assert.equal(initialsFromEmail("ana.silva@exemplo.com"), "AS");
  assert.equal(initialsFromEmail("joao@x.com"), "JO");
  assert.equal(initialsFromEmail("42@x.com"), "CM");
});

test("heading slugs are stable, accent-free anchors", () => {
  assert.equal(slugifyHeading("Security Groups × NACLs (o clássico)"), "security-groups-nacls-o-classico");
  assert.equal(slugifyHeading("Conectividade híbrida e entre VPCs"), "conectividade-hibrida-e-entre-vpcs");
  assert.equal(slugifyHeading("**Sinais** de `prova`"), "sinais-de-prova");
});

test("table of contents ignores fenced code and duplicates", () => {
  const markdown = [
    "## Primeira seção",
    "texto",
    "```bash",
    "## não é título",
    "```",
    "### subtítulo",
    "## Segunda **seção**",
    "## Primeira seção",
  ].join("\n");
  assert.deepEqual(extractHeadings(markdown), [
    { id: "primeira-secao", text: "Primeira seção" },
    { id: "segunda-secao", text: "Segunda seção" },
  ]);
});

test("longest streak counts consecutive UTC days once", () => {
  assert.equal(longestStreak([]), 0);
  assert.equal(
    longestStreak([
      "2026-09-01T10:00:00Z",
      "2026-09-02T09:00:00Z",
      "2026-09-02T22:00:00Z",
      "2026-09-03T08:00:00Z",
      "2026-09-10T08:00:00Z",
    ]),
    3
  );
});

test("activity calendar covers the window oldest first", () => {
  const now = Date.parse("2026-09-30T12:00:00Z");
  const calendar = activityCalendar(["2026-09-30T01:00:00Z", "2026-09-30T05:00:00Z", "2026-09-28T01:00:00Z"], 3, now);
  assert.deepEqual(calendar, [
    { date: "2026-09-28", count: 1 },
    { date: "2026-09-29", count: 0 },
    { date: "2026-09-30", count: 2 },
  ]);
});

test("minutes format as compact durations", () => {
  assert.equal(formatMinutes(45), "45 min");
  assert.equal(formatMinutes(120), "2h");
  assert.equal(formatMinutes(135), "2h 15min");
});
