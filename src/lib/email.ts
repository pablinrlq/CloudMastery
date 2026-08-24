import "server-only";

export async function sendAuthEmail(to: string, subject: string, html: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.AUTH_EMAIL_FROM;
  if (!apiKey || !from) {
    if (process.env.NODE_ENV !== "production") console.info(`[auth email] ${subject} -> ${to}\n${html}`);
    else throw new Error("RESEND_API_KEY e AUTH_EMAIL_FROM são obrigatórios em produção");
    return;
  }
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to, subject, html }),
  });
  if (!response.ok) throw new Error(`Falha ao enviar email de autenticação (${response.status})`);
}
