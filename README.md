# CloudMastery

Plataforma de preparação para certificações AWS em português. A CloudMastery une trilhas de estudo em MDX, simulados cronometrados, flashcards, diagnóstico gratuito e assinatura Premium para aprofundar a preparação.

## Certificações disponíveis

- AWS Certified Cloud Practitioner — CLF-C02
- AWS Certified Solutions Architect – Associate — SAA-C03
- AWS Certified AI Practitioner — AIF-C01

## Stack

- Next.js 16.3 + TypeScript + Tailwind CSS
- Supabase: Auth, Postgres e Row Level Security
- Stripe: Checkout, portal do cliente e webhooks de assinatura
- MDX: conteúdos versionados em `content/<cert>/modules`
- Vercel: hospedagem, Analytics, Speed Insights, logs e Firewall

## Funcionalidades

- Cadastro, confirmação de e-mail, login, recuperação de senha e bloqueio de contas não verificadas.
- Diagnóstico gratuito por certificação; simulados completos, por domínio, dicas e análise detalhada para assinantes Premium.
- Correção de simulados totalmente server-side: respostas corretas nunca são enviadas ao navegador.
- Assinatura mensal e anual via Stripe, com sincronização imediata pós-checkout e webhook como fonte de verdade para renovações e cancelamentos.
- Gestão da assinatura pelo Stripe Customer Portal.

## Segurança e produção

- RLS protege dados de usuários, progresso, tentativas e assinatura.
- Acesso Premium é validado no servidor e no banco, incluindo confirmação de e-mail e expiração do período contratado.
- CSP com nonce, HSTS, `nosniff`, proteção contra iframe, Referrer Policy e Permissions Policy.
- Rate limits persistentes por usuário para checkout, portal e APIs de simulados.
- Vercel Firewall observa rajadas de tráfego em checkout e simulados; revise os logs antes de transformar regras em bloqueio.
- Não publique `.env.local`, credenciais de Stripe/Supabase, URLs de banco ou chaves de webhook.

## Desenvolvimento local

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Copie o ambiente de exemplo e preencha as variáveis:

   ```bash
   cp .env.example .env.local
   ```

3. Configure o projeto Supabase e aplique as migrations:

   ```bash
   npm run db:migrate
   ```

   Veja [db/README.md](db/README.md) para detalhes. Em produção, as migrations também devem ser aplicadas pelo fluxo controlado do Supabase.

4. Inicie o app:

   ```bash
   npm run dev
   ```

## Variáveis de ambiente essenciais

```env
NEXT_PUBLIC_APP_URL=https://seu-dominio.com
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_MONTHLY=
STRIPE_PRICE_ANNUAL=
```

Use `.env.example` como referência completa. Nunca use valores de produção em arquivos versionados.

## Qualidade

```bash
npm test
npm run lint
npm run build
npm audit --audit-level=high
npm run check:production
```

## Deploy

O repositório está conectado à Vercel: pushes em `main` criam deploy de produção. Para EC2/Docker, consulte [deploy/ec2-amazon-linux-2023.sh](deploy/ec2-amazon-linux-2023.sh).

Antes de abrir cobranças ao público, valide uma compra real ponta a ponta: pagamento Stripe → webhook → registro da assinatura no Supabase → acesso Premium. Confirme também a entrega de e-mails com SMTP/domínio de envio configurado.

## Estrutura

```text
app/          Rotas, páginas e Route Handlers
components/   Componentes de interface
content/      Módulos MDX das trilhas
db/           Migrations e utilitários do banco
deploy/       Script de instalação Docker para EC2
lib/          Auth, billing, DAL, segurança e rate limit
tests/        Testes automatizados
```

## Aviso de marca

AWS, seus serviços e certificações são marcas da Amazon Web Services, Inc. A CloudMastery é uma plataforma independente e não possui afiliação ou endosso da AWS.
