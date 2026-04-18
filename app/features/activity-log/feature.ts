import type { FeatureManifest } from '~/core/subscription/types'

export default {
  id: 'activity-log',
  routePrefix: '/activity-log',
  navLabel: 'nav.activityLog',
  navIcon: 'log',
  navGroup: 'management',
  order: 225,
} satisfies FeatureManifest
