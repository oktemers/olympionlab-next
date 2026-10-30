# OlympionLab V14 — Giriş, ders akışı ve güvenlik raporu

Date: 2026-10-30
Scope: Follow-up to merged V13; current draft PR V14.

## Confirmed from repository before changes
- V13 PR #12 was already merged into `main`. Existing billing endpoints fail closed.
- `/courses/:slug` was linked from authenticated Courses page, but no dynamic page existed.
- Password reset emails pointed to an absent `/reset-password` page.
- Registration UI submitted Turkish descriptive branch labels instead of profile enum values.
- After signing up when confirmation was required, UI redirected to the dashboard even though no session existed.
- Base Supabase migration permitted students to UPDATE their own profile rows, **not excluding privileged role and plan fields**. Thus the live database must be checked for privilege escalation.

## V14 code changes
1. Canonical `/giris` links, return URL allowlist, Google callback verification, email confirmation-aware sign-up, profile branch synchronization after verified sign-in.
2. New password reset UI supports Supabase PKCE callback and compatible legacy hash-based recovery session; updates password only with a valid session.
3. Add `/courses/[slug]`: authenticated lesson-section listing and inline YouTube-nocookie player, membership labels and prerequisite checks.
4. Add `/api/course-progress`: origin validation, signed-in user, course+active lesson membership, correct branch, tier and prerequisite checks. Saves manual completion to **user_video_progress** rather than unrelated legacy **user_progress**.
5. Onboarding/settings input validation, aligned settings dropdown values with Supabase enums and retained custom study goals; show saving errors rather than silently continuing.
6. SQL migration `supabase/migrations/0003_profile_payment_privileges.sql` revokes user UPDATE on privileged profile columns and blocks client INSERT of fake payment records. Server service-role billing remains separate.
7. No shared homepage header/footer, pricing page or visual layout changed.

## REQUIRED — Supabase SQL migration
**Merely merging this PR will not execute the SQL against the hosted Supabase database** unless an explicit migrations pipeline has been configured. Before production sign-off:
1. In the **correct** Supabase project, inspect current policies/privileges and back up the existing schema.
2. Run migration `0003_profile_payment_privileges.sql` through trusted Supabase SQL Editor or configured migration tooling.
3. Verify a normal authenticated student can update `full_name/branch/level/goal`, but CANNOT update `role/plan` or create payment rows.
4. Verify trusted server-side administrative operations still work. Do not paste the service-role key into the repository.

## Required browser and auth QA (not automated by this PR)
- [ ] Mobile Safari/Chrome login, 5+ hamburger open/close repetitions; no dark overlay.
- [ ] E-mail/password sign-in and Google sign-in, no external redirect.
- [ ] New account: email confirmation pending → explanatory message; confirm → panel, branch retained.
- [ ] Settings: save physics/chemistry/math/biology, level and custom goal, refresh to verify values persist.
- [ ] Request reset email, open fresh link, update password, sign in with the new password.
- [ ] `/kurslar` → an unlocked course section, open video; refresh and save manual completion.
- [ ] Free user cannot mark paid-only videos completed or bypass prerequisite stages.
- [ ] Two simultaneous student accounts cannot read or update each other's progress.
- [ ] Unauthenticated course requests redirect to `/giris`.
- [ ] Check Supabase table `course_sections`, `lesson_videos`, and `user_video_progress` exist with appropriate RLS. These are used by the existing course screen, but their schema is **not defined in repository migration 0001**.
- [ ] Vercel build and typecheck latest commit; preview device testing.
- [ ] Billing endpoints stay HTTP 503 until verified provider integration exists.

## Limitations and next engineering work
- No real payment processing, refund/renewal or card collection has been enabled.
- Marking a lesson completed is explicitly manual. Verified watched time requires an on-site player with trusted progress events; a browser event alone is not proof.
- Existing legacy `public/lesson.html` has local-only state; reconciling it with the new server-side student progress system needs another scoped migration/implementation.
- No production Supabase migration, real Google login, mailbox recovery clickthrough or device QA can be confirmed from GitHub/Vercel build logs alone.
- After these tests, prioritize robust server-side quotas/logging for AI Coach and then the olympiad question bank.

## Rollback
Revert the V14 PR if login/course routing regresses. SQL privilege revocation should **not** be casually reverted; fix affected legitimate profile updates using column-specific grants instead.
