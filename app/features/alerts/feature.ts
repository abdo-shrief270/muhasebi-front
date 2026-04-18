import type { FeatureManifest } from '~/core/subscription/types'
import { PERMISSIONS } from '~/core/rbac/permissions'

export default {
  id: 'alerts',
  routePrefix: '/alerts',
  permission: PERMISSIONS.MANAGE_ALERTS,
  navLabel: 'nav.alerts',
  navIcon: 'bell',
  navGroup: 'management',
  order: 125,
} satisfies FeatureManifest
