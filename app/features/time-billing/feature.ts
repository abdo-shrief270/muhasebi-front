import type { FeatureManifest } from '~/core/subscription/types'
import { PERMISSIONS } from '~/core/rbac/permissions'

export default {
  id: 'time-billing',
  routePrefix: '/time-billing',
  permission: PERMISSIONS.MANAGE_TIMESHEETS,
  plans: ['pro', 'business', 'enterprise'],
  navLabel: 'nav.timeBilling',
  navIcon: 'invoices',
  navGroup: 'management',
  order: 105,
} satisfies FeatureManifest
