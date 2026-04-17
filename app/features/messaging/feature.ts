import type { FeatureManifest } from '~/core/subscription/types'

export default {
  id: 'messaging',
  routePrefix: '/messaging',
  plans: ['pro', 'business', 'enterprise'],
  flag: 'messaging_enabled',
  navLabel: 'nav.messaging',
  order: 130,
} satisfies FeatureManifest
