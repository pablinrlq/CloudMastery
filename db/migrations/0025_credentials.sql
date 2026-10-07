-- Verifiable credentials (badges and certificates) earned on the platform.
-- Each row is public through its unguessable code (/c/<code>) and is never
-- re-issued: (user_id, achievement) is unique, so earning is idempotent.
create table if not exists public.credentials (
  id uuid primary key default gen_random_uuid(),
  -- Public identifier shown on the certificate and used in the share URL,
  -- e.g. CM-7K3Q-9XWD-PT4M (Crockford base32, 60 random bits).
  code text not null unique check (code ~ '^CM-[0-9A-Z]{4}-[0-9A-Z]{4}-[0-9A-Z]{4}$'),
  user_id uuid not null references public."user"(id) on delete cascade,
  kind text not null check (kind in ('badge', 'certificate')),
  -- Catalog key, e.g. 'track-complete:ccp', 'streak-7', 'level-5'.
  achievement text not null,
  cert_id text references public.certifications(id) on delete set null,
  title text not null,
  -- Evidence captured at issuance (scores, module counts) so the public page
  -- stays stable even if the account keeps studying.
  evidence jsonb not null default '{}'::jsonb,
  issued_at timestamptz not null default now(),
  revoked_at timestamptz,
  unique (user_id, achievement)
);

create index if not exists credentials_user_id_idx on public.credentials (user_id, issued_at desc);

-- Same protection as free_diagnostic_claims: only the app (table owner) reads
-- and writes; Supabase's anon/authenticated roles get nothing.
do $$
begin
  if exists (select 1 from pg_roles where rolname = 'anon')
     or exists (select 1 from pg_roles where rolname = 'authenticated') then
    alter table public.credentials enable row level security;
  end if;

  if exists (select 1 from pg_roles where rolname = 'anon') then
    execute 'revoke all on table public.credentials from anon';
  end if;

  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    execute 'revoke all on table public.credentials from authenticated';
  end if;
end;
$$;
