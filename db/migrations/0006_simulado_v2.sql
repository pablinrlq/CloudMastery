-- Simulado v2: dicas com penalidade (estilo AWS Jam), tempo por questão,
-- tempo negativo (overtime) e pontuação com/sem penalidade.

alter table questions add column if not exists hint text;

alter table simulado_attempts
  add column if not exists question_timings jsonb,
  add column if not exists hints_used jsonb not null default '[]'::jsonb,
  add column if not exists overtime_seconds integer,
  add column if not exists score_no_penalty integer;

-- Remove duplicatas de seeds anteriores antes de criar os índices únicos.
delete from questions a using questions b
  where a.id > b.id and a.cert_id = b.cert_id and a.prompt = b.prompt;
delete from flashcards a using flashcards b
  where a.id > b.id and a.cert_id = b.cert_id and a.front = b.front;

-- Permite re-execução idempotente dos seeds de questões/flashcards.
create unique index if not exists questions_cert_prompt_uniq
  on questions (cert_id, md5(prompt));
create unique index if not exists flashcards_cert_front_uniq
  on flashcards (cert_id, md5(front));
