import type { FeatureAccess, FeatureManifest } from './types'
import { getFeature } from './registry'

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
  if (feature.plans?.length && !subscription.hasPlan(feature.plans)) {
    return { allowed: false, reason: 'plan', requiredPlan: feature.plans }
  }

  if (feature.flag && !subscription.isFlagEnabled(feature.flag)) {
    return { allowed: false, reason: 'flag' }
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
