# Plataforma de estudos para certificações AWS

SaaS de assinatura com trilhas de estudo (MDX), simulados cronometrados com correção server-side, flashcards e diagnóstico de prontidão para as certificações AWS. MVP: Cloud Practitioner (CLF-C02) e Solutions Architect Associate (SAA-C03).

> O produto ainda não tem nome/marca definidos — textos usam placeholders neutros.

## Stack

- Next.js 16 (App Router, Turbopack) + TypeScript + Tailwind v3
- PostgreSQL + Kysely + Better Auth — usuários, progresso, questões, assinaturas
- Prisma Schema + `prisma-kysely` — geração automática dos tipos do banco usados pelo Kysely
- Stripe — assinatura mensal/anual (checkout, portal, webhook)
- MDX (`next-mdx-remote`) — conteúdo dos módulos em `/content`

## Setup local

1. `npm install`
2. Suba o PostgreSQL (`docker compose up -d db`) e rode `npm run db:migrate`.
3. Copie `.env.example` para `.env.local` e preencha PostgreSQL, Better Auth e Stripe.
4. No Stripe (modo teste): crie um produto de assinatura com preço mensal e anual; cole os price IDs no `.env.local`.
5. Webhook local: defina `CLOUDMASTERY_DEV_ORIGIN` com a origem do servidor de desenvolvimento e rode `stripe listen --forward-to "$env:CLOUDMASTERY_DEV_ORIGIN/api/stripe/webhook"`; depois, copie o signing secret para `.env.local`.
6. `npm run dev`

## Arquitetura — pontos importantes

- **Código da aplicação**: rotas em `src/app`, UI compartilhada em `src/components`, domínio e integrações em `src/lib` e tipos gerados em `src/generated`.
- **Domínios server-side**: autenticação em `src/lib/auth`, banco em `src/lib/db`, Stripe em `src/lib/stripe` e regras de aprendizado em `src/lib/learning`.

- **Gabarito nunca vai ao cliente**: o banco só é acessado no servidor; `/api/simulado/start` retorna questões sem resposta e `/api/simulado/submit` corrige server-side.
- **Gate de acesso**: `src/proxy.ts` redireciona deslogados; `src/lib/dal.ts` (`requireAccess`) valida a assinatura por certificação em cada página paga.
- **Assinaturas**: estado espelhado do Stripe via webhook em `subscriptions` (upsert por `user_id`).
- **Conteúdo**: módulos MDX em `content/<cert>/modules/`, registrados em `db/migrations/0003_seed_modules.sql` (manter em sincronia).
- **Nota**: Next.js 16 mudou APIs (params são Promises, `middleware.ts` → `proxy.ts`). Docs reais em `node_modules/next/dist/docs/`.
- **Compatibilidade Windows**: Tailwind fixado na v3 porque o Smart App Control desta máquina bloqueia o binário nativo do v4. Evitar dependências com binários nativos não assinados.
