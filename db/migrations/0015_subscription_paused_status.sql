-- Stripe can pause a subscription. Persist that state without granting access
-- so webhook delivery does not fail on the database status constraint.
alter table subscriptions drop constraint if exists subscriptions_status_check;
alter table subscriptions add constraint subscriptions_status_check
  check (status in (
    'trialing', 'active', 'past_due', 'canceled', 'incomplete',
    'incomplete_expired', 'unpaid', 'paused'
  ));
