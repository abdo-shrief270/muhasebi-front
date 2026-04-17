import type { FeatureManifest } from '~/core/subscription/types'
import { PERMISSIONS } from '~/core/rbac/permissions'

export default {
  id: 'dashboard',
  routePrefix: '/dashboard',
  permission: PERMISSIONS.VIEW_DASHBOARD,
  plans: ['starter', 'pro', 'business', 'enterprise'],
  navLabel: 'nav.dashboard',
  navIcon: 'dashboard',
  navGroup: 'main',
  order: 10,
} satisfies FeatureManifest
