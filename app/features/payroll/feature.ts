import type { FeatureManifest } from '~/core/subscription/types'
import { PERMISSIONS } from '~/core/rbac/permissions'

export default {
  id: 'payroll',
  routePrefix: '/payroll',
  permission: PERMISSIONS.MANAGE_PAYROLL,
  plans: ['business', 'enterprise'],
  flag: 'payroll_enabled',
  navLabel: 'nav.payroll',
  navIcon: 'payroll',
  navGroup: 'management',
  order: 110,
} satisfies FeatureManifest
