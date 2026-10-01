export const PASSWORD_MIN_LENGTH = 12;

export function passwordPolicyError(password: string) {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `A senha precisa ter pelo menos ${PASSWORD_MIN_LENGTH} caracteres.`;
  }
  if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
    return "Use letras maiúsculas e minúsculas, número e símbolo.";
  }
  return null;
}
