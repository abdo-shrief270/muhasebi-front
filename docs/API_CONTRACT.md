# Frontend ↔ Backend Contract

**The authoritative spec is the numbered `01-*.md` through `28-*.md` docs in this folder.** This file covers only the cross-cutting parts the frontend is built against.

---

## Base URL + versioning

- Production: `${NUXT_PUBLIC_API_BASE}` — defaults to `http://muhasebi.test/v1`.
- Every path below is **relative to that base**. The path `/invoices` means `<base>/invoices`.

## Headers the frontend sends

| Header | When | Purpose |
| --- | --- | --- |
| `Authorization: Bearer <sanctum-token>` | every auth'd request | session |
| `Accept: application/json` | always | |
| `Accept-Language: ar \| en` | always | localized `message` + enum labels |
| `X-Request-ID: <hex>-<ts>` | every request | log correlation — **the backend MUST log this on every request** |
| `X-Client-Version: <appEnv>` | every request | deprecation telemetry |
| `Idempotency-Key: <uuid>` | on money-moving POST/PUT/PATCH/DELETE when the caller supplies one | dedupe retries |

**No `X-Tenant` header.** Tenant is inferred from the authenticated user. (Portal users use a portal-scoped token under `/v1/portal/*`.)

## Response envelope

- Single resource: `{ "data": T }`
- List: `{ "data": T[], "meta": { current_page, per_page, total, last_page }, "links"?: { next, prev, first, last } }`
- Validation error (422): `{ "message": "...", "errors": { "field": ["msg"] } }`
- Everything else: `{ "message": "human text" }` with the HTTP status code.

## Auth flow (see `01-authentication.md`)

### Login

```jsonc
POST /login
{ "email": "...", "password": "...", "device_name": "optional" }

// 200
{ "data": {
    "user":     { id, name, email, role, locale, timezone, ... },
    "tenant":   { id, name, plan, features: ["invoicing","payroll",...], ... },
    "token":    "sanctum-token",
    "requires_2fa": false
  } }
```

If `requires_2fa: true`, the frontend calls `POST /2fa/verify` with the 6-digit TOTP (or recovery code) to upgrade the token.

### /me

```jsonc
GET /me
{ "data": {
    "user":               { id, name, email, locale, timezone, ... },
    "tenant":             { id, plan, features: [...] },
    "permissions":        ["manage_invoices","view_reports",...],
    "two_factor_enabled": false
  } }
```

`/me` is the cold-load sync endpoint. The frontend's `plugins/session.client.ts` calls it on app start whenever a token cookie exists. The response hydrates the auth store (user, tenant, permissions) and the subscription store (plan, features[]).

## Gating model

- **Permissions** are strings on `permissions[]` from `/me`. Frontend checks with `usePermissions().can('manage_invoices')`. The full list of slugs lives in `app/core/rbac/permissions.ts`.
- **Feature flags** are strings on `tenant.features[]` from `/me` or `/login`. Frontend checks with `useSubscription().isFlagEnabled('payroll')`. The full list of flags lives in `app/core/subscription/flags.ts`.
- **Plan tier** (`tenant.plan`) is **display-only**. Gating is flag-based. The frontend doesn't compare tiers.
- **Middleware** (`app/middleware/access.global.ts`) reads the feature manifest (`feature.ts`) and applies gates in this order: unauthenticated → permission (403) → flag (redirect to `/subscription?required=<feature>`) → plan (same redirect).

## Retry / idempotency contract

The frontend's `core/api/client.ts`:

- **Retries GETs** on `408, 425, 429, 500, 502, 503, 504` (2 attempts, 300ms delay).
- **Does NOT retry mutations** by default. If the caller passes `{ idempotencyKey }`, the client forwards `Idempotency-Key: <uuid>`; the backend MUST key `(tenant_id, key) → response` for 24h and replay the stored response on collision.
- **Offline queue** (`core/reliability/offlineQueue.ts`) replays mutations when connectivity returns — each replay carries its original idempotency key.

Backend MUST honor `Idempotency-Key` on at minimum:

- `POST /invoices`, `POST /invoices/{id}/send`, `POST /payments`
- `POST /bills`, `POST /bill-payments`, `POST /expenses/*` (submit/approve/reimburse)
- `POST /payroll/{id}/calculate|approve|mark-paid`
- `POST /eta/documents/{invoice}/submit|cancel`
- `POST /subscription/subscribe|change-plan|renew`
- `POST /import/*`

## Error-code mapping (`core/api/errors.ts`)

- `401 unauthorized` → auto-clear auth + redirect to `/auth/login`
- `403 forbidden` → toast (`insufficient permissions`)
- `404 not_found` → typed `ApiError` — caller decides
- `422 validation` → `fieldErrors` available; `useZodForm` maps them back to the form
- `429 rate_limited` → toast with retry hint; client-side retry handles GETs
- `5xx server` → typed `ApiError`; GETs retry, mutations do not

## Rate limits the frontend expects

| Class | Endpoints | Ceiling |
| --- | --- | --- |
| `throttle:5,1` | register, login, contact, 2fa-verify, subscription ops | 5/min/IP |
| `throttle:3,1` | change-password, 2fa-disable | 3/min/user |
| `throttle:10,1` | payments create, messaging send | 10/min/user |
| `throttle:reports` | `/reports/*` (heavy) | backend-defined |
| `throttle:exports` | `/export/*` (heavy) | backend-defined |

Client shows a 429 toast automatically. For `throttle:reports`/`throttle:exports` the frontend may additionally gate the button to prevent spam — decided per-page.

## Change log

- **v3 (current)** — aligned with `docs/01..28-*.md`. Base URL is `/v1`, no `X-Tenant` header, `/me` returns `{ user, tenant{plan,features}, permissions, two_factor_enabled }`, gating is flag-based on `tenant.features[]`.
- **v2** — subscription snapshot on `/login` + `/me`, idempotency keys, request correlation.
- **v1** — pre-refactor.
