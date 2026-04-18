import type { FeatureManifest } from '~/core/subscription/types'
import { PERMISSIONS } from '~/core/rbac/permissions'

export default {
  id: 'webhooks',
  routePrefix: '/webhooks',
  permission: PERMISSIONS.MANAGE_SETTINGS,
  navLabel: 'nav.webhooks',
  navIcon: 'hook',
  navGroup: 'integrations',
  order: 155,
} satisfies FeatureManifest
