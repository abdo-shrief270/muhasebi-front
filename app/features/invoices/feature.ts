import type { FeatureManifest } from '~/core/subscription/types'
import { PERMISSIONS } from '~/core/rbac/permissions'

export default {
  id: 'invoices',
  routePrefix: '/invoices',
  permission: PERMISSIONS.MANAGE_INVOICES,
  plans: ['starter', 'pro', 'business', 'enterprise'],
  navLabel: 'nav.invoices',
  navIcon: 'invoices',
  navGroup: 'main',
  order: 30,
} satisfies FeatureManifest
