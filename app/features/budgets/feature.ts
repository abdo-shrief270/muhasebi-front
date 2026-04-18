import type { FeatureManifest } from '~/core/subscription/types'
import { PERMISSIONS } from '~/core/rbac/permissions'
import { FEATURE_FLAGS } from '~/core/subscription/flags'

export default {
  id: 'budgets',
  routePrefix: '/budgets',
  permission: PERMISSIONS.MANAGE_ACCOUNTS,
  flag: FEATURE_FLAGS.BUDGETING,
  navLabel: 'nav.budgets',
  navIcon: 'budget',
  navGroup: 'accounting',
  order: 59,
} satisfies FeatureManifest
