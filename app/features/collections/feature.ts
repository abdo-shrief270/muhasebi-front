import type { FeatureManifest } from '~/core/subscription/types'
import { PERMISSIONS } from '~/core/rbac/permissions'
import { FEATURE_FLAGS } from '~/core/subscription/flags'

export default {
  id: 'collections',
  routePrefix: '/collections',
  permission: PERMISSIONS.MANAGE_COLLECTIONS,
  flag: FEATURE_FLAGS.COLLECTIONS,
  navLabel: 'nav.collections',
  navIcon: 'dunning',
  navGroup: 'main',
  order: 36,
} satisfies FeatureManifest
