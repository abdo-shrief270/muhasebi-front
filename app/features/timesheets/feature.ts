import type { FeatureManifest } from '~/core/subscription/types'
import { PERMISSIONS } from '~/core/rbac/permissions'
import { FEATURE_FLAGS } from '~/core/subscription/flags'

export default {
  id: 'timesheets',
  routePrefix: '/timesheets',
  permission: PERMISSIONS.MANAGE_TIMESHEETS,
  flag: FEATURE_FLAGS.TIMESHEETS,
  navLabel: 'nav.timesheets',
  navIcon: 'timesheets',
  navGroup: 'management',
  order: 100,
} satisfies FeatureManifest
