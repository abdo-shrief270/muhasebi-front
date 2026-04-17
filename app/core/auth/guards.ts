import { featureByRoute } from '../subscription/registry'
import { evaluateFeature } from '../subscription/useFeature'

export function requireAuth() {
  const auth = useAuthStore()
  if (!auth.isAuthenticated) return navigateTo('/auth/login')
}

export function requireGuest() {
  const auth = useAuthStore()
  if (auth.isAuthenticated) return navigateTo(defaultRouteFor())
}

export function defaultRouteFor(): string {
  const auth = useAuthStore()
  if (auth.isClient) return '/portal'
  const { can } = usePermissions()
  const candidates = ['/dashboard', '/clients', '/invoices', '/accounts', '/reports', '/documents']
  for (const path of candidates) {
    const f = featureByRoute(path)
    if (!f) continue
    if (!f.permission || can(f.permission)) return path
  }
  return '/settings'
}

export function accessCheck(path: string) {
  const feature = featureByRoute(path)
  if (!feature) return { ok: true } as const
  const access = evaluateFeature(feature)
  return { ok: access.allowed, access, feature } as const
}
