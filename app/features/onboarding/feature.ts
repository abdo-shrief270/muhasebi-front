import type { FeatureManifest } from '~/core/subscription/types'
import { PERMISSIONS } from '~/core/rbac/permissions'

export default {
  id: 'onboarding',
  routePrefix: '/onboarding',
  permission: PERMISSIONS.MANAGE_ONBOARDING,
  order: 5,
} satisfies FeatureManifest
