-- Local Better Auth uses public."user" and server-side authorization. Older
-- Supabase migrations below still reference its auth schema and database roles.
-- Provide no-login compatibility objects only for standalone Postgres installs;
-- a real Supabase project already owns all of these objects.
do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    create role anon nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then
    create role authenticated nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then
    create role service_role nologin;
  end if;

  if not exists (select 1 from pg_namespace where nspname = 'auth') then
    create schema auth;
  end if;
  if to_regclass('auth.users') is null then
    create table auth.users (
      id uuid primary key,
      email_confirmed_at timestamptz
    );
  end if;
  if to_regprocedure('auth.uid()') is null then
    execute 'create function auth.uid() returns uuid language sql stable as ''select null::uuid''';
  end if;
  if to_regprocedure('public.is_email_confirmed()') is null then
    execute 'create function public.is_email_confirmed() returns boolean language sql stable security definer set search_path = '''' as ''select exists (select 1 from auth.users where id = auth.uid() and email_confirmed_at is not null)''';
  end if;
  if to_regprocedure('public.set_updated_at()') is null then
    execute 'create function public.set_updated_at() returns trigger language plpgsql set search_path = '''' as ''begin new.updated_at = now(); return new; end;''';
  end if;
end;
$$;

-- A stale 'active' row must not grant access forever if Stripe delivery is delayed.
create or replace function public.has_active_access(p_user_id uuid, p_cert_id text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    p_user_id = (select auth.uid())
    and public.is_email_confirmed()
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

revoke all on function public.has_active_access(uuid, text) from public;
grant execute on function public.has_active_access(uuid, text) to authenticated;
