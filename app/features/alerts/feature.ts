import type { FeatureManifest } from '~/core/subscription/types'
import { PERMISSIONS } from '~/core/rbac/permissions'

// NOTE: no dedicated `manage_alerts` permission in the backend yet
// (BACKEND_QUESTIONS 10.1). Gating by view_dashboard as the weakest fallback.

export default {
  id: 'alerts',
  routePrefix: '/alerts',
  permission: PERMISSIONS.VIEW_DASHBOARD,
  navLabel: 'nav.alerts',
  navIcon: 'bell',
  navGroup: 'management',
  order: 125,
} satisfies FeatureManifest
