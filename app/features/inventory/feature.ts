import type { FeatureManifest } from '~/core/subscription/types'
import { PERMISSIONS } from '~/core/rbac/permissions'
import { FEATURE_FLAGS } from '~/core/subscription/flags'

export default {
  id: 'inventory',
  routePrefix: '/inventory',
  permission: PERMISSIONS.MANAGE_INVENTORY,
  flag: FEATURE_FLAGS.INVENTORY,
  navLabel: 'nav.inventory',
  navIcon: 'stock',
  navGroup: 'main',
  order: 25,
} satisfies FeatureManifest
