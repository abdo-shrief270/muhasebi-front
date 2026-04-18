# Workflow: backend spec → shipped feature

This is the tactical companion to `ARCHITECTURE.md`. When the backend team gives
you an endpoint spec, do these steps in order. Every step names the file you
touch so there's no searching.

---

## Scenario A — Adding a brand-new feature

Backend says: "Here's a new `receipts` resource. Endpoints: `GET /receipts`,
`GET /receipts/{id}`, `POST /receipts`, `PUT /receipts/{id}`, `DELETE /receipts/{id}`.
Plan gate: `pro+`. Permission: `manage_receipts`. Feature flag: `receipts_enabled`."

### 1. Scaffold

```bash
node scripts/new-feature.mjs receipts
```

Creates `app/features/receipts/` with feature.ts, service, composables, and a
starter page.

### 2. Register endpoints — `app/core/api/endpoints.ts`

```ts
receipts: {
  list: '/receipts',
  one:  (id: Id) => `/receipts/${id}`,
  // Add sub-actions here if any (e.g. /receipts/{id}/void)
},
```

### 3. Wire service to endpoints — `app/features/receipts/services/receiptsService.ts`

Replace the scaffolded inline paths:

```ts
import { ENDPOINTS } from '~/core/api/endpoints'
// ...
const crud = createCrudService<Receipts, ReceiptsForm, ReceiptsListParams>({
  list: ENDPOINTS.receipts.list,
  one:  ENDPOINTS.receipts.one,
})
```

### 4. Add permission constant — `app/core/rbac/permissions.ts`

```ts
MANAGE_RECEIPTS: 'manage_receipts',
```

### 5. Fill out the manifest — `app/features/receipts/feature.ts`

Uncomment the scaffolded hints:

```ts
import { PERMISSIONS } from '~/core/rbac/permissions'

export default {
  id: 'receipts',
  routePrefix: '/receipts',
  permission: PERMISSIONS.MANAGE_RECEIPTS,
  plans: ['pro', 'business', 'enterprise'],
  flag: 'receipts_enabled',
  navLabel: 'nav.receipts',
  navIcon: 'receipts',
  navGroup: 'main',
  order: 35,
} satisfies FeatureManifest
```

### 6. i18n — `i18n/locales/ar.ts` and `i18n/locales/en.ts`

```ts
nav: {
  // ...
  receipts: 'الإيصالات',     // ar
  receipts: 'Receipts',       // en
}
```

### 7. Fill out the entity type — `services/receiptsService.ts`

```ts
export interface Receipts {
  id: number
  number: string
  client_id: number
  amount: string
  date: string
  // ... whatever the backend spec says
}
```

### 8. Build the page(s) — `app/features/receipts/pages/*.vue`

The scaffolded `index.vue` gives you a working list. For a detail page, add
`[id].vue` that uses `useReceipts(id)`. For a create page, add `create.vue`
with `useReceiptsMutations().create`.

### 9. (Optional) Add a zod schema — `app/features/receipts/schemas.ts`

If the feature has forms:

```ts
import { z } from 'zod'

export const receiptsFormSchema = z.object({
  client_id: z.number().int().positive('Client is required'),
  amount: z.union([z.number(), z.string()]).transform(/* ... */),
  date: z.string().min(1, 'Date is required'),
})

export const receiptsFormDefaults: z.input<typeof receiptsFormSchema> = {
  client_id: 0, amount: 0, date: new Date().toISOString().slice(0, 10),
}
```

Then `useZodForm({ schema: receiptsFormSchema, initial: receiptsFormDefaults })`
in the create/edit pages.

### Done checklist

- [ ] `ENDPOINTS.receipts` exists in `endpoints.ts`
- [ ] `feature.ts` has the right permission/plans/flag
- [ ] `PERMISSIONS.MANAGE_RECEIPTS` exists
- [ ] `nav.receipts` translated in both locales
- [ ] Entity type matches backend response shape
- [ ] Pages render without errors in dev (`npm run dev`)
- [ ] If forms exist, schema and its defaults match the type
- [ ] Unit test for the schema if there's non-trivial validation
- [ ] Sidebar link appears automatically (via `useNavigation`)
- [ ] Middleware gates correctly (test by loading `/receipts` with a pro user)

---

## Scenario B — Adding endpoints to an existing feature

Backend adds `POST /invoices/{id}/duplicate` to the invoices feature.

1. `app/core/api/endpoints.ts` — add `duplicate: (id: Id) => \`/invoices/${id}/duplicate\`,` to the `invoices` group
2. `app/features/invoices/services/invoiceService.ts` — add:
   ```ts
   duplicate: (id: Id, idempotencyKey?: string) =>
     api.post<ItemResponse<Invoice>>(ENDPOINTS.invoices.duplicate(id), undefined, { idempotencyKey }).then(r => r.data),
   ```
3. `app/features/invoices/composables/useInvoices.ts` — add to `useInvoiceMutations`:
   ```ts
   duplicate: useMutation(async (id: number) => {
     const r = await svc.duplicate(id, generateRequestId())
     bust()
     return r
   }),
   ```
4. Call `duplicate.mutate(invoice.id)` from the UI.

---

## Scenario C — Changing a plan/flag/permission gate

Backend: "Payroll is now `business+` only, was `pro+` before."

Edit one line in `app/features/payroll/feature.ts`:
```ts
plans: ['business', 'enterprise'],   // was: ['pro', 'business', 'enterprise']
```

That's it. The middleware picks it up on the next navigation. Pro users get
redirected to `/subscription?required=payroll`.

---

## Scenario D — Backend changes a response shape

Backend: "`GET /invoices` now returns `currency_code` instead of `currency`."

1. Update the type in `app/shared/types/invoice.ts` — rename the field
2. Dev server + TypeScript surface every broken usage — fix each one
3. No service/composable change — the service is typed against the interface,
   so the compiler shows you where to update

---

## Common traps

### "Why isn't my sidebar link showing?"
- You added a `navLabel` but it's not in `i18n/locales/*.ts` — the label would still render but raw key text shows
- User is missing the feature's `permission` — check `usePermissions().can()`
- User's plan is below the feature's floor — check `useSubscription().plan.tier`
- Flag is off — check `useSubscription().flags[feature.flag]`

### "Why does the middleware redirect to /subscription?"
- Feature has `plans` and the user's tier is below them — working as designed
- To debug: open devtools, `Vue` tab, check the subscription store's `plan.tier` value

### "Why does the form submit but not validate?"
- You're not calling `handleSubmit(cb)` — direct `@submit` bypasses zod
- Fields bound to `v-model="form.x"` instead of `v-model="values.x"` — values is the reactive proxy

### "Why does my new endpoint 404 in dev?"
- Forgot to register it in `endpoints.ts` AND the service has a hardcoded string — most likely a typo in the service string
- Backend actually not deployed yet — check the Laravel side

### "The feature manifest validator yelled at me"
- Read the console — it tells you exactly which feature and which field
- Most common: duplicate `routePrefix` between two features, or a typo in `plans`

---

## Philosophy

- **If you're adding a string URL anywhere except `endpoints.ts`, stop.**
- **If you're writing the same code in two composables, move it to `core/api/crud.ts` or `shared/composables`.**
- **If you're writing `api.get` inside a page, move it to the feature's service.**
- **If you're reaching into a feature from another feature, it's OK — but type-import, don't duplicate.**
- **If you're editing `nuxt.config.ts` or `middleware/access.global.ts` to add a feature, stop.** You shouldn't need to.
