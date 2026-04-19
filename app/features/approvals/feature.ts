import type { FeatureManifest } from '~/core/subscription/types'
import { PERMISSIONS } from '~/core/rbac/permissions'

// NOTE: no dedicated `manage_approvals` permission in the backend yet
// (BACKEND_QUESTIONS 10.1). Gating by view_dashboard as the weakest fallback.

export default {
  id: 'approvals',
  routePrefix: '/approvals',
  permission: PERMISSIONS.VIEW_DASHBOARD,
  navLabel: 'nav.approvals',
  navIcon: 'check',
  navGroup: 'management',
  order: 120,
} satisfies FeatureManifest
