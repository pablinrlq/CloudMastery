import "server-only";
import nodemailer from "nodemailer";

let transporter: ReturnType<typeof nodemailer.createTransport> | undefined;

export async function sendAuthEmail(to: string, subject: string, html: string) {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? "587");
  const secure = process.env.SMTP_SECURE === "true";
  const user = process.env.SMTP_USER;
  const password = process.env.SMTP_PASSWORD;
  const from = process.env.AUTH_EMAIL_FROM;

  if (!host || !user || !password || !from) {
    if (process.env.NODE_ENV !== "production") console.info(`[auth email] ${subject} -> ${to}\n${html}`);
    else throw new Error("SMTP_HOST, SMTP_USER, SMTP_PASSWORD e AUTH_EMAIL_FROM são obrigatórios em produção");
    return;
  }

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("SMTP_PORT deve ser uma porta válida.");
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    requireTLS: !secure,
    auth: { user, pass: password },
    disableFileAccess: true,
    disableUrlAccess: true,
  });

  console.log(transporter)

  await transporter.sendMail({ from, to, subject, html });
}
