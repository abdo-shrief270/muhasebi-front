import type { FeatureManifest } from '~/core/subscription/types'

export default {
  id: 'settings',
  routePrefix: '/settings',
  navLabel: 'nav.settings',
  navIcon: 'settings',
  navGroup: 'account',
  order: 200,
} satisfies FeatureManifest
