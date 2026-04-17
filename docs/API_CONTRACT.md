# Backend API Contract (Filament + Laravel)

This document is the frontend-side contract for the Laravel/Filament backend.
Everything listed here is consumed by the refactored Nuxt 4 app. Anything not
listed here is not used by the frontend.

Versioned under `NUXT_PUBLIC_API_BASE` (default `/api/v1`).

---

## 1. Global request/response conventions

### Request headers the frontend sends on every call
| Header | Source | Notes |
| --- | --- | --- |
| `Authorization: Bearer <token>` | Sanctum PAT or similar | absent for public endpoints |
| `X-Tenant: <tenant-id>` | current tenant id (numeric or uuid) | **REQUIRED** for all tenant-scoped endpoints |
| `X-Request-ID: <hex>-<ts>` | generated client-side | **log this on the server** — it's how oncall correlates a browser error to a Laravel log line |
| `X-Client-Version: <appEnv>` | build env label | use for deprecation telemetry |
| `Idempotency-Key: <uuid>` | only on `POST/PUT/PATCH/DELETE` that pass `idempotencyKey` | **must** short-circuit duplicate submits inside a 24h window |
| `Accept: application/json` | always | |
| `Accept-Language: ar \| en` | current i18n locale | used to localize `message` and enum labels |

### Response shapes

**List / paginated:**
```json
{
  "data": [/* items */],
  "meta": { "current_page": 1, "per_page": 15, "total": 120, "last_page": 8 },
  "links": { "next": "...", "prev": null }
}
```

**Single:**
```json
{ "data": { /* resource */ } }
```

**Validation error (HTTP 422):**
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "email": ["The email field is required."],
    "total": ["Must be greater than 0."]
  }
}
```

**Generic error (401/403/404/429/5xx):**
```json
{ "message": "Human-readable summary", "code": "optional_machine_code" }
```

The frontend `core/api/errors.ts` maps HTTP status to `ApiErrorCode`:
- `401 → unauthorized` (auto-logout + redirect to `/auth/login`)
- `403 → forbidden` (toast shown)
- `404 → not_found`
- `422 → validation` (field errors shown inline)
- `429 → rate_limited` (toast; client retries GETs automatically)
- `5xx → server` (retry on idempotent GETs; surfaced to user otherwise)

### Retry behavior
The client retries on `408, 425, 429, 500, 502, 503, 504` for **GET** requests
only, 2 attempts with 300ms delay. For non-GET, retries must be backed by
`Idempotency-Key` or they won't retry at all.

---

## 2. Auth endpoints

### `POST /login`
```json
// request
{ "email": "a@b.com", "password": "..." }
```
```jsonc
// response (200)
{
  "message": "ok",
  "data": {
    "user":  { /* User resource, see §3 */ },
    "token": "plain-text-sanctum-token",
    "subscription": { /* Subscription snapshot, see §4 */ }
  }
}
```

### `POST /logout`
- Requires `Authorization`. Revokes current token. 204 or `{ "message": "..." }`.

### `POST /forgot-password`
- Body `{ "email": "..." }` → 204 / `{ "message": "..." }`.
- Never leaks whether the email exists.

### `POST /register`
- Body: whatever the registration form sends. Response mirrors `POST /login`.

### `GET /me` *(auth required)*
```jsonc
{
  "data": { /* User */ },
  "subscription": { /* Subscription snapshot */ }
}
```
Note: `subscription` is **sibling** to `data`, not under it. The frontend plugin
`session.client.ts` calls this on cold load when a token is present.

---

## 3. User resource

```ts
interface User {
  id: number
  name: string
  email: string
  phone: string | null
  role: 'admin' | 'accountant' | 'auditor' | 'client' | string  // tenant-scoped role slug; NOT 'super_admin' (that lives in Filament)
  permissions: string[]                    // array of permission slugs
  locale: 'ar' | 'en'
  timezone: string | null
  is_active: boolean
  tenant_id: number | null
  client_id: number | null                 // populated only for role='client'
  last_login_at: string | null
  created_at: string
  tenant: TenantInfo | null
}

