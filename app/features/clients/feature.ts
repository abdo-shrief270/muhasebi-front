import type { FeatureManifest } from '~/core/subscription/types'
import { PERMISSIONS } from '~/core/rbac/permissions'

export default {
  id: 'clients',
  routePrefix: '/clients',
  permission: PERMISSIONS.MANAGE_CLIENTS,
  plans: ['starter', 'pro', 'business', 'enterprise'],
  navLabel: 'nav.clients',
  navIcon: 'clients',
  navGroup: 'main',
  order: 20,
} satisfies FeatureManifest
