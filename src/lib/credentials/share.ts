// Credential codes, share links and holder-name rules. Pure and client-safe.

// Crockford base32: no I, L, O or U, so codes survive being read aloud or typed.
const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
const CODE_RE = /^CM-[0-9A-HJKMNP-TV-Z]{4}-[0-9A-HJKMNP-TV-Z]{4}-[0-9A-HJKMNP-TV-Z]{4}$/;

function secureRandomBytes(length: number) {
  const bytes = new Uint8Array(length);
  globalThis.crypto.getRandomValues(bytes);
  return bytes;
}

/** CM-XXXX-XXXX-XXXX: 12 symbols × 5 bits = 60 random bits, unguessable. */
export function generateCredentialCode(randomBytes: (length: number) => Uint8Array = secureRandomBytes): string {
  // 256 is a multiple of 32, so masking keeps every symbol equally likely.
  const symbols = Array.from(randomBytes(12), (byte) => ALPHABET[byte & 31]).join("");
  return `CM-${symbols.slice(0, 4)}-${symbols.slice(4, 8)}-${symbols.slice(8, 12)}`;
}

export function normalizeCredentialCode(input: string): string | null {
  const value = input.trim().toUpperCase();
  return CODE_RE.test(value) ? value : null;
}

export function credentialPath(code: string) {
  return `/c/${code}`;
}

/**
 * LinkedIn "Add to profile" for Licenses & certifications. With a company page
 * id the entry shows its logo; otherwise LinkedIn uses the name as plain text.
 */
export function linkedInAddToProfileUrl({
  title,
  issuedAt,
  url,
  code,
  organizationId,
}: {
  title: string;
  issuedAt: string | Date;
  url: string;
  code: string;
  organizationId?: string | null;
}) {
  const date = new Date(issuedAt);
  const params = new URLSearchParams({ startTask: "CERTIFICATION_NAME", name: title });
  if (organizationId) params.set("organizationId", organizationId);
  else params.set("organizationName", "CloudMastery");
  params.set("issueYear", String(date.getUTCFullYear()));
  params.set("issueMonth", String(date.getUTCMonth() + 1));
  params.set("certUrl", url);
  params.set("certId", code);
  return `https://www.linkedin.com/profile/add?${params.toString()}`;
}

/** LinkedIn builds the post preview from the page's Open Graph tags. */
export function linkedInShareUrl(url: string) {
  return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
}

export function whatsappShareUrl(text: string) {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export function xShareUrl(text: string, url: string) {
  return `https://x.com/intent/post?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
}

export function shareCaption({ title, url, kind }: { title: string; url: string; kind: "badge" | "certificate" }) {
  return kind === "certificate"
    ? `Concluí a trilha e conquistei o ${title} na CloudMastery. A credencial pode ser verificada aqui: ${url}`
    : `Nova conquista na minha preparação para a AWS: ${title}. Credencial verificável: ${url}`;
}

export function formatIssuedDate(value: string | Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(value));
}

const NAME_RE = /^\p{L}[\p{L}\p{M}' .-]*$/u;

/** Name printed on certificates: letters, spaces, apostrophes, dots and hyphens. */
export function normalizeHolderName(input: unknown): { ok: true; value: string } | { ok: false; error: string } {
  const value = String(input ?? "")
    .normalize("NFC")
    .replace(/\s+/g, " ")
    .trim();
  if (value.length < 3) return { ok: false, error: "Digite seu nome completo." };
  if (value.length > 80) return { ok: false, error: "Use no máximo 80 caracteres." };
  if (!NAME_RE.test(value)) return { ok: false, error: "Use apenas letras, espaços, apóstrofo, ponto e hífen." };
  return { ok: true, value };
}

/** A full name (two or more words of letters), not an e-mail-style handle. */
export function looksLikeFullName(name: string | null | undefined) {
  if (!name) return false;
  const value = name.trim();
  return NAME_RE.test(value) && value.split(" ").filter(Boolean).length >= 2;
}
