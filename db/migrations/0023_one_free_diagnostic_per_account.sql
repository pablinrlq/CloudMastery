-- A new account can choose exactly one certification for its free diagnostic.
-- Keep historical attempts intact; this dedicated claim is the final authority.
create table if not exists public.free_diagnostic_claims (
  -- Better Auth owns identities in public."user". Migration 0000 imports
  -- legacy Supabase users into that table before this migration is run.
  user_id uuid primary key references public."user"(id) on delete cascade,
  cert_id text not null references public.certifications(id),
  attempt_id uuid not null references public.simulado_attempts(id) on delete cascade,
  claimed_at timestamptz not null default now()
);

-- Preserve Supabase's direct-client protection when its roles are available,
-- while allowing the same schema to run in plain local Postgres.
do $$
begin
  if exists (select 1 from pg_roles where rolname = 'anon')
     or exists (select 1 from pg_roles where rolname = 'authenticated') then
    alter table public.free_diagnostic_claims enable row level security;
  end if;

  if exists (select 1 from pg_roles where rolname = 'anon') then
    execute 'revoke all on table public.free_diagnostic_claims from anon';
  end if;

  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    execute 'revoke all on table public.free_diagnostic_claims from authenticated';
  end if;
end;
$$;

-- Existing diagnostics are preserved and treated as a claim, oldest first.
insert into public.free_diagnostic_claims (user_id, cert_id, attempt_id, claimed_at)
select distinct on (user_id) user_id, cert_id, id, started_at
from public.simulado_attempts
where mode = 'diagnostic'
order by user_id, started_at asc
on conflict (user_id) do nothing;
