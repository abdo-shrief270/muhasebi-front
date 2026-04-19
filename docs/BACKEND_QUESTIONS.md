# Open Questions for the Backend Team

Items where the spec doesn't quite answer what the frontend needs to do. Most have a sensible default already wired in the code — the goal of answering these is to lock behavior down before it drifts in production.

Each item lists: **what the frontend currently assumes** → **what we need confirmed**.

---

## 01 · Auth & 2FA

### 1.1 Token scope after `requires_2fa: true`
**Doc reference:** `docs/01-authentication.md` → `POST /login` response includes `token` even when `requires_2fa: true`.

**Frontend assumes:** the returned token is **scoped to `/2fa/verify` only** until the user supplies a TOTP. Calling any other authenticated endpoint with it should return 401 or a dedicated `requires_2fa` error. After `/2fa/verify` succeeds, the SAME token is "upgraded" (no new token swap).

**Confirm:**
- Is that the real behavior? (`app/stores/auth.ts` → `verify2fa()` keeps the same token.)
- Or is a new token issued on verify? If so, what is the response shape of `/2fa/verify`?

### 1.2 Recovery codes on `/2fa/verify`
**Confirm:** when a user enters a recovery code (not a TOTP), does the same `/2fa/verify` endpoint accept it, or is there a separate path?

### 1.3 `throttle:5,1` on login — per IP or per email?
**Confirm:** the frontend shows a generic "rate limited" toast on 429. Should we also call out "5 attempts / min" in the UX? More specifically, is the limit per IP or per account so we know whether rotating accounts defeats it.

---

## 02 · Portal user auth

### 2.1 Portal login endpoint
**Doc reference:** `docs/05-clients.md` describes `POST /clients/{client}/invite-portal` which provisions a portal user. `docs/28-client-portal.md` lists `/v1/portal/*` endpoints but does NOT document how portal users obtain their session token.

**Frontend currently has no portal-login path wired up.** 

**Confirm one of:**
- (a) Portal users use the same `POST /login` — the response role flag distinguishes them.
- (b) There's a dedicated `POST /portal/login` endpoint not in the docs.
- (c) The magic link sent in the invite is the only auth mechanism (no password).

If (c), what's the endpoint that exchanges the magic-link token for a Sanctum token?

### 2.2 Portal user role on `/me`
**Confirm:** when a portal user hits `/v1/me`, what does `user.role` return? The frontend's middleware checks `role === 'client'` to route to `/portal`. Is that still the string, or something else (e.g. `client_portal_user` as mentioned in module 28 notes)?

---

## 03 · Idempotency-Key

### 3.1 Storage window
**Frontend assumes** `Idempotency-Key` replay window is **24 hours per `(tenant_id, key)` pair**.

**Confirm:** is that right? If shorter (e.g. 1 hour), the offline-queue replay-on-reconnect behavior may need adjustment for mutations that sat pending overnight.

### 3.2 Response on replay
**Frontend assumes** replaying a key that matches a previously-completed request returns the **original response with the original HTTP status** (e.g. 201 on a successful POST, even on the replay).

**Confirm:** or does the backend return 200 / 409 on replay? This matters because `useQuery`/`useMutation` error handling keys off the status.

### 3.3 Scope
**Confirm:** is `Idempotency-Key` required, optional, or opportunistic on each of these endpoints?
- `POST /invoices` · `POST /invoices/{id}/send` · `POST /payments`
- `POST /bills` · `POST /bills/{id}/payments`
- `POST /payroll/{id}/calculate|approve|mark-paid`
- `POST /eta/documents/{invoice}/submit|cancel`
- `POST /subscription/subscribe|change-plan|renew`
- `POST /import`

The frontend currently **generates a UUID per mutation** on these routes. If the backend rejects requests without one, we're fine. If it silently ignores them, retries can double-charge.

---

## 04 · Response envelopes

### 4.1 Bulk endpoint status codes
**Doc reference:** `docs/21-documents.md` → bulk upload returns 201 on full success, 206 on partial.
**Doc reference:** `docs/22-ecommerce.md` → bulk-convert returns 200 always with per-order status in the body.

**Confirm:** which pattern is canonical? The frontend handles both today but we'd like to pick one.

### 4.2 Error shape on 422
**Doc reference:** every doc says 422 is `{ message, errors: { field: [msgs] } }`.

