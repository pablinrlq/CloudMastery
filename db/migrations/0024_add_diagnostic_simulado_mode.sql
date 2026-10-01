alter table public.simulado_attempts
  drop constraint if exists simulado_attempts_mode_check;

alter table public.simulado_attempts
  add constraint simulado_attempts_mode_check
  check (mode in ('full', 'domain', 'diagnostic'));
