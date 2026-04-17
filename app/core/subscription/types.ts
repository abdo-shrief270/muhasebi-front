export type PlanTier = 'free' | 'starter' | 'pro' | 'business' | 'enterprise'

export type FeatureDenyReason = 'unauthenticated' | 'permission' | 'plan' | 'flag' | 'tenant'

export interface FeatureManifest {
  id: string
  routePrefix: string
  permission?: string
  plans?: PlanTier[]
  flag?: string
  navLabel?: string
  navIcon?: string
  navGroup?: string
  order?: number
  hideWhenDenied?: boolean
}

export interface FeatureAccess {
  allowed: boolean
  reason?: FeatureDenyReason
  requiredPlan?: PlanTier[]
  requiredPermission?: string
}

export interface TenantPlan {
  id: string
  tier: PlanTier
  name: string
  expires_at: string | null
  is_trial: boolean
}

export interface SubscriptionSnapshot {
  plan: TenantPlan | null
  flags: Record<string, boolean>
}
