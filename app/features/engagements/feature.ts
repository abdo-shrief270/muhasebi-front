import type { FeatureManifest } from '~/core/subscription/types'
import { PERMISSIONS } from '~/core/rbac/permissions'

export default {
  id: 'engagements',
  routePrefix: '/engagements',
  permission: PERMISSIONS.MANAGE_ENGAGEMENTS,
  navLabel: 'nav.engagements',
  navIcon: 'briefcase',
  navGroup: 'management',
  order: 115,
} satisfies FeatureManifest
