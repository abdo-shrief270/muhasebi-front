import type { FeatureManifest } from '~/core/subscription/types'

export default {
  id: 'import',
  routePrefix: '/import',
  plans: ['pro', 'business', 'enterprise'],
  flag: 'bulk_import_enabled',
  navLabel: 'nav.import',
  order: 140,
} satisfies FeatureManifest
