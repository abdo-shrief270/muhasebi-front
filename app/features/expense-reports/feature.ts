import type { FeatureManifest } from '~/core/subscription/types'
import { PERMISSIONS } from '~/core/rbac/permissions'
import { FEATURE_FLAGS } from '~/core/subscription/flags'

export default {
  id: 'expense-reports',
  routePrefix: '/expense-reports',
  permission: PERMISSIONS.MANAGE_EXPENSES,
  flag: FEATURE_FLAGS.EXPENSES,
  navLabel: 'nav.expense_reports',
  navIcon: 'file-spreadsheet',
  navGroup: 'purchases',
  order: 34,
} satisfies FeatureManifest
