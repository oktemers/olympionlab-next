-- 0003_profile_payment_privileges.sql
-- SECURITY: apply to the connected Supabase project using the SQL Editor or migrations.
-- A row-level policy restricting *which row* a user may edit does not restrict
-- *which columns* they can edit. Protect paid plans and administrator roles.
begin;

revoke update on table public.profiles from PUBLIC, anon, authenticated;

-- Students may change only non-privileged profile fields.
-- The existing trigger automatically manages updated_at.
grant update (full_name, branch, level, goal, study_days)
  on table public.profiles to authenticated;

-- Students must never create fake successful payment records.
-- Only a verified server-side payment provider integration should write payments.
drop policy if exists "payments_insert_own" on public.payments;
revoke insert on table public.payments from PUBLIC, anon, authenticated;

commit;
