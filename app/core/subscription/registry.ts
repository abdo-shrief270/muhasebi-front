import type { FeatureManifest } from './types'
import { reportManifestIssues, validateManifests } from './validateManifest'

const modules = import.meta.glob('../../features/*/feature.ts', { eager: true, import: 'default' }) as Record<string, FeatureManifest>

export const FEATURES: readonly FeatureManifest[] = Object.values(modules)
  .filter(Boolean)
  .sort((a, b) => (a.order ?? 999) - (b.order ?? 999))

if (import.meta.dev) {
  reportManifestIssues(validateManifests(FEATURES))
}

const byId = new Map(FEATURES.map(f => [f.id, f]))

export function getFeature(id: string): FeatureManifest | undefined {
  return byId.get(id)
}

export function featureByRoute(path: string): FeatureManifest | undefined {
  return FEATURES.find(f => path === f.routePrefix || path.startsWith(f.routePrefix + '/'))
}
