import { defineStore } from 'pinia'
import type { SubscriptionSnapshot, TenantPlanInfo } from './types'
import { ENDPOINTS } from '~/core/api/endpoints'

/**
 * Real `/v1/subscription` response shape (verified 2026-04-19, BACKEND_QUESTIONS 9.1):
 *   {
 *     data: {
 *       plan:    { id, slug, name, price_egp_monthly },
 *       status:  'active' | 'trialing' | 'past_due' | 'canceled',
 *       billing_cycle: 'monthly' | 'quarterly' | 'annual',
 *       current_period_start: string,
 *       current_period_end:   string,
 *       trial_ends_at:        string | null,
 *       auto_renew:           boolean,
 *       enabled_features:     string[],     // ← NOTE: NOT `features`
 *       limits:               Record<string, number>,
 *     }
 *   }
 *
 * We keep our `SubscriptionSnapshot` type stable (plan + features) and map the
 * shape here.
 */
interface RawSubscriptionResponse {
  data: {
    plan?: { id: number; slug: string; name: string; price_egp_monthly?: number } | null
    status?: string
    billing_cycle?: string
    current_period_start?: string
    current_period_end?: string
    trial_ends_at?: string | null
    auto_renew?: boolean
    enabled_features?: string[]
    limits?: Record<string, number>
  }
}

export const useSubscriptionStore = defineStore('subscription', () => {
  const plan = ref<TenantPlanInfo | null>(null)
  const features = ref<readonly string[]>([])
  const loaded = ref(false)

  function hydrate(snapshot: SubscriptionSnapshot) {
    plan.value = snapshot.plan
    features.value = snapshot.features ?? []
    loaded.value = true
  }

  function reset() {
    plan.value = null
    features.value = []
    loaded.value = false
  }

  async function fetch() {
    try {
      const api = useApi()
      const raw = await api.get<RawSubscriptionResponse>(ENDPOINTS.subscription.current)
      hydrate({
        plan: raw.data.plan
          ? { slug: raw.data.plan.slug ?? null, name: raw.data.plan.name ?? null }
          : null,
        features: raw.data.enabled_features ?? [],
      })
    } catch {
      // leave defaults; middleware will treat as unprivileged
    }
  }

  /** Authoritative gate: the tenant has access to this flag. */
  function isFlagEnabled(key: string): boolean {
    return features.value.includes(key)
  }

  /**
   * Kept for backward compatibility with manifests that still set `plans: [...]`.
   * Real gating is via isFlagEnabled.
   */
  function hasPlan(allowed: readonly string[]): boolean {
    if (!allowed.length) return true
    if (!plan.value?.slug) return false
    return allowed.includes(plan.value.slug)
  }

  return { plan, features, loaded, hydrate, reset, fetch, hasPlan, isFlagEnabled }
})

export function useSubscription() {
  return useSubscriptionStore()
}
