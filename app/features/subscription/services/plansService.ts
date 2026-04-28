import { ENDPOINTS } from '~/core/api/endpoints'
import type { ItemResponse } from '~/shared/types/common'

/**
 * Public plan catalog — `GET /v1/plans`. Verified against
 * `App\Http\Resources\PlanResource`. The endpoint is unauthenticated but the
 * subscribe/changePlan actions it feeds are gated by `manage_subscription`.
 *
 * `limits` is a free-form map keyed by the same slugs the backend uses in
 * `SubscriptionRecord.limits` (users, invoices, storage_gb, api_calls, ...).
 * `features` is the list of feature flag slugs that get copied into
 * `SubscriptionRecord.enabled_features` when this plan is active.
 *
 * Named `SubscriptionPlan` (not `Plan`) to avoid shadowing the marketing
 * landing page's narrower `Plan` type via Nuxt's auto-imports.
 */
export interface SubscriptionPlan {
  id: number
  name_en: string
  name_ar: string
  slug: string
  description_en: string | null
  description_ar: string | null
  price_monthly: number
  price_annual: number
  currency: string
  trial_days: number
  limits: Record<string, number>
  /**
   * Backend stores plan features as a key→boolean map (matching the JSON
   * column on the `plans` table), e.g. `{"e_invoice": false, "api_access": true}`.
   * Templates iterate as `(enabled, slug)` and `v-show="enabled"`.
   */
  features: Record<string, boolean>
  is_active: boolean
  sort_order: number
}

export function plansService() {
  const api = useApi()
  return {
    // PlanController@index returns an AnonymousResourceCollection —
    // `{ data: SubscriptionPlan[] }` with no pagination meta, so type it as
    // ItemResponse<SubscriptionPlan[]>, not ListResponse<SubscriptionPlan>.
    list: () =>
      api.get<ItemResponse<SubscriptionPlan[]>>(ENDPOINTS.public.plans).then(r => r.data),
    get: (id: number) =>
      api.get<ItemResponse<SubscriptionPlan>>(ENDPOINTS.public.plan(id)).then(r => r.data),
  }
}
