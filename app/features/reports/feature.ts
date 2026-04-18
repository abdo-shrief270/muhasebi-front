import type { FeatureManifest } from '~/core/subscription/types'
import { PERMISSIONS } from '~/core/rbac/permissions'
import { FEATURE_FLAGS } from '~/core/subscription/flags'

export default {
  id: 'reports',
  routePrefix: '/reports',
  permission: PERMISSIONS.VIEW_REPORTS,
  flag: FEATURE_FLAGS.REPORTS,
  navLabel: 'nav.reports',
  navIcon: 'reports',
  navGroup: 'accounting',
  order: 60,
} satisfies FeatureManifest
