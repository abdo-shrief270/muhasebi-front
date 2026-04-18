#!/usr/bin/env node
/**
 * One-shot seeder to materialize the remaining feature-manifest slots so the
 * registry matches docs/FEATURES.md + docs/01..28-*.md. Safe to re-run — it
 * only creates missing folders/files. Does NOT overwrite existing manifests.
 */
import { mkdirSync, writeFileSync, existsSync } from 'node:fs'
import { resolve, join } from 'node:path'

const FEATURES = [
  // id,              routePrefix,        permission,               flag,            navLabel,             navIcon, navGroup,     order
  ['audit-log',       '/audit-log',       'VIEW_AUDIT',             'AUDIT_LOG',     'nav.auditLog',       'audit', 'management', 220],
  ['bank-reconciliation','/bank-reconciliation','MANAGE_ACCOUNTS',   'ACCOUNTING',    'nav.bankReconciliation','bank','accounting',55],
  ['bills',           '/bills',           'MANAGE_BILLS',           'BILLS_VENDORS', 'nav.bills',          'bills', 'ap',         31],
  ['vendors',         '/vendors',         'MANAGE_VENDORS',         'BILLS_VENDORS', 'nav.vendors',        'vendors','ap',        32],
  ['expenses',        '/expenses',        'MANAGE_EXPENSES',        'EXPENSES',      'nav.expenses',       'expenses','ap',       33],
  ['fixed-assets',    '/fixed-assets',    'MANAGE_FIXED_ASSETS',    'FIXED_ASSETS',  'nav.fixedAssets',    'assets','accounting', 57],
  ['inventory',       '/inventory',       'MANAGE_INVENTORY',       'INVENTORY',     'nav.inventory',      'stock', 'main',       25],
  ['cost-centers',    '/cost-centers',    'MANAGE_COST_CENTERS',    'COST_CENTERS',  'nav.costCenters',    'centers','accounting',58],
  ['budgets',         '/budgets',         'MANAGE_ACCOUNTS',        'BUDGETING',     'nav.budgets',        'budget','accounting', 59],
  ['tax',             '/tax',             'MANAGE_TAX',             'TAX',           'nav.tax',            'tax',   'compliance', 75],
  ['engagements',     '/engagements',     'MANAGE_ENGAGEMENTS',     null,            'nav.engagements',    'briefcase','management',115],
  ['approvals',       '/approvals',       'MANAGE_APPROVALS',       null,            'nav.approvals',      'check', 'management', 120],
  ['alerts',          '/alerts',          'MANAGE_ALERTS',          null,            'nav.alerts',         'bell',  'management', 125],
  ['ecommerce',       '/ecommerce',       'MANAGE_INTEGRATIONS',    null,            'nav.ecommerce',      'cart',  'integrations',150],
  ['webhooks',        '/webhooks',        'MANAGE_SETTINGS',        null,            'nav.webhooks',       'hook',  'integrations',155],
  ['currency',        '/currency',        null,                     null,            'nav.currency',       'coin',  'more',       160],
  ['collections',     '/collections',     'MANAGE_COLLECTIONS',     'COLLECTIONS',   'nav.collections',    'dunning','main',      36],
  ['custom-reports',  '/custom-reports',  'VIEW_REPORTS',           'CUSTOM_REPORTS','nav.customReports',  'reports','accounting',62],
  ['anomalies',       '/anomalies',       'VIEW_REPORTS',           'REPORTS',       'nav.anomalies',      'warn',  'accounting', 63],
  ['activity-log',    '/activity-log',    null,                     null,            'nav.activityLog',    'log',   'management', 225],
]

const root = resolve(process.cwd(), 'app/features')
let created = 0, skipped = 0

for (const [id, routePrefix, permissionKey, flagKey, navLabel, navIcon, navGroup, order] of FEATURES) {
  const folder = join(root, id)
  const manifestPath = join(folder, 'feature.ts')
  if (existsSync(manifestPath)) { skipped++; continue }

  for (const sub of ['pages', 'components', 'composables', 'services']) {
    mkdirSync(join(folder, sub), { recursive: true })
  }

  const permLine = permissionKey ? `  permission: PERMISSIONS.${permissionKey},\n` : ''
  const flagLine = flagKey ? `  flag: FEATURE_FLAGS.${flagKey},\n` : ''
  const permImport = permissionKey ? `import { PERMISSIONS } from '~/core/rbac/permissions'\n` : ''
  const flagImport = flagKey ? `import { FEATURE_FLAGS } from '~/core/subscription/flags'\n` : ''

  writeFileSync(manifestPath, `import type { FeatureManifest } from '~/core/subscription/types'
${permImport}${flagImport}
export default {
  id: '${id}',
  routePrefix: '${routePrefix}',
${permLine}${flagLine}  navLabel: '${navLabel}',
  navIcon: '${navIcon}',
  navGroup: '${navGroup}',
  order: ${order},
} satisfies FeatureManifest
`)
  created++
}

console.log(`seeded: ${created}, skipped (already existed): ${skipped}`)
