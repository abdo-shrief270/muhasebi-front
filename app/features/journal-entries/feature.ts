import type { FeatureManifest } from '~/core/subscription/types'
import { PERMISSIONS } from '~/core/rbac/permissions'

export default {
  id: 'journal-entries',
  routePrefix: '/journal-entries',
  permission: PERMISSIONS.MANAGE_JOURNAL_ENTRIES,
  plans: ['pro', 'business', 'enterprise'],
  navLabel: 'nav.journalEntries',
  navIcon: 'journal',
  navGroup: 'accounting',
  order: 50,
} satisfies FeatureManifest
