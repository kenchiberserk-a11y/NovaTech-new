# NovaTech authentication audit runbook

## Scope and safety
Run tests only against an environment you own and have explicitly authorized. Keep production data out of the test account. Do not enable weak credentials on a public Vercel deployment or run password spraying/brute-force traffic against the public site. Use a local-only clone or isolated VM for tests that require intentionally weak passwords; use a separate throwaway database and fake records.

## Current implementation status
- Supabase Auth handles password verification; this app does not store plaintext passwords.
- The role selector is not an authorization mechanism. The role is read from `profiles`.
- New profiles default to `employee`; role changes must be performed by a trusted operator.
- RLS is enabled on profiles and audit events. Audit events are admin-readable and have no client write policy.
- Dashboard metrics are placeholders, not real records.
- No server-side distributed rate limiter, account lockout policy, MFA enforcement, or trusted audit-event writer has been wired yet. Treat these as required before production.

## Test checklist
1. Unauthenticated requests to `/workspace` and `/admin` redirect to sign-in.
2. An employee account cannot access `/admin`, even by directly entering the URL.
3. Choosing “Administrador” in the UI does not elevate an employee account.
4. A user cannot read another user's profile through the Supabase API.
5. An employee cannot query `audit_events`; an administrator can read them.
6. Invalid credentials return a generic message and do not reveal whether an email exists.
7. Verify rate limiting at the edge/WAF or via a shared server-side limiter before enabling any password-guessing test.
8. Confirm no service-role key or other secret appears in browser bundles, Git history, logs, or public environment variables.
9. Review Vercel Preview deployment before any Production promotion.

## Recommended next security controls
- Add a shared rate limiter (for example, an Upstash Redis-backed limiter) at the login boundary; an in-memory counter is not reliable on serverless deployments.
- Configure Supabase Auth email confirmation, password policy, MFA for administrators, and session expiry/revocation.
- Add a trusted server-side audit writer that records event type, outcome, actor, timestamp, and request correlation ID. Never record passwords, access tokens, or session cookies.
- Use server-side authorization checks in every route that reads sensitive data. Middleware is defense-in-depth, not the sole control.
- Add per-table RLS policies before introducing real business records.
