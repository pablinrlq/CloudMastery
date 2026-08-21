import assert from "node:assert/strict";
import test from "node:test";
import {
  isLoopbackHostname,
  isCheckoutPlan,
  normalizeSiteOrigin,
  resolveCheckoutPlan,
  safeRedirectPath,
} from "../lib/security.ts";
import { hasAccess } from "../lib/access.ts";

test("subscription access requires coverage and a non-expired period", () => {
  const future = new Date(Date.now() + 60_000).toISOString();
  const expired = new Date(Date.now() - 60_000).toISOString();
  assert.equal(hasAccess({ status: "active", plan: "monthly", cert_access: ["ccp"], current_period_end: future }, "ccp"), true);
  assert.equal(hasAccess({ status: "active", plan: "monthly", cert_access: ["ccp"], current_period_end: expired }, "ccp"), false);
  assert.equal(hasAccess({ status: "active", plan: "lifetime", cert_access: ["all"], current_period_end: null }, "aif"), true);
  assert.equal(hasAccess({ status: "canceled", plan: "lifetime", cert_access: ["all"], current_period_end: null }, "aif"), false);
});
import {
  confirmationPath,
  hasVerifiedEmail,
} from "../lib/auth-security.ts";

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

test("production URL guard recognizes local-only hosts", () => {
  assert.equal(isLoopbackHostname("localhost"), true);
  assert.equal(isLoopbackHostname("app.localhost"), true);
  assert.equal(isLoopbackHostname("127.0.0.1"), true);
  assert.equal(isLoopbackHostname("[::1]"), true);
  assert.equal(isLoopbackHostname("cloudmastery.vercel.app"), false);
});

test("protected auth accepts only users with a confirmed email timestamp", () => {
  assert.equal(hasVerifiedEmail(null), false);
  assert.equal(
    hasVerifiedEmail({ email_confirmed_at: null } as never),
    false
  );
  assert.equal(
    hasVerifiedEmail({ email_confirmed_at: "2026-08-20T12:00:00Z" } as never),
    true
  );
});

test("confirmation path encodes email data instead of interpreting it as a URL", () => {
  assert.equal(
    confirmationPath("student+aws@example.com"),
    "/signup/confirmacao?email=student%2Baws%40example.com"
  );
  assert.equal(confirmationPath(), "/signup/confirmacao");
});
