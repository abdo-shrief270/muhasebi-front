import type { FeatureManifest } from '~/core/subscription/types'
import { PERMISSIONS } from '~/core/rbac/permissions'
import { FEATURE_FLAGS } from '~/core/subscription/flags'

export default {
  id: 'tax',
  routePrefix: '/tax',
  permission: PERMISSIONS.MANAGE_TAX,
  flag: FEATURE_FLAGS.TAX,
  navLabel: 'nav.tax',
  navIcon: 'tax',
  navGroup: 'compliance',
  order: 75,
} satisfies FeatureManifest
