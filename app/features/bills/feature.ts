import type { FeatureManifest } from '~/core/subscription/types'
import { PERMISSIONS } from '~/core/rbac/permissions'
import { FEATURE_FLAGS } from '~/core/subscription/flags'

export default {
  id: 'bills',
  routePrefix: '/bills',
  permission: PERMISSIONS.MANAGE_BILLS,
  flag: FEATURE_FLAGS.BILLS_VENDORS,
  navLabel: 'nav.bills',
  navIcon: 'bills',
  navGroup: 'ap',
  order: 31,
} satisfies FeatureManifest
