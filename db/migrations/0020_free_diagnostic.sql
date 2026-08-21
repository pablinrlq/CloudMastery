-- One resumable free diagnostic per user and certification. Premium modes
-- remain protected by application authorization and paid-access RLS.
alter table public.simulado_attempts
  drop constraint if exists simulado_attempts_mode_check;

alter table public.simulado_attempts
  add constraint simulado_attempts_mode_check
  check (mode in ('diagnostic', 'full', 'domain'));

create unique index if not exists simulado_one_diagnostic_per_user_cert
  on public.simulado_attempts (user_id, cert_id)
  where mode = 'diagnostic';

-- Atomic hint registration avoids lost updates when two requests arrive together.
create or replace function public.append_simulado_hint(
  p_attempt_id uuid,
  p_question_id uuid,
  p_user_id uuid
)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.simulado_attempts
  set hints_used = case
    when hints_used @> jsonb_build_array(p_question_id::text) then hints_used
    else hints_used || jsonb_build_array(p_question_id::text)
  end
  where id = p_attempt_id
    and user_id = p_user_id
    and completed_at is null
    and p_question_id = any(selected_question_ids);
$$;

revoke all on function public.append_simulado_hint(uuid, uuid, uuid) from public;
-- The app invokes this with its service-role client after checking ownership.
grant execute on function public.append_simulado_hint(uuid, uuid, uuid) to service_role;
