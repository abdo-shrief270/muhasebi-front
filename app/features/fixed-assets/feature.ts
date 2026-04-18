import type { FeatureManifest } from '~/core/subscription/types'
import { PERMISSIONS } from '~/core/rbac/permissions'
import { FEATURE_FLAGS } from '~/core/subscription/flags'

export default {
  id: 'fixed-assets',
  routePrefix: '/fixed-assets',
  permission: PERMISSIONS.MANAGE_FIXED_ASSETS,
  flag: FEATURE_FLAGS.FIXED_ASSETS,
  navLabel: 'nav.fixedAssets',
  navIcon: 'assets',
  navGroup: 'accounting',
  order: 57,
} satisfies FeatureManifest
