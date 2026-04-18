import { defineStore } from 'pinia'
import type { SubscriptionSnapshot, TenantPlanInfo } from './types'
import { ENDPOINTS } from '~/core/api/endpoints'

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
      const { data } = await api.get<{ data: SubscriptionSnapshot }>(ENDPOINTS.subscription.current)
      hydrate(data)
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
   * Returns true if no constraint is set or if the plan slug is in the list.
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
