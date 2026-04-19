import { STAFF_NAV, PORTAL_NAV, type NavGroup, type NavLeaf } from '~/shared/navigation/staff-nav'

/**
 * Staff sidebar — §9.1. Filters the canonical tree by tenant features and
 * user permissions; hides whole groups with no visible children.
 */
export function useNavigation() {
  const auth = useAuthStore()
  const subscription = useSubscription()
  const { can } = usePermissions()

  function isVisible(leaf: NavLeaf): boolean {
    if (!auth.isAuthenticated) return false
    if (leaf.permission && !can(leaf.permission)) return false
    if (leaf.feature && !subscription.isFlagEnabled(leaf.feature)) return false
    return true
  }

  const groups = computed<NavGroup[]>(() => {
    return STAFF_NAV
      .map(g => ({ ...g, items: g.items.filter(isVisible) }))
      .filter(g => g.items.length > 0)
  })

  const items = computed<NavLeaf[]>(() => groups.value.flatMap(g => g.items))

  return { groups, items }
}

/**
 * Portal topnav — §9.2. No feature/permission gating; the portal user only
 * sees what's already filtered server-side.
 */
export function usePortalNavigation() {
  return { items: PORTAL_NAV }
}

export type { NavGroup, NavLeaf }
