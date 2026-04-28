import type { FeatureManifest } from '~/core/subscription/types'
import { PERMISSIONS } from '~/core/rbac/permissions'
import { FEATURE_FLAGS } from '~/core/subscription/flags'

export default {
  id: 'payments',
  routePrefix: '/payments',
  permission: PERMISSIONS.MANAGE_PAYMENTS,
  flag: FEATURE_FLAGS.INVOICING,
  navLabel: 'nav.payments_received',
  navIcon: 'wallet',
  navGroup: 'sales',
  order: 34,
} satisfies FeatureManifest