**Confirm:** the `errors` object is keyed by **HTML form field name** (e.g. `"lines.0.quantity"` for a nested array), not a human label. `useZodForm.applyApiErrors()` assumes that shape.

---

## 05 · Rate limiting classes

### 5.1 `throttle:reports` and `throttle:exports`
**Doc reference:** `docs/19-reporting.md` says these are custom rate-limit classes.

**Confirm:** what are the numeric limits? (e.g. `throttle:reports` = N requests per minute per user?) The frontend could preemptively disable buttons during cooldown if we knew the window.

### 5.2 Messaging `throttle:10,1`
**Confirm:** per user, per tenant, or per IP? 10 sends / min is very low if it's per tenant for a busy accounting firm.

---

## 06 · Multi-tenancy

### 6.1 Tenant inference
**Doc reference:** `docs/01-authentication.md` → "Tenant context is inferred from the authenticated user — there is no explicit `X-Tenant-ID` header for app users."

**Confirm:** this is consistent across every endpoint in modules 03–27? The frontend has dropped `X-Tenant` entirely.

### 6.2 Cross-tenant users
**Confirm:** can a single user belong to multiple tenants (e.g. an accountant serving several firms)? If yes, how do they switch tenants? There's no such UI today.

---

## 07 · Webhooks (inbound)

### 7.1 Signature verification
**Doc reference:** `docs/02-public-routes.md` lists `POST /webhooks/paymob|fawry|beon-chat|ecommerce/{platform}` as signature-verified.

**Frontend is not a consumer of these** — they come INTO the backend. Flagged only so we know there's no work needed on our side. Delete this section after confirming.

---

## 08 · Storage & file limits

### 8.1 Document upload
**Doc reference:** `docs/21-documents.md` — single: 20 MB max, bulk: 10 files max.

**Confirm:** per-file 20 MB in bulk, or 20 MB aggregate?

### 8.2 Receipt upload on expenses
**Doc reference:** `docs/10-expenses.md` — "jpg/png/pdf ≤ 10MB".

**Confirm:** hard reject at 10MB or soft warning? Frontend currently has no client-side size check — trusting backend 413.

---

## 09 · Feature-flag source of truth

### 9.1 `tenant.features[]` on `/me`
**Frontend assumes** `tenant.features[]` is the **single source of truth** for plan gating. The array is the union of: plan-bundled flags + any per-tenant overrides.

**Confirm:** that's the behavior? No separate "flags" endpoint to merge?

### 9.2 Flag naming
**Confirm** these 17 flag slugs are canonical:
```
accounting, audit_log, bills_vendors, budgeting, clients, client_portal,
collections, cost_centers, custom_reports, documents, e_invoice, expenses,
fixed_assets, inventory, invoicing, payroll, reports, tax, timesheets
```
(stored at `app/core/subscription/flags.ts`)

Any flag added server-side that ISN'T in this list will render its feature's sidebar entry invisible on the frontend until we extend the const.

---

## 10 · Permissions

### 10.1 `permissions[]` on `/me`
**Confirm** these 30 slugs are the complete set:
```
view_dashboard, view_audit, manage_subscription, manage_team, manage_onboarding,
manage_settings, manage_landing_page, manage_clients, invite_client_portal,
manage_accounts, manage_journal_entries, post_journal_entries, manage_invoices,
send_invoices, manage_payments, manage_collections, manage_vendors, manage_bills,
manage_expenses, manage_fixed_assets, manage_inventory, manage_cost_centers,
manage_tax, manage_eta, manage_employees, manage_payroll, manage_timesheets,
approve_timesheets, manage_engagements, view_reports, manage_reports,
manage_approvals, manage_alerts, manage_documents, manage_integrations
```
(stored at `app/core/rbac/permissions.ts`)

### 10.2 Role-to-permission map
**Confirm:** is there a backend-visible mapping of **built-in role → default permissions** the frontend could display in team management? Today the team page shows permission slugs as-is, not role presets.

---

## Template for answering

Please edit this file in place and mark each item:

- ✅ **Confirmed** — frontend assumption matches reality
- 🔁 **Correction needed** — (explain) — I'll update the frontend
- 🚫 **Not implemented yet** — (eta) — frontend will stub/skip until ready

And delete the section once all its items are resolved.
