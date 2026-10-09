-- The simulado start route reads the student's latest attempts per certification
-- to avoid repeating questions.
create index if not exists simulado_attempts_user_cert_started_idx
  on public.simulado_attempts (user_id, cert_id, started_at desc);
