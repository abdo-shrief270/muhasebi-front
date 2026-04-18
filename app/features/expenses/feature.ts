import type { FeatureManifest } from '~/core/subscription/types'
import { PERMISSIONS } from '~/core/rbac/permissions'
import { FEATURE_FLAGS } from '~/core/subscription/flags'

export default {
  id: 'expenses',
  routePrefix: '/expenses',
  permission: PERMISSIONS.MANAGE_EXPENSES,
  flag: FEATURE_FLAGS.EXPENSES,
  navLabel: 'nav.expenses',
  navIcon: 'expenses',
  navGroup: 'ap',
  order: 33,
} satisfies FeatureManifest
