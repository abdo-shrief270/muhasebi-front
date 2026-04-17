import { defineStore } from 'pinia'
import type { PlanTier, SubscriptionSnapshot, TenantPlan } from './types'

const TIER_ORDER: Record<PlanTier, number> = {
  free: 0,
  starter: 1,
  pro: 2,
  business: 3,
  enterprise: 4,
}

export const useSubscriptionStore = defineStore('subscription', () => {
  const plan = ref<TenantPlan | null>(null)
  const flags = ref<Record<string, boolean>>({})
  const loaded = ref(false)

  function hydrate(snapshot: SubscriptionSnapshot) {
    plan.value = snapshot.plan
    flags.value = snapshot.flags ?? {}
    loaded.value = true
  }

  function reset() {
    plan.value = null
    flags.value = {}
    loaded.value = false
  }

  async function fetch() {
    try {
      const api = useApi()
      const { data } = await api.get<{ data: SubscriptionSnapshot }>('/me/subscription')
      hydrate(data)
    } catch {
      // leave defaults; middleware will treat as unprivileged
    }
  }

  function hasPlan(allowed: PlanTier[]): boolean {
    if (!plan.value) return false
    const current = TIER_ORDER[plan.value.tier] ?? -1
    return allowed.some(tier => current >= TIER_ORDER[tier])
  }

  function isFlagEnabled(key: string): boolean {
    return !!flags.value[key]
  }

  return { plan, flags, loaded, hydrate, reset, fetch, hasPlan, isFlagEnabled }
})

export function useSubscription() {
  return useSubscriptionStore()
}
