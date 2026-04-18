import { z } from 'zod'
import type { FeatureManifest } from './types'

const PLAN_TIERS = ['free', 'starter', 'pro', 'business', 'enterprise'] as const

const manifestSchema = z.object({
  id: z.string().min(1, 'id is required'),
  routePrefix: z.string().startsWith('/', 'routePrefix must start with /'),
  permission: z.string().optional(),
  plans: z.array(z.enum(PLAN_TIERS)).nonempty('plans must not be empty if set').optional(),
  flag: z.string().optional(),
  navLabel: z.string().optional(),
  navIcon: z.string().optional(),
  navGroup: z.string().optional(),
  order: z.number().optional(),
  hideWhenDenied: z.boolean().optional(),
})

export interface ValidationIssue {
  featureId: string
  kind: 'schema' | 'duplicate-id' | 'duplicate-route'
  message: string
}

export function validateManifests(features: readonly FeatureManifest[]): ValidationIssue[] {
  const issues: ValidationIssue[] = []
  const seenIds = new Map<string, FeatureManifest>()
  const seenRoutes = new Map<string, FeatureManifest>()

  for (const f of features) {
    const parsed = manifestSchema.safeParse(f)
    if (!parsed.success) {
      for (const i of parsed.error.issues) {
        issues.push({
          featureId: f?.id ?? '<unknown>',
          kind: 'schema',
          message: `${i.path.join('.') || '<root>'}: ${i.message}`,
        })
      }
    }

    if (seenIds.has(f.id)) {
      issues.push({
        featureId: f.id,
        kind: 'duplicate-id',
        message: `duplicate feature id "${f.id}"`,
      })
    } else {
      seenIds.set(f.id, f)
    }

    if (seenRoutes.has(f.routePrefix)) {
      issues.push({
        featureId: f.id,
        kind: 'duplicate-route',
        message: `duplicate routePrefix "${f.routePrefix}" (also used by "${seenRoutes.get(f.routePrefix)!.id}")`,
      })
    } else {
      seenRoutes.set(f.routePrefix, f)
    }
  }

  return issues
}

/**
 * Report manifest issues to the console in dev. No-op in production.
 * Duplicate ids and duplicate routePrefixes are errors; schema issues are also errors.
 */
export function reportManifestIssues(issues: readonly ValidationIssue[]) {
  if (!issues.length) return
  if (!import.meta.dev) return
  const grouped = new Map<string, ValidationIssue[]>()
  for (const i of issues) {
    const arr = grouped.get(i.featureId) ?? []
    arr.push(i)
    grouped.set(i.featureId, arr)
  }
  for (const [id, list] of grouped) {
    console.error(
      `[feature-manifest] ${id}:\n` + list.map(i => `  - [${i.kind}] ${i.message}`).join('\n'),
    )
  }
}
