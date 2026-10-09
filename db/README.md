# PostgreSQL

1. Configure `DATABASE_URL` em `.env.local` (local: `postgresql://postgres:1234@localhost:5433/cloudmastery`).
2. Execute `npm run db:migrate`.
3. Configure `BETTER_AUTH_SECRET` com pelo menos 32 bytes aleatórios.

O schema canônico fica em `prisma/schema.prisma`. Depois de qualquer alteração nele, execute `npm run db:generate`; o arquivo `src/generated/kysely/types.ts` não deve ser editado manualmente.

Ao migrar uma instância Supabase existente, `0000_better_auth.sql` preserva UUIDs e emails. Por segurança, hashes de senha não são importados: cada usuário deve usar “Esqueci minha senha” uma vez.

## Contas de teste

`npm run db:seed-demo` cria `premium@cloudmastery.test` (Premium, com histórico de estudo) e `gratis@cloudmastery.test` (plano gratuito), já com o e-mail verificado, então não precisa de SMTP. A senha é sorteada e impressa uma única vez; rodar de novo recria as contas com outra senha (ou defina `DEMO_PASSWORD`).

Em um banco que não é localhost o comando exige `--remote`. Use só em banco de teste/preview, nunca em produção: as contas têm senha conhecida e acesso Premium. O botão "Gerenciar assinatura" não funciona nelas, porque o cliente Stripe é fictício.

### Preview da Vercel com contas de teste automáticas

Cada build de preview pode preparar o próprio banco de teste: com `DEMO_PASSWORD` definida no ambiente **Preview**, o `prebuild` (`db/preview-setup.mjs`) aplica as migrations e recria as duas contas com essa senha. Em builds locais, em produção ou sem `DEMO_PASSWORD` ele não faz nada.

1. Na Vercel: **Storage → Create Database → Neon**, conectado ao projeto só nos ambientes **Preview** (e Development), nunca Production. Isso cria `DATABASE_URL` e `DATABASE_URL_UNPOOLED`.
2. Em **Settings → Environment Variables**, ambiente **Preview**: `BETTER_AUTH_SECRET` (32+ bytes aleatórios), `NEXT_PUBLIC_SITE_URL` (o link do preview) e `DEMO_PASSWORD` (8+ caracteres).
3. **Redeploy** do preview e login com `premium@cloudmastery.test` ou `gratis@cloudmastery.test` e a `DEMO_PASSWORD`.

Cada deploy recria as contas, então o progresso feito nelas volta ao histórico de demonstração. Nunca defina `DEMO_PASSWORD` num ambiente cujo `DATABASE_URL` seja o banco de produção.
