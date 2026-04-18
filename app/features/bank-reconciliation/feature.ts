import type { FeatureManifest } from '~/core/subscription/types'
import { PERMISSIONS } from '~/core/rbac/permissions'
import { FEATURE_FLAGS } from '~/core/subscription/flags'

export default {
  id: 'bank-reconciliation',
  routePrefix: '/bank-reconciliation',
  permission: PERMISSIONS.MANAGE_ACCOUNTS,
  flag: FEATURE_FLAGS.ACCOUNTING,
  navLabel: 'nav.bankReconciliation',
  navIcon: 'bank',
  navGroup: 'accounting',
  order: 55,
} satisfies FeatureManifest
