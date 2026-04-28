import { featureByRoute } from '~/core/subscription/registry'
import { evaluateFeature } from '~/core/subscription/useFeature'
import { defaultRouteFor } from '~/core/auth/guards'

const PUBLIC_PREFIXES = ['/auth', '/', '/blog', '/contact', '/privacy', '/terms', '/changelog', '/features']

/**
 * Specific public routes that don't fit a prefix bucket — used for
 * magic-link landings where the user is by-definition not authenticated
 * yet (they're about to set their password). Matched before the
 * /portal-prefix check below so the redirect-to-login doesn't trigger.
 */
const PUBLIC_ROUTES = ['/portal/accept-invite']

function isPublicPath(path: string): boolean {
  if (path === '/') return true
  if (PUBLIC_ROUTES.includes(path)) return true
  return PUBLIC_PREFIXES.some(p => p !== '/' && (path === p || path.startsWith(p + '/')))
}

export default defineNuxtRouteMiddleware((to) => {
  const auth = useAuthStore()
  const path = to.path

  if (path.startsWith('/auth')) return

  if (!auth.isAuthenticated) {
    if (isPublicPath(path)) return
    return navigateTo('/auth/login')
  }

  if (auth.isClient && !path.startsWith('/portal') && !path.startsWith('/settings')) {
    return navigateTo('/portal')
  }

  // /portal/accept-invite stays accessible to authenticated staff too —
  // they shouldn't get bounced if they're already logged in (e.g. as an
  // admin) when they click a magic link from a different account's email.
  if (path.startsWith('/portal') && path !== '/portal/accept-invite' && !auth.isClient) {
    return navigateTo(defaultRouteFor())
  }

  const feature = featureByRoute(path)
  if (!feature) return

  const access = evaluateFeature(feature)
  if (access.allowed) return

  if (access.reason === 'permission') {
    return abortNavigation(createError({ statusCode: 403, statusMessage: 'Forbidden' }))
  }
  if (access.reason === 'flag' || access.reason === 'plan') {
    // Feature not included in the tenant's plan — redirect to subscription with
    // ?required= so the page can show which feature the user needs to unlock.
    return navigateTo(`/subscription?required=${feature.id}`)
  }
})
