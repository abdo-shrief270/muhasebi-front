import type { FeatureManifest } from '~/core/subscription/types'
import { PERMISSIONS } from '~/core/rbac/permissions'

export default {
  id: 'dashboard',
  routePrefix: '/dashboard',
  permission: PERMISSIONS.VIEW_DASHBOARD,
  // Plan slugs match `config/plans` seeder: free_trial / starter / professional / enterprise.
  // Dashboard hidden on free_trial only.
  plans: ['starter', 'professional', 'enterprise'],
  navLabel: 'nav.dashboard',
  navIcon: 'dashboard',
  navGroup: 'main',
  order: 10,
} satisfies FeatureManifest
