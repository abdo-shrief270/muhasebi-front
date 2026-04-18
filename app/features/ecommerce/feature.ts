import type { FeatureManifest } from '~/core/subscription/types'
import { PERMISSIONS } from '~/core/rbac/permissions'

export default {
  id: 'ecommerce',
  routePrefix: '/ecommerce',
  permission: PERMISSIONS.MANAGE_INTEGRATIONS,
  navLabel: 'nav.ecommerce',
  navIcon: 'cart',
  navGroup: 'integrations',
  order: 150,
} satisfies FeatureManifest
