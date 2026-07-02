# Plataforma de estudos para certificações AWS

SaaS de assinatura com trilhas de estudo (MDX), simulados cronometrados com correção server-side, flashcards e diagnóstico de prontidão para as certificações AWS. MVP: Cloud Practitioner (CLF-C02) e Solutions Architect Associate (SAA-C03).

> O produto ainda não tem nome/marca definidos — textos usam placeholders neutros.

## Stack

- Next.js 16 (App Router, Turbopack) + TypeScript + Tailwind v3
- Supabase (Postgres + Auth) — usuários, progresso, questões, assinaturas
- Stripe — assinatura mensal/anual (checkout, portal, webhook)
- MDX (`next-mdx-remote`) — conteúdo dos módulos em `/content`

## Setup local

1. `npm install`
2. Crie um projeto em [supabase.com](https://supabase.com) e rode as migrations de `db/migrations/` em ordem no SQL editor (ver `db/README.md`).
3. Copie `.env.example` para `.env.local` e preencha Supabase + Stripe.
4. No Stripe (modo teste): crie um produto de assinatura com preço mensal e anual; cole os price IDs no `.env.local`.
5. Webhook local: `stripe listen --forward-to localhost:3000/api/stripe/webhook` e cole o signing secret no `.env.local`.
6. `npm run dev`

## Arquitetura — pontos importantes

- **Gabarito nunca vai ao cliente**: a tabela `questions` não tem policy de select para usuários; `/api/simulado/start` retorna questões sem resposta e `/api/simulado/submit` corrige no servidor (service-role key).
- **Gate de acesso**: `proxy.ts` (o middleware do Next 16) redireciona deslogados; `lib/dal.ts` (`requireAccess`) valida a assinatura por certificação em cada página paga.
- **Assinaturas**: estado espelhado do Stripe via webhook em `subscriptions` (upsert por `user_id`).
- **Conteúdo**: módulos MDX em `content/<cert>/modules/`, registrados em `db/migrations/0003_seed_modules.sql` (manter em sincronia).
- **Nota**: Next.js 16 mudou APIs (params são Promises, `middleware.ts` → `proxy.ts`). Docs reais em `node_modules/next/dist/docs/`.
- **Compatibilidade Windows**: Tailwind fixado na v3 porque o Smart App Control desta máquina bloqueia o binário nativo do v4. Evitar dependências com binários nativos não assinados.
