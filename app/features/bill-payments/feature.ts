import type { FeatureManifest } from '~/core/subscription/types'
import { PERMISSIONS } from '~/core/rbac/permissions'
import { FEATURE_FLAGS } from '~/core/subscription/flags'

export default {
  id: 'bill-payments',
  routePrefix: '/bill-payments',
  permission: PERMISSIONS.MANAGE_BILLS,
  flag: FEATURE_FLAGS.BILLS_VENDORS,
  navLabel: 'nav.bill_payments',
  navIcon: 'banknote',
  navGroup: 'purchases',
  order: 32,
} satisfies FeatureManifest
