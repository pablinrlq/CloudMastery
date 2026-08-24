# PostgreSQL

1. Configure `DATABASE_URL` em `.env.local` (local: `postgresql://postgres:1234@localhost:5433/cloudmastery`).
2. Execute `npm run db:migrate`.
3. Configure `BETTER_AUTH_SECRET` com pelo menos 32 bytes aleatórios.

O schema canônico fica em `prisma/schema.prisma`. Depois de qualquer alteração nele, execute `npm run db:generate`; o arquivo `src/generated/kysely/types.ts` não deve ser editado manualmente.

Ao migrar uma instância Supabase existente, `0000_better_auth.sql` preserva UUIDs e emails. Por segurança, hashes de senha não são importados: cada usuário deve usar “Esqueci minha senha” uma vez.
