# muhasebi — UI / UX Specification (Nuxt 4 + Nuxt UI v3)

> **Single source of truth for the frontend agent.** Any deviation from this document must be called out explicitly in the PR description. When the API docs (`01-authentication.md` … `28-client-portal.md`, `API_CONTRACT.md`) and this spec disagree on a field name, URL, or response shape, the API docs win; when they disagree on a *UI decision*, this spec wins.
>
> Scope: three surfaces share one codebase.
> 1. **Staff app** (`/app/*`) — data-dense ERP for accountants, managers, employees.
> 2. **Client portal** (`/portal/*`) — minimal, trust-oriented, bilingual.
> 3. **Marketing site** (`/`, `/pricing`, `/blog/*`, `/contact`) — minimal, public, SEO-first.
>
> Plus two cross-cutting flows: **Auth** (`/auth/*`) and **Onboarding wizard** (`/onboarding/*`).

---

## 0. How to use this spec

This document is written for a single autonomous frontend agent. It is structured in four layers:

1. **System layer** (sections 1–7): product principles, tech stack, design tokens, dark mode, RTL, iconography, density. Read top-to-bottom first.
2. **Shell & navigation layer** (sections 8–10): app shells, information architecture, route map.
3. **Component & pattern layer** (sections 11–15): Nuxt UI v3 component conventions, page patterns, state management, API client, i18n, permissions, performance, accessibility, testing.
4. **Feature layer** (sections 16–18): every page, every list, every form, every flow for the 28 modules, plus the portal, marketing, and onboarding.

Do not implement feature pages (section 16+) until the system and pattern layers are green — otherwise you will rebuild them 28 times.

When in doubt, prefer: **Nuxt UI v3 defaults → documented pattern in this spec → bespoke component.** Only build bespoke components when explicitly called for.

---

## 1. Product snapshot

muhasebi is a multi-tenant Egyptian accounting SaaS. Core tenants: small/medium businesses and professional-services firms (accountants, auditors). Every authenticated route runs through `tenant, active, enforce.2fa, set_timezone, set_locale, meter.usage` middleware; the frontend must respect tenant scope, feature flags, and permissions on every render.

- **Primary personas:** tenant admin, accountant, manager, employee, viewer (staff app); portal user (portal).
- **Primary locale:** Arabic (`ar`) — RTL, Egyptian Arabic copy. **Secondary:** English (`en`) — LTR. Both are first-class and must ship at v1.
- **Primary currency:** EGP. Multi-currency supported on invoices/bills/journals.
- **Compliance context:** ETA e-invoicing, Egyptian Labor Law (Law 12/2003), Social Insurance Law 148/2019, VAT 14%, WHT.
- **Density target (staff app):** ≥ 20 data rows visible without scroll on a 1366×768 laptop with the sidebar collapsed.

### 1.1 Design principles (ordered — earlier wins conflicts)

1. **Predictable over clever.** Same action in the same place on every screen.
2. **Keyboard-first for staff.** Every primary action has a shortcut. `Ctrl/Cmd+K` opens the command palette from anywhere.
3. **Bilingual symmetry.** Every layout must look correct in both `dir="rtl"` and `dir="ltr"`. No flipped icons for numbers, charts, times, or directional UI (arrows flip; clocks and graphs do not).
4. **Data-density for the staff app, air for everything else.** Compact rows, small paddings, sticky toolbars inside `/app/*`. Generous whitespace, larger type, big CTAs in `/portal/*`, `/`, `/onboarding/*`, `/auth/*`.
5. **Feel instant.** Optimistic updates for obvious mutations, skeleton screens for async reads, Nuxt route transitions for navigation.
6. **Trust through clarity.** Money is right-aligned tabular numerals; destructive actions always confirm; every error states what broke and how to fix it.
7. **Respect the server.** The backend is the source of truth for money, state, permissions, and validation. The frontend never re-computes VAT, WHT, depreciation, or payroll.

---

## 2. Tech stack (non-negotiable)

| Concern | Choice | Notes |
|---|---|---|
| Framework | **Nuxt 4** (stable) | `srcDir: app/`, file-based routing, layers enabled |
| UI kit | **Nuxt UI v3** + Tailwind v4 | Do not mix in Vuetify, PrimeVue, or shadcn |
| Styling | Tailwind v4 via Nuxt UI preset | No inline CSS except for computed RTL logical props |
| State | **Pinia** (module-per-store) | No Vuex, no composables masquerading as stores |
| Data fetching | **`$fetch` + `useAsyncData` + `useFetch`** | Wrapped in `useApi()` (see §13.2) |
| Forms / validation | **Zod** schemas + `useForm` composable | Server 422 errors merged into field errors |
| Tables | **`UTable`** with server-side sort/filter/pagination; virtualization via `TanStack Virtual` for >200-row views | See §11.3 |
| Charts | **`unovis-vue`** (preferred) or Chart.js for simple cases | Must support RTL axis labels |
| Dates | **`@internationalized/date`** + `date-fns` with `locale` | Never `moment`, never `Date` math |
| Money | **`dinero.js`** for display only; never for arithmetic | Server returns strings, render strings, never `parseFloat` |
| i18n | **`@nuxtjs/i18n`** — lazy locale files, locale-prefix `strategy: 'prefix_except_default'` | See §13.4 |
| Auth | **Sanctum bearer token** in memory + httpOnly refresh cookie (if backend supports it) | Token never in `localStorage` |
| Icons | **Lucide** (via `@iconify-json/lucide`) | No Font Awesome, no mixed icon sets |
| Testing | **Vitest** (unit) + **Playwright** (e2e) | CI gates on both |
| Lint / format | **ESLint flat config** + **Prettier** | Pre-commit hook required |
| Package manager | **pnpm** | Lockfile committed |
| Node | **22 LTS** | Pinned via `.nvmrc` / `package.json#engines` |

### 2.1 Repo layout

```
app/
  assets/
    css/            # Tailwind entry + design tokens
    icons/          # custom SVGs only (Lucide handles the rest)
  components/
    app/            # staff-app specific (AppSidebar, AppTopbar, …)
    portal/         # portal specific
    marketing/      # landing/blog specific
    ui/             # extensions of Nuxt UI (e.g., AppMoney, AppDateRange)
    forms/          # reusable form fields (FormMoney, FormAccountSelect, …)
    tables/         # TableToolbar, SavedViewMenu, BulkActionBar, …
  composables/
    useApi.ts       # the only API client
    useAuth.ts
    usePermissions.ts
    useFeatures.ts
    useLocale.ts
    useDir.ts       # 'rtl' | 'ltr'
    useMoney.ts
    useShortcuts.ts
    useCommandPalette.ts
  layouts/
    app.vue         # staff app shell
    portal.vue      # portal shell
    marketing.vue   # public shell
    auth.vue        # auth split screen
    onboarding.vue  # wizard shell
    error.vue
  middleware/
    auth.global.ts
    tenant.ts
    permission.ts   # named middleware
    feature.ts      # named middleware
  pages/
    index.vue                    # marketing landing
    pricing.vue
    blog/[...slug].vue
    contact.vue
    auth/login.vue
    auth/register.vue
    auth/2fa.vue
    auth/forgot-password.vue
    auth/reset-password.vue
    onboarding/index.vue
    onboarding/[step].vue
    app/index.vue                # dashboard
    app/clients/index.vue
    app/clients/[id].vue
    …
    portal/index.vue
    portal/invoices/index.vue
    portal/invoices/[id].vue
    …
  plugins/
    api.client.ts
    pinia.ts
    i18n.ts
    shortcuts.client.ts
  stores/
    auth.ts
    me.ts
    permissions.ts
    features.ts
    notifications.ts
    ui.ts           # theme, density, sidebar collapsed
    savedViews.ts
    …one per module
  utils/
    format.ts
    errors.ts
    rtl.ts
nuxt.config.ts
app.config.ts       # Nuxt UI theme
i18n/               # locale files: ar.json, en.json (nested by module)
tests/
```

Anything not listed above requires justification in the PR.

---

## 3. Design tokens

All tokens live in `app.config.ts` (for Nuxt UI) and `assets/css/tokens.css` (for raw Tailwind v4 `@theme`). The frontend agent must not hardcode hex codes, pixel spacing, or font sizes outside these two files.

### 3.1 Color

Neutral-first palette with a single primary. Semantic colors for status. Everything else is a tint/shade of these scales.

```css
/* assets/css/tokens.css */
@theme {
  /* Neutral (slate-based, warm enough for Arabic type) */
  --color-neutral-50:  #F8FAFC;
  --color-neutral-100: #F1F5F9;
  --color-neutral-200: #E2E8F0;
  --color-neutral-300: #CBD5E1;
  --color-neutral-400: #94A3B8;
  --color-neutral-500: #64748B;
  --color-neutral-600: #475569;
  --color-neutral-700: #334155;
  --color-neutral-800: #1E293B;
  --color-neutral-900: #0F172A;
  --color-neutral-950: #020617;

  /* Primary — DEFAULT proposal: teal-600 (muhasebi brand slot). 
     If the user supplies a different primary, only these 11 values change. */
  --color-primary-50:  #ECFEFF;
  --color-primary-100: #CFFAFE;
  --color-primary-200: #A5F3FC;
  --color-primary-300: #67E8F9;
  --color-primary-400: #22D3EE;
  --color-primary-500: #06B6D4;
  --color-primary-600: #0891B2;  /* default brand */
  --color-primary-700: #0E7490;
  --color-primary-800: #155E75;
  --color-primary-900: #164E63;
  --color-primary-950: #083344;

  /* Semantic — reused across badges, toasts, focus rings. */
  --color-success-500: #10B981;
  --color-warning-500: #F59E0B;
  --color-danger-500:  #EF4444;
  --color-info-500:    #3B82F6;
}
```

Nuxt UI color aliases (`app.config.ts`):

```ts
export default defineAppConfig({
  ui: {
    colors: {
      primary: 'primary',
      neutral: 'neutral',
      success: 'success',
      warning: 'warning',
      error:   'danger',
      info:    'info',
    },
  },
})
```

Contrast rule: every text/background pair must hit **WCAG AA (4.5:1)** for body copy and **3:1** for large text. Validate with the `@nuxtjs/axe` plugin in dev.

### 3.2 Typography

Bilingual pairing. Latin for English, IBM Plex Sans Arabic for Arabic — both subset-loaded via `@nuxtjs/fontaine`.

```css
@theme {
  --font-sans-latin:  'Inter', 'ui-sans-serif', system-ui, sans-serif;
  --font-sans-arabic: 'IBM Plex Sans Arabic', 'Segoe UI Arabic', 'Tahoma', sans-serif;
  --font-mono:        'JetBrains Mono', 'ui-monospace', monospace;

  /* Scale — optimized for data density at 14px base in the staff app. */
  --text-xs:    0.75rem;   /* 12px — table captions, timestamps */
  --text-sm:    0.875rem;  /* 14px — default body inside /app */
  --text-base:  1rem;      /* 16px — default body inside /portal, /, /onboarding */
  --text-lg:    1.125rem;  /* 18px — page subtitle */
  --text-xl:    1.25rem;   /* 20px — section title */
  --text-2xl:   1.5rem;    /* 24px — page title */
  --text-3xl:   1.875rem;  /* 30px — dashboard KPI */
  --text-4xl:   2.25rem;   /* 36px — marketing hero only */
  --text-5xl:   3rem;      /* 48px — marketing hero only */

  --leading-tight:  1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;

  --font-weight-regular:  400;
  --font-weight-medium:   500;
  --font-weight-semibold: 600;
  --font-weight-bold:     700;
}
```

- The `html` tag receives a class `font-sans-latin` or `font-sans-arabic` based on locale (set in `useLocale()` → plugin).
- **Tabular numerals (`font-variant-numeric: tabular-nums`) are mandatory** on every money column, KPI, and table cell that contains a number.
- Never use italic for Arabic; substitute emphasis with weight.
- Line height inside tables: `1.35` (use `leading-snug`).

### 3.3 Spacing, radii, shadow

```css
@theme {
  /* Spacing — Tailwind 4pt scale kept, but define named semantic spaces. */
  --space-gutter-app:    0.75rem; /* 12px — staff app padding */
  --space-gutter-portal: 1.5rem;  /* 24px — portal/marketing padding */
  --space-row-app:       0.375rem;/* 6px  — staff table row v-padding */
  --space-row-comfy:     0.75rem; /* 12px — portal table row v-padding */

  /* Radii — tight in staff app, soft elsewhere. */
  --radius-sm:  0.25rem;  /* badges, chips */
  --radius-md:  0.375rem; /* inputs, buttons inside /app */
  --radius-lg:  0.5rem;   /* inputs, buttons inside /portal, /, /onboarding */
  --radius-xl:  0.75rem;  /* cards */
  --radius-2xl: 1rem;     /* marketing hero cards */
  --radius-full: 9999px;

  /* Shadows — layered, never heavy. */
  --shadow-xs: 0 1px 1px rgba(15,23,42,0.04);
  --shadow-sm: 0 1px 2px rgba(15,23,42,0.06), 0 1px 1px rgba(15,23,42,0.04);
  --shadow-md: 0 4px 6px -1px rgba(15,23,42,0.08), 0 2px 4px -2px rgba(15,23,42,0.06);
  --shadow-lg: 0 10px 15px -3px rgba(15,23,42,0.10), 0 4px 6px -4px rgba(15,23,42,0.06);
  --shadow-overlay: 0 20px 40px -12px rgba(15,23,42,0.25);
}
```

### 3.4 Motion

```css
@theme {
  --ease-standard: cubic-bezier(0.2, 0, 0, 1);
  --ease-emphasized: cubic-bezier(0.3, 0, 0, 1);
  --duration-instant: 80ms;
  --duration-fast:    150ms;
  --duration-normal:  220ms;
  --duration-slow:    320ms;
}
```

Rules:
- Route transitions: fade 150ms (Nuxt `page` transition).
- Slide-overs and modals: translate + fade 220ms `--ease-emphasized`.
- Toasts: slide-in 220ms, auto-dismiss 4s (6s for errors, never auto-dismiss if actionable).
- Skeletons pulse at 1.5s cycle. Shimmer only on surfaces ≥ 200×40.
- Respect `prefers-reduced-motion`: disable all non-essential transitions.

### 3.5 Elevation hierarchy (z-index)

```
  0   base content
 10   sticky table toolbar / page header
 20   sticky table footer (pagination)
 30   dropdowns / popovers
 40   slide-overs
 50   modals
 60   command palette
 70   toast stack
 80   full-screen takeovers (receipt viewer, PDF preview)
 90   dev HUD (only in dev)
100   critical system banner (e.g., "Subscription expired — read only mode")
```

Never introduce a z-index outside this ladder.

---

## 4. Dark mode

- Implemented via Nuxt UI `useColorMode()` with `html[class~="dark"]`.
- Stored in `useUiStore().colorMode: 'system' | 'light' | 'dark'`.
- Toggle lives in the staff app user menu and in the portal user menu; marketing does not expose it (system only).
- Dark palette derives from the neutral scale:
  - Page background: `neutral-950` (staff), `neutral-900` (portal).
  - Surface/card: `neutral-900` (staff), `neutral-800` (portal).
  - Border default: `neutral-800`.
  - Text primary: `neutral-100`. Text muted: `neutral-400`.
