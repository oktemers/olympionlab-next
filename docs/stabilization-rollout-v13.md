# OlympionLab V13 — stabilization rollout checklist

This release intentionally changes **no public design, header/footer, or plan prices**.

## Security and data correctness

- `/api/payments/create` (GET/POST) returns HTTP 503 with `PAYMENTS_NOT_CONFIGURED`. It does not insert misleading "created" payments.
- `/api/payments/callback` (POST) returns HTTP 503. It does not accept an unverified gateway token or write "callback_received".
- **Do not enable live billing by changing only this status.** First implement the chosen provider (PayTR or other), signed callback verification, amount/currency/plan reconciliation, payment intent identity, idempotent processing, retries, recurring renewal/cancelation, and sandbox tests. Secrets remain in Vercel Environment Variables (never GitHub).
- Video completion is **student-declared**, not verified watch duration. The endpoint validates the authenticated user, numeric video ID, video existence and plan entitlement, and never fabricates watched time.
- Student-only static routes fail closed (503) if Supabase configuration is missing.

## Before merging the pull request

1. Ensure Vercel Preview build is **Ready** for the **latest commit**. Run `npm run build` and `npm run typecheck` in Codespaces for extra confidence.
2. Open `/panel`, `/ders/<valid-id>`, `/rota/adim/1`, and `/student-labs` as a signed-in account; check mobile menu 5+ consecutive open/close cycles.
3. From a valid lesson, click **Dersi tamamladım**. Refresh; it should show completed, and should not change watched seconds to an unrealistic number. Check free accounts cannot mark paid-only lessons as completed.
4. Test invalid `/api/progress?videoId=abc` POST (400), and unauthenticated request (login redirect). Cross-origin requests must be refused.
5. Test `/api/payments/create?plan=plus` returns 503 and does not create a payment row. Test `/api/payments/callback` returns 503 and does not create a payment row. Use non-production credentials when testing future provider integrations.
6. Review `/sitemap.xml` (only public canonical URLs) and `/robots.txt`. Submit the refreshed sitemap in Search Console after merge.
7. AI Koç: verify with/without `OPENAI_API_KEY`; without key it should visibly label its rule-based guidance, not impersonate a model. With a configured model, test a valid question and a malformed/overlarge request.

## Deployment/rollback

- Merge only after user acceptance of preview. The GitHub `main` branch should not be force-pushed.
- If the preview fails, do not merge; fix on the branch.
- If the production deploy regresses, revert the merge commit and redeploy the last known-good Vercel deployment.
- There are **no database migrations** in this release.

## Follow-up work (separate PRs)

1. Verified, provider-specific paid subscriptions and subscription lifecycle.
2. Full in-site lesson player progress events and normalized canonical lesson URLs.
3. Stable YouTube catalog sync with publication-status checks.
4. AI Coach cost quotas and observability using a durable server-side quota store.
5. Content and question bank after the existing experience passes mobile regression tests.
