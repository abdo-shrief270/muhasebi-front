import { ENDPOINTS } from '~/core/api/endpoints'
import type { ItemResponse } from '~/shared/types/common'

/**
 * Add-on catalog & per-tenant subscription bindings. Mirrors the backend
 * resources at `app/Http/Resources/AddOnResource.php` and
 * `app/Http/Resources/SubscriptionAddOnResource.php`.
 *
 * `boost` keys match the same slugs used in `Plan.limits`
 * (`max_users`, `max_storage_bytes`, …) so a UI consumer can render
 * "+5 max_users" without translating between two key spaces.
 */

export type AddOnType = 'boost' | 'feature' | 'credit_pack'
export type AddOnBillingCycle = 'monthly' | 'annual' | 'once'
export type SubscriptionAddOnStatus = 'active' | 'cancelled' | 'expired'

export interface AddOn {
  id: number
  slug: string
  name_en: string
  name_ar: string
  description_en: string | null
  description_ar: string | null
  type: AddOnType
  billing_cycle: AddOnBillingCycle
  /** Limit deltas — only set when type=boost. */
  boost: Record<string, number> | null
  /** Feature flag slug — only set when type=feature. */
  feature_slug: string | null
  /** Credit kind (sms, ai_tokens, …) — only set when type=credit_pack. */
  credit_kind: string | null
  /** Credits granted per pack — only set when type=credit_pack. */
  credit_quantity: number | null
  price_monthly: number
  price_annual: number
  price_once: number
  currency: string
  is_active: boolean
  sort_order: number
}

export interface AddOnCreditSummary {
  id: number
  kind: string
  quantity_total: number
  quantity_used: number
  remaining: number
  expires_at: string | null
}

export interface SubscriptionAddOn {
  id: number
  subscription_id: number
  add_on_id: number
  quantity: number
  status: SubscriptionAddOnStatus
  billing_cycle: AddOnBillingCycle
  price: number
  currency: string
  current_period_start: string | null
  current_period_end: string | null
  cancelled_at: string | null
  cancel_at_period_end: boolean
  expires_at: string | null
  gateway: string | null
  add_on?: AddOn
  credits?: AddOnCreditSummary[]
  is_active: boolean
  created_at: string
}

export interface PurchaseAddOnPayload {
  add_on_id: number
  quantity?: number
  billing_cycle?: AddOnBillingCycle
  payment_method?: 'paymob' | 'fawry' | 'bank_transfer'
  gateway_payment_id?: string
}

export function addOnsService() {
  const api = useApi()

  return {
    /** Full public catalog, ordered by `sort_order`. */
    catalog: () =>
      api.get<ItemResponse<AddOn[]>>(ENDPOINTS.public.addOns).then(r => r.data),

    /**
     * Add-ons attached to the current tenant's subscription.
     * `activeOnly=true` filters out cancelled/expired rows server-side.
     */
    list: (activeOnly = false) =>
      api
        .get<ItemResponse<SubscriptionAddOn[]>>(
          activeOnly
            ? `${ENDPOINTS.subscription.addOns}?active_only=1`
            : ENDPOINTS.subscription.addOns,
        )
        .then(r => r.data),

    get: (id: number) =>
      api.get<ItemResponse<SubscriptionAddOn>>(ENDPOINTS.subscription.addOn(id)).then(r => r.data),

    purchase: (payload: PurchaseAddOnPayload, idempotencyKey: string) =>
      api
        .post<ItemResponse<SubscriptionAddOn>>(
          ENDPOINTS.subscription.addOns,
          payload,
          { idempotencyKey },
        )
        .then(r => r.data),

    cancel: (id: number) =>
      api.delete<ItemResponse<SubscriptionAddOn> & { message?: string }>(
        ENDPOINTS.subscription.addOn(id),
      ),

    /** Per-tenant credit balances grouped by kind ({ sms, ai_tokens, ... }). */
    credits: () =>
      api
        .get<ItemResponse<Record<string, { kind: string; balance: number }>>>(
          ENDPOINTS.subscription.credits,
        )
        .then(r => r.data ?? {}),
  }
}
