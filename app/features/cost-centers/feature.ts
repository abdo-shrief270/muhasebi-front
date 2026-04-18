import type { FeatureManifest } from '~/core/subscription/types'
import { PERMISSIONS } from '~/core/rbac/permissions'
import { FEATURE_FLAGS } from '~/core/subscription/flags'

export default {
  id: 'cost-centers',
  routePrefix: '/cost-centers',
  permission: PERMISSIONS.MANAGE_COST_CENTERS,
  flag: FEATURE_FLAGS.COST_CENTERS,
  navLabel: 'nav.costCenters',
  navIcon: 'centers',
  navGroup: 'accounting',
  order: 58,
} satisfies FeatureManifest