- Charts must re-emit color palettes via CSS vars so they switch without re-render.
- Dark mode must be spec-complete from day one — do not ship light only.

---

## 5. RTL & i18n

### 5.1 The RTL contract

1. `<html dir>` is set by middleware before hydration (from the active locale).
2. All layout uses **logical CSS properties**: `ms-*`, `me-*`, `ps-*`, `pe-*`, `border-s`, `border-e`, `start-0`, `end-0`. Never `ml-*`, `mr-*`, `pl-*`, `pr-*`, `left-*`, `right-*` — ESLint rule enforces this inside `app/components/`.
3. **Flip:** arrows/chevrons that indicate direction (back, forward, breadcrumb separators, drawer handles), progress bars, slide-overs.
4. **Do not flip:** numbers, money, dates, clocks, code snippets, charts (axis labels stay left-to-right for numerical axes), logos, brand marks, play/pause icons, media scrubbers, video timelines.
5. **Never hardcode** Arabic punctuation — rely on CSS `text-align: start` and let the browser bidi engine do its job.
6. **Tables:** first column is the *starting* edge (leftmost in LTR, rightmost in RTL). Money columns are always aligned to the *end* edge regardless of direction, so visual alignment of digits stays consistent.

### 5.2 Locale file structure

`i18n/ar.json` and `i18n/en.json` are nested by module:

```json
{
  "common": { "save": "…", "cancel": "…", "delete": "…" },
  "nav": { "dashboard": "…", "clients": "…" },
  "auth": { "login": { "title": "…", "email": "…" } },
  "clients": { "list": { "title": "…", "columns": { "name": "…" } } },
  "modules": {
    "01_authentication": { … },
    "05_clients": { … }
  }
}
```

Translation keys are stable and referenced by path. Hardcoded strings in `.vue` templates fail ESLint.

### 5.3 Number and date formatting

- Numbers: `Intl.NumberFormat(locale, { … })` via `useMoney()` and `useNumber()` composables. Arabic uses Eastern Arabic digits *only* where the tenant explicitly opts in via a setting (`tenant.settings.use_arabic_digits`); default is Latin digits in both locales (accountants prefer this universally).
- Dates: `@internationalized/date` with the tenant timezone. Default format `DD MMM YYYY` (e.g., `19 Apr 2026`). Gregorian calendar throughout; Hijri is not required for v1.
- Currency: always render symbol + code on single-currency screens (e.g., `EGP 1,250.00`) so multi-currency context is never ambiguous.

---

## 6. Iconography

- Single source: Lucide. Bundle via `@iconify-json/lucide` + Nuxt UI's `UIcon`.
- Default size: `16px` inside `/app`, `20px` inside `/portal` and `/`.
- Stroke width 1.5 for `/app` (denser), 2 for everywhere else.
- Semantic icons (status, type) use a fixed mapping documented per module.

### 6.1 Canonical status icons

| Status | Icon | Color |
|---|---|---|
| Draft | `lucide:file-text` | neutral-500 |
| Pending / Submitted | `lucide:clock` | warning-500 |
| Approved / Posted / Paid / Valid | `lucide:check-circle-2` | success-500 |
| Rejected / Failed / Void / Overdue | `lucide:x-circle` | danger-500 |
| Partial | `lucide:circle-half` | info-500 |
| Cancelled / Archived | `lucide:ban` | neutral-400 |
| Reversed | `lucide:undo-2` | neutral-500 |
| Locked (period close, ETA issued) | `lucide:lock` | neutral-600 |

Module-level status chips (§11.5) use this mapping — never reinvent.

---

## 7. Density

Two density levels: **compact** (staff default) and **comfortable** (portal/marketing default). User may switch per-surface via the UI store; persisted in `useUiStore().density`.

| Token | Compact (staff) | Comfortable (portal) |
|---|---|---|
| Table row height | 36px | 52px |
| Input height | 32px | 40px |
| Button height (md) | 32px | 40px |
| Page gutter | 12px | 24px |
| Card padding | 12px | 20px |
| Heading scale | `text-xl` → `text-2xl` | `text-2xl` → `text-3xl` |

Components read density via `useDensity()` and apply Tailwind classes accordingly. Never branch on `layout.name` directly.

---

## 8. App shells

Four shells, one codebase. Each is a Nuxt layout (`layouts/*.vue`). Pick the layout in `definePageMeta({ layout: 'app' | 'portal' | 'marketing' | 'auth' | 'onboarding' })`.

### 8.1 Staff app shell (`layouts/app.vue`)

```
┌─ Topbar (48px, sticky, z-10) ─────────────────────────────────────────┐
│  [logo] [tenant switcher] …      [search] [cmd-k] [notif] [help] [me] │
├────────┬──────────────────────────────────────────────────────────────┤
│        │  PageHeader (title + breadcrumb + primary action)            │
│ Side-  ├──────────────────────────────────────────────────────────────┤
│ bar    │                                                              │
│ (240px │                        Page content                          │
│ /64px) │                                                              │
│        │                                                              │
├────────┴──────────────────────────────────────────────────────────────┤
│  Footer (optional, tenant status bar: env/EGP/tz/build)               │
└───────────────────────────────────────────────────────────────────────┘
```

**Topbar (`AppTopbar.vue`)**
- Height: 48px. Background: `neutral-0` (light) / `neutral-900` (dark). Bottom border `neutral-200` / `neutral-800`.
- Left cluster (LTR) / right cluster (RTL): brand mark (32×32) + product name; tenant switcher (if user belongs to >1 tenant).
- Right cluster: 
  - Global search input (collapses to icon below `lg`) — opens command palette on focus.
  - `Ctrl/Cmd+K` button (visible hint).
  - Notifications bell (`NotificationsMenu`) with unread badge — polled every 60s via `useNotifications()`.
  - Help menu (shortcuts `?`, docs link, keyboard cheatsheet).
  - User menu (avatar, name, email, role badge): profile, 2FA, preferences, density toggle, theme toggle, language toggle, sign out.
- On scroll, gains `shadow-xs`.

**Sidebar (`AppSidebar.vue`)**
- Two widths: expanded (240px) and rail (64px). Toggle via user menu or `Ctrl/Cmd+\`.
- Top: primary navigation (see §9). Items in visual groups with dividers.
- Bottom: quick-create button (plus icon → slide-over with grid of common entities: invoice, bill, expense, JE, client, vendor).
- Collapsed state shows icons with tooltips on hover (respect RTL: tooltip appears on the *end* side).
- Keyboard navigable: `j/k` moves selection, `Enter` opens, `g then h` jumps to dashboard, etc. (see §11.7).
- Active route highlighted with a 2px `primary-500` bar on the *start* edge.
- Feature-flag disabled modules are hidden entirely; permission-denied modules are shown but grayed with a lock icon and tooltip "Your role doesn't include this".

**PageHeader (`AppPageHeader.vue`)**
- Always the first child inside `<NuxtPage>`. Slots: `breadcrumbs`, `title`, `description`, `actions`.
- Breadcrumbs come from `useBreadcrumbs()` composable, derived from route meta.
- Primary action is the big button on the end edge. Secondary actions collapse into an overflow menu beyond 2 visible.

**Footer (`AppFooter.vue`)** — Optional. Shows: current tenant name, environment badge (only if non-prod), active base currency, timezone, Nuxt build hash. Never more than 32px tall.

### 8.2 Portal shell (`layouts/portal.vue`)

Minimal. A single top nav + centered content area, max-width 1280px.

```
┌─ Topbar (64px) ────────────────────────────────────────────────┐
│  [tenant logo]    Invoices  Documents  Messages    [lang] [me] │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│                     Page content (px-6 py-8)                   │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

- Tenant branding (logo + primary color) pulled from `/v1/portal/settings/public` on first load.
- No sidebar. No command palette. No dense tables.
- Density defaults to **comfortable**.
- All buttons are `size="lg"`. Typography one step larger than staff.
- Mobile-first; the topbar collapses to a hamburger under `md`.

### 8.3 Marketing shell (`layouts/marketing.vue`)

Public, SEO-first, fully pre-rendered (`nitro.prerender.routes` lists `/`, `/pricing`, `/contact`, `/blog`).

- Topbar with product mark, links (Features, Pricing, Blog, Contact), sign-in CTA.
- Footer with company info, nav links, language switcher, social links.
- Uses `marketing.*` component family — larger type, more whitespace, hero sections.

### 8.4 Auth shell (`layouts/auth.vue`)

Split screen. Left (or start, RTL-flipped): form card. Right (or end): brand panel with a rotating testimonial/statistic (pulled from a static JSON, no API).

- Max-width of the form card: 420px.
- No topbar/sidebar.
- Shows language + theme toggle in a top corner.

### 8.5 Onboarding shell (`layouts/onboarding.vue`)

Wizard. Full-width content with a step bar at the top.

- Step bar: shows 4–5 named steps with current highlighted; clickable for already-completed steps, locked for future.
- Sticky footer with `Back` and `Next` (end edge). `Next` is disabled until the current step is valid.
- `Save and exit` link — persists `onboarding_wizard_state` on the server so the user can resume.

---

## 9. Information architecture

Every module gets one sidebar entry in the staff app, grouped visually. Groups are defined by business intent, not by doc numbers.

### 9.1 Sidebar groups (staff app)

```
DASHBOARD
  Home                    /app
  Notifications           /app/notifications
  Activity log            /app/activity
  Audit compliance        /app/audit              (feature:audit_log)

SALES
  Clients                 /app/clients            (feature:clients)
  Invoices                /app/invoices           (feature:invoicing)
  Recurring invoices      /app/invoices/recurring (feature:invoicing)
  Payments received       /app/payments           (feature:invoicing)
  Credit notes            /app/credit-notes       (feature:invoicing)
  Collections             /app/collections        (feature:collections)

PURCHASES
  Vendors                 /app/vendors            (feature:bills_vendors)
  Bills                   /app/bills              (feature:bills_vendors)
  Bill payments           /app/bill-payments      (feature:bills_vendors)
  Expenses                /app/expenses           (feature:expenses)
  Expense reports         /app/expense-reports    (feature:expenses)

BANKING
  Bank accounts           /app/bank-accounts      (feature:accounting)
  Reconciliation          /app/reconciliation     (feature:accounting)
  Connections             /app/bank-connections   (feature:accounting)
  FX revaluation          /app/fx-revaluation     (feature:accounting)

ACCOUNTING
  Chart of accounts       /app/chart-of-accounts  (feature:accounting)
  Journal entries         /app/journal-entries    (feature:accounting)
  Recurring JE            /app/journal-entries/recurring
  Fiscal calendar         /app/fiscal-calendar    (feature:accounting)
  Cost centers            /app/cost-centers       (feature:cost_centers)
  Budgets                 /app/budgets            (feature:budgeting)

INVENTORY
  Products                /app/products           (feature:inventory)
  Product categories      /app/products/categories
  Stock movements         /app/stock-movements
  Low-stock alerts        /app/stock-alerts

FIXED ASSETS
  Asset register          /app/assets             (feature:fixed_assets)
  Asset categories        /app/assets/categories
  Depreciation runs       /app/assets/depreciation
  Disposals               /app/assets/disposals

TAX & COMPLIANCE
  VAT returns             /app/tax/vat            (feature:tax)
  WHT certificates        /app/tax/wht
  Corporate tax           /app/tax/corporate
  ETA e-invoicing         /app/eta                (feature:e_invoice)
  ETA item codes          /app/eta/item-codes

PAYROLL & HR
  Employees               /app/employees          (feature:payroll)
  Payroll runs            /app/payroll
  Payslips                /app/payroll/payslips
  Salary components       /app/payroll/components
  Loans                   /app/payroll/loans
  Leave requests          /app/leave
  Attendance              /app/attendance
  Social insurance        /app/payroll/social-insurance

SERVICES
  Engagements             /app/engagements
  Deliverables            /app/engagements/deliverables
  Working papers          /app/engagements/working-papers
  Timesheets              /app/timesheets         (feature:timesheets)
  Timer                   /app/timesheets/timer

REPORTS
  Report center           /app/reports            (feature:reports)
  Custom reports          /app/reports/custom     (feature:custom_reports)
  Scheduled reports       /app/reports/scheduled
  Anomaly detection       /app/reports/anomalies

WORKFLOWS
  Approvals               /app/approvals
  Alerts                  /app/alerts

DATA
  Documents               /app/documents          (feature:documents)
  Data import             /app/import
  E-commerce              /app/ecommerce
  Messaging               /app/messaging

SETTINGS
  Team                    /app/settings/team
  Onboarding              /app/settings/onboarding
  Subscription & plan     /app/settings/subscription
  Company profile         /app/settings/company
  Currencies              /app/settings/currencies
  Webhooks                /app/settings/webhooks
  Landing page            /app/settings/landing
  General                 /app/settings/general
```

Sidebar renders only groups for which the user has at least one feature-enabled + permission-granted child route.

### 9.2 Portal sidebar (topnav)

```
Overview        /portal
Invoices        /portal/invoices
Documents       /portal/documents
Messages        /portal/messages
Profile         /portal/profile
```

### 9.3 Route map (full)

See §16 for per-module route tables. Every route is typed via `definePageMeta({ middleware: ['auth', 'tenant', 'permission', 'feature'], permission: 'manage_invoices', feature: 'invoicing' })`.

---

## 10. Layout rules that apply everywhere

- **Max content width** inside `/app`: none — data-density wants full bleed. Cards cap at their natural size.
- **Max content width** inside `/portal`, `/`, `/onboarding`: `max-w-screen-xl` (`1280px`), centered.
- **Sticky page headers** in `/app` when the page scrolls below 240px. Headers collapse to a thin bar containing title + primary action.
- **Breadcrumbs** appear in the page header, never as a separate bar.
- **Mobile** in staff app: the sidebar becomes an off-canvas drawer from the *start* edge; tables switch to card view below `md` (but accounts still expect desktop — mobile is a polished fallback, not a primary persona).

---

## 11. Components and patterns

### 11.1 Nuxt UI v3 base component mapping

Use Nuxt UI components as the default. Wrap only when a convention is required.

| Purpose | Use | Wrapper (if any) | Notes |
|---|---|---|---|
| Button | `UButton` | `AppButton` | Wrapper enforces `size` based on density, sets loading/disabled state consistently |
| Input (text) | `UInput` | `FormInput` | Wrapper handles error prop from server 422 |
| Number input | `UInput type="number"` | `FormNumber` | Tabular-nums, step & min/max, locale-aware thousands separator |
| Money input | — | `FormMoney` | Bespoke; integrates currency picker + mask |
| Select | `USelectMenu` | `FormSelect` | Async-search capable |
| Autocomplete (entity picker) | `USelectMenu` | `FormEntityPicker` | Generic; takes a resource name like `clients`, `accounts`, `vendors` |
| Date / range | `UCalendar` + `UPopover` | `FormDate`, `FormDateRange` | Uses `@internationalized/date`, Gregorian, tenant tz |
| Textarea | `UTextarea` | `FormTextarea` | Auto-grow; max 10 rows |
| Toggle | `USwitch` | `FormSwitch` |  |
| Checkbox | `UCheckbox` | `FormCheckbox` |  |
| Radio group | `URadioGroup` | `FormRadioGroup` |  |
| File upload | `UInput type="file"` + `UProgress` | `FormFileUpload` | Multipart, validates MIME + size from §21 |
| Table | `UTable` | `AppTable` | See §11.3 |
| Modal | `UModal` | `AppModal` | Enforces close-on-esc, focus trap, RTL flip |
| Slide-over | `USlideover` | `AppSlideover` | Enters from *end* edge |
| Drawer | `USlideover side="start"` | `AppDrawer` | Only used for the mobile sidebar |
| Tooltip | `UTooltip` | — | Arrow position flips in RTL |
| Badge / chip | `UBadge` | `AppStatusChip`, `AppBadge` | See §11.5 |
| Tabs | `UTabs` | `AppTabs` | Sticky under page header on detail pages |
| Alert | `UAlert` | `AppAlert` | Four variants aligned with semantic colors |
| Toast | `UNotifications` + `useToast()` | `useAppToast()` | See §11.8 |
| Pagination | `UPagination` | `AppPagination` | Always pair with page-size selector |
| Command palette | `UCommandPalette` | `AppCommandPalette` | See §11.7 |
| Popover | `UPopover` | — |  |
| Avatar | `UAvatar` | — | Falls back to initials; Arabic initials from first name |
| Skeleton | `USkeleton` | — | Compose page-specific skeletons |

