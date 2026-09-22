-- A new account can choose exactly one certification for its free diagnostic.
-- Keep historical attempts intact; this dedicated claim is the final authority.
create table if not exists public.free_diagnostic_claims (
  user_id uuid primary key references auth.users(id) on delete cascade,
  cert_id text not null references public.certifications(id),
  attempt_id uuid not null references public.simulado_attempts(id) on delete cascade,
  claimed_at timestamptz not null default now()
);

alter table public.free_diagnostic_claims enable row level security;
revoke all on table public.free_diagnostic_claims from anon, authenticated;

-- Existing diagnostics are preserved and treated as a claim, oldest first.
insert into public.free_diagnostic_claims (user_id, cert_id, attempt_id, claimed_at)
select distinct on (user_id) user_id, cert_id, id, created_at
from public.simulado_attempts
where mode = 'diagnostic'
order by user_id, created_at asc
on conflict (user_id) do nothing;
