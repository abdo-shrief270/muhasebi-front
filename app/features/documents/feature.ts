import type { FeatureManifest } from '~/core/subscription/types'
import { PERMISSIONS } from '~/core/rbac/permissions'

export default {
  id: 'documents',
  routePrefix: '/documents',
  permission: PERMISSIONS.MANAGE_DOCUMENTS,
  plans: ['starter', 'pro', 'business', 'enterprise'],
  navLabel: 'nav.documents',
  navIcon: 'documents',
  navGroup: 'more',
  order: 70,
} satisfies FeatureManifest
