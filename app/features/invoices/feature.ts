import type { FeatureManifest } from '~/core/subscription/types'
import { PERMISSIONS } from '~/core/rbac/permissions'
import { FEATURE_FLAGS } from '~/core/subscription/flags'

export default {
  id: 'invoices',
  routePrefix: '/invoices',
  permission: PERMISSIONS.MANAGE_INVOICES,
  flag: FEATURE_FLAGS.INVOICING,
  navLabel: 'nav.invoices',
  navIcon: 'invoices',
  navGroup: 'main',
  order: 30,
} satisfies FeatureManifest
