-- Defense in depth: an authenticated JWT is not enough. The account must also
-- have a confirmed email before it can read or mutate user-owned application data.

create or replace function public.is_email_confirmed()
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

revoke all on function public.is_email_confirmed() from public;
grant execute on function public.is_email_confirmed() to authenticated;

-- Preserve the paid-access helper, now requiring both ownership of the JWT and
-- a confirmed email. This prevents direct API access from bypassing the UI guard.
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
          p_cert_id = any(subscriptions.cert_access)
          or 'all' = any(subscriptions.cert_access)
        )
    );
$$;

revoke all on function public.has_active_access(uuid, text) from public;
grant execute on function public.has_active_access(uuid, text) to authenticated;

drop policy if exists "users read own subscription" on public.subscriptions;
drop policy if exists "verified users read own subscription" on public.subscriptions;
create policy "verified users read own subscription"
  on public.subscriptions
  for select
  to authenticated
  using (
    (select auth.uid()) = user_id
    and (select public.is_email_confirmed())
  );

drop policy if exists "users manage own progress" on public.user_progress;
drop policy if exists "verified users manage own progress" on public.user_progress;
create policy "verified users manage own progress"
  on public.user_progress
  for all
  to authenticated
  using (
    (select auth.uid()) = user_id
    and (select public.is_email_confirmed())
  )
  with check (
    (select auth.uid()) = user_id
    and (select public.is_email_confirmed())
  );

drop policy if exists "users manage own simulado attempts" on public.simulado_attempts;
drop policy if exists "verified users manage own simulado attempts" on public.simulado_attempts;
create policy "verified users manage own simulado attempts"
  on public.simulado_attempts
  for all
  to authenticated
  using (
    (select auth.uid()) = user_id
    and (select public.is_email_confirmed())
  )
  with check (
    (select auth.uid()) = user_id
    and (select public.is_email_confirmed())
  );

drop policy if exists "subscribers read flashcards" on public.flashcards;
drop policy if exists "verified subscribers read flashcards" on public.flashcards;
create policy "verified subscribers read flashcards"
  on public.flashcards
  for select
  to authenticated
  using (public.has_active_access((select auth.uid()), cert_id));

drop policy if exists "users manage own flashcard progress" on public.user_flashcard_progress;
drop policy if exists "verified users manage own flashcard progress" on public.user_flashcard_progress;
create policy "verified users manage own flashcard progress"
  on public.user_flashcard_progress
  for all
  to authenticated
  using (
    (select auth.uid()) = user_id
    and (select public.is_email_confirmed())
  )
  with check (
    (select auth.uid()) = user_id
    and (select public.is_email_confirmed())
  );

-- certifications/modules remain public reference metadata for marketing pages.
-- questions remain inaccessible to clients. Service-role processes (Stripe and
-- server-side grading) bypass RLS by design and therefore also validate the user
-- in their Route Handler before touching user-owned data.
