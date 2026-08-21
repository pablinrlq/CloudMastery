import assert from "node:assert/strict";
import test from "node:test";
import { signupErrorMessage } from "../lib/auth-errors.ts";

test("signup errors never expose provider internals", () => {
  assert.equal(
    signupErrorMessage("email_address_invalid"),
    "Informe um endereço de email real e válido."
  );
  assert.match(signupErrorMessage("unknown_provider_error"), /Não foi possível/);
  assert.doesNotMatch(signupErrorMessage("unknown_provider_error"), /provider/i);
});
