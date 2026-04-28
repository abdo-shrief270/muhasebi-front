import type { FeatureManifest } from '~/core/subscription/types'
import { PERMISSIONS } from '~/core/rbac/permissions'

export default {
  id: 'team',
  routePrefix: '/team',
  permission: PERMISSIONS.MANAGE_TEAM,
  // Plan slugs match backend seeder: team mgmt is on professional+.
  plans: ['professional', 'enterprise'],
  navLabel: 'nav.team',
  navIcon: 'team',
  navGroup: 'management',
  order: 90,
} satisfies FeatureManifest
