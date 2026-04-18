import type { FeatureManifest } from '~/core/subscription/types'
import { PERMISSIONS } from '~/core/rbac/permissions'
import { FEATURE_FLAGS } from '~/core/subscription/flags'

export default {
  id: 'eta',
  routePrefix: '/eta',
  permission: PERMISSIONS.MANAGE_ETA,
  flag: FEATURE_FLAGS.E_INVOICE,
  navLabel: 'nav.eta',
  navIcon: 'eta',
  navGroup: 'more',
  order: 80,
} satisfies FeatureManifest