### 11.2 Page patterns

Every staff page falls into one of the following archetypes. The frontend agent must not invent a new archetype.

#### A. List page (`*/index.vue`)

The default for every collection. Layout:

```
PageHeader
  title | [Import ▾] [Export ▾]   [+ Primary create]
TableToolbar
  [search]  [Filter]  [Saved views ▾]   [Density ⚙]  [Columns ⚙]
  (optionally: filter chips row if filters applied)
AppTable (virtualized if rows > 200)
  ├─ sticky header, sortable columns
  ├─ bulk-select checkbox column (start edge)
  ├─ row click → detail
  └─ row overflow (⋮) → contextual actions
BulkActionBar (only when rows selected; floats bottom, full width of table)
  "{n} selected"  [action 1] [action 2] … [clear]
Pagination
  [← prev]  page 3 of 40  [next →]   [Rows: 25 ▾]   (total: 982)
```

- **Server-side by default**: sort, filter, paginate via query params (`page`, `per_page`, `sort_by`, `sort_direction`, plus filter fields). Query state is bidirectionally bound to the URL via `useQueryParams()`.
- **Virtualized lists** (journal lines, trial balance, attendance, statement lines): switch from `UTable` to `AppVirtualTable` using TanStack Virtual, still server-paginated by fetching in windows of 200.
- **Saved views** persist `{ filters, sort, columns }` as named presets per user per module. Stored via `/v1/me/saved-views` (if the backend exposes it — else Pinia + `localStorage` fallback for MVP). Dropdown shows: Default, user's custom views, "Manage views".
- **Filters** live in a slide-over opened from the "Filter" button — one form per list, declared in module spec. The slide-over previews counts before applying.
- **Column picker** lets the user toggle and reorder columns. Persists per user per list.
- **Bulk actions** only appear when selectable rows exist on the page. Selection is page-local (no cross-page selection in MVP — note the limitation in a tooltip).
- **Empty states** (§11.6) must be branded and instructive.
- **Loading** shows a table skeleton matching the expected column widths.

#### B. Detail page (`*/[id].vue`)

```
PageHeader (sticky)
  [breadcrumb › clients › Acme Corp]
  Acme Corp         [StatusChip Active]   [Actions ▾] [Edit] [Save]
  Subtitle: tax_id · balance · last activity
AppTabs (sticky under header)
  Overview | Invoices | Payments | Contacts | Addresses | Documents | Messages | Activity
<tab content>
  Two-column layout:
    Left (2/3): primary content
    Right (1/3): side panel with metadata / quick actions
ActivityFeed at the bottom of the Overview tab (collapsed by default)
```

- The tab set is enumerated per module in §16.
- Each tab is a lazy-loaded subroute or component (`<Suspense>`); switching tabs must not refetch already-loaded data in the same session.
- The header stays sticky on scroll; actions remain accessible.
- The `Edit` button either opens a slide-over (for simple edits) or switches the page to an inline-edit mode (complex entities like invoices and journal entries).
- Irreversible actions (Post, Void, Delete) open a confirm modal (§11.9) that requires typing the entity's code or number for "high-danger" actions.

#### C. Create / Edit page (`*/new.vue`, `*/[id]/edit.vue`)

Two shapes:
- **Simple form** (create client, create vendor, create account): slide-over with `FormInput` fields, stacked.
- **Complex form** (invoice, bill, journal entry, payroll run, engagement, import mapping): full page with multiple sections, saves as draft every 20s while dirty.

Rules:
- Submit button lives in a sticky footer bar (bottom of viewport), end edge. Secondary `Cancel` on the start edge.
- Field-level errors bind to server 422 responses automatically (§13.2).
- Pressing `Ctrl/Cmd+S` saves the form; `Ctrl/Cmd+Enter` submits.
- Leaving the page with unsaved changes triggers a confirm.
- Auto-save drafts for invoices, bills, journal entries — every 20s, POST `?draft=1` if the endpoint supports it; otherwise store in `draftStore` keyed by entity + user.

#### D. Wizard (`*/new.vue` with steps)

Used for onboarding, plan change, bulk import, bulk convert e-commerce orders, payroll run creation, fiscal year setup, CoA template selection, ETA settings.

```
AppWizard
  StepIndicator at top (1 … N, current highlighted)
  StepContent
  Footer: [Back]      [Save & exit]    [Next] / [Finish]
```

- Each step has validation that must pass before `Next`.
- State is held in a transient Pinia module `useWizardStore(wizardId)` — purged on finish/exit.
- Long wizards (onboarding) also POST step state to the server after each step.

#### E. Split grid (reconciliation grid, bulk categorization)

Two-column grid: statement lines on the start side, GL entries on the end side, with a match zone between. Drag-to-match or click-to-match. Unmatched entries are visually de-emphasized. This pattern is used in:
- Bank reconciliation (§16.7)
- ETA unmapped lines (§16.15)
- E-commerce bulk convert (§16.22)

#### F. Dashboard / report page

KPI row on top (4–6 metric cards), chart row below (2–3 charts), list/table at the bottom. All sections independently loaded with skeletons. Period picker in the page header. Currency override selector when relevant.

### 11.3 Tables — `AppTable` specification

Wraps `UTable` with:
- Virtualization opt-in via `virtualized` prop.
- Server-side sort/filter/pagination via `state` prop (`ListState` interface).
- Column config: `{ key, label, sortable, hideByDefault, width, align, render, cellClass, stickyStart, stickyEnd }`.
- Built-in cell renderers: `text`, `money`, `date`, `datetime`, `status`, `badge`, `avatar`, `entityLink`, `bool`, `percent`.
- Row click handler (detail navigation) separate from inline action handlers (overflow menu).
- Loading skeletons rendered per-row when `loading`.
- Empty state slot (`#empty`) required.
- Keyboard: `j/k` to move row focus, `Enter` to open, `x` to select, `Shift+x` to range-select.
- Column widths: sticky `Code`/`Number` start column on wide tables, sticky `Actions` end column.

`ListState` interface (used by every list page):

```ts
interface ListState<TFilters extends Record<string, unknown>> {
  page: number
  perPage: number
  sortBy: string | null
  sortDirection: 'asc' | 'desc'
  search: string
  filters: TFilters
  selectedIds: Set<string | number>
  visibleColumns: string[]
  savedView: string | null
}
```

Every module exports a typed `useXxxListState()` composable.

### 11.4 Forms — `useForm()` contract

```ts
const { values, errors, isDirty, isSubmitting, submit, reset, setField, setErrors } =
  useForm({
    schema: zInvoiceCreate,                 // Zod
    initial: { client_id: null, … },
    onSubmit: async (values) => {
      return await api.post('/v1/invoices', values)
    },
  })
```

- `submit()` catches 422, maps `errors` object directly into field errors.
- `submit()` toasts generic errors (500, network) as error toasts.
- `isDirty` triggers the unsaved-changes guard on route change.
- `setField('line_items', [...])` supports array field helpers (`addAt`, `removeAt`, `move`).
- Validation runs on blur + on submit. Never block typing.

### 11.5 Status chips — `AppStatusChip`

```vue
<AppStatusChip :value="invoice.status" kind="invoice" />
```

- `kind` selects the mapping (invoice, bill, payment, journal_entry, reconciliation, approval, payroll_run, eta_document, engagement, timesheet, expense, import_job, webhook_delivery, …).
- Each `kind` has a mapping of `{ statusValue → { label_key, icon, color } }` in `utils/statusMaps.ts`.
- Chip shape: pill with icon on start edge. Label translated. Color from semantic token (§6.1).
- Never inline status styling; always use the chip.

### 11.6 Empty, loading, error states

| State | Component | Content |
|---|---|---|
| Empty (no data yet) | `AppEmpty` | Illustration slot + headline + description + primary CTA. Example: "No invoices yet" → "Create your first invoice" |
| Empty (filters returned 0) | `AppEmpty` with `variant="filtered"` | "No invoices match these filters" → "Clear filters" |
| Loading initial | `AppSkeleton` composed per page | Matches final layout closely |
| Loading refetch | `UProgress` under page header (2px) | Does not blank existing content |
| Error (4xx general) | `AppAlert` inline | Human message from server `message` field |
| Error (403 / missing permission) | `AppPermissionDenied` page | "You don't have access to this area" + contact admin |
| Error (404 entity) | `AppNotFound` page | "Couldn't find this invoice" + back link |
| Error (500 / network) | `AppErrorBoundary` | "Something went wrong" + retry + open support |
| Offline | Persistent banner under topbar | "You're offline. Showing cached data." |

Every list page ships with tailored skeletons (toolbar + table rows). Every detail page ships with tailored skeletons (header + two-column content). Spinners are forbidden outside button loading states.

### 11.7 Command palette & keyboard shortcuts

**Command palette (`Ctrl/Cmd+K`)**
- Powered by `UCommandPalette`.
- Three groups: **Go to** (pages: Dashboard, Clients, Invoices, …), **Create** (new invoice, new bill, new JE, …), **Search** (fuzzy across clients, invoices, bills, vendors — debounced 200ms, hits `/v1/search?q=…`).
- Recents show above the groups (stored in Pinia, capped at 8).
- Each action has an optional inline shortcut hint.

**Global shortcuts (`?` opens cheatsheet)**
- `Ctrl/Cmd+K` — command palette
- `Ctrl/Cmd+/` — focus global search (same as palette but opens pre-filled)
- `Ctrl/Cmd+\` — toggle sidebar
- `g` then `h` — go to dashboard
- `g` then `c` — clients
- `g` then `i` — invoices
- `g` then `b` — bills
- `g` then `j` — journal entries
- `g` then `r` — reports
- `n` then `i` — new invoice
- `n` then `b` — new bill
- `n` then `c` — new client
- `n` then `j` — new journal entry
- `/` — focus list search input on current list page
- `?` — open shortcuts cheatsheet
- `Esc` — close top-most overlay (palette → modal → slide-over → popover)
- **List context**: `j/k` navigate rows, `Enter` open, `x` select, `Shift+x` range, `e` edit, `Del` delete (with confirm).
- **Form context**: `Ctrl/Cmd+S` save draft, `Ctrl/Cmd+Enter` submit.

Shortcut conflicts respect focus: never intercept `j/k` when a text input has focus.

### 11.8 Toasts — `useAppToast()`

```ts
const toast = useAppToast()
toast.success('Invoice posted')
toast.error('Couldn\'t post invoice', { description: err.message, actions: [{ label: 'Retry', onClick: retry }] })
toast.warning(…) ; toast.info(…)
```

- Stacked in the top-end corner (flips in RTL).
- Auto-dismiss: success 4s, info 4s, warning 6s, error 6s (or sticky if `actions` is set).
- Max visible: 4 — overflow queues.
- Optimistic updates: show a neutral toast on action; if the server responds with error, toast flips to error and the UI rolls back (§11.10).

### 11.9 Confirmations

- **Low-danger** (cancel draft): plain `AppModal` with `Cancel` + `Confirm`.
- **Medium-danger** (void, archive, delete soft): `AppModal` with a `checkbox` "I understand this will …" that enables the confirm button.
- **High-danger** (delete hard, reverse posted JE, delete workflow): `AppModal` requires typing the entity identifier (e.g., `INV-2026-0014`) exactly before `Confirm` enables.
- Destructive actions use `color="error"` and an explicit verb label ("Reverse entry", not "Confirm").
- Every destructive action logs to activity; the UI surfaces the logged entry in a toast linking to activity.

### 11.10 Optimistic updates

Applies to: marking notifications read, toggling active on clients/products/accounts, updating row inline when allowed, reordering saved views, assigning categories to documents.

Rules:
- Update the Pinia store immediately.
- Fire the API call; on success, replace with server response.
- On error, revert + toast error with a Retry action.
- Never optimistic on: posting JE, posting invoice, approving bill, running payroll, submitting to ETA, bulk convert, destructive actions.

### 11.11 File upload pattern

- Drop zone + click-to-browse.
- Chunking for files > 10MB (via `tus` if backend supports; else single PUT with progress).
- MIME + size validation from the module (§16.21 documents has the full list).
- Receipt/image previews use `UPopover` thumbnails.
- Multiple files: shows a mini-table with per-file status (uploading, done, error) and retry buttons.

### 11.12 PDF / document viewer

- Uses a vendored `pdf.js` viewer.
- Opens in a full-screen takeover (z-80) with toolbar (zoom, rotate, download, print).
- PDFs can also render inline in detail pages for invoices, payslips, WHT certificates.

### 11.13 PWA / offline

- `@vite-pwa/nuxt` generates service worker.
- Strategy: **offline shell + runtime cache** of recent GET responses (`/v1/me`, `/v1/clients?page=1`, `/v1/invoices?page=1`, etc.) with `stale-while-revalidate`, TTL 5 min.
- Offline writes: **queued** via `useOfflineQueue()` — when back online, flush in order, show a banner while draining. Money mutations (post invoice, post JE, approve bill, payroll run) are never queued — they fail loudly while offline.
- Install prompt: show via `AppPwaInstallBanner` once the user has visited 3+ times.
- App manifest: name muhasebi, short_name muhasebi, icons in 192, 384, 512. Primary color from theme.

---

## 12. Accessibility

- **Target:** WCAG 2.1 AA.
- Every interactive element reachable by keyboard. Focus ring visible — never remove outline.
- Skip-to-content link on every page (first focusable element).
- Live regions for toasts (`aria-live="polite"`), for async success/error (`aria-live="assertive"` for errors).
- Modals/slide-overs use `role="dialog"`, trap focus, return focus on close.
- Tables: proper `<th>` + `scope`. Sort buttons announce direction.
- Color is never the only signal — status chips always carry icon + label.
- Arabic forms: labels positioned at the *start*; error text uses the Arabic locale; `lang="ar"` on content containers.
- Motion: `prefers-reduced-motion` disables slide/zoom; keeps opacity only.

---

## 13. State, data, routing

### 13.1 Pinia stores — one store per module + shared stores

Shared stores:
- `useAuthStore` — token, user id, tenant id.
- `useMeStore` — `/v1/me` response (user, tenant, currency, timezone, locale).
- `usePermissionsStore` — set of `permission:*` strings.
- `useFeaturesStore` — set of `feature:*` flags.
- `useNotificationsStore` — unread count, paginated list, polling.
- `useUiStore` — theme, density, sidebar collapsed, locale.
- `useSavedViewsStore` — per-module list presets.
- `useToastStore` (via `useToast()`).
- `useOfflineQueueStore`.
- `useDraftsStore` — autosaved unsaved forms.

Per-module store pattern:

```ts
export const useInvoicesStore = defineStore('invoices', () => {
  const list     = ref<ListState<InvoiceFilters>>(defaultListState)
  const byId     = ref<Record<number, Invoice>>({})
  const loading  = ref({ list: false, detail: false })

  async function fetchList() { … }
  async function fetchById(id) { … }
  async function post(id) { … }     // mutation, no optimistic
  async function create(payload) { … }

  return { list, byId, loading, fetchList, fetchById, post, create }
})
```

Stores never call `$fetch` directly — always through `useApi()`.

### 13.2 API client — `useApi()`

```ts
// composables/useApi.ts
export const useApi = () => {
  const auth = useAuthStore()
  const { locale } = useI18n()
  const { tz } = useMeStore()

  const client = $fetch.create({
    baseURL: '/v1',
    retry: 1,
    retryStatusCodes: [408, 425, 429, 500, 502, 503, 504],
    onRequest({ options }) {
      options.headers = {
        ...options.headers,
        Authorization: auth.token ? `Bearer ${auth.token}` : undefined,
        'Accept-Language': locale.value,
        'X-Timezone': tz,
      }
    },
    onResponseError({ response }) {
      if (response.status === 401) auth.signOut({ reason: 'expired' })
      if (response.status === 403) useAppToast().error('Permission denied')
      if (response.status === 422) return  /* caller handles field errors */
      if (response.status === 429) useAppToast().warning('Rate limit — try again in a moment')
      if (response.status >= 500) useAppToast().error('Server error. Our team has been notified.')
    },
  })

  return {
    get:  <T>(u: string, q?: object) => client<ApiEnvelope<T>>(u, { method: 'GET', query: q }),
    post: <T>(u: string, body?: object, opts?) => client<ApiEnvelope<T>>(u, { method: 'POST', body, ...opts }),
    put:  <T>(u: string, body?: object) => client<ApiEnvelope<T>>(u, { method: 'PUT', body }),
    patch:<T>(u: string, body?: object) => client<ApiEnvelope<T>>(u, { method: 'PATCH', body }),
    del:  <T>(u: string) => client<ApiEnvelope<T>>(u, { method: 'DELETE' }),
    upload: <T>(u: string, form: FormData, onProgress?) => /* multipart with progress */ …,
  }
}

