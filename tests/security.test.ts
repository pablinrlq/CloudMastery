import assert from "node:assert/strict";
import test from "node:test";
import {
  isLoopbackHostname,
  isCheckoutPlan,
  normalizeSiteOrigin,
  resolveCheckoutPlan,
  safeRedirectPath,
} from "../src/lib/security.ts";
import {
  confirmationPath,
  hasVerifiedEmail,
} from "../src/lib/auth/security.ts";
import {
  emailVerificationTemplate,
  passwordResetTemplate,
} from "../src/lib/email-templates.ts";

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

test("protected auth accepts only Better Auth users with verified email", () => {
  assert.equal(hasVerifiedEmail(null), false);
  assert.equal(hasVerifiedEmail({ emailVerified: false }), false);
  assert.equal(hasVerifiedEmail({ emailVerified: true }), true);
});

test("confirmation path encodes email data instead of interpreting it as a URL", () => {
  assert.equal(
    confirmationPath("student+aws@example.com"),
    "/signup/confirmacao?email=student%2Baws%40example.com"
  );
  assert.equal(confirmationPath(), "/signup/confirmacao");
});

test("authentication email templates include their action and escape URLs", () => {
  const url = 'https://cloudmastery.example/confirm?token=<unsafe>&next="test"';
  const verification = emailVerificationTemplate(url);
  const passwordReset = passwordResetTemplate(url);

  assert.equal(verification.subject, "Confirme seu e-mail — Cloud Mastery");
  assert.match(verification.html, /Confirmar meu e-mail/);
  assert.equal(passwordReset.subject, "Redefina sua senha — Cloud Mastery");
  assert.match(passwordReset.html, /Redefinir minha senha/);
  assert.match(verification.html, /token=&lt;unsafe&gt;&amp;next=&quot;test&quot;/);
  assert.doesNotMatch(verification.html, /token=<unsafe>/);
  assert.match(verification.html, /cloudmastery-icon\.png/);
  assert.match(verification.html, /src="https:\/\/cloudmastery\.example\/cloudmastery-icon\.png"/);
  assert.match(verification.html, /#f97316/);
  assert.doesNotMatch(verification.html, /#155eef|#35b7ff/);
  assert.match(passwordReset.html, /token=&lt;unsafe&gt;&amp;next=&quot;test&quot;/);
});
