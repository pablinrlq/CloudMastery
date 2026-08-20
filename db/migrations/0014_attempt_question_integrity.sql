-- Bind each attempt to the exact server-selected question set. Without this,
-- a modified client could submit arbitrary question ids and distort its score.
alter table simulado_attempts
  add column if not exists selected_question_ids uuid[] not null default '{}';
