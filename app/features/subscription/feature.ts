import type { FeatureManifest } from '~/core/subscription/types'
import { PERMISSIONS } from '~/core/rbac/permissions'

export default {
  id: 'subscription',
  routePrefix: '/subscription',
  permission: PERMISSIONS.MANAGE_SUBSCRIPTION,
  navLabel: 'nav.subscription',
  navIcon: 'subscription',
  navGroup: 'account',
  order: 210,
} satisfies FeatureManifest
