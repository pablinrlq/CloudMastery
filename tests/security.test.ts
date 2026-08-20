import assert from "node:assert/strict";
import test from "node:test";
import {
  isCheckoutPlan,
  normalizeSiteOrigin,
  resolveCheckoutPlan,
  safeRedirectPath,
} from "../lib/security.ts";

test("checkout accepts only known plans", () => {
  assert.equal(isCheckoutPlan("monthly"), true);
  assert.equal(isCheckoutPlan("annual"), true);
  assert.equal(isCheckoutPlan("free"), false);
  assert.equal(isCheckoutPlan(null), false);
});

test("Stripe prices never fall back to another plan", () => {
  assert.equal(resolveCheckoutPlan("price_month", "price_month", "price_year"), "monthly");
  assert.equal(resolveCheckoutPlan("price_year", "price_month", "price_year"), "annual");
  assert.equal(resolveCheckoutPlan("price_unknown", "price_month", "price_year"), null);
  assert.equal(resolveCheckoutPlan(undefined, "price_month", "price_year"), null);
});

test("redirect sanitizer blocks external and malformed destinations", () => {
  assert.equal(safeRedirectPath("/dashboard?tab=progress"), "/dashboard?tab=progress");
  assert.equal(safeRedirectPath("https://evil.example"), "/dashboard");
  assert.equal(safeRedirectPath("//evil.example"), "/dashboard");
  assert.equal(safeRedirectPath("/\\evil.example"), "/dashboard");
  assert.equal(safeRedirectPath("/ok\nLocation: evil"), "/dashboard");
});

test("public origin is normalized and rejects unsafe protocols", () => {
  assert.equal(
    normalizeSiteOrigin("https://cloudmastery.example/path?q=1#x").toString(),
    "https://cloudmastery.example/"
  );
  assert.throws(() => normalizeSiteOrigin("javascript:alert(1)"));
  assert.throws(() => normalizeSiteOrigin("https://user:pass@example.com"));
  assert.throws(() => normalizeSiteOrigin(undefined));
});
