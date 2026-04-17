import type { FeatureManifest } from '~/core/subscription/types'
import { PERMISSIONS } from '~/core/rbac/permissions'

export default {
  id: 'accounts',
  routePrefix: '/accounts',
  permission: PERMISSIONS.MANAGE_ACCOUNTS,
  plans: ['starter', 'pro', 'business', 'enterprise'],
  navLabel: 'nav.accounts',
  navIcon: 'accounts',
  navGroup: 'accounting',
  order: 40,
} satisfies FeatureManifest
