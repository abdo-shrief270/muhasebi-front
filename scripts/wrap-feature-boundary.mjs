#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(process.cwd(), 'app/features')

const targets = [
  { feature: 'invoices', pages: ['index.vue', 'create.vue', 'recurring.vue', '[id]/index.vue', '[id]/edit.vue'] },
  { feature: 'payroll', pages: ['index.vue', '[id].vue', 'employees.vue'] },
  { feature: 'eta', pages: ['index.vue', 'settings.vue', 'item-codes.vue', 'reconcile.vue', 'documents/index.vue', 'documents/[id].vue'] },
  { feature: 'journal-entries', pages: ['index.vue', 'create.vue', '[id].vue'] },
  { feature: 'reports', pages: ['index.vue', 'balance-sheet.vue', 'income-statement.vue', 'cash-flow.vue', 'trial-balance.vue', 'ledger.vue', 'aging.vue', 'comparative.vue', 'client-statement.vue'] },
  { feature: 'dashboard', pages: ['index.vue'] },
  { feature: 'clients', pages: ['index.vue', '[id].vue'] },
  { feature: 'accounts', pages: ['index.vue', 'fiscal-years.vue'] },
  { feature: 'documents', pages: ['index.vue'] },
  { feature: 'timesheets', pages: ['index.vue', 'summary.vue'] },
  { feature: 'team', pages: ['index.vue'] },
  { feature: 'subscription', pages: ['index.vue'] },
  { feature: 'onboarding', pages: ['index.vue'] },
  { feature: 'settings', pages: ['index.vue', 'notifications.vue', 'security.vue', 'currencies.vue'] },
]

let wrapped = 0, skipped = 0, already = 0

for (const { feature, pages } of targets) {
  for (const p of pages) {
    const path = resolve(root, feature, 'pages', p)
    let src
    try { src = readFileSync(path, 'utf8') } catch { skipped++; continue }

    if (src.includes('<FeatureBoundary')) { already++; continue }

    const openMatch = src.match(/([ \t]*)<NuxtLayout\b[^>]*>\s*\n/)
    if (!openMatch) { skipped++; continue }

    const openEnd = openMatch.index + openMatch[0].length
    const layoutIndent = openMatch[1]
    const childIndent = layoutIndent + '  '

    const closeMatch = src.slice(openEnd).match(/([ \t]*)<\/NuxtLayout>/)
    if (!closeMatch) { skipped++; continue }

    const closeAbs = openEnd + closeMatch.index

    const before = src.slice(0, openEnd)
    const inner = src.slice(openEnd, closeAbs)
    const after = src.slice(closeAbs)

    const next =
      before +
      `${childIndent}<FeatureBoundary id="${feature}">\n` +
      inner +
      `${childIndent}</FeatureBoundary>\n` +
      after

    writeFileSync(path, next)
    wrapped++
  }
}

console.log(`wrapped: ${wrapped}, already: ${already}, skipped: ${skipped}`)
