import type { FeatureManifest } from '~/core/subscription/types'
import { PERMISSIONS } from '~/core/rbac/permissions'
import { FEATURE_FLAGS } from '~/core/subscription/flags'

export default {
  id: 'ecommerce',
  routePrefix: '/ecommerce',
  permission: PERMISSIONS.MANAGE_INTEGRATIONS,
  flag: FEATURE_FLAGS.ECOMMERCE,
  navLabel: 'nav.ecommerce',
  navIcon: 'cart',
  navGroup: 'integrations',
  order: 150,
} satisfies FeatureManifest
