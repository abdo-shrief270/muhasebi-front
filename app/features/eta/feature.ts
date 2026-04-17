import type { FeatureManifest } from '~/core/subscription/types'
import { PERMISSIONS } from '~/core/rbac/permissions'

export default {
  id: 'eta',
  routePrefix: '/eta',
  permission: PERMISSIONS.MANAGE_ETA,
  plans: ['business', 'enterprise'],
  flag: 'eta_enabled',
  navLabel: 'nav.eta',
  navIcon: 'eta',
  navGroup: 'more',
  order: 80,
} satisfies FeatureManifest
