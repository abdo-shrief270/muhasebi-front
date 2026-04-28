import type { FeatureManifest } from '~/core/subscription/types'
import { PERMISSIONS } from '~/core/rbac/permissions'
import { FEATURE_FLAGS } from '~/core/subscription/flags'

export default {
  id: 'credit-notes',
  routePrefix: '/credit-notes',
  permission: PERMISSIONS.MANAGE_INVOICES,
  flag: FEATURE_FLAGS.INVOICING,
  navLabel: 'nav.credit_notes',
  navIcon: 'receipt',
  navGroup: 'sales',
  order: 35,
} satisfies FeatureManifest
