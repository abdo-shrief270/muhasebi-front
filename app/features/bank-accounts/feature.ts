import type { FeatureManifest } from '~/core/subscription/types'
import { PERMISSIONS } from '~/core/rbac/permissions'
import { FEATURE_FLAGS } from '~/core/subscription/flags'

export default {
  id: 'bank-accounts',
  routePrefix: '/bank-accounts',
  permission: PERMISSIONS.MANAGE_ACCOUNTS,
  flag: FEATURE_FLAGS.BANKING,
  navLabel: 'nav.bank_accounts',
  navIcon: 'landmark',
  navGroup: 'banking',
  order: 45,
} satisfies FeatureManifest
