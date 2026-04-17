import type { FeatureManifest } from '~/core/subscription/types'
import { PERMISSIONS } from '~/core/rbac/permissions'

export default {
  id: 'reports',
  routePrefix: '/reports',
  permission: PERMISSIONS.VIEW_REPORTS,
  plans: ['pro', 'business', 'enterprise'],
  navLabel: 'nav.reports',
  navIcon: 'reports',
  navGroup: 'accounting',
  order: 60,
} satisfies FeatureManifest
