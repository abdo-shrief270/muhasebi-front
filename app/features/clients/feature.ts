import type { FeatureManifest } from '~/core/subscription/types'
import { PERMISSIONS } from '~/core/rbac/permissions'
import { FEATURE_FLAGS } from '~/core/subscription/flags'

export default {
  id: 'clients',
  routePrefix: '/clients',
  permission: PERMISSIONS.MANAGE_CLIENTS,
  flag: FEATURE_FLAGS.CLIENTS,
  navLabel: 'nav.clients',
  navIcon: 'clients',
  navGroup: 'main',
  order: 20,
} satisfies FeatureManifest
