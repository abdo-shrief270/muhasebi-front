import type { FeatureManifest } from '~/core/subscription/types'
import { PERMISSIONS } from '~/core/rbac/permissions'
import { FEATURE_FLAGS } from '~/core/subscription/flags'

export default {
  id: 'custom-reports',
  routePrefix: '/custom-reports',
  permission: PERMISSIONS.VIEW_REPORTS,
  flag: FEATURE_FLAGS.CUSTOM_REPORTS,
  navLabel: 'nav.customReports',
  navIcon: 'reports',
  navGroup: 'accounting',
  order: 62,
} satisfies FeatureManifest
