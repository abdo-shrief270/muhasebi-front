import type { FeatureManifest } from '~/core/subscription/types'
import { PERMISSIONS } from '~/core/rbac/permissions'
import { FEATURE_FLAGS } from '~/core/subscription/flags'

export default {
  id: 'time-billing',
  routePrefix: '/time-billing',
  permission: PERMISSIONS.MANAGE_TIMESHEETS,
  flag: FEATURE_FLAGS.TIMESHEETS,
  navLabel: 'nav.timeBilling',
  navIcon: 'invoices',
  navGroup: 'management',
  order: 105,
} satisfies FeatureManifest
