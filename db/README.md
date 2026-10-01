# PostgreSQL

1. Configure `DATABASE_URL` em `.env.local` (local: `postgresql://postgres:1234@localhost:5433/cloudmastery`).
2. Execute `npm run db:migrate`.
3. Configure `BETTER_AUTH_SECRET` com pelo menos 32 bytes aleatórios.

O schema canônico fica em `prisma/schema.prisma`. Depois de qualquer alteração nele, execute `npm run db:generate`; o arquivo `src/generated/kysely/types.ts` não deve ser editado manualmente.

Ao migrar uma instância Supabase existente, `0000_better_auth.sql` preserva UUIDs e emails. Por segurança, hashes de senha não são importados: cada usuário deve usar “Esqueci minha senha” uma vez.

## Contas de teste

`npm run db:seed-demo` cria `premium@cloudmastery.test` (Premium, com histórico de estudo) e `gratis@cloudmastery.test` (plano gratuito), já com o e-mail verificado, então não precisa de SMTP. A senha é sorteada e impressa uma única vez; rodar de novo recria as contas com outra senha (ou defina `DEMO_PASSWORD`).

Em um banco que não é localhost o comando exige `--remote`. Use só em banco de teste/preview, nunca em produção: as contas têm senha conhecida e acesso Premium. O botão "Gerenciar assinatura" não funciona nelas, porque o cliente Stripe é fictício.
