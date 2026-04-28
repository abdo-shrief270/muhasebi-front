import type { FeatureManifest } from '~/core/subscription/types'
import { PERMISSIONS } from '~/core/rbac/permissions'

export default {
  id: 'approvals',
  routePrefix: '/approvals',
  permission: PERMISSIONS.MANAGE_APPROVALS,
  navLabel: 'nav.approvals',
  navIcon: 'check',
  navGroup: 'management',
  order: 120,
} satisfies FeatureManifest
