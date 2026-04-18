/**
 * Subscription + feature-flag shape, aligned with the real /me response:
 *   /me -> { user, tenant: { plan, features: string[] }, permissions, two_factor_enabled }
 *
 * There is no "plan tier" ordering; gating is flag-based. A feature manifest
 * that sets `flag: 'payroll'` is visible iff `'payroll'` is in tenant.features[].
 * Manifests may still set `plans: [...]` as a hint, but the authoritative
 * check is always the flag. `plans` is retained for informational display on
 * the /subscription page.
 */

export type FeatureDenyReason =
  | 'unauthenticated'
  | 'permission'
  | 'plan'
  | 'flag'
  | 'tenant'

export interface FeatureManifest {
  id: string
  routePrefix: string
  permission?: string
  plans?: string[]            // informational only — NOT enforced by middleware
  flag?: string               // authoritative gate; checked against tenant.features[]
  navLabel?: string
  navIcon?: string
  navGroup?: string
  order?: number
  hideWhenDenied?: boolean
}

export interface FeatureAccess {
  allowed: boolean
  reason?: FeatureDenyReason
  requiredPlan?: string[]
  requiredPermission?: string
  requiredFlag?: string
}

export interface TenantPlanInfo {
  /** Plan slug returned by the backend (e.g. "starter", "pro"). Display-only. */
  slug: string | null
  /** Human-readable plan name. */
  name: string | null
}

export interface SubscriptionSnapshot {
  plan: TenantPlanInfo | null
  features: readonly string[]
}
