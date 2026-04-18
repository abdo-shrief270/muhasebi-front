import type { FeatureManifest } from '~/core/subscription/types'
import { PERMISSIONS } from '~/core/rbac/permissions'
import { FEATURE_FLAGS } from '~/core/subscription/flags'

export default {
  id: 'audit-log',
  routePrefix: '/audit-log',
  permission: PERMISSIONS.VIEW_AUDIT,
  flag: FEATURE_FLAGS.AUDIT_LOG,
  navLabel: 'nav.auditLog',
  navIcon: 'audit',
  navGroup: 'management',
  order: 220,
} satisfies FeatureManifest
