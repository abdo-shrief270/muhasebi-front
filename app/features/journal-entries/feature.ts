import type { FeatureManifest } from '~/core/subscription/types'
import { PERMISSIONS } from '~/core/rbac/permissions'
import { FEATURE_FLAGS } from '~/core/subscription/flags'

export default {
  id: 'journal-entries',
  routePrefix: '/journal-entries',
  permission: PERMISSIONS.MANAGE_JOURNAL_ENTRIES,
  flag: FEATURE_FLAGS.ACCOUNTING,
  navLabel: 'nav.journalEntries',
  navIcon: 'journal',
  navGroup: 'accounting',
  order: 50,
} satisfies FeatureManifest
