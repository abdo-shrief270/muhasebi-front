import type { FeatureManifest } from '~/core/subscription/types'
import { PERMISSIONS } from '~/core/rbac/permissions'
import { FEATURE_FLAGS } from '~/core/subscription/flags'

export default {
  id: 'accounts',
  routePrefix: '/accounts',
  permission: PERMISSIONS.MANAGE_ACCOUNTS,
  flag: FEATURE_FLAGS.ACCOUNTING,
  navLabel: 'nav.accounts',
  navIcon: 'accounts',
  navGroup: 'accounting',
  order: 40,
} satisfies FeatureManifest
