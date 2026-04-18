# Architecture

This document is for engineers working on the Muhasebi frontend. Read it before
touching `app/core/*`, `app/shared/*`, or the feature manifest system. For the
backend contract see `docs/API_CONTRACT.md`.

---

## Mental model in one sentence

Every vertical slice of the product lives in `app/features/<name>/` and opts
into subscription/permission/flag gating by shipping a `feature.ts` manifest
that a global middleware reads on every navigation.

---

## Directory layout

```
app/
├── core/                     framework plumbing (tenant-agnostic)
│   ├── api/                  ofetch client, typed errors, useQuery/useMutation
│   ├── auth/                 session guards, defaultRouteFor
│   ├── rbac/                 PERMISSIONS const, Can.vue, usePermissions
│   ├── subscription/         Feature.vue, useFeature, useSubscription, registry
│   ├── tenant/               useTenantId, useTenantTheme
│   ├── telemetry/            logger with pluggable sink (Sentry)
│   └── reliability/          FeatureBoundary, offlineQueue
│
├── shared/                   cross-feature, no domain knowledge
│   ├── ui/                   UiAppButton, UiDataTable, UiSlideOver, …
│   ├── composables/          useZodForm, useDarkMode, useNavigation
│   ├── utils/                timeAgo, design defaults
│   └── types/                common response shapes + entity types
│
├── features/                 the product surface — one folder per slice
│   └── <feature>/
│       ├── feature.ts        the manifest (see below)
│       ├── pages/            route files (wired via nuxt.config pages:extend)
│       ├── components/       feature-scoped components
│       ├── composables/      thin wrappers over services (useQuery/useMutation)
│       ├── services/         pure API layer — only place that touches useApi()
│       ├── schemas.ts        zod schemas + defaults
│       └── types.ts          (optional) feature-specific types
│
├── layouts/                  dashboard, auth, portal, public
├── middleware/               access.global.ts (the one gatekeeper), guest.ts
├── plugins/                  session, sentry, offline, perf, errorHandler
├── stores/                   auth, notifications, toast
└── app.vue, error.vue
```

**Auto-imports:** Nuxt scans `app/core/*`, `app/shared/composables`, and
`features/*/composables` and `features/*/services`. You do not write
`import { useInvoicesList } …` — it's globally available.

---

## Feature manifest (`feature.ts`)

Every feature declares what it is and how it's gated:

```ts
// app/features/payroll/feature.ts
import type { FeatureManifest } from '~/core/subscription/types'
import { PERMISSIONS } from '~/core/rbac/permissions'

export default {
  id: 'payroll',
  routePrefix: '/payroll',
  permission: PERMISSIONS.MANAGE_PAYROLL,    // optional RBAC gate
  plans: ['business', 'enterprise'],         // optional plan-tier floor
  flag: 'payroll_enabled',                   // optional feature flag
  navLabel: 'nav.payroll',                   // i18n key, appears in sidebar
  navIcon: 'payroll',
  navGroup: 'management',                    // groups sidebar items
  order: 110,
} satisfies FeatureManifest
```

`app/core/subscription/registry.ts` uses `import.meta.glob` to auto-collect
all `features/*/feature.ts` at build time. You never register anything manually.

### How gating decides

The precedence in `core/subscription/useFeature.ts → evaluateFeature()`:
1. **unauthenticated** — not logged in
2. **permission** — missing RBAC permission
3. **plan** — tier below required floor
4. **flag** — feature flag off

The `access.global.ts` middleware reads this and redirects:
- `permission` → abortNavigation 403
- `plan` → `/subscription?required=<feature.id>`
- `flag` → abortNavigation 404 (feature hidden entirely)

The subscription page reads `?required=` and shows an upgrade banner.

### Where to check from UI

- **Route-level:** nothing — global middleware handles it
- **Sidebar link:** `useNavigation()` computes groups from the registry, skips
  denied features automatically
- **Inline button:** `<Feature id="payroll" v-slot="{ allowed }">…</Feature>`
- **Single permission:** `<Can perm="manage_invoices">…</Can>`

---

## Data flow per feature

Three layers. Code touches each layer only from the one above.

```
pages + components
       │
       ▼
composables    useInvoicesList / useInvoiceMutations
       │       thin wrappers around useQuery / useMutation
       │       plus a legacy shim for pre-migration pages
       ▼
services       invoiceService()
       │       pure API layer: list(), get(), create(), update(), …
       │       generates Idempotency-Key on mutations
       ▼
core/api/client  useApi()
       │       ofetch wrapper: retry policy, X-Request-ID, X-Tenant, auth
       ▼
Laravel backend
```

### Why the split

- **Pages** don't touch fetch, don't know URL shapes, don't dedupe requests.
- **Composables** manage cache keys, invalidation, loading state.
- **Services** are the only place an endpoint path appears. Mock them in tests.
- **Client** is the only place headers/retries/idempotency are configured.

Anything that ignores this split (e.g. a page calling `useApi()` directly) is a
smell and should migrate.

---

## Request pipeline on every call