interface TenantInfo {
  id: number
  name: string
  slug: string
  email: string | null
  phone: string | null
  logo_path: string | null                 // public URL
  tagline: string | null
  primary_color: string | null
  secondary_color: string | null
  city: string | null
}
```

### Permission slugs the frontend knows about
From `app/core/rbac/permissions.ts`:
```
view_dashboard
manage_clients
manage_invoices
manage_accounts
post_journal_entries
manage_journal_entries
view_reports
manage_documents
manage_team
manage_timesheets
manage_payroll
manage_eta
manage_subscription
manage_onboarding
manage_settings
```
The backend is free to add more. Anything it returns in `permissions[]` is simply
checked with `can(perm)` on the client. No schema enforcement.

---

## 4. Subscription snapshot (CRITICAL — this is new)

Returned from `POST /login` and `GET /me`, and refetched from:

### `GET /me/subscription` *(auth required)*
```jsonc
{
  "data": {
    "plan": {
      "id":         "plan-pro-monthly",
      "tier":       "pro",                     // free | starter | pro | business | enterprise
      "name":       "Pro (monthly)",
      "expires_at": "2026-05-18T00:00:00Z",    // ISO 8601, null when not applicable
      "is_trial":   false
    },
    "flags": {
      "payroll_enabled":     true,
      "eta_enabled":         false,
      "messaging_enabled":   true,
      "bulk_import_enabled": false
    }
  }
}
```

- `tier` drives plan-gating for features declared with `plans: ['pro', ...]` in
  each `feature.ts`. Tiers are ordered: `free < starter < pro < business < enterprise`.
  A feature that requires `['pro']` is available to anyone on `pro` or higher.
- `flags` are feature-flag booleans. A feature declared with
  `flag: 'payroll_enabled'` in its manifest is hidden entirely (404) when the
  flag is false.
- The frontend does **not** fetch per-flag or per-plan endpoints. Send the whole
  snapshot every time.
- When `plan` is `null`, the user sees everything gated as "plan required" and
  bounces to `/subscription?required=<feature>`.

### Subscription management (existing, unchanged expected)
- `GET /subscription` → current subscription details (billing cycle, price, trial_ends_at, status)
- `GET /subscription/usage` → per-meter usage `{ users, clients, invoices, storage }` each `{ current, limit, percent, exceeded }`

---

## 5. Tenant-scoped CRUD endpoints

All require `Authorization` + `X-Tenant`. All accept pagination via `?page=` and
most accept `?search=`. Return shapes follow §1.

### Clients
- `GET    /clients?page=&search=`
- `GET    /clients/{id}`
- `POST   /clients`
- `PUT    /clients/{id}`
- `DELETE /clients/{id}`

### Invoices
- `GET    /invoices?page=&search=&status=&client_id=&from=&to=`
- `GET    /invoices/{id}`
- `POST   /invoices`                          **idempotent** (Idempotency-Key)
- `PUT    /invoices/{id}`
- `DELETE /invoices/{id}`
- `POST   /invoices/{id}/send`                **idempotent**
- `POST   /invoices/{id}/cancel`
- `POST   /invoices/{id}/post-to-gl`
- `POST   /invoices/{id}/credit-note` body `{ lines: [...] }`
- `POST   /payments` body `PaymentForm`       **idempotent**

### Accounts (chart of accounts)
- `GET/POST/PUT/DELETE /accounts`
- Supporting: `GET /fiscal-years`, `POST /fiscal-years`

### Journal entries
- `GET/POST/PUT/DELETE /journal-entries`
- `POST /journal-entries/{id}/post` (post to GL)

### Reports *(read-only)*
- `GET /reports/balance-sheet?date=`
- `GET /reports/income-statement?from=&to=`
- `GET /reports/cash-flow?from=&to=`
- `GET /reports/trial-balance?date=`
- `GET /reports/ledger?account_id=&from=&to=`
- `GET /reports/aging`
- `GET /reports/comparative?period=`
- `GET /reports/client-statement?client_id=&from=&to=`

### Documents
- `GET /documents?page=&type=`
- `POST /documents` (multipart/form-data)
- `DELETE /documents/{id}`
- `GET /documents/{id}/download` → redirect or `{ url }` for signed URL

### Team
- `GET /team` — members + their role + 2FA status
- `POST /team/invite` — invite by email with role
- `PATCH /team/{id}` — change role / activate
- `DELETE /team/{id}`
- **`GET /roles`** — tenant-scoped role list (was `/admin/roles`, **moved to tenant scope**)

### Timesheets & time billing
- `GET/POST/PUT/DELETE /timesheets`
- `GET /timesheets/summary?from=&to=`
- `POST /time-billing/generate` — turn selected timesheets into invoice drafts

### Payroll (plan-gated: `business+`, flag: `payroll_enabled`)
- `GET/POST /payroll` — runs
- `GET /payroll/{id}` — single run
- `GET/POST/PUT/DELETE /employees`
- `POST /payroll/{id}/process` — **idempotent**

### ETA (plan-gated: `business+`, flag: `eta_enabled`)
- `GET /eta` — dashboard status
- `GET/PUT /eta/settings`
- `GET/POST /eta/item-codes`
- `GET /eta/documents`, `GET /eta/documents/{id}`
- `POST /eta/reconcile` — **idempotent**, triggers reconciliation job

### Settings
- `GET/PUT /settings/profile`
- `GET/PUT /settings/security` — password change, 2FA enroll
- `GET/PUT /settings/notifications`
- `GET/PUT /settings/currencies`

### Onboarding
- `GET /onboarding/state`
- `POST /onboarding/{step}` — save step data

### Import
- `POST /import/preview` (multipart)
- `POST /import/execute` — **idempotent**

### Notifications
- `GET /notifications?page=&unread=`
- `POST /notifications/{id}/read`
- `POST /notifications/read-all`

### Messaging (plan-gated: `pro+`, flag: `messaging_enabled`)
- `GET/POST /threads`
- `GET/POST /threads/{id}/messages`

---

## 6. Client portal endpoints (role=client only)

All tenant-scoped. The backend must enforce that a `client` user only sees their
own data.

- `GET /portal/invoices` — invoices where `client_id = user.client_id`
- `GET /portal/invoices/{id}`
- `GET /portal/documents`
- `GET /portal/messages`
- `POST /portal/messages`
- `GET /portal/notifications`
- `GET/PUT /portal/profile`

---

## 7. Public endpoints (no auth)

Consumed by the marketing site. Previously these had `/admin/*` twins for editing
in-frontend — those are removed. Filament now owns all writes.

- `GET /landing` — `LandingData` (hero, stats, features)
- `GET /plans` — `Plan[]` for pricing display
- `GET /testimonials` — `Testimonial[]`
- `GET /faqs` — `FaqItem[]`
- `GET /pages/{slug}` — CMS page (terms, privacy, changelog, about)
- `GET /blog`, `GET /blog/{slug}`, `GET /blog/featured`
- `GET /blog/categories`, `GET /blog/tags`
- `POST /contact` — contact form submission

---

## 8. What the backend must do

### 8.1 Honor `X-Request-ID`
Log it on every request. Include it in `exception` logs. If Sentry is wired on
the backend too, set it as a tag. This is the single biggest debugging multiplier.

### 8.2 Honor `Idempotency-Key`
Required on: `POST /invoices`, `POST /invoices/{id}/send`, `POST /payments`,
`POST /import/execute`, `POST /payroll/{id}/process`, `POST /eta/reconcile`.
Recommended on all money-moving operations.

Store `(tenant_id, idempotency_key)` → response payload for 24h. Repeat hits
return the original response (200, not 201). This prevents double-charges if a
network retry happens.

### 8.3 Honor `X-Tenant`
Every tenant-scoped route must 400 if `X-Tenant` is missing, 403 if the user's
`tenant_id` doesn't match the header. Do NOT trust `user.tenant_id` as the
scope — always use the header.

### 8.4 Subscription snapshot is mandatory
`POST /login` and `GET /me` must include `subscription`. Without it, the
frontend treats everything as "plan required" and gates all features.

### 8.5 Permissions are declarative
Put the source of truth in Filament. The backend must return `permissions[]`
on the User resource. The frontend never guesses or derives them.

### 8.6 Role constraints
`user.role = 'client'` is frontend-special: it routes to `/portal/**`. Any other
role (admin, accountant, auditor, bookkeeper, …) gets the main dashboard and
is gated only by `permissions[]`. **Do not** return `role: 'super_admin'` to
the frontend — that's Filament-only now.

### 8.7 Feature flags are plan-aware server-side
`flags` in the subscription snapshot should already reflect plan eligibility
and tenant overrides. The frontend only reads the boolean. Don't push the
"for plan X, flag Y is on" logic into the client.

### 8.8 Rate limiting
Return 429 with `Retry-After` header and `{ "message": "..." }` body. The
frontend toasts the message and client-side retry kicks in for GETs.

### 8.9 Security headers *(optional but expected)*
- `Strict-Transport-Security` on HTTPS
- `Content-Security-Policy` (frontend-friendly — Nuxt emits `X-Frame-Options`,
  `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` via nitro)
- `X-Tenant-Id` echoed back (helpful for log correlation)

---

## 9. What the frontend does NOT need from the backend

These used to be called but are now deleted from the client:
- `POST/PUT/DELETE /admin/blog/posts`, `/admin/blog/categories`, `/admin/blog/tags`
- `GET/PUT /admin/landing`
- `GET/POST/PUT/DELETE /admin/testimonials`, `/admin/faqs`, `/admin/plans`
- `GET/POST/PUT/DELETE /admin/pages`
- `GET /admin/roles` → moved to tenant-scoped `GET /roles`
- Everything under `/admin/*` that used to power the deleted admin panel.
  Filament owns these.

---

## 10. Enum reference

### Plan tiers (frontend order)
```
free < starter < pro < business < enterprise
```

### Subscription status (frontend displays as Badge)
```
active | trial | past_due | cancelled | expired
```

### Invoice status
```
draft | sent | partial | paid | cancelled | overdue
```
(Whatever the backend uses — the frontend just passes through strings and
localizes via i18n.)

---

## 11. Change log for this contract

- **v2** (current) — post-admin-removal. `/admin/*` routes deleted. Subscription
  snapshot now required on `/login` and `/me`. `Idempotency-Key` support added.
  `X-Request-ID` required for log correlation. `/admin/roles` → `/roles`.
- **v1** — pre-refactor. Admin CRUD lived in the frontend. No subscription
  snapshot. No request correlation.
