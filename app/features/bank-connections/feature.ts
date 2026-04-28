import type { FeatureManifest } from '~/core/subscription/types'
import { PERMISSIONS } from '~/core/rbac/permissions'
import { FEATURE_FLAGS } from '~/core/subscription/flags'

export default {
  id: 'bank-connections',
  routePrefix: '/bank-connections',
  permission: PERMISSIONS.MANAGE_ACCOUNTS,
  flag: FEATURE_FLAGS.BANKING,
  navLabel: 'nav.bank_connections',
  navIcon: 'plug',
  navGroup: 'banking',
  order: 47,
} satisfies FeatureManifest
