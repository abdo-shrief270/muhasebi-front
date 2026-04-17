import type { FeatureManifest } from '~/core/subscription/types'
import { PERMISSIONS } from '~/core/rbac/permissions'

export default {
  id: 'team',
  routePrefix: '/team',
  permission: PERMISSIONS.MANAGE_TEAM,
  plans: ['pro', 'business', 'enterprise'],
  navLabel: 'nav.team',
  navIcon: 'team',
  navGroup: 'management',
  order: 90,
} satisfies FeatureManifest