1. `useApi().post('/invoices', form, { idempotencyKey })` invoked by a service
2. `onRequest`: injects `Authorization`, `X-Tenant`, `X-Request-ID`,
   `Accept-Language`, `X-Client-Version`, and (for mutations) `Idempotency-Key`
3. ofetch retries `GET` on 408/425/429/5xx (2 attempts, 300ms delay)
4. `onResponseError`:
   - `401` → `clearAuth()` + redirect to `/auth/login`
   - `403` → toast (permissions msg)
   - `429` → toast (rate-limit msg)
5. Thrown errors pass through `toApiError()` — typed `ApiError` with
   `code`, `status`, `fieldErrors`
6. `useQuery` caches the resolved value in a Map keyed by the caller's `key`,
   with stale-while-revalidate semantics controlled by `staleMs`
7. Mutations call `invalidateQuery(/^feature:/)` to bust cache by regex

---

## Forms

`useZodForm({ schema, initial })` returns a reactive bag:

```ts
const { values, errors, submitting, clearError, handleSubmit, applyApiErrors } =
  useZodForm({ schema: invoiceFormSchema, initial: invoiceFormDefaults })

async function onSubmit() {
  const result = await handleSubmit(async (data) => {
    await createMutation.mutate(data)
  })
  if (!result.ok && result.error) applyApiErrors(result.error as ApiError)
}
```

- Client-side validation runs on submit; `errors` populates per-field.
- On 422 server response, `applyApiErrors` maps `fieldErrors` back to the form.
- Inputs bind `v-model="values.<field>"`; clear errors with `@input="clearError('<field>')"`.
- Standard class contract: `input-field`, `input-error`, `form-label`, `form-error`.

---

## Telemetry

`core/telemetry/logger.ts` exposes `logger.{debug,info,warn,error}` and
`captureException`. `setTelemetrySink(sink)` wires downstream transport.
`plugins/sentry.client.ts` wires that sink to `@sentry/vue` when
`NUXT_PUBLIC_SENTRY_DSN` is set; otherwise it's a no-op.

Log context is enriched with `tenantId` + `userId` automatically. Per-call
extras go in the second argument: `logger.error('payment_failed', { invoiceId })`.

`core/reliability/FeatureBoundary.vue` wraps every high-risk feature page,
logs `feature-boundary` errors with the feature id, and renders a per-feature
fallback instead of bubbling to `error.vue`.

---

## Adding a new feature

1. `node scripts/new-feature.mjs <name>` — scaffolds the skeleton
2. Edit the generated `feature.ts` to set permission/plans/flag/navLabel
3. Build the service in `services/<name>Service.ts`
4. Add composables in `composables/use<Name>List.ts`
5. Add pages in `pages/` — Nuxt's `pages:extend` hook picks them up
6. (Optional) Add `schemas.ts` for form validation
7. (Optional) Add i18n keys for `nav.<name>` and `nav.groups.<group>`

The sidebar appears automatically via `useNavigation()`. The middleware gates
the route automatically. No edits to `nuxt.config.ts`, layouts, or the
middleware are needed.

---

## Things that look like shortcuts but aren't

- **Legacy shims in composables** (e.g. `useInvoices()` alongside
  `useInvoicesList`/`useInvoiceMutations`) exist so older pages keep working
  while you migrate them one at a time. Delete a shim only when no page
  imports it.
- **`pages:extend` hook in `nuxt.config.ts`** dynamically registers pages from
  `features/*/pages/`. Don't put pages in `app/pages/` — it's been deleted.
- **`isSuperAdmin` in `usePermissions`** is a defensive backstop. The backend
  should never return that role (Filament owns the super-admin panel) but the
  check harmlessly treats it as god-mode if it ever does.

---

## Migration state

- ✅ Feature-based structure (22 slices)
- ✅ Global access middleware + feature registry
- ✅ Services layer (clients, invoices, accounts, journal-entries, documents, dashboard, eta)
- ✅ Schemas (invoices, clients, journal-entries, payments, team-invite, password)
- ✅ FeatureBoundary rolled out (38 pages)
- ✅ Retry + idempotency + request correlation in the API client
- ✅ Pluggable telemetry + Sentry hook
- ✅ Offline queue + flush plugin
- 🟡 Remaining settings forms (profile / notifications / currencies / onboarding)
- 🟡 Per-feature i18n split (today all in `i18n/locales/*.ts`)
- 🟡 Heavy features as Nuxt Layers (payroll, eta, reports) for bundle splitting
- 🔴 Backend-blocked: subscription snapshot on `/login` + `/me`, `/me/subscription` endpoint, `/admin/roles` → `/roles`

---

## When to break the rules

- **One-shot scripts and storybook-only files** can import freely.
- **Marketing pages** don't need FeatureBoundary — no auth means no feature gating
  and the error page is enough.
- **Admin-ish operations** (e.g. impersonation, tenant debug) belong on the
  Laravel Filament panel, not here.

If you're about to do something that doesn't fit one of the patterns above,
stop and write a short rationale — or ask.
