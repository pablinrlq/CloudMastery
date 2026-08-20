# Cloud Mastery — checklist de Auth no Supabase

## 1. Exigir confirmação de email

1. Abra **Authentication → Sign In / Providers → Email**.
2. Mantenha **Allow new users to sign up** ligado.
3. Ligue **Confirm email**. Quando essa opção fica desligada, o Supabase confirma o cadastro implicitamente.
4. Mantenha **Secure email change** ligado para exigir confirmação nos dois endereços durante uma troca.
5. Salve e teste com um endereço que nunca foi cadastrado.

> O app também verifica `email_confirmed_at` no Proxy, no DAL, nos Route Handlers e nas políticas RLS. Assim, uma sessão antiga ou uma configuração alterada por engano não libera o sistema.

## 2. Configurar URLs de produção

Abra **Authentication → URL Configuration**:

- **Site URL:** `https://cloudmastery.vercel.app` enquanto esse for o domínio principal.
- **Redirect URLs de produção:**
  - `https://cloudmastery.vercel.app/auth/callback`
  - `https://cloudmastery.vercel.app/auth/callback?next=/dashboard`
  - `https://cloudmastery.vercel.app/auth/callback?next=/redefinir-senha`
- **Desenvolvimento local, somente quando necessário:**
  - `http://localhost:3000/auth/callback`
  - `http://localhost:3000/auth/callback?next=/dashboard`
  - `http://localhost:3000/auth/callback?next=/redefinir-senha`

Ao publicar em EC2 ou domínio próprio, troque o **Site URL** pelo domínio HTTPS definitivo e adicione os três callbacks equivalentes. A variável `NEXT_PUBLIC_SITE_URL` do app deve usar exatamente a mesma origem.

## 3. Corrigir entrega de email com SMTP próprio

O SMTP padrão do Supabase é apenas para testes: ele envia somente para endereços da equipe da organização, tem limite muito baixo e não oferece garantia de entrega. Em produção:

1. Contrate um provedor transacional, como AWS SES, Resend, Postmark ou SendGrid.
2. Verifique um domínio ou subdomínio exclusivo, por exemplo `auth.cloudmastery.com.br`.
3. Publique no DNS os registros **SPF**, **DKIM** e **DMARC** fornecidos pelo provedor.
4. No provedor, desative rastreamento/reescrita de links para mensagens de autenticação; isso pode consumir ou invalidar links de uso único.
5. Abra **Project Settings → Authentication → Emails → SMTP Settings** (em algumas versões: **Authentication → Emails → SMTP Settings**).
6. Ligue **Custom SMTP** e preencha:
   - **Sender email:** endereço verificado, como `no-reply@auth.cloudmastery.com.br`.
   - **Sender name:** `Cloud Mastery`.
   - **Host:** host SMTP fornecido pelo provedor.
   - **Port:** normalmente `587` com STARTTLS ou `465` com TLS, conforme o provedor.
   - **Username/Password:** credenciais SMTP, não chaves de API comuns.
7. Salve e envie um cadastro real para Gmail e Outlook. Verifique `Authentication → Logs` e os logs/bounces do provedor.

No AWS SES, tire a conta do **sandbox** antes do lançamento; no sandbox, o destinatário também precisa estar verificado.

## 4. Ajustar limites sem abrir abuso

Abra **Authentication → Rate Limits**:

- Ajuste **Rate limit for sending emails** somente depois de ativar SMTP próprio.
- Comece conservadoramente e aumente conforme o volume de cadastro esperado.
- Preserve o intervalo mínimo entre reenvios para impedir spam pelo endpoint de confirmação.
- Monitore erros `over_email_send_rate_limit`, hard bounces e reclamações.

O SMTP próprio começa com um limite conservador no Supabase. Não eleve o limite além da capacidade e da reputação permitidas pelo provedor.

## 5. Instalar os templates premium

Abra **Authentication → Email Templates** e copie os arquivos de `supabase/templates`:

| Tipo no Dashboard | Arquivo | Assunto sugerido |
|---|---|---|
| Confirm signup | `confirmation.html` | Confirme sua conta na Cloud Mastery |
| Reset password | `recovery.html` | Redefina sua senha da Cloud Mastery |
| Invite user | `invite.html` | Seu convite para a Cloud Mastery |
| Magic link | `magic-link.html` | Seu acesso seguro à Cloud Mastery |
| Change email address | `email-change.html` | Confirme seu novo email |
| Reauthentication | `reauthentication.html` | Seu código de segurança Cloud Mastery |

Os templates usam apenas variáveis oficiais do Supabase, como `{{ .ConfirmationURL }}`, `{{ .SiteURL }}`, `{{ .NewEmail }}` e `{{ .Token }}`.

## 6. Teste de aceite

1. Cadastre um email novo e confirme que a mensagem chega e possui a logo.
2. Antes de clicar no link, tente abrir `/dashboard`, chamar `/api/simulado/start` e iniciar o checkout: todos devem bloquear.
3. Consulte `subscriptions`, `user_progress` e `simulado_attempts` com o token do usuário não verificado: as consultas devem retornar zero linhas ou negar a operação.
4. Confirme o email e repita os testes: o app passa a permitir a navegação, ainda respeitando a assinatura.
5. Solicite recuperação de senha em `/esqueci-senha`, use o link e defina uma nova senha.
6. Teste link expirado, reenvio repetido, email inexistente e callback adulterado. O app não deve revelar se um email está cadastrado nem aceitar redirecionamento externo.