type ApiEnvelope<T> = { data: T, meta?: PaginationMeta }
type Val422 = { message: string, errors: Record<string, string[]> }
```

- Every module service lives in `services/*.ts` and consumes `useApi()` — no `fetch`, no axios.
- 401 triggers silent refresh (if backend supports it) or hard logout with a flash toast "Your session expired".
- 429 surfaces a warning toast with the retry-after delay.
- `Idempotency-Key` header is auto-generated on POST/PUT/PATCH for mutations that change money (invoices, bills, payments, journal entries, payroll) — a UUID v4 per user action, cached in `useIdempotencyStore()`.
- Query keys are serialized stably so `useAsyncData` caches consistently.

### 13.3 Route guards / middleware

- `auth.global.ts` — redirects unauthenticated to `/auth/login?redirect=<path>` for `/app/*`, `/portal/*`, `/onboarding/*`.
- `tenant.ts` — ensures `/v1/me` loaded; if user's tenant is inactive, renders `AppTenantInactive` page.
- `permission.ts` — reads `definePageMeta({ permission: 'manage_invoices' })` and blocks render.
- `feature.ts` — reads `definePageMeta({ feature: 'invoicing' })`; if not enabled, renders `AppFeatureDisabled` with upgrade CTA.
- `twoFactor.ts` — for endpoints requiring `enforce.2fa`, if the user hasn't verified 2FA in session, prompts 2FA modal.

### 13.4 i18n

- `@nuxtjs/i18n` configured with `ar` (default, RTL) and `en`.
- Route strategy: `prefix_except_default` — i.e., `/app/clients` for ar, `/en/app/clients` for en.
- Locale switcher in the topbar and in `/auth` and `/onboarding`.
- Every module owns its locale namespace; no keys may be defined outside their namespace.
- Pluralization follows ICU message format.
- Locale files are linted: missing keys fail CI.

### 13.5 Permissions & feature flags in UI

- `usePermissions().can('manage_invoices')` and `useFeatures().has('invoicing')`.
- Sidebar: hide group entirely if all children fail; show child with a lock if permission fails but feature is enabled.
- Buttons gated by permission are **hidden** (not disabled) — disabled buttons imply a fixable state to users.
- Buttons gated by feature are shown with a tooltip "Upgrade your plan" and open a plan comparison slide-over on click.
- Routes enforce the same at the middleware level — UI and routes must never disagree.

### 13.6 Money handling

- Server returns money as strings (e.g., `"1250.00"`). Frontend:
  - **Display**: use `useMoney().format(value, currency)`.
  - **Input**: `FormMoney` stores a string in form state; never `Number`.
  - **Transport**: always the string the user typed (normalized: trim, drop thousands separators, keep decimal).
- Rates from `/v1/currencies/rates` are authoritative — never extrapolate.
- Locale toggles thousands separator and decimal mark but never the digit system by default (see §5.3).

### 13.7 Realtime & polling

- Notifications unread count: polled every 60s when tab is visible (pauses on blur).
- Long-running jobs (imports, reports PDF, bulk submit ETA): polled every 2s for the first 30s, then 10s.
- Posture: **no WebSockets in v1**. If/when the backend ships SSE/WS, the `useRealtime()` composable is the single integration point.

---

## 14. Performance budgets

- Initial JS payload on `/app/index`: **≤ 220 KB gzip**.
- LCP on `/app` (cold, cached login): **≤ 2.0s** on a mid-tier laptop over 4G.
- First meaningful render on list pages: **≤ 1.0s** with skeleton, **≤ 2.5s** with data.
- Time to interactive on invoice create page: **≤ 1.5s**.
- Route-switch nav (warm): **≤ 200ms** page paint.
- Every page ships its own async chunks (`defineAsyncComponent` for heavy widgets).
- Images: `@nuxt/image`, `loading="lazy"`, sized.
- Tables > 200 rows: virtualized (§11.3).
- No library > 50 KB gzip added without explicit sign-off. Reject moment, lodash full, jQuery, etc.

---

## 15. Testing

- **Unit (Vitest):** every composable, every store, every reducer. Coverage gate 80%.
- **Component (Vitest + `@nuxt/test-utils`):** every shared component (`AppTable`, `AppStatusChip`, `FormMoney`, …). Snapshot-style optional; behavior tests required.
- **E2E (Playwright):** smoke flows per module (list → detail → action) in both `ar` and `en` locales. Runs in CI on every PR.
- **Visual regression:** Playwright snapshots for the staff app shell, sidebar (expanded + collapsed), PageHeader, AppTable (light+dark, ar+en). Catches RTL regressions.
- **Accessibility:** `@axe-core/playwright` sweep per route — zero violations of `critical` severity.

---

## 16. Per-module UX specification

Every module below is the **authoritative UX contract** for its feature. The frontend agent must implement every listed route, every listed page, every listed action. Columns and filters are the minimum set; additional ones may be added if clearly useful but may not be removed.

Legend:
- **Route** paths are under `/app` unless noted.
- **Perm** = permission required (UI hides if denied).
- **Feat** = feature flag required (UI shows upgrade CTA if missing).
- **Archetype** = page pattern from §11.2 (A list, B detail, C form, D wizard, E split grid, F dashboard).

---

### 16.1 Module 01 — Authentication & account management

Surfaces live under `/auth/*` (public) and `/app/settings/account` (authenticated).

#### Routes

| Route | Archetype | Perm | Feat | Notes |
|---|---|---|---|---|
| `/auth/login` | C | — | — | Email + password + optional 2FA prompt |
| `/auth/register` | C | — | — | Creates new tenant; company name, admin email, password, phone, industry, locale |
| `/auth/forgot-password` | C | — | — | Email input; always shows success banner (don't leak account existence) |
| `/auth/reset-password?token=…` | C | — | — | New password + confirm |
| `/auth/2fa` | C | — | — | Prompt after login when user has 2FA enabled |
| `/app/settings/account/profile` | C | — | — | Name, phone, avatar upload, locale, timezone |
| `/app/settings/account/password` | C | — | — | Old + new + confirm; revokes other sessions |
| `/app/settings/account/2fa` | C | — | — | Enable (QR + code), disable (re-enter password), recovery codes (once) |
| `/app/settings/account/sessions` | A | — | — | Active device tokens; revoke individual |
| `/app/settings/account/notifications` | C | — | — | Channel toggles (email, in-app, WhatsApp, SMS) per event type |

#### Login page

- Split-screen auth shell. Card 420px.
- Fields: email, password, "Remember me" checkbox, "Forgot password?" link.
- Submit button full-width.
- On success: if 2FA enabled → redirect to `/auth/2fa`; else if first-time tenant → `/onboarding`; else → `/app`.
- Rate-limited (5/min). If 429, show countdown in submit button.
- Social/SSO: out of scope for v1.
- Error surface: form-level alert above fields for invalid credentials.

#### 2FA setup

- Stepper: (1) scan QR, (2) enter 6-digit code, (3) save recovery codes.
- Recovery codes shown once in a code block with "Copy" and "Download .txt". A checkbox "I saved these codes" gates the finish button.
- Disabling 2FA requires re-entering password; shows a warning about reduced security.

#### Sessions page

- Table of active tokens: device name, last active, IP, browser/OS, current session pill.
- Row action: revoke (cannot revoke current). Bulk: revoke all other sessions.

---

### 16.2 Module 02 — Public routes (marketing site)

Lives under the `marketing` layout. All pre-rendered.

#### Routes

| Route | Content |
|---|---|
| `/` | Landing: hero, feature grid, screenshots, pricing teaser, testimonials, CTA |
| `/pricing` | Full plan comparison table (pulled from `/v1/public/plans`, cached 10 min) |
| `/contact` | Contact form: name, company, email, phone, message |
| `/blog` | Post list with category filter and search |
| `/blog/[slug]` | Post detail with related posts |

#### Conventions

- Typography scale: h1 `text-5xl`, h2 `text-4xl`, body `text-lg`.
- Pricing page honors "monthly / annual" toggle (annual shows % saved badge).
- Contact form submission calls `/v1/public/contact-leads`; success shows a thank-you card without redirect.
- All marketing pages expose a locale switcher, language-aware `<html lang>`.
- All routes render a footer with company address, privacy, terms, blog, pricing, login/sign-up.
- SEO: each page defines `useSeoMeta` with localized title/description/OG tags.

---

### 16.3 Module 03 — Dashboard, activity log, audit, notifications

#### Routes

| Route | Archetype | Perm | Feat |
|---|---|---|---|
| `/app` | F | `view_dashboard` | — |
| `/app/notifications` | A | — | — |
| `/app/activity` | A | `view_audit` | `audit_log` |
| `/app/audit` | F+A | `view_audit` | `audit_log` |

#### Dashboard (`/app`)

- **Period picker** in page header: Today, This week, This month, This quarter, YTD, Custom.
- **KPI row (6 cards)**: Revenue, Gross profit, Accounts receivable, Accounts payable, Cash on hand, Overdue invoices. Each card: big number (`text-3xl`, tabular-nums), delta vs prior period with colored arrow (success up / danger down — semantic, not directional), tiny sparkline.
- **Chart row**: revenue trend (line, 12 buckets), AR aging (stacked bar: current, 1-30, 31-60, 61-90, 90+), cash-flow (line, rolling 30d).
- **Widgets (grid below)**:
  - Top 5 clients by revenue (mini-table).
  - Alerts panel (unacknowledged alerts, last 24h).
  - Pending approvals (count badge + list).
  - Upcoming recurring invoices / bills.
- Each widget has its own loading skeleton and "View all" link.
- **Personalization**: users can hide/reorder widgets; persists in `useUiStore`.

#### Notifications (`/app/notifications`)

- List with columns: Unread dot, Type icon, Title, Description, Created at.
- Filter chips: All, Unread, Today, Mentions.
- Row click opens the linked entity (invoice, bill, report, etc.).
- Bulk: mark selected read, delete.
- Header action: "Mark all as read".

#### Activity log (`/app/activity`)

- Columns: User avatar+name, Action, Entity type, Entity link, Date/time, IP.
- Filters: user, entity type (dropdown of module names), action (created, updated, posted, voided, …), date range, IP.
- Detail: slide-over with before/after diff (JSON formatted, key-colored).
- Export CSV (async → notification).

#### Audit compliance (`/app/audit`)

- Three tabs: **High-risk events** (default), **All audit events**, **Compliance reports**.
- High-risk tab lists manual journal entries, late postings, reversed entries, deletion attempts, exports, permission changes.
- Compliance reports tab: download SOX-style reports per date range.
- Immutable — no edit/delete on any row.

---

### 16.4 Module 04 — Subscription & plans

#### Routes

| Route | Archetype | Perm |
|---|---|---|
| `/app/settings/subscription` | F+C | `manage_subscription` |
| `/app/settings/subscription/change` | D | `manage_subscription` |
| `/app/settings/subscription/usage` | F | `manage_subscription` |
| `/app/settings/subscription/history` | A | `manage_subscription` |

#### Subscription overview (`/app/settings/subscription`)

- Hero card: current plan name, price, renewal date, status chip (active/trialing/past_due/canceled).
- Usage grid (4-6 usage meters):
  - Users (X of Y, progress bar, color shifts to warning at 80%, danger at 100%).
  - Invoices this month.
  - Storage.
  - API calls.
  - Client portal seats (if plan includes).
- "Change plan" primary action → wizard.
- "Cancel subscription" in overflow menu (end-of-period cancel).
- Banner if usage ≥ 80% of any limit.

#### Change plan wizard

- Step 1: pick plan tier (cards with radio behavior).
- Step 2: billing cycle (monthly vs annual, discount shown).
- Step 3: proration preview (today's charge vs credit, next renewal).
- Step 4: payment (Paymob/Fawry redirect).
- Step 5: confirmation — waits on webhook (poll status every 3s up to 2 min, then fall back to "we'll email you").

#### Billing history

- Table: date, amount, status (paid/failed/pending), reference, receipt PDF download.

---

### 16.5 Module 05 — Clients & CRM

#### Routes

| Route | Archetype | Perm | Feat |
|---|---|---|---|
| `/app/clients` | A | `manage_clients` | `clients` |
| `/app/clients/new` | C | `manage_clients` | `clients` |
| `/app/clients/[id]` | B | `manage_clients` | `clients` |
| `/app/clients/[id]/edit` | C | `manage_clients` | `clients` |
| `/app/clients/import` | D | `manage_clients` | `clients` |

#### List (`/app/clients`)

- **Columns** (default): Name, Tax ID, Email, Phone, City, Status chip, Balance (money, end-aligned), Open invoices (count, clickable → filtered invoice list), Last activity (relative time).
- **Hidden by default**: Credit limit, Created at, Industry, Currency.
- **Filters**: status (active/inactive/archived), city, industry, currency, has-open-invoices, balance range, created-date range.
- **Primary action**: "New client" (opens slide-over form).
- **Secondary**: Import (→ `/import` with type=clients pre-selected), Export (CSV).
- **Row overflow**: Edit, Archive, Invite to portal, Send message, Export statement.
- **Bulk**: Archive, Tag, Export, Send message.
- **Saved views** preset examples: "All active clients", "Overdue clients", "VIP (balance > 50K)".

#### Detail (`/app/clients/[id]`)

- **Header**: name + tax ID chip + status chip; subtitle: balance · credit limit gauge · open invoices.
- **Tabs**: Overview, Invoices, Payments, Contacts, Addresses, Documents, Messages, Activity.
- **Overview**:
  - Left: balance breakdown (current / 1-30 / 31-60 / 61-90 / 90+), recent invoices mini-table, last 5 activities.
  - Right: metadata card (tax ID, email, phone, website, industry, currency, payment terms), credit-limit gauge, portal status (invited/active/not invited) with "Invite/Resend" button.
- **Invoices tab**: filtered invoice list (by client_id) embedded as `AppTable`.
- **Contacts tab**: list of contacts with role, email, phone; add/edit via slide-over.
- **Addresses tab**: list with type (billing/shipping/office), default toggle.
- **Messages tab**: embedded messaging thread (§16.23).

#### Create / Edit (slide-over)

- Sections (accordion): Basic info, Tax info, Contact, Address, Payment terms, Portal.
- Tax ID live-validates against ETA format; shows warning icon if invalid but still saves.
- "Invite to portal" checkbox triggers post-create magic-link dispatch.

#### Import wizard (Module 27 shell with type=clients)

- See §16.27.

#### Aging analysis widget

- Reusable component `ClientAgingWidget` — horizontal stacked bar with 5 buckets, tooltip shows amount + count. Appears on overview and on the main dashboard.

---

### 16.6 Module 06 — Accounting core (CoA, Journal Entries, Fiscal Calendar)

#### Routes

| Route | Archetype | Perm | Feat |
|---|---|---|---|
| `/app/chart-of-accounts` | Tree+A | `manage_accounts` | `accounting` |
| `/app/chart-of-accounts/[id]` | B | `manage_accounts` | `accounting` |
| `/app/journal-entries` | A | `manage_journal_entries` | `accounting` |
| `/app/journal-entries/new` | C | `manage_journal_entries` | `accounting` |
| `/app/journal-entries/[id]` | B | `manage_journal_entries` | `accounting` |
| `/app/journal-entries/recurring` | A | `manage_journal_entries` | `accounting` |
| `/app/fiscal-calendar` | B+A | `manage_accounts` | `accounting` |

#### Chart of accounts (`/app/chart-of-accounts`)

- **View toggle** in page header: Tree / Flat.
- **Tree view** (default): hierarchical with expand/collapse, each row shows: Code (mono), Name (with AR/EN toggle per row), Type badge (asset/liability/equity/revenue/expense, color-coded), Balance (end-aligned money), Children count.
  - Drag-and-drop reorder (saves parent + position).
  - Inline "Add child" plus icon appears on row hover.
- **Flat view**: `AppTable` with columns: Code, Name AR, Name EN, Type, Parent, Balance, Actions. All filterable.
- **Primary action**: "New account" (slide-over form).
- **Secondary**: Import template, Export CSV, AI Suggest (opens a modal with a prompt field and suggestions → select → pre-fills form).
- **Row actions**: Edit, Delete (blocked if has transactions), View ledger.

#### Account detail (`/app/chart-of-accounts/[id]`)

- **Tabs**: Overview, Ledger (all transactions hitting this account, virtualized), Children (if any), Budgets (if linked).
- **Header**: code · name · type chip · current balance · debit total · credit total.

#### Journal entries list

- **Columns**: Number, Date, Description, Status chip (draft/posted/reversed), Debit total, Credit total, Source (manual/invoice/bill/payment/depreciation), Created by, Reference.
- **Filters**: status, date range, account (multi), cost center, source, reference, created-by, amount range.
- **Primary action**: "New entry" (full page, §11.2C complex form).
- **Row actions**: View, Edit (draft only), Post (draft only), Reverse (posted only), Delete (draft only).
- **Bulk**: Post drafts, Export CSV.

#### Journal entry form

- Header fields: Date, Reference, Description, Cost center, Currency (default tenant base).
- **Line items** table with inline editing:
  - Account (async select, shows code + name), Cost center, Description, Debit (money), Credit (money), Tax code (optional).
  - Each line is either debit OR credit — mutually exclusive (entering one clears the other).
  - Add line, duplicate line, delete line.
- **Running totals** at the bottom: Debit total, Credit total, **Balance indicator** (green check when equal, red warning with difference when not).
- **File attachments** slot.
- **Buttons**: Save draft, Post (disabled until balanced). Post triggers a confirm modal.

#### Journal entry detail

- Read-only line grid + totals.
- Actions: Print, Reverse (creates a new JE flipping debits/credits), View in ledger, View source (if generated from invoice/bill).

#### Recurring journal entries

- List: Name, Frequency (daily/weekly/monthly/yearly), Next run, Last run, Active toggle, Created by.
- Create: JE template + frequency config (day of month, interval) + start/end dates + auto-post toggle.
- Activity log view: entries generated from the recurring template.

#### Fiscal calendar (`/app/fiscal-calendar`)

- Visual: year timeline with 12 period boxes. Each box shows status (open/closed), start/end dates, count of transactions.
- Actions: Close period (confirm modal with "all entries in this period will be locked"), Reopen period (permission-gated, logs to audit).
- Current period highlighted.
- Fiscal year setup wizard when no year exists — (1) start date, (2) end date, (3) period granularity (monthly default), (4) confirm.

#### Gotchas

- Posted entries immutable — actions limited to Reverse.
- Closing a period blocks all date-before entries for non-admins.
- Multi-currency: each line has `exchange_rate`, auto-filled from `/v1/currencies/rates` for the entry date.
- Debit = Credit is enforced client-side as visual validation, server-side as hard rule.

---

### 16.7 Module 07 — Bank reconciliation, connections, FX revaluation

#### Routes

| Route | Archetype | Perm | Feat |
|---|---|---|---|
| `/app/reconciliation` | A | `manage_accounts` | `accounting` |
| `/app/reconciliation/new` | C | `manage_accounts` | `accounting` |
| `/app/reconciliation/[id]` | E | `manage_accounts` | `accounting` |
| `/app/reconciliation/rules` | A | `manage_accounts` | `accounting` |
| `/app/bank-connections` | A | `manage_accounts` | `accounting` |
| `/app/bank-connections/new` | D | `manage_accounts` | `accounting` |
| `/app/fx-revaluation` | A+F | `manage_accounts` | `accounting` |

#### Reconciliation list

- Columns: Account, Statement date, Status (open/completed), Matched count, Unmatched count, Variance (end-aligned money, red if non-zero), Created at.
- Filters: account, status, date range.
- Primary action: "Start reconciliation".

#### Reconciliation detail (split grid)

```
┌─ Header: account · statement date · statement balance · GL balance · variance ─┐
│  [Import statement] [Auto-match] [Smart-match (AI)] [Complete] (→ when variance=0) │
├──────────────────────────────────────┬─────────────────────────────────────────┤
│  STATEMENT LINES (start side)        │  GL ENTRIES (end side)                  │
│   [ ] Date   Desc   Amount   Status  │   [ ] Date   Desc   Amount   Status    │
│   [ ] …                              │   [ ] …                                │
│    Drag row to GL row to match       │                                        │
│    …                                 │                                        │
├──────────────────────────────────────┴─────────────────────────────────────────┤
│  MATCHED SET                                                                  │
│   Statement row ↔ GL row  [✕ Unmatch]                                         │
└──────────────────────────────────────────────────────────────────────────────┘
```

- Drag-to-match or select-both-then-click-Match.
- Match-confidence score shown for smart-match (0-100%). Auto-accept ≥ 95, prompt between 70-95, reject below.
- Exclude line (e.g., bank fee) with a reason.
- "Categorize" action applies a rule to uncategorized statement lines.
- "Complete" is disabled until variance = 0.
- Sticky summary footer with matched count, unmatched count, variance.

#### Rules builder (`/app/reconciliation/rules`)

- List of rules: Name, Pattern (regex/wildcard), Category (account), Priority, Active.
- Create rule: pattern input + test area ("paste statement line to test"), map to account, set cost center optional.

#### Bank connections

- Cards grid (one per connection): Bank logo, Account name, Last sync, Status (healthy/warning/error), Schedule (manual/hourly/daily).
- Actions: Sync now, Configure schedule, View statements, Disconnect.
- "New connection" wizard: (1) select bank (NBE, CIB, AAIB, QNB, Banque Misr, HSBC, custom), (2) credentials form, (3) select account, (4) set schedule.

#### FX revaluation

- List of revaluation runs: Date, Currencies, Accounts covered, Gain/loss (money, colored), Status (draft/posted/reversed).
- "Run revaluation" action: date, currencies to include, preview table (account, original balance, revalued balance, gain/loss), then Post or Save draft.

---

### 16.8 Module 08 — Invoicing & receivables

#### Routes

| Route | Archetype | Perm | Feat |
|---|---|---|---|
| `/app/invoices` | A | `manage_invoices` | `invoicing` |
| `/app/invoices/new` | C | `manage_invoices` | `invoicing` |
| `/app/invoices/[id]` | B | `manage_invoices` | `invoicing` |
| `/app/invoices/[id]/edit` | C | `manage_invoices` | `invoicing` |
| `/app/invoices/recurring` | A | `manage_invoices` | `invoicing` |
| `/app/invoices/recurring/new` | C | `manage_invoices` | `invoicing` |
| `/app/credit-notes` | A | `manage_invoices` | `invoicing` |
| `/app/payments` | A | `manage_payments` | `invoicing` |
| `/app/payments/new` | C | `manage_payments` | `invoicing` |
| `/app/collections` | F+A | `manage_collections` | `collections` |

#### Invoice list

- **Columns**: Number (mono), Client, Issue date, Due date, Amount, Paid, Balance (end-aligned), Status chip, ETA status chip (only if feature enabled).
- **Filters**: client, status (draft/sent/partial/paid/overdue/cancelled/credited), date range, amount range, currency, has-eta-errors.
- **Saved views**: Open, Overdue, Paid, Drafts, This month.
- **Primary action**: "New invoice".
- **Secondary**: Import, Export.
- **Row overflow**: View, Edit (draft only), Send (email/WhatsApp), Record payment, Credit note, Cancel (confirm), Duplicate, PDF, Submit to ETA (if eligible).
- **Bulk**: Send, Submit to ETA, Export PDF pack, Export CSV.

#### Invoice create/edit form

Full page. Sections:

1. **Header**: Client (async picker with balance/credit-limit chip), Invoice number (auto, editable if setting allows), Issue date, Due date (computed from payment terms, editable), Currency, Reference/PO number.
2. **Line items** table (inline, array field):
   - Columns: Product (async picker with SKU/price; optional — free-text allowed), Description, Qty, Unit price, Discount (%), Tax rate (dropdown), **ETA item code** (picker, required when feature enabled), Cost center, Line total.
   - Add line, duplicate line, delete line, reorder drag handle.
3. **Totals** side card (right / end):
   - Subtotal, Discount total, Tax total (grouped by rate), Grand total.
   - Each row tabular-nums, end-aligned.
4. **Notes / terms**: rich text with default from settings.
5. **Attachments**: file upload slot.
6. **Send options**: checkbox "Send after saving" with channel picker (email, WhatsApp, both).

Sticky footer: Save draft · Pre-check (runs credit-limit + duplicate check, shows warnings) · Post to GL · Send.

On post, show a confirmation modal summarizing: JE to be created, VAT breakdown, ETA submission (if auto_submit). After confirm, disable Post button and redirect to detail.

#### Invoice detail

- Header: number + client + status chip + ETA chip + amount. Subtitle: due date (colored if overdue) · payment terms.
- **Tabs**: Overview, Line items, Payments, GL posting, ETA, Documents, Activity.
- **Overview**: summary card + PDF preview (inline via pdf.js viewer).
- **Payments tab**: list of payment applications. "Record payment" opens slide-over (amount, date, method, bank account, reference).
- **GL posting tab**: JE breakdown (debits/credits). Read-only. Link to the parent JE.
- **ETA tab**: submission status, payload JSON (collapsed), validation warnings, actions (Submit, Cancel submission, Check status).
- **Actions**: Send, Record payment, Credit note, Cancel, Duplicate, PDF, Email history.

#### Recurring invoices

- List: Template name, Client, Frequency, Next run, Last run, Active, Amount.
- Create: same as invoice form + frequency config + generation mode (draft/send).

#### Credit notes

- List similar to invoices. Linked to source invoice.
- Create: pick invoice → preview → adjust lines → save.

#### Payments received

- List: Payment number, Date, Client, Amount, Method, Applied to (count), Bank account, Reference, Status.
- Create: pick client → show open invoices with checkboxes → auto-distribute → method + bank account + reference → save.
- Void action from detail: reverses GL posting (confirm with typed code).

#### Collections dashboard

- KPIs: Total AR, Overdue AR, Average DSO, Collections this month.
- Aging widget (stacked bar + drill-down).
- **Collection actions list**: Action type (reminder_email, reminder_whatsapp, phone_call, escalation), Due date, Target invoice, Status (pending/completed/skipped).
- Schedule a reminder: slide-over with template picker + channel.

---

### 16.9 Module 09 — Accounts payable (vendors, bills, bill payments)

Mirrors invoicing but on the payables side. Reuse patterns.

#### Routes

| Route | Archetype | Perm | Feat |
|---|---|---|---|
| `/app/vendors` | A | `manage_vendors` | `bills_vendors` |
| `/app/vendors/[id]` | B | `manage_vendors` | `bills_vendors` |
| `/app/bills` | A | `manage_bills` | `bills_vendors` |
| `/app/bills/new` | C | `manage_bills` | `bills_vendors` |
| `/app/bills/[id]` | B | `manage_bills` | `bills_vendors` |
| `/app/bill-payments` | A | `manage_bills` | `bills_vendors` |
| `/app/bill-payments/new` | C | `manage_bills` | `bills_vendors` |

#### Bills list

- Columns: Bill #, Vendor, Bill date, Due date, Amount, Paid, Balance, Status chip, Approval chip (if workflow configured), WHT amount.
- Filters: vendor, status (draft/pending_approval/approved/paid/partial/cancelled), date range, amount range, has-wht, approver.
- Primary: "New bill". Secondary: import, export.
- Row overflow: View, Edit (draft), Submit for approval, Approve (if in queue), Cancel, Duplicate, Record payment, Generate WHT.

#### Bill form

Similar to invoice form, with:
- Vendor picker (shows WHT rate from vendor profile).
- Line items: Product/service, Description, Qty, Unit price, Tax rate, WHT rate, Account (expense account mandatory), Cost center.
- Totals: Subtotal, VAT, WHT (deducted), Net payable.
- Attachments mandatory if the setting `bills.require_receipt` is on.

#### Bill detail

- Tabs: Overview, Line items, **Approvals** (workflow timeline with each step's status and approver), Payments, GL posting, Documents, Activity.
- Actions: Submit for approval, Approve (for current approver), Reject, Cancel, Record payment, Generate WHT certificate, Export statement.

#### Bill payments

- List + create similar to receivable payments, but on the AP side.
- Method includes: bank transfer, cheque, cash. For cheque, capture cheque number + bank.

#### WHT certificate

- Action from bill detail. Opens slide-over: preview certificate (vendor, amount, WHT rate, period). "Issue" locks the certificate. "Submit to ETA" triggers §16.15 submission.

#### Vendor detail

- Mirrors client detail: Overview, Bills, Payments, WHT certificates, Contacts, Addresses, Documents, Activity.

---

### 16.10 Module 10 — Expenses & expense reports

#### Routes

| Route | Archetype | Perm | Feat |
|---|---|---|---|
| `/app/expenses` | A | `manage_expenses` | `expenses` |
| `/app/expenses/new` | C | `manage_expenses` | `expenses` |
| `/app/expenses/[id]` | B | `manage_expenses` | `expenses` |
| `/app/expenses/categories` | A | `manage_expenses` | `expenses` |
| `/app/expense-reports` | A | `manage_expenses` | `expenses` |
| `/app/expense-reports/new` | C | `manage_expenses` | `expenses` |
| `/app/expenses/approvals` | A | `manage_expenses` | `expenses` |

#### Expenses list

- Columns: Date, Employee avatar+name, Category (color pill), Vendor, Amount, Receipt thumbnail (click → modal), Status chip, Submitted at.
- Filters: status (draft/submitted/approved/rejected/reimbursed), employee, category, cost center, date range, amount range, has-receipt.
- Primary: "New expense". Bulk: submit, approve (if role), export.

#### Expense create form

- Simple form — single page:
  - Date, Category (dropdown with colors), Vendor (text or picker), Amount, Currency, Tax rate, Cost center, Project (optional), Description.
  - **Receipt** drop zone (jpg/png/pdf ≤ 10 MB). Shows preview. OCR is out of scope for v1 (optional future).
  - Submit for approval checkbox.

#### Expense detail

- Tabs: Overview (with receipt viewer), Approval history, GL posting, Related expense report (if bundled).
- Actions: Edit (draft), Submit, Approve (if current approver), Reject, Reimburse (→ creates bank payment), Delete (draft only).

#### Expense categories

- Simple list with inline edit: Name, Color swatch picker, Default account, Default tax rate, Active.

#### Expense reports

- Bundle of expenses for reimbursement. List: Report name, Employee, Period, Total, Status (draft/submitted/approved/reimbursed), Expenses count.
- Create: select employee + period → show eligible unbundled expenses with checkboxes → bundle.
- Detail: summary + expense list + approval chain + reimburse action.

#### Approvals queue (`/app/expenses/approvals`)

- Filtered expense list scoped to current user as approver. Highlights overdue approvals.

---

### 16.11 Module 11 — Fixed assets & depreciation

#### Routes

| Route | Archetype | Perm | Feat |
|---|---|---|---|
| `/app/assets` | A | `manage_fixed_assets` | `fixed_assets` |
| `/app/assets/new` | C | `manage_fixed_assets` | `fixed_assets` |
| `/app/assets/[id]` | B | `manage_fixed_assets` | `fixed_assets` |
| `/app/assets/categories` | A | `manage_fixed_assets` | `fixed_assets` |
| `/app/assets/depreciation` | A | `manage_fixed_assets` | `fixed_assets` |
| `/app/assets/depreciation/new` | C | `manage_fixed_assets` | `fixed_assets` |
| `/app/assets/disposals` | A | `manage_fixed_assets` | `fixed_assets` |
| `/app/assets/disposals/new` | C | `manage_fixed_assets` | `fixed_assets` |

#### Asset register (list)

- Columns: Asset # (mono), Name, Category, Acquisition date, Cost, Accumulated depreciation, **Book value** (end-aligned, tabular, emphasized), Status chip (active/disposed/fully_depreciated).
- Filters: category, status, acquisition-date range, cost range, depreciation method.
- Saved views: Active, Disposed, Fully depreciated, Under-depreciated (ratio < expected).
- Primary: "New asset", "Run depreciation", "New disposal".
- Bulk: Export register, Run depreciation for selected.

#### Asset detail

- Header: number · name · category chip · status chip · book value (large).
- **Tabs**: Overview, Depreciation schedule, Components (parent/child), Disposals, GL entries, Documents.
- **Overview**: cost breakdown card, salvage rate, useful life, depreciation method, bookvalue gauge, next run date.
- **Depreciation schedule** tab: line chart (cumulative + period) + table (period, opening, depreciation, closing).
- **Components** tab: hierarchical child-asset list (e.g., server rack + components).

#### Asset form

- Sections: Basic (name, category, asset number, cost, acquisition date), Depreciation (method: SL/DB/UOP, useful life, salvage rate, start date), Location (cost center, physical location), Parent asset (optional), Attachments.
- Category selection prefills depreciation defaults (editable).

#### Asset categories

- List: Code, Name, Depreciation method, Useful life, Salvage rate %, Default GL account, Active.

#### Depreciation runs

- List: Run date, Period covered, Assets affected, Total depreciation, Status (draft/posted/reversed), Posted by.
- Create: pick period (month) → preview table (asset, current, depreciation, new book value) → Post or Save draft.
- Posting generates JE entries; reverse creates opposing JE.

#### Disposals

- List: Date, Asset, Disposal type (sale/scrap/donation/trade_in), Sale amount, Gain/loss (colored), Status.
- Create: pick asset → disposal type → sale amount (if sale) → buyer/recipient → date → preview gain/loss → Confirm → auto-generated JE.

#### Reports

- "Asset register" export (CSV/PDF): full list with all columns.
- "Roll-forward" export: opening + additions + depreciation + disposals + closing per category.

---

### 16.12 Module 12 — Inventory management

#### Routes

| Route | Archetype | Perm | Feat |
|---|---|---|---|
| `/app/products` | A | `manage_inventory` | `inventory` |
| `/app/products/new` | C | `manage_inventory` | `inventory` |
| `/app/products/[id]` | B | `manage_inventory` | `inventory` |
| `/app/products/categories` | A | `manage_inventory` | `inventory` |
| `/app/stock-movements` | A | `manage_inventory` | `inventory` |
| `/app/stock-movements/new` | C | `manage_inventory` | `inventory` |
| `/app/stock-alerts` | A | `manage_inventory` | `inventory` |
| `/app/inventory/valuation` | F | `manage_inventory` | `inventory` |
| `/app/inventory/turnover` | F | `manage_inventory` | `inventory` |

#### Products list

- Columns: SKU (mono), Name (AR/EN toggle in header), Category, Current stock (color-coded: green ≥ reorder, warning < reorder, danger = 0), Cost price, Selling price, Margin % (computed), Valuation method.
- Filters: category, low-stock only, out-of-stock only, valuation method, active.
- Primary: "New product". Bulk: Export, Stock count (opens count modal), Set category.

#### Product form

- Sections: Basic (SKU, barcode, name AR/EN, category, image upload), Pricing (cost, sell, currency), Inventory (valuation method, reorder level, initial stock + cost), Tax (tax code), Accounts (revenue, COGS, inventory asset), ETA item code (if feature on), Description.

#### Product detail

- Header: SKU + name + stock badge + current book value.
- Tabs: Overview, Stock movements, Valuation, Turnover, Price history, Documents.
- Overview: stock gauge (current / reorder / max), cost/sell spread card, last movement snapshot.
- Stock movements: virtualized list.

#### Stock movements list

- Columns: Date, Product, Type chip (in/out/adjustment/transfer), Qty (signed), Unit cost, Total, Source (manual/invoice/bill), Reference.
- Filters: product, type, date range, source, cost center.
- "New movement" action for manual adjustments with a reason field (required).

#### Low-stock alerts

- Grid/card list of products below reorder. Each card: SKU, name, current vs reorder, suggested reorder qty. Action: "Create bill" to quick-order from preferred vendor.

#### Valuation report

- Filters: as-of date, category, valuation method override.
- Table: product, qty on hand, unit cost (per method), total value.
- Export.

#### Turnover analysis

- Chart: turnover ratio per product over period. Filter by category.

---

### 16.13 Module 13 — Cost centers & budgeting

#### Routes

| Route | Archetype | Perm | Feat |
|---|---|---|---|
| `/app/cost-centers` | Tree+A | `manage_cost_centers` | `cost_centers` |
| `/app/cost-centers/new` | C | `manage_cost_centers` | `cost_centers` |
| `/app/cost-centers/[id]` | B | `manage_cost_centers` | `cost_centers` |
| `/app/budgets` | A | `manage_accounts` | `budgeting` |
| `/app/budgets/new` | C | `manage_accounts` | `budgeting` |
| `/app/budgets/[id]` | B | `manage_accounts` | `budgeting` |
| `/app/budgets/[id]/variance` | F | `manage_accounts` | `budgeting` |

#### Cost center tree

- Tree view: Code, Name (AR/EN), Type (department/project/location), Manager, Balance YTD, Children count.
- Drag to reorder / reparent.
- Right-panel on selection: summary + quick actions.

#### Cost center detail

- Tabs: Overview, P&L, Budgets, Team members, Transactions (JE lines hitting this CC), Children.
- Overview KPIs: revenue, direct expenses, contribution, headcount.
- Manager assignment in overview card.

#### Budgets

- List: Name, Cost center, Period (month/quarter/year), Total amount, Status (draft/approved/closed), Created by.
- Primary: "New budget".
- Create wizard:
  - Step 1: cost center + period.
  - Step 2: line items (account → amount per period column: Jan, Feb, … Dec; copy-down helper).
  - Step 3: review totals.
- Detail: same table + **variance view** toggle that shows Actual (live from GL) + Variance (signed, colored) + Variance %.

---

### 16.14 Module 14 — Tax management

#### Routes

| Route | Archetype | Perm | Feat |
|---|---|---|---|
| `/app/tax/vat` | A+F | `manage_tax` | `tax` |
| `/app/tax/vat/new` | C | `manage_tax` | `tax` |
| `/app/tax/vat/[id]` | B | `manage_tax` | `tax` |
| `/app/tax/wht` | A | `manage_tax` | `tax` |
| `/app/tax/wht/[id]` | B | `manage_tax` | `tax` |
| `/app/tax/corporate` | A+F | `manage_tax` | `tax` |
| `/app/tax/corporate/[id]` | B | `manage_tax` | `tax` |
| `/app/tax/adjustments` | A | `manage_tax` | `tax` |

#### VAT returns list

- Columns: Period (e.g., 2026-04), Status (draft/filed/submitted), Output VAT, Input VAT, Net payable (end-aligned, colored if refund), Filed on, Due by.
- Primary: "New VAT return" (wizard: pick period → auto-calculate → review table → mark filed).

#### VAT return detail

- Header: period · status · net.
- Tabs: Calculation (full breakdown), Source invoices, Source bills, Adjustments, Filing (reference, date, receipt upload).
- Export PDF (official form format).

#### WHT certificates list

- Columns: Certificate #, Vendor, Bill, Gross amount, WHT rate, WHT amount, Issue date, Status (draft/issued/submitted), Submission ref.
- Primary: "New WHT certificate" (pick a bill).
- Row actions: Issue (locks certificate), Submit to ETA, Download PDF, Void (issued not-submitted only).

#### WHT certificate detail

- Shows certificate preview (PDF) with QR code. Actions as above.

#### Corporate tax

- List of annual returns. Create: fiscal year → auto-pull book net profit → adjustments ledger (add-backs / deductions / deferred items) → computed taxable income → tax amount → file → record payment.
- Detail: adjustments table (type chip, reference, amount, description), file button, payment card.

#### Tax adjustments

- Standalone management of add-backs / deductions used by corporate tax.

---

### 16.15 Module 15 — ETA e-invoicing

#### Routes

| Route | Archetype | Perm | Feat |
|---|---|---|---|
| `/app/eta` | F | `manage_eta` | `e_invoice` |
| `/app/eta/settings` | C | `manage_eta` | `e_invoice` |
| `/app/eta/documents` | A | `manage_eta` | `e_invoice` |
| `/app/eta/documents/[id]` | B | `manage_eta` | `e_invoice` |
| `/app/eta/item-codes` | A | `manage_eta` | `e_invoice` |
| `/app/eta/item-codes/auto-assign` | D | `manage_eta` | `e_invoice` |
| `/app/eta/item-codes/unmapped` | E | `manage_eta` | `e_invoice` |
| `/app/eta/activity-codes` | A | `manage_eta` | `e_invoice` |

#### Compliance dashboard (`/app/eta`)

- KPIs: Success rate (last 30d), Rejected count, Unmapped lines, Pending submissions, Certificate expiry countdown (colored warning < 30d, danger < 7d).
- Recent submissions table (last 20).
- Quick actions: Bulk retry, Bulk status check, Reconcile state.
- Banner if `environment=preprod` or if auto_submit is off.

#### Settings (`/app/eta/settings`)

- Multi-section form:
  - Environment toggle (Preprod / Prod).
  - Tax number, activity code (dropdown), issuer name, branch.
  - Certificate upload (`.pem`/`.pfx`) + password (write-only field; never re-read).
  - Client secret (write-only).
  - Auto-submit toggle.
  - Signing mode (server / hardware token — currently server only).
- "Test connection" button before save.

#### Documents list

- Columns: Invoice # (link), Submission UUID (mono, truncated + copy), Status chip (prepared/submitted/valid/rejected/cancelled), Submitted at, ETA response time, Validation warnings count.
- Filters: status, date range, has-warnings, has-errors.
- Bulk: Retry rejected, Check status, Cancel (where allowed).

#### Document detail

- Tabs: Payload JSON (collapsed, syntax-highlighted), Validation warnings, Validation errors, Submission history.
- Actions: Resubmit, Cancel submission, Open related invoice.

#### Item codes catalog

- Columns: Code (GS1/EGS), Description, Category, Mapped products count.
- Import CSV button.

#### Auto-assign wizard

- Step 1: choose strategy (keyword match / product category / SKU prefix).
- Step 2: preview mapping suggestions with confidence.
- Step 3: select and apply.

#### Unmapped lines (split grid)

- Left: unmapped invoice lines (invoice #, product, description, amount).
- Right: item code catalog with search.
- Click-to-assign; bulk-assign after selecting multiple lines of the same product.

---

### 16.16 Module 16 — Payroll, attendance, leave

#### Routes

| Route | Archetype | Perm | Feat |
|---|---|---|---|
| `/app/employees` | A | `manage_employees` | `payroll` |
| `/app/employees/new` | C | `manage_employees` | `payroll` |
| `/app/employees/[id]` | B | `manage_employees` | `payroll` |
| `/app/payroll` | A | `manage_payroll` | `payroll` |
| `/app/payroll/new` | D | `manage_payroll` | `payroll` |
| `/app/payroll/[id]` | B | `manage_payroll` | `payroll` |
| `/app/payroll/payslips` | A | `manage_payroll` | `payroll` |
| `/app/payroll/payslips/[id]` | B | `manage_payroll` | `payroll` |
| `/app/payroll/components` | A | `manage_payroll` | `payroll` |
| `/app/payroll/loans` | A | `manage_payroll` | `payroll` |
| `/app/payroll/loans/new` | C | `manage_payroll` | `payroll` |
| `/app/payroll/social-insurance` | F | `manage_payroll` | `payroll` |
| `/app/payroll/calculators` | C | `manage_payroll` | `payroll` |
| `/app/leave` | A | `manage_employees` | `payroll` |
| `/app/leave/new` | C | `manage_employees` | `payroll` |
| `/app/leave/balances` | A | `manage_employees` | `payroll` |
| `/app/attendance` | A | `manage_employees` | `payroll` |

#### Employees list

- Columns: Photo+Name, Job title, Department, Hire date, Status chip, Salary (optional, permission-gated), Bank account (masked).
- Filters: department, status, hire-date range, job title.
- Saved views: Active, Terminated, On leave, Probation.

#### Employee detail

- Header: avatar · name · job title · department · status.
- Tabs: Overview, Compensation (salary components), Loans, Leave balances, Attendance, Payroll history, Documents, Emergency contacts, Bank info.
- Overview: contact card, manager, reporting line, key dates (hire, confirmation, contract end).
- Compensation: table of salary components (basic, allowances, deductions) with effective date.

#### Payroll runs list

- Columns: Period (month), Employees, Gross, Tax, SI, Net, Status (draft/calculated/approved/paid), Created by, Paid on.
- Primary: "New payroll run" (wizard).

#### Payroll run wizard

- Step 1: period (month), employees selection (all active by default, can exclude).
- Step 2: calculation — shows per-employee table: name, gross, overtime, deductions, tax, SI, loan repayment, net. Edit individual lines.
- Step 3: review totals.
- Step 4: approve (creates JE + payslips, locks the run).
- Step 5: mark paid (bank payment entry for the net total).

#### Payroll run detail

- Tabs: Summary, Employee breakdown (virtualized), GL posting, Payslips, Activity.
- Actions: Export (bank file), Download all payslips (ZIP), Reverse (if approved not paid).

#### Payslips

- List: Period, Employee, Gross, Net, Status, Downloaded count.
- Detail: bilingual payslip PDF (all fields: earnings, deductions, tax, SI, net, YTD totals, SI registration #).

#### Loans

- List: Employee, Principal, Installments, Remaining, Start date, Status.
- Create: employee, amount, installments count, start month, deduction account. Installments auto-calculated.

#### Salary components

- Global component templates: Name, Type (earning/deduction), Calculation (fixed / % of basic / formula), Default amount, Taxable flag, Included in SI base, Accounts.

#### Social insurance

- Monthly report: pre-filled Form 2 / Form 6 equivalents. Download PDF for filing.
- Employee SI status (registered/pending/exempt).

#### Labor-law calculators

- Forms that compute:
  - Overtime: regular/holiday/night rate × hours.
  - End-of-service gratuity: tenure → amount.
  - Leave encashment.
- Pure UI — no persistence unless user clicks "Save scenario".

#### Leave requests list

- Columns: Employee, Type (annual/sick/casual/unpaid/maternity), From, To, Days, Status chip, Approver, Submitted at.
- Filters: employee, type, status, period.
- Primary: "New leave request".

#### Leave create

- Employee (auto-filled for self-service), type, from, to (computes days excluding weekends), reason, attachment (medical cert for sick).
- Shows remaining balance of that type inline.

#### Leave balances (`/app/leave/balances`)

- Per-employee grid: Annual, Sick, Casual, Maternity, Unpaid. Cells: accrued / used / remaining.

#### Attendance

- Multi-view: Calendar heatmap (month) and daily grid (employee × day with status icons).
- Record attendance: check-in/out per day, late minutes, overtime hours. Bulk import CSV.

---

### 16.17 Module 17 — Timesheets & time tracking

#### Routes

| Route | Archetype | Perm | Feat |
|---|---|---|---|
| `/app/timesheets` | A | `manage_timesheets` | `timesheets` |
| `/app/timesheets/new` | C | `manage_timesheets` | `timesheets` |
| `/app/timesheets/[id]` | B | `manage_timesheets` | `timesheets` |
| `/app/timesheets/approvals` | A | `approve_timesheets` | `timesheets` |
| `/app/timesheets/timer` | — | `manage_timesheets` | `timesheets` |
| `/app/timesheets/billing-preview` | F | `manage_timesheets` | `timesheets` |

#### Timesheets list

- Columns: Employee, Week start, Total hours, Billable hours, Non-billable, Status, Submitted at, Approved by.
- Filters: employee, status, period, engagement, client.
- Saved views: My timesheets, Pending approval, This month.

#### Timesheet detail

- Weekly grid: days as columns (Mon–Sun, reversed in RTL), entries as rows.
- Each entry: client/project/engagement picker, task description, billable toggle, hours per day (cell inputs).
- Totals row.
- Sticky footer: Submit, Save draft, Discard.

#### Timer widget (global)

- Floating button bottom-end. Click opens popover:
  - Engagement/client selector (required), task description (optional).
  - Start / Stop / Discard buttons.
  - Elapsed time (large, tabular).
- On Stop, converts to an entry on the current week's timesheet.
- Running timer indicator in the topbar (pulse dot + running time).
- Auto-stops at midnight; shows a notification.

#### Billing preview

- Filters: client, engagement, date range, billable only (default on).
- Preview table: entries grouped by engagement with rate × hours = amount.
- Action: "Generate invoice" → prefills invoice form with selected entries as line items.

#### Approvals queue

- Filtered list of submitted timesheets where current user is approver. Bulk approve/reject.

---

### 16.18 Module 18 — Engagements & working papers

#### Routes

| Route | Archetype | Perm |
|---|---|---|
| `/app/engagements` | F+A | `manage_engagements` |
| `/app/engagements/new` | C | `manage_engagements` |
| `/app/engagements/[id]` | B | `manage_engagements` |
| `/app/engagements/deliverables` | A | `manage_engagements` |
| `/app/engagements/working-papers` | A | `manage_engagements` |
| `/app/engagements/working-papers/[id]` | B | `manage_engagements` |

#### Engagements dashboard

- KPI row: Active engagements, Budget hours, Actual hours, Utilization %.
- List of engagements with filters.

#### Engagements list

- Columns: Client, Name, Service type (audit/tax/bookkeeping/advisory/…), Start date, Status chip, Budget hrs, Actual hrs, **Utilization %** (progress bar), Team count, Overdue deliverables.

#### Engagement detail

- Tabs: Overview, Budget vs actual, Deliverables, Working papers, Team, Time log.
- Overview: status card, dates, description, client link.
- Budget vs actual: table (per phase) + stacked bar chart.
- Deliverables: milestone list with due dates, assignees, status.
- Working papers: index tree (A.1, B.2, …); reviewer/preparer chips.
- Team: team members + allocation %.
- Time log: embedded timesheet entries filtered to this engagement.

#### Engagement form

- Sections: Client (picker), Name, Service type, Start/end dates, Budget (hours + amount), Team (multi-pick), Description.

#### Working paper detail

- Header: reference (A.1), title, preparer, reviewer, status chip.
- Body: description, attached files, notes.
- Review actions: Sign off (approve / request rework / reject) — appends to immutable history.

---

### 16.19 Module 19 — Reporting & analytics

#### Routes

| Route | Archetype | Perm | Feat |
|---|---|---|---|
| `/app/reports` | F (center) | `view_reports` | `reports` |
| `/app/reports/trial-balance` | F | `view_reports` | `reports` |
| `/app/reports/profit-loss` | F | `view_reports` | `reports` |
| `/app/reports/balance-sheet` | F | `view_reports` | `reports` |
| `/app/reports/cash-flow` | F | `view_reports` | `reports` |
| `/app/reports/ar-aging` | F | `view_reports` | `reports` |
| `/app/reports/ap-aging` | F | `view_reports` | `reports` |
| `/app/reports/vat` | F | `view_reports` | `reports` |
| `/app/reports/wht` | F | `view_reports` | `reports` |
| `/app/reports/custom` | A | `manage_reports` | `custom_reports` |
| `/app/reports/custom/new` | C | `manage_reports` | `custom_reports` |
| `/app/reports/custom/[id]` | B | `manage_reports` | `custom_reports` |
| `/app/reports/scheduled` | A | `manage_reports` | `reports` |
| `/app/reports/anomalies` | F | `view_reports` | `reports` |

#### Report center

- Grid of report cards grouped by category (Financial, Tax, AR, AP, Inventory, Custom). Each card: icon, name, description, "Run" button.

#### Report page (archetype F)

- Page header: title + date-range picker + currency override + comparative toggle (vs prior period) + cost-center filter + "Save as custom" + Export (PDF, CSV, Excel).
- Main table (hierarchical for TB/P&L/BS/CF): account hierarchy rows with expand/collapse, column for current period, comparative column if toggled, variance %.
- All money end-aligned, tabular.
- Trial balance shows "out of balance" banner if debits != credits.
- Async exports: click Export → toast "Generating…" → push notification when ready → download link.

#### Custom report builder

- Drag-and-drop fields (left panel: available fields) onto canvas (center: selected columns, group-by, filters).
- Preview on the right.
- Save template → appears in scheduled/run history.

#### Scheduled reports

- List: Name, Frequency (daily/weekly/monthly/custom CRON), Recipients, Last run, Next run, Active.
- Create: pick report + schedule + recipients (emails) + delivery format (PDF/CSV).

#### Anomalies

- Tabs: Duplicates, Unusual amounts, Missing sequences, Weekend entries.
- Each tab is a list with "Confidence" badge and "Acknowledge" action.

---

### 16.20 Module 20 — Approvals & alerts

#### Routes

| Route | Archetype | Perm |
|---|---|---|
| `/app/approvals` | A | `manage_approvals` |
| `/app/approvals/queue` | A | — (any user) |
| `/app/approvals/workflows` | A | `manage_approvals` |
| `/app/approvals/workflows/new` | C | `manage_approvals` |
| `/app/approvals/workflows/[id]` | B | `manage_approvals` |
| `/app/alerts` | A | `manage_alerts` |
| `/app/alerts/rules/new` | C | `manage_alerts` |
| `/app/alerts/rules/[id]` | B | `manage_alerts` |
| `/app/alerts/history` | A | `manage_alerts` |

#### Approvals queue

- Shown to all users. Filtered to items where current user is an active approver.
- Columns: Entity type icon, Title, Submitter, Amount (if applicable), Step, Submitted at, **Timeout countdown** (colored if < 24h).
- Row action: Approve / Reject / View details.
- Bulk approve (same entity type, same step).

#### Workflows list

- Columns: Name (AR/EN), Entity type, Steps, Active, Last used.
- Create: pick entity type (bill, expense, JE, payroll run, …) → drag-arrange steps → for each step define: approver type (user/role/manager), spend limit (optional), timeout hours.

#### Workflow detail

- Visual diagram (stepper) + list of pending requests under this workflow.

#### Alert rules list

- Columns: Name, Metric, Operator, Threshold, Cooldown, Active, Last fired, Fire count.
- Metrics include: DSO, AR total, AP total, cash balance, overdue invoice count, VAT-due-date proximity, budget utilization %, collection rate.
- Create rule form: metric picker → operator (>, ≥, <, ≤, =) → threshold input → cooldown (hours) → recipients (emails) → channels (email/in-app/WhatsApp) → active toggle.

#### Alert history

- Columns: Date, Rule, Value, Recipients, Channel, Delivery status.

---

### 16.21 Module 21 — Documents & files

#### Routes

| Route | Archetype | Perm | Feat |
|---|---|---|---|
| `/app/documents` | A (grid+list toggle) | `manage_documents` | `documents` |
| `/app/documents/upload` | C | `manage_documents` | `documents` |
| `/app/documents/[id]` | B (preview) | `manage_documents` | `documents` |
| `/app/documents/archived` | A | `manage_documents` | `documents` |

#### Document library

- **View toggle**: Grid (thumbnail cards) / List (table).
- **Storage quota** progress bar above the toolbar.
- **Columns (list)**: Thumbnail, Name, Category chip, Client link (if any), Size, MIME icon, Uploaded by, Upload date, Archive chip.
- **Filters**: search (name/description), category (tax_document, invoice, receipt, contract, financial_statement, correspondence, working_paper, other), client, uploaded_by, date range, archived-only.
- **Primary action**: "Upload" opens slide-over with drop zone (single) or "Bulk upload" button (opens full-screen zone, up to 10 files).
- **Row/card actions**: Preview, Download, Edit metadata, Archive/Unarchive, Delete (confirm).
- **Bulk**: Archive, Delete, Assign category, Assign client.

#### Upload flow

- Drop zone accepts configured MIMEs (pdf, doc/docx, xls/xlsx, jpg/jpeg/png/gif/webp, txt, csv, zip/rar). Max 20 MB per file, 10 files per bulk.
- Per-file progress with retry.
- After upload, a metadata panel: Name (prefilled), Category, Description, Link to client/invoice/working-paper (optional).

#### Document detail / preview

- Full-screen takeover (z-80).
- Toolbar: name, category chip, size, uploaded-by, download, print, archive, delete, close.
- Preview renderers: PDF (pdf.js), images (native), text/CSV (monospace viewer), others (generic icon + download CTA).
- Metadata drawer on the end edge: category, description, linked entities, activity.

---

### 16.22 Module 22 — E-commerce integration

#### Routes

| Route | Archetype | Perm |
|---|---|---|
| `/app/ecommerce` | F | `manage_integrations` |
| `/app/ecommerce/channels` | A | `manage_integrations` |
| `/app/ecommerce/channels/new` | D | `manage_integrations` |
| `/app/ecommerce/channels/[id]` | B | `manage_integrations` |
| `/app/ecommerce/orders` | A | `manage_integrations` |
| `/app/ecommerce/orders/[id]` | B | `manage_integrations` |
| `/app/ecommerce/orders/convert` | E | `manage_integrations` |
| `/app/ecommerce/conversion-log` | A | `manage_integrations` |

#### E-commerce dashboard

- KPIs: Active channels, Orders pending conversion, Revenue (this month / last month), Conversion success rate.
- Channel status grid: one card per channel with platform logo, last sync, error count, "Sync now" button.

#### Channels list

- Columns: Platform logo+name, Store URL, Active, Last sync, Errors, Orders (count).

#### Channel wizard

- Step 1: pick platform (Shopify, WooCommerce, Salla, Zid, Custom).
- Step 2: credentials (API key, webhook secret) with test-connection button.
- Step 3: mapping (default VAT rate, default sales account, auto_convert toggle).
- Step 4: webhook URL + copy-to-clipboard with signature instructions.

#### Orders list

- Columns: Order ID, Platform, Buyer (name + email), Amount, Order date, Status, Conversion status (pending/converted/failed), Invoice link (if converted).
- Filters: platform, status, conversion status, date range, amount range, channel.
- Primary action: "Convert to invoices" (opens split-grid wizard).

#### Convert split-grid

- Left: selected orders.
- Right: preview of draft invoices (grouped by buyer; existing clients matched by email/phone, new ones flagged "will create new client").
- Actions: adjust matching, confirm → background job → watch progress.

#### Order detail

- Panel: line items, shipping, buyer, payment method.
- Conversion panel: invoice link, create-date, errors (if any).

#### Conversion log

- Attempts history with success/fail status, error message, retry action.

---

### 16.23 Module 23 — Messaging (WhatsApp / SMS via Beon.chat)

#### Routes

| Route | Archetype | Perm | Feat |
|---|---|---|---|
| `/app/messaging` | inbox | `manage_clients` | `clients` |
| `/app/messaging/[conversationId]` | thread | `manage_clients` | `clients` |
| `/app/messaging/templates` | A | `manage_settings` | `clients` |

#### Inbox

- Two-pane layout: conversation list (start side, 320px), thread view (end side, flex-grow).
- Conversation list row: channel icon (WhatsApp/SMS), client name, phone (masked partial), last message preview, timestamp, unread badge.
- Filter pills: All, Unread, WhatsApp, SMS, Open, Closed.
- Search.

#### Thread view

- Header: client (click → client detail), phone, channel switch toggle (if multi-channel), status chip (open/pending/closed), actions (assign to staff, mark closed).
- Messages: bubbles, direction (inbound = start, outbound = end; flips in RTL appropriately), timestamp, sender, delivery status icons (sent/delivered/read/failed).
- Template messages rendered with template name header.
- Message composer at the bottom:
  - Text area (auto-grow) + emoji picker (Latin + RTL-safe) + attachments + send.
  - Template picker (dropdown) — selecting fills variables via modal.
  - Character counter: 160 for SMS (multipart warning), 4096 for WhatsApp.
  - WhatsApp free-form disabled with tooltip "24-hour window expired. Use a template" if conversation is outside window.

#### Templates

- List of approved templates with name, channel, variables, example preview, active.
- Create: template name, channel, body with `{{var}}` placeholders, sample values for preview.

---

### 16.24 Module 24 — Currency management

#### Routes

| Route | Archetype | Perm |
|---|---|---|
| `/app/settings/currencies` | A | — |
| `/app/settings/currencies/converter` | C | — |
| `/app/settings/currencies/rates/[code]` | F | — |

#### Currencies list

- Read-only for tenants. Columns: Code, Name (AR/EN), Symbol, Decimal places, Active.
- No primary action.

#### Converter

- Card with: Amount input (number), From currency (dropdown), To currency (dropdown), Date picker (default today).
- Large result display. Rate shown as "1 USD = 48.32 EGP as of 2026-04-19".
- Swap button (flips from/to).

#### Rate history chart

- Line chart: date × rate. Toggle: 30 days / 90 days / 1 year / 5 years.
- Hover tooltip with rate + source (CBE / manual).

---

### 16.25 Module 25 — Team & onboarding

#### Routes

| Route | Archetype | Perm |
|---|---|---|
| `/app/settings/team` | A | `manage_team` |
| `/app/settings/team/invite` | C | `manage_team` |
| `/app/settings/team/[id]` | B | `manage_team` |
| `/app/settings/onboarding` | F | `manage_onboarding` |
| `/onboarding` | D | — |
| `/onboarding/[step]` | D | — |

#### Team list

- Columns: Avatar+Name, Email, Role chip, Status chip (active/inactive/invited), Last login, Created at.
- Filters: role, status, search.
- Primary action: "Invite member" (slide-over: email + role + message).

#### Team member detail

- Tabs: Profile, Role & permissions (matrix of permissions grouped by module — read-only, edited via role), Activity.
- Actions: Change role, Deactivate (cannot deactivate self or last admin), Resend invite (if pending).

#### Roles & permissions

- Role badges: tenant_admin, accountant, manager, employee, viewer (from backend).
- Permission matrix is informational in v1 — edits are role-level only. Custom roles are out of scope for v1 (note in UI: "Custom roles coming soon").

#### Onboarding wizard (`/onboarding`)

- Target: new tenants after registration.
- Uses the `onboarding` layout with step bar.
- Steps:
  1. **Company profile** — Legal name (AR/EN), tax ID, activity code, address, logo, phone, website.
  2. **Industry template** — Cards: Retail, Services, Manufacturing, Professional firm, Non-profit, Custom. Pre-loads CoA + VAT/WHT rates + sample categories.
  3. **Fiscal year** — Start date, end date (typically Jan 1 – Dec 31 for Egypt), period granularity (monthly default).
  4. **Opening balances** — Table: account + amount. CSV import option. Trial-balance check (debit = credit).
  5. **First team member** — Invite email + role.
  6. **Finish** — Summary + "Go to dashboard".
- State persists server-side after each step (resume supported). Auto-saves on blur.
- Progress overview in settings shows checklist with completion %.

---

### 16.26 Module 26 — Webhooks & landing page settings

#### Routes

| Route | Archetype | Perm |
|---|---|---|
| `/app/settings/webhooks` | A | `manage_settings` |
| `/app/settings/webhooks/new` | C | `manage_settings` |
| `/app/settings/webhooks/[id]` | B | `manage_settings` |
| `/app/settings/webhooks/[id]/deliveries` | A | `manage_settings` |
| `/app/settings/landing` | C | `manage_landing_page` |

#### Webhooks list

- Columns: URL (truncated + copy), Events (count chip with tooltip list), Active, Last delivery, Success rate % (last 100), Created at.

#### Webhook create/edit

- URL input.
- Event checklist grouped by module (invoice.*, bill.*, payment.*, eta.*, payroll.*, …).
- Description (optional).
- On save, generates secret — shown once in a dialog with "Copy" + explicit warning.

#### Webhook detail

- Tabs: Config, Deliveries.
- Config shows secret as "•••• [Rotate]" with re-display only on rotate.
- Deliveries tab: list of attempts with request/response bodies, status code, retry button for failed.

#### Landing page editor

- Two-pane: left is form, right is live preview.
- Fields: Hero title (AR + EN), Subtitle (AR + EN), Primary color picker, Logo upload, Favicon upload, Contact email, Social links, Content sections (add/remove/reorder).
- Publish button + "View live" link.

---

### 16.27 Module 27 — Data import

#### Routes

| Route | Archetype | Perm |
|---|---|---|
| `/app/import` | F (gallery) | per-type |
| `/app/import/new/[type]` | D | per-type |
| `/app/import/[jobId]` | B (progress) | per-type |
| `/app/import/[jobId]/errors` | A | per-type |

#### Import gallery

- Cards per importable type: Clients, Vendors, Products, Chart of accounts, Invoices, Bills, Opening balances, Journal entries, Employees, Assets.
- Each card: icon, name, "Download template", "Start import".

#### Import wizard

- Step 1: upload file (CSV/XLSX drop zone, 20 MB max).
- Step 2: mapping — left: source columns, right: target fields. Auto-guesses; user confirms.
- Step 3: dry run — shows preview table (first 10 rows), errors summary, match strategy (skip / update / upsert).
- Step 4: confirm — starts background job, redirects to progress page.

#### Progress page

- Live progress bar (polled every 2s first 30s, then 10s).
- Counters: Total, Imported, Skipped, Failed.
- On completion, "View errors" (if any) + "Start another import".

#### Errors page

- Grid: row number, field, message, raw-value. Exportable as CSV to fix offline.
- "Retry failed rows" action.

---

### 16.28 Module 28 — Client portal

Uses the `portal` layout. Everything is minimal, comfortable density, generous spacing, larger type.

#### Routes

| Route | Archetype | Notes |
|---|---|---|
| `/portal` | F | Overview |
| `/portal/invoices` | A | Simplified table |
| `/portal/invoices/[id]` | B | Large PDF + pay button |
| `/portal/documents` | A+C | Upload + browse |
| `/portal/documents/[id]` | B | Preview |
| `/portal/messages` | inbox | Threads with staff |
| `/portal/messages/[conversationId]` | thread |  |
| `/portal/profile` | C | Self-service profile |
| `/portal/notifications` | A |  |

#### Portal overview

- Big welcome card with tenant branding.
- 3 summary cards: Total due, Overdue count, Paid last 30d.
- "Recent invoices" mini-list (5 latest).
- "Unread messages" pointer card.

#### Portal invoices

- List columns (comfortable): Invoice # (mono), Issue date, Due date, Amount (end-aligned), Status chip, Paid amount.
- Filters: status (sent/partial/paid/overdue), date range.
- Row click → detail.

#### Portal invoice detail

- Full-width PDF viewer.
- Sticky side card: amount due, "Pay now" button (disabled if paid). Pay button opens a payment method picker (Paymob / Fawry with logos) → redirects to gateway → returns with pending/success state.
- Download PDF button.
- Link: "Message staff about this invoice".

#### Portal documents

- Upload / browse owned documents. Categorize on upload. Download via signed URL.

#### Portal messages

- Same thread pattern as staff (§16.23) but single conversation with the tenant's staff. Free-form text + attachments.

#### Portal profile

- Edit name, phone, language preference. No 2FA setup in v1.

#### Portal restrictions

- Cannot access staff endpoints. If token presents a staff path, show 403 page with "Return to portal".
- Session timeout: 30 min idle (vs 8h for staff).
- Portal branding (logo, primary color) fetched from `/v1/portal/settings/public` and applied before first paint (prevents flash).

---

## 17. Cross-cutting flows — checklists

### 17.1 Login → Dashboard

1. User lands on `/auth/login`.
2. Posts credentials. If 2FA needed → `/auth/2fa` → verify.
3. Fetches `/v1/me` → populates `useMeStore`, `usePermissionsStore`, `useFeaturesStore`.
4. If first-time tenant → `/onboarding`. Else → `/app`.
5. Dashboard loads: skeleton → parallel requests for KPIs, charts, widgets.

### 17.2 Create invoice → Send → Pay → Reconcile

1. `/app/invoices/new` → fill form → Pre-check (toast with warnings if any) → Post to GL.
2. Detail view opens with ETA auto-submission (if enabled) pending; user can send via email/WhatsApp.
3. Client receives email with portal link or PDF.
4. Portal user clicks "Pay now" → gateway → success.
5. Payment webhook creates payment record; invoice moves to `paid`.
6. Bank reconciliation: the bank transaction appears on the bank statement → auto-match to payment → reconciled.

### 17.3 Record bill → Approval → Pay → WHT

1. `/app/bills/new` → fill form → Save draft.
2. Submit for approval → routed to approver (approvals queue notification).
3. Approver approves → bill moves to `approved` → JE posted.
4. `/app/bill-payments/new` → pick bill → record payment.
5. If WHT: generate WHT certificate → issue → submit to ETA.

### 17.4 Payroll month-end

1. `/app/payroll/new` → select period → include/exclude employees.
2. Calculate (server computes gross, tax, SI, net per employee).
3. Review, optionally edit outliers.
4. Approve → generates JE + payslips (locked).
5. Mark paid → creates bank payment JE for total net.
6. Download bank-transfer file + payslip ZIP.

---

## 18. Acceptance checklist for the frontend agent

Tick every item before marking a PR ready.

### Per feature (repeat for each module PR)

- [ ] Routes from §16.X registered with correct middleware (`auth`, `tenant`, `permission`, `feature`).
- [ ] All listed columns and filters implemented in list view.
- [ ] Saved views (at least default + 2 presets) available.
- [ ] Server-side sort/filter/paginate working; URL reflects state.
- [ ] Skeleton matches final layout.
- [ ] Empty state with CTA.
- [ ] Create form validates client-side via Zod and binds server 422 errors.
- [ ] Detail view tabs match §16.X.
- [ ] Destructive actions confirm appropriately (§11.9).
- [ ] Optimistic updates only where §11.10 allows.
- [ ] Permissions hide actions (not disable) per §13.5.
- [ ] Feature flag hides route, shows upgrade CTA.
- [ ] Bilingual: every string in locale files, no hardcoded text.
- [ ] RTL verified by Playwright screenshot test.
- [ ] Dark mode verified by Playwright screenshot test.
- [ ] Keyboard shortcuts: primary action reachable via documented shortcut.
- [ ] Command palette entries registered for key "Go to" and "Create" actions.
- [ ] Accessibility: zero critical axe violations.
- [ ] Unit tests for store and service.
- [ ] E2E smoke test: list → detail → primary action.

### App-wide (one-time gates)

- [ ] Design tokens in `assets/css/tokens.css` and `app.config.ts` match §3.
- [ ] `AppTable`, `AppStatusChip`, `FormMoney`, `FormDate`, `FormEntityPicker`, `AppCommandPalette`, `AppSidebar`, `AppTopbar`, `AppPageHeader`, `AppEmpty`, `AppSkeleton`, `AppConfirm`, `AppModal`, `AppSlideover`, `AppBulkActionBar`, `AppPagination` built and documented.
- [ ] `useApi`, `useForm`, `useShortcuts`, `usePermissions`, `useFeatures`, `useLocale`, `useDir`, `useDensity`, `useMoney`, `useNumber`, `useBreadcrumbs`, `useSavedViews` composables built and tested.
- [ ] Middleware suite in place per §13.3.
- [ ] i18n loaded lazily; locale switching works without full reload.
- [ ] PWA installable; offline banner + queue functional.
- [ ] Performance budgets (§14) met.
- [ ] CI gates: lint, unit tests ≥ 80%, e2e green, visual snapshots updated.

---

## 19. Glossary

- **Base currency**: the tenant's primary currency (usually EGP); amounts stored and reported in this unless explicitly converted.
- **Billable entry**: a timesheet entry flagged `billable=true` and approved — eligible for invoicing.
- **CoA**: Chart of accounts — hierarchical list of accounting accounts.
- **CC**: Cost center — organizational unit used to tag transactions for P&L by department/project/location.
- **Comfortable density**: portal/marketing visual density (larger, airier).
- **Compact density**: staff-app visual density (denser, tighter).
- **ETA**: Egyptian Tax Authority — manages mandatory e-invoicing.
- **JE**: Journal entry — a balanced set of debit/credit lines.
- **Money string**: money returned by the API as a string (e.g., `"1250.00"`) — never a JS Number.
- **Optimistic update**: UI updates before server acknowledges; rolls back on error.
- **Posted**: entry committed to the GL; immutable thereafter.
- **Reversal**: creates a new JE flipping debits/credits of a posted JE; never mutates the original.
- **RTL**: Right-to-left layout (Arabic).
- **Saved view**: a named preset of filters + sort + columns for a list page.
- **Slide-over**: panel sliding in from the end edge (right in LTR, left in RTL).
- **Tabular nums**: monospaced digits in a proportional font (`font-variant-numeric: tabular-nums`).
- **WHT**: Withholding tax — deducted at payment, remitted by payer.

---

## 20. Open questions for the product owner

Answer these before shipping v1 to prevent scope drift:

1. **Brand primary color** — confirm teal `#0891B2` or substitute with a specific brand hex. If brand has a full guide, attach it.
2. **Logo assets** — provide AR+EN wordmarks, color + monochrome, favicons.
3. **Arabic digits default** — confirm Latin digits as default for both locales (accountant preference). Opt-in Arabic digits per tenant setting?
4. **Hijri calendar** — out of scope for v1; confirm.
5. **Employee self-service portal** — not part of module 16 in v1; confirm.
6. **OCR on expense receipts** — out of scope for v1; confirm.
7. **WebSocket realtime** — out of scope; polling only for v1. Confirm.
8. **Mobile-native app** — out of scope; PWA only. Confirm.
9. **SSO / SAML / Google sign-in** — out of scope for v1; confirm.
10. **Custom role creation** — out of scope for v1; only predefined roles. Confirm.

---

*End of UI/UX specification. Any change to this document is a breaking change to the frontend contract; version it and communicate in the PR description.*




