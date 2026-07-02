-- Initial schema for AWS Certs study platform
-- Run in Supabase SQL editor (or via `supabase db push`) in order.

create extension if not exists "pgcrypto";

-- ============================================================
-- Reference data
-- ============================================================

create table certifications (
  id text primary key,                    -- 'ccp', 'saa'
  name text not null,
  code text not null,                     -- 'CLF-C02', 'SAA-C03'
  exam_duration_minutes int not null,
  exam_question_count int not null,
  passing_score int not null,             -- e.g. 700 (AWS scaled score)
  created_at timestamptz not null default now()
);

create table modules (
  id uuid primary key default gen_random_uuid(),
  cert_id text not null references certifications(id) on delete cascade,
  slug text not null,
  title text not null,
  domain text,                            -- exam domain this module maps to
  order_index int not null,
  created_at timestamptz not null default now(),
  unique (cert_id, slug)
);

-- ============================================================
-- Subscriptions (mirrors Stripe state via webhook)
-- ============================================================

create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  stripe_customer_id text not null,
  stripe_subscription_id text,
  status text not null default 'incomplete'
    check (status in ('trialing','active','past_due','canceled','incomplete','incomplete_expired','unpaid')),
  plan text,                              -- 'monthly' | 'annual'
  cert_access text[] not null default '{}', -- e.g. {'ccp','saa'} or {'all'}
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger subscriptions_set_updated_at
  before update on subscriptions
  for each row execute function set_updated_at();

-- Helper used by RLS policies to check paid access to a certification.
create or replace function has_active_access(p_user_id uuid, p_cert_id text)
returns boolean as $$
  select exists (
    select 1 from subscriptions
    where user_id = p_user_id
      and status in ('trialing','active')
      and (p_cert_id = any(cert_access) or 'all' = any(cert_access))
  );
$$ language sql stable security definer;

-- ============================================================
-- Progress tracking
-- ============================================================

create table user_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  module_id uuid not null references modules(id) on delete cascade,
  status text not null default 'not_started'
    check (status in ('not_started','in_progress','completed')),
  last_visited_at timestamptz not null default now(),
  unique (user_id, module_id)
);

-- ============================================================
-- Question bank (answers must never be exposed to the client
-- before grading -- see /api/simulado/submit, which uses the
-- service-role key. No RLS policy below grants client select.)
-- ============================================================

create table questions (
  id uuid primary key default gen_random_uuid(),
  cert_id text not null references certifications(id) on delete cascade,
  domain text not null,
  prompt text not null,
  choices jsonb not null,                 -- [{"id":"a","text":"..."}, ...]
  correct_choice_ids text[] not null,      -- supports multi-select questions
  explanation text,
  difficulty text not null default 'medium' check (difficulty in ('easy','medium','hard')),
  created_at timestamptz not null default now()
);

create table simulado_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  cert_id text not null references certifications(id) on delete cascade,
  mode text not null check (mode in ('full','domain')),
  domain text,                            -- set when mode = 'domain'
  score numeric,                          -- percentage, filled on completion
  time_spent_seconds int,
  answers jsonb not null default '{}',     -- {question_id: [choice_ids]}
  domain_breakdown jsonb,                  -- {domain: {correct, total}}
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

-- ============================================================
-- Flashcards
-- ============================================================

create table flashcards (
  id uuid primary key default gen_random_uuid(),
  cert_id text not null references certifications(id) on delete cascade,
  domain text,
  front text not null,
  back text not null,
  created_at timestamptz not null default now()
);

create table user_flashcard_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  flashcard_id uuid not null references flashcards(id) on delete cascade,
  status text not null default 'new' check (status in ('new','review_later','known')),
  last_reviewed_at timestamptz not null default now(),
  unique (user_id, flashcard_id)
);

-- ============================================================
-- Row Level Security
-- ============================================================

alter table certifications enable row level security;
alter table modules enable row level security;
alter table subscriptions enable row level security;
alter table user_progress enable row level security;
alter table questions enable row level security;
alter table simulado_attempts enable row level security;
alter table flashcards enable row level security;
alter table user_flashcard_progress enable row level security;

-- Certifications & modules: metadata is public (used for marketing/pricing
-- pages and course navigation). Actual module MDX content lives in the app
-- bundle (/content), gated by subscription in app code, not by this table.
create policy "certifications are publicly readable"
  on certifications for select using (true);

create policy "modules are publicly readable"
  on modules for select using (true);

-- Subscriptions: users can only see/manage their own row.
-- Inserts/updates from webhooks use the service-role key and bypass RLS.
create policy "users read own subscription"
  on subscriptions for select using (auth.uid() = user_id);

-- Progress: owner-only read/write.
create policy "users manage own progress"
  on user_progress for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Questions: intentionally NO select policy for anon/authenticated roles.
-- Only the server (service-role key) reads this table, e.g. to build a
-- simulado and to grade it, so correct_choice_ids never reaches the client
-- before grading.

-- Simulado attempts: owner-only.
create policy "users manage own simulado attempts"
  on simulado_attempts for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Flashcards: front/back is paid content, gated by active subscription.
create policy "subscribers read flashcards"
  on flashcards for select
  using (has_active_access(auth.uid(), cert_id));

create policy "users manage own flashcard progress"
  on user_flashcard_progress for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
