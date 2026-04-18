import type { FeatureManifest } from '~/core/subscription/types'

export default {
  id: 'currency',
  routePrefix: '/currency',
  navLabel: 'nav.currency',
  navIcon: 'coin',
  navGroup: 'more',
  order: 160,
} satisfies FeatureManifest
