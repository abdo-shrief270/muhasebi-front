#!/usr/bin/env node
/**
 * Tailwind v4 requires `@reference` in every component <style> block that
 * uses `@apply`. This script prepends the reference to every scoped style
 * in app/features that contains an @apply. Idempotent — safe to rerun.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { execSync } from 'node:child_process'

const REFERENCE = '@reference "~/assets/css/tokens.css";'

const files = execSync('grep -rl "@apply" app --include="*.vue"', { encoding: 'utf8' })
  .split('\n').filter(Boolean)

let patched = 0, already = 0, skipped = 0

for (const file of files) {
  const src = readFileSync(file, 'utf8')

  if (!src.includes('@apply')) { skipped++; continue }
  if (src.includes(REFERENCE)) { already++; continue }

  // Match every <style [scoped|lang="…"]> ... </style> that contains @apply.
  const next = src.replace(
    /(<style\b[^>]*>)([\s\S]*?)(<\/style>)/g,
    (full, open, body, close) => {
      if (!body.includes('@apply')) return full
      if (body.includes(REFERENCE)) return full
      return `${open}\n${REFERENCE}\n${body.trimStart()}${close}`
    },
  )

  if (next !== src) {
    writeFileSync(file, next)
    patched++
  } else {
    skipped++
  }
}

console.log(`patched: ${patched}, already: ${already}, skipped: ${skipped}`)
