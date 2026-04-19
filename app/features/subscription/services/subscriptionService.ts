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

export interface UsageSlice {
  used: number
  /** -1 = unlimited. */
  limit: number
}

export interface UsageSnapshot {
  period: { start: string; end: string }
  users: UsageSlice
  invoices_created: UsageSlice
  storage_gb: UsageSlice
  api_calls: UsageSlice
  [key: string]: UsageSlice | { start: string; end: string }
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
