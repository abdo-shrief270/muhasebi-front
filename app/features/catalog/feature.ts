import type { FeatureManifest } from '~/core/subscription/types'
import { PERMISSIONS } from '~/core/rbac/permissions'
import { FEATURE_FLAGS } from '~/core/subscription/flags'

/**
 * Tenant-wide catalog rollup of saved billable items — both per-client
 * (revenue side) and per-vendor (expense side). Read-only views; mutations
 * always go through the per-party detail pages so the audit trail and
 * route-model binding stay sensible.
 *
 * Gated by `manage_clients` since the AR side is the primary use; admins
 * who only have `manage_vendors` will see the page but only the Vendor tab
 * has data they can act on. The `<Can>` wrappers inside the page render
 * fallbacks per tab.
 */
export default {
  id: 'catalog',
  routePrefix: '/catalog',
  permission: PERMISSIONS.MANAGE_CLIENTS,
  flag: FEATURE_FLAGS.CLIENTS,
  navLabel: 'nav.catalog',
  navIcon: 'package',
  navGroup: 'sales',
  order: 25,
} satisfies FeatureManifest
