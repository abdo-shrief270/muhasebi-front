import type { FeatureManifest } from '~/core/subscription/types'

// NOTE: no dedicated `manage_engagements` permission in the backend yet
// (BACKEND_QUESTIONS 10.1). Gating by feature access only until the slug lands.

export default {
  id: 'engagements',
  routePrefix: '/engagements',
  navLabel: 'nav.engagements',
  navIcon: 'briefcase',
  navGroup: 'management',
  order: 115,
} satisfies FeatureManifest
