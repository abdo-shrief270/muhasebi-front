import type { FeatureManifest } from '~/core/subscription/types'
import { PERMISSIONS } from '~/core/rbac/permissions'
import { FEATURE_FLAGS } from '~/core/subscription/flags'

export default {
  id: 'messaging',
  routePrefix: '/messaging',
  permission: PERMISSIONS.MANAGE_CLIENTS,
  flag: FEATURE_FLAGS.CLIENTS,
  navLabel: 'nav.messaging',
  navGroup: 'management',
  order: 130,
} satisfies FeatureManifest
