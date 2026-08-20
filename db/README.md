# Database setup

1. Create a project at supabase.com.
2. In the SQL editor, run every file in `migrations/` in numeric order. Existing environments must also apply new migrations before deploying matching application code.
3. Copy `.env.example` to `.env.local` and fill in the Supabase URL/keys from Project Settings > API.

## Notes

- `questions` has no client-facing select policy on purpose: correct answers are only ever read server-side (service-role key) when building a simulado and when grading a submission, so they never reach the browser before grading.
- `flashcards` is gated by `has_active_access()`, which checks for an active/trialing subscription covering that certification (or an `all` plan).
- `subscriptions` rows are written by the Stripe webhook handler using the service-role key (bypasses RLS); users can only read their own row.
