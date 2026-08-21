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
