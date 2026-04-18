import type { FeatureManifest } from '~/core/subscription/types'
import { PERMISSIONS } from '~/core/rbac/permissions'
import { FEATURE_FLAGS } from '~/core/subscription/flags'

export default {
  id: 'documents',
  routePrefix: '/documents',
  permission: PERMISSIONS.MANAGE_DOCUMENTS,
  flag: FEATURE_FLAGS.DOCUMENTS,
  navLabel: 'nav.documents',
  navIcon: 'documents',
  navGroup: 'more',
  order: 70,
} satisfies FeatureManifest
