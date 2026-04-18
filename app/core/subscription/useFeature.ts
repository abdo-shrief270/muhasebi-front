import type { FeatureAccess, FeatureManifest } from './types'
import { getFeature } from './registry'

/**
 * Gating precedence:
 *   1. unauthenticated — not logged in
 *   2. permission      — missing RBAC slug
 *   3. flag            — tenant.features[] does NOT contain manifest.flag
 *   4. plan            — manifest has `plans: [...]` and tenant.plan.slug not in it
 *                        (informational; backend enforcement is flag-only)
 */
export function evaluateFeature(feature: FeatureManifest): FeatureAccess {
  const auth = useAuthStore()
  if (!auth.isAuthenticated) {
    return { allowed: false, reason: 'unauthenticated' }
  }

  const { can } = usePermissions()
  if (feature.permission && !can(feature.permission)) {
    return { allowed: false, reason: 'permission', requiredPermission: feature.permission }
  }

  const subscription = useSubscription()

  if (feature.flag && !subscription.isFlagEnabled(feature.flag)) {
    return { allowed: false, reason: 'flag', requiredFlag: feature.flag }
  }

  if (feature.plans?.length && !subscription.hasPlan(feature.plans)) {
    return { allowed: false, reason: 'plan', requiredPlan: feature.plans }
  }

  return { allowed: true }
}

export function useFeature(id: string) {
  const feature = getFeature(id)
  const access = computed<FeatureAccess>(() => {
    if (!feature) return { allowed: false, reason: 'flag' }
    return evaluateFeature(feature)
  })

  return {
    feature,
    access,
    allowed: computed(() => access.value.allowed),
    reason: computed(() => access.value.reason),
  }
}
