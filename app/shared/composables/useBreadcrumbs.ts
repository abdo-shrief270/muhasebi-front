import { STAFF_NAV } from '~/shared/navigation/staff-nav'
import type { NavLeaf } from '~/shared/navigation/staff-nav'

/**
 * Derives breadcrumbs from the current route against the canonical STAFF_NAV
 * tree (§8.1 + §9.1 of docs/UI_UX_SPEC.md). The first crumb is always
 * dashboard; subsequent crumbs point at the matching group + leaf. Pages
 * may override/extend via `definePageMeta({ breadcrumbs: [...] })`.
 */
export interface Breadcrumb {
  label: string         // i18n key OR literal (page-provided)
  to?: string
}

export function useBreadcrumbs() {
  const route = useRoute()

  const crumbs = computed<Breadcrumb[]>(() => {
    const override = (route.meta as { breadcrumbs?: Breadcrumb[] }).breadcrumbs
    if (override && override.length) return override

    const path = route.path
    const home: Breadcrumb = { label: 'nav.home', to: '/dashboard' }
    if (path === '/' || path === '/dashboard') return [home]

    let matchedGroup: string | undefined
    let matchedLeaf: NavLeaf | undefined
    for (const group of STAFF_NAV) {
      for (const leaf of group.items) {
        if (leaf.to === path || path.startsWith(leaf.to + '/')) {
          if (!matchedLeaf || leaf.to.length > matchedLeaf.to.length) {
            matchedLeaf = leaf
            matchedGroup = group.id
          }
        }
      }
    }

    if (!matchedLeaf || !matchedGroup) return [home]

    return [
      home,
      { label: `nav.groups.${matchedGroup}` },
      { label: matchedLeaf.label, to: matchedLeaf.to },
    ]
  })

  return { crumbs }
}
