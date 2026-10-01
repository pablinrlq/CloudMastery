type AuthEmailTemplate = {
  subject: string;
  html: string;
};

type TemplateContent = {
  preview: string;
  title: string;
  message: string;
  buttonLabel: string;
  url: string;
  securityNote: string;
};

function escapeHtml(value: string) {
  return value.replace(/[&<>"]/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
    };
    return entities[character];
  });
}

function authEmailTemplate({ preview, title, message, buttonLabel, url, securityNote }: TemplateContent) {
  const safeUrl = escapeHtml(url);
  const logoUrl = escapeHtml(new URL("/cloudmastery-icon.png", url).toString());

  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="x-apple-disable-message-reformatting" />
    <title>${escapeHtml(title)}</title>
  </head>
  <body style="margin:0;padding:0;background:#fff7ed;color:#172033;font-family:Arial,Helvetica,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;">
      ${escapeHtml(preview)}
    </div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background:#fff7ed;">
      <tr>
        <td align="center" style="padding:40px 16px;">
          <!--[if mso]>
          <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0"><tr><td>
          <![endif]-->
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:600px;">
            <tr>
              <td align="center" style="padding:0 0 24px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td style="width:40px;height:40px;border-radius:12px;background:#ffffff;box-shadow:0 1px 3px rgba(124,45,18,0.15);">
                      <img src="${logoUrl}" width="40" height="40" alt="Cloud Mastery" style="display:block;width:40px;height:40px;border:0;border-radius:12px;" />
                    </td>
                    <td style="padding-left:10px;color:#172033;font-size:18px;font-weight:700;letter-spacing:-0.3px;">Cloud Mastery</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="overflow:hidden;border:1px solid #fed7aa;border-radius:20px;background:#ffffff;box-shadow:0 12px 32px rgba(124,45,18,0.08);">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td style="padding:40px 40px 32px;">
                      <p style="margin:0 0 12px;color:#ea580c;font-size:12px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;">Acesso à sua conta</p>
                      <h1 style="margin:0;color:#172033;font-size:30px;font-weight:700;letter-spacing:-0.8px;line-height:1.2;">${escapeHtml(title)}</h1>
                      <p style="margin:20px 0 0;color:#4b5870;font-size:16px;line-height:1.65;">${escapeHtml(message)}</p>
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:30px 0;">
                        <tr>
                          <td align="center" bgcolor="#f97316" style="border-radius:10px;">
                            <a href="${safeUrl}" style="display:inline-block;padding:15px 22px;color:#ffffff;font-size:15px;font-weight:700;line-height:20px;text-decoration:none;">${escapeHtml(buttonLabel)} &rarr;</a>
                          </td>
                        </tr>
                      </table>
                      <p style="margin:0;color:#66758f;font-size:13px;line-height:1.6;">${escapeHtml(securityNote)}</p>
                      <div style="height:1px;margin:28px 0 20px;background:#ffedd5;"></div>
                      <p style="margin:0 0 8px;color:#66758f;font-size:12px;line-height:1.6;">Se o botão não funcionar, copie e cole este endereço no navegador:</p>
                      <p style="margin:0;word-break:break-all;color:#c2410c;font-size:12px;line-height:1.6;"><a href="${safeUrl}" style="color:#c2410c;text-decoration:underline;">${safeUrl}</a></p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:24px 20px 0;color:#8491a7;font-size:12px;line-height:1.6;">
                Cloud Mastery &middot; Preparação focada para certificações AWS<br />
                Se você não solicitou esta mensagem, pode ignorá-la com segurança.
              </td>
            </tr>
          </table>
          <!--[if mso]>
          </td></tr></table>
          <![endif]-->
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function emailVerificationTemplate(url: string): AuthEmailTemplate {
  return {
    subject: "Confirme seu e-mail — Cloud Mastery",
    html: authEmailTemplate({
      preview: "Confirme seu e-mail para ativar sua conta Cloud Mastery.",
      title: "Confirme seu e-mail",
      message: "Falta só uma etapa para ativar sua conta e começar sua preparação.",
      buttonLabel: "Confirmar meu e-mail",
      url,
      securityNote: "Este link é pessoal e de uso único. Não o compartilhe com ninguém.",
    }),
  };
}

export function passwordResetTemplate(url: string): AuthEmailTemplate {
  return {
    subject: "Redefina sua senha — Cloud Mastery",
    html: authEmailTemplate({
      preview: "Recebemos um pedido para redefinir sua senha.",
      title: "Redefina sua senha",
      message: "Recebemos um pedido para criar uma nova senha para sua conta. Use o botão abaixo para continuar.",
      buttonLabel: "Redefinir minha senha",
      url,
      securityNote: "Se você não solicitou essa alteração, ignore este e-mail. Sua senha atual continuará protegida.",
    }),
  };
}
