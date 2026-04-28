/**
 * Hydrates the auth + subscription stores before route middleware runs.
 *
 * Universal (runs on both SSR and client) — required because the
 * `access.global` route middleware checks `can(permission)` and
 * `isFlagEnabled(flag)`. If this plugin only ran client-side (the old
 * `.client.ts` variant), SSR would see an authenticated-but-empty store,
 * every permission check would fail, and users would 403 on pages they
 * actually have access to (e.g. /subscription?required=… redirects).
 *
 * `fetchUser()` hits /me, which returns user + tenant + permissions +
 * tenant.features. That single request is enough for the nav filter and
 * route-level gates to render correctly on the server. The dedicated
 * /subscription endpoint is only called by the /subscription page itself
 * (for plan metadata + usage); nav gating doesn't need it.
 */
export default defineNuxtPlugin({
  name: 'muhasebi:session',
  dependsOn: ['pinia'],
  async setup() {
    const auth = useAuthStore()
    if (!auth.isAuthenticated) return
    if (!auth.user) {
      await auth.fetchUser()
    }
  },
})
