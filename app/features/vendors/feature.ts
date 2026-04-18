import type { FeatureManifest } from '~/core/subscription/types'
import { PERMISSIONS } from '~/core/rbac/permissions'
import { FEATURE_FLAGS } from '~/core/subscription/flags'

export default {
  id: 'vendors',
  routePrefix: '/vendors',
  permission: PERMISSIONS.MANAGE_VENDORS,
  flag: FEATURE_FLAGS.BILLS_VENDORS,
  navLabel: 'nav.vendors',
  navIcon: 'vendors',
  navGroup: 'ap',
  order: 32,
} satisfies FeatureManifest
