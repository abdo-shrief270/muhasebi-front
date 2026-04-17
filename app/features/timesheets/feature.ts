import type { FeatureManifest } from '~/core/subscription/types'
import { PERMISSIONS } from '~/core/rbac/permissions'

export default {
  id: 'timesheets',
  routePrefix: '/timesheets',
  permission: PERMISSIONS.MANAGE_TIMESHEETS,
  plans: ['pro', 'business', 'enterprise'],
  navLabel: 'nav.timesheets',
  navIcon: 'timesheets',
  navGroup: 'management',
  order: 100,
} satisfies FeatureManifest
