import assert from "node:assert/strict";
import test from "node:test";
import {
  DIAGNOSTIC_DURATION_MINUTES,
  DIAGNOSTIC_QUESTION_COUNT,
  isSimuladoMode,
  shuffledCopy,
} from "../lib/simulado.ts";

test("simulado modes reject forged values", () => {
  assert.equal(isSimuladoMode("diagnostic"), true);
  assert.equal(isSimuladoMode("full"), true);
  assert.equal(isSimuladoMode("domain"), true);
  assert.equal(isSimuladoMode("admin"), false);
  assert.equal(isSimuladoMode({}), false);
});

test("free diagnostic has a bounded product allowance", () => {
  assert.equal(DIAGNOSTIC_QUESTION_COUNT, 10);
  assert.equal(DIAGNOSTIC_DURATION_MINUTES, 15);
});

test("shuffle does not mutate the question source", () => {
  const original = [1, 2, 3, 4];
  const shuffled = shuffledCopy(original, () => 0);
  assert.deepEqual(original, [1, 2, 3, 4]);
  assert.deepEqual([...shuffled].sort(), original);
  assert.notDeepEqual(shuffled, original);
});
