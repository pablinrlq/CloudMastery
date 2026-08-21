import assert from "node:assert/strict";
import test from "node:test";
import { passwordPolicyError } from "../lib/password-policy.ts";

test("password policy rejects weak and accepts strong credentials", () => {
  assert.ok(passwordPolicyError("30609030"));
  assert.ok(passwordPolicyError("onlylowercase123!"));
  assert.equal(passwordPolicyError("Nuvem#Segura2026"), null);
});
