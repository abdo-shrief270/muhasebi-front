import type { FeatureManifest } from '~/core/subscription/types'
import { PERMISSIONS } from '~/core/rbac/permissions'
import { FEATURE_FLAGS } from '~/core/subscription/flags'

export default {
  id: 'payroll',
  routePrefix: '/payroll',
  permission: PERMISSIONS.MANAGE_PAYROLL,
  flag: FEATURE_FLAGS.PAYROLL,
  navLabel: 'nav.payroll',
  navIcon: 'payroll',
  navGroup: 'management',
  order: 110,
} satisfies FeatureManifest
