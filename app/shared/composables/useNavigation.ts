import { FEATURES } from '~/core/subscription/registry'
import { evaluateFeature } from '~/core/subscription/useFeature'
import type { FeatureManifest } from '~/core/subscription/types'

export interface NavItem {
  id: string
  to: string
  label: string
  icon?: string
  group?: string
}

export function useNavigation() {
  const items = computed<NavItem[]>(() => {
    return FEATURES
      .filter((f: FeatureManifest) => f.navLabel)
      .filter((f: FeatureManifest) => evaluateFeature(f).allowed)
      .map((f: FeatureManifest) => ({
        id: f.id,
        to: f.routePrefix,
        label: f.navLabel!,
        icon: f.navIcon,
        group: f.navGroup,
      }))
  })

  const groups = computed(() => {
    const map = new Map<string, NavItem[]>()
    for (const item of items.value) {
      const g = item.group ?? 'default'
      if (!map.has(g)) map.set(g, [])
      map.get(g)!.push(item)
    }
    return Array.from(map.entries()).map(([id, items]) => ({ id, items }))
  })

  return { items, groups }
}
