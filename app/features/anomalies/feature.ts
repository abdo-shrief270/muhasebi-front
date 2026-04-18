import type { FeatureManifest } from '~/core/subscription/types'
import { PERMISSIONS } from '~/core/rbac/permissions'
import { FEATURE_FLAGS } from '~/core/subscription/flags'

export default {
  id: 'anomalies',
  routePrefix: '/anomalies',
  permission: PERMISSIONS.VIEW_REPORTS,
  flag: FEATURE_FLAGS.REPORTS,
  navLabel: 'nav.anomalies',
  navIcon: 'warn',
  navGroup: 'accounting',
  order: 63,
} satisfies FeatureManifest
