import type { FeatureManifest } from '~/core/subscription/types'
import { PERMISSIONS } from '~/core/rbac/permissions'
import { FEATURE_FLAGS } from '~/core/subscription/flags'

export default {
  id: 'fiscal-calendar',
  routePrefix: '/fiscal-calendar',
  permission: PERMISSIONS.MANAGE_ACCOUNTS,
  flag: FEATURE_FLAGS.ACCOUNTING,
  navLabel: 'nav.fiscal_calendar',
  navIcon: 'calendar-days',
  navGroup: 'accounting',
  order: 53,
} satisfies FeatureManifest
