import { ENDPOINTS } from '~/core/api/endpoints'
import type { BaseListParams, ItemResponse, ListResponse } from '~/shared/types/common'

export type BillingCycle = 'monthly' | 'quarterly' | 'annual'
export type PaymentMethod = 'paymob' | 'fawry' | 'bank_transfer'
export type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'canceled'

export interface SubscriptionPlanRef {
  id: number
  slug: string
  name: string
  price_egp_monthly: number
}

export interface SubscriptionRecord {
  plan: SubscriptionPlanRef
  status: SubscriptionStatus
  billing_cycle: BillingCycle
  current_period_start: string
  current_period_end: string
  trial_ends_at: string | null
  auto_renew: boolean
  enabled_features: string[]
  limits: Record<string, number>
}

/**
 * One row in the `/subscription/usage` response. `current` and `limit` are
 * scalar; `boost_contribution` reports how much of `limit` came from active
 * add-ons, so the UI can render a "10 base + 5 add-on" breakdown.
 *
 * Shape comes from `App\Domain\Subscription\Services\UsageService::buildMetric`.
 */
export interface UsageMetric {
  current: number
  /** -1 = unlimited. */
  limit: number
  /** Plan-only portion of the limit, after subtracting add-on boost. */
  base_limit: number
  boost_contribution: number
  percent: number
  exceeded: boolean
}

/**
 * Storage row is special-cased — bytes are humanized server-side and the
 * service returns parallel `_human` strings to skip client-side formatting.
 */
export interface UsageStorageMetric {
  current_bytes: number
  limit_bytes: number
  current_human: string
  limit_human: string
  percent: number
  exceeded: boolean
  boost_contribution: number
}

/**
 * `/subscription/usage` payload. The `projections` map gives a rough
 * "exhaust date" for each metered resource based on the trailing 14-day
 * trend; `null` means either unlimited, no growth, or beyond a year out.
 */
export interface UsageSnapshot {
  users: UsageMetric
  clients: UsageMetric
  invoices: UsageMetric
  bills: UsageMetric
  journal_entries: UsageMetric
  bank_imports: UsageMetric
  documents: UsageMetric
  api_calls: UsageMetric
  storage: UsageStorageMetric
  plan: { name: string; name_ar: string; slug: string | null }
  projections: Record<string, string | null>
}

export interface SubscribePayload {
  plan_id: number
  billing_cycle: BillingCycle
  payment_method: PaymentMethod
  coupon_code?: string
}

export interface ChangePlanPayload {
  new_plan_id: number
  effective_date?: 'immediate' | 'end_of_period'
}

export interface SubscriptionCancelPayload {
  reason?: string
  immediate?: boolean
}

export interface SubscriptionPayment {
  id: number
  amount: number
  currency: string
  status: string
  paid_at: string | null
  invoice_url: string | null
  created_at: string
}

export interface UsageHistoryQuery {
  from?: string
  to?: string
  metric?: string
}

function toQuery(p: Record<string, unknown>): string {
  const q = new URLSearchParams()
  for (const [k, v] of Object.entries(p)) {
    if (v === '' || v == null) continue
    q.set(k, String(v))
  }
  return q.toString() ? `?${q}` : ''
}

export function subscriptionService() {
  const api = useApi()

  return {
    current: () =>
      api.get<ItemResponse<SubscriptionRecord>>(ENDPOINTS.subscription.current).then(r => r.data),
    usage: () =>
      api.get<ItemResponse<UsageSnapshot>>(ENDPOINTS.subscription.usage).then(r => r.data),
    usageHistory: (q: UsageHistoryQuery = {}) =>
      api.get<ItemResponse<Array<Record<string, unknown>>>>(`${ENDPOINTS.subscription.usageHistory}${toQuery(q)}`).then(r => r.data),
    payments: (params: BaseListParams & { status?: string } = {}) =>
      api.get<ListResponse<SubscriptionPayment>>(`${ENDPOINTS.subscription.payments}${toQuery(params)}`),

    subscribe: (payload: SubscribePayload, idempotencyKey: string) =>
      api.post<ItemResponse<SubscriptionRecord & { redirect_url?: string | null }>>(
        ENDPOINTS.subscription.subscribe, payload, { idempotencyKey },
      ).then(r => r.data),
    changePlan: (payload: ChangePlanPayload, idempotencyKey?: string) =>
      api.post<ItemResponse<SubscriptionRecord>>(
        ENDPOINTS.subscription.changePlan, payload, { idempotencyKey },
      ).then(r => r.data),
    renew: (payload: { billing_cycle?: BillingCycle } = {}, idempotencyKey?: string) =>
      api.post<ItemResponse<SubscriptionRecord>>(
        ENDPOINTS.subscription.renew, payload, { idempotencyKey },
      ).then(r => r.data),
    cancel: (payload: SubscriptionCancelPayload = {}, idempotencyKey?: string) =>
      api.post<ItemResponse<SubscriptionRecord>>(
        ENDPOINTS.subscription.cancel, payload, { idempotencyKey },
      ).then(r => r.data),
  }
}
