import type { FeatureManifest } from '~/core/subscription/types'
import { PERMISSIONS } from '~/core/rbac/permissions'
import { FEATURE_FLAGS } from '~/core/subscription/flags'

export default {
  id: 'fx-revaluation',
  routePrefix: '/fx-revaluation',
  permission: PERMISSIONS.MANAGE_ACCOUNTS,
  flag: FEATURE_FLAGS.BANKING,
  navLabel: 'nav.fx_revaluation',
  navIcon: 'refresh-cw',
  navGroup: 'banking',
  order: 48,
} satisfies FeatureManifest
