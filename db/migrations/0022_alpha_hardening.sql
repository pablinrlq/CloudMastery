-- Alpha hardening: keep authorization helpers out of the exposed public schema,
-- lock down internal routines and provide a concurrency-safe API rate limiter.

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to authenticated, service_role;

create or replace function private.is_email_confirmed()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from auth.users as users
    where users.id = (select auth.uid())
      and users.email_confirmed_at is not null
  );
$$;

revoke all on function private.is_email_confirmed() from public, anon;
grant execute on function private.is_email_confirmed() to authenticated, service_role;

create or replace function private.has_active_access(p_user_id uuid, p_cert_id text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    p_user_id = (select auth.uid())
    and private.is_email_confirmed()
    and exists (
      select 1
      from public.subscriptions as subscriptions
      where subscriptions.user_id = p_user_id
        and subscriptions.status in ('trialing', 'active')
        and (
          subscriptions.plan = 'lifetime'
          or subscriptions.current_period_end > now()
        )
        and (
          p_cert_id = any(subscriptions.cert_access)
          or 'all' = any(subscriptions.cert_access)
        )
    );
$$;

revoke all on function private.has_active_access(uuid, text) from public, anon;
grant execute on function private.has_active_access(uuid, text) to authenticated, service_role;

drop policy if exists "verified users read own subscription" on public.subscriptions;
create policy "verified users read own subscription"
  on public.subscriptions for select to authenticated
  using ((select auth.uid()) = user_id and (select private.is_email_confirmed()));

drop policy if exists "verified users manage own progress" on public.user_progress;
create policy "verified users manage own progress"
  on public.user_progress for all to authenticated
  using ((select auth.uid()) = user_id and (select private.is_email_confirmed()))
  with check ((select auth.uid()) = user_id and (select private.is_email_confirmed()));

drop policy if exists "verified users manage own simulado attempts" on public.simulado_attempts;
create policy "verified users manage own simulado attempts"
  on public.simulado_attempts for all to authenticated
  using ((select auth.uid()) = user_id and (select private.is_email_confirmed()))
  with check ((select auth.uid()) = user_id and (select private.is_email_confirmed()));

drop policy if exists "verified subscribers read flashcards" on public.flashcards;
create policy "verified subscribers read flashcards"
  on public.flashcards for select to authenticated
  using (private.has_active_access((select auth.uid()), cert_id));

drop policy if exists "verified users manage own flashcard progress" on public.user_flashcard_progress;
create policy "verified users manage own flashcard progress"
  on public.user_flashcard_progress for all to authenticated
  using ((select auth.uid()) = user_id and (select private.is_email_confirmed()))
  with check ((select auth.uid()) = user_id and (select private.is_email_confirmed()));

drop function if exists public.has_active_access(uuid, text);
drop function if exists public.is_email_confirmed();

alter function public.set_updated_at() set search_path = '';
revoke all on function public.set_updated_at() from public, anon, authenticated;

revoke all on function public.append_simulado_hint(uuid, uuid, uuid)
  from public, anon, authenticated;
grant execute on function public.append_simulado_hint(uuid, uuid, uuid) to service_role;

alter table public.cloudmastery_migrations enable row level security;
revoke all on table public.cloudmastery_migrations from public, anon, authenticated;

create index if not exists simulado_attempts_cert_id_idx
  on public.simulado_attempts (cert_id);
create index if not exists user_flashcard_progress_flashcard_id_idx
  on public.user_flashcard_progress (flashcard_id);
create index if not exists user_progress_module_id_idx
  on public.user_progress (module_id);

create table if not exists private.api_rate_limits (
  bucket_key text not null,
  window_start timestamptz not null,
  request_count integer not null check (request_count > 0),
  primary key (bucket_key, window_start)
);
revoke all on table private.api_rate_limits from public, anon, authenticated;

create or replace function public.consume_api_rate_limit(
  p_bucket_key text,
  p_limit integer,
  p_window_seconds integer
)
returns table (allowed boolean, remaining integer, retry_after integer)
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_now timestamptz := clock_timestamp();
  v_window_start timestamptz;
  v_count integer;
begin
  if p_bucket_key is null or length(p_bucket_key) < 3 or length(p_bucket_key) > 300
     or p_limit < 1 or p_limit > 10000
     or p_window_seconds < 1 or p_window_seconds > 86400 then
    raise exception 'invalid rate limit parameters';
  end if;

  v_window_start := to_timestamp(
    floor(extract(epoch from v_now) / p_window_seconds) * p_window_seconds
  );

  insert into private.api_rate_limits (bucket_key, window_start, request_count)
  values (p_bucket_key, v_window_start, 1)
  on conflict (bucket_key, window_start)
  do update set request_count = private.api_rate_limits.request_count + 1
  returning request_count into v_count;

  return query select
    v_count <= p_limit,
    greatest(p_limit - v_count, 0),
    greatest(ceil(extract(epoch from (v_window_start + make_interval(secs => p_window_seconds) - v_now)))::integer, 1);
end;
$$;

revoke all on function public.consume_api_rate_limit(text, integer, integer)
  from public, anon, authenticated;
grant execute on function public.consume_api_rate_limit(text, integer, integer)
  to service_role;
