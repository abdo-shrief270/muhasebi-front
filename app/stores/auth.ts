import { defineStore } from 'pinia'
import type { User, TenantInfo, LoginPayload, LoginResponse, MeResponse, RegisterPayload, RegisterResponse } from '~/shared/types/auth'
import { ENDPOINTS } from '~/core/api/endpoints'

/**
 * Aligned with the real backend (BACKEND_QUESTIONS 1.1, 2.2, 9.1):
 *   - `POST /login` returns { message, data: { user, token } } only.
 *     Tenant + permissions come from /me in a subsequent call.
 *   - There is NO `requires_2fa` flag on the login response. 2FA is enforced
 *     downstream via 403 + `code: "2fa_required"` on protected endpoints;
 *     `app/plugins/twoFactor.client.ts` watches for that signal.
 *   - Tenant.features[] is NOT on /me today. Subscription store fetches it
 *     from `/v1/subscription`.
 */
export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const tenant = ref<TenantInfo | null>(null)
  const permissions = ref<string[]>([])
  const twoFactorEnabled = ref(false)
  const token = ref<string | null>(null)
  const isImpersonating = ref(false)

  const tokenCookie = useCookie<string | null>('auth_token', { maxAge: 60 * 60 * 24 * 30 })
  const roleCookie = useCookie<string | null>('auth_role', { maxAge: 60 * 60 * 24 * 30 })
  // Lifetime mirrors the impersonation Sanctum token (1h, see ImpersonationService).
  const impersonationCookie = useCookie<string | null>('auth_impersonating', { maxAge: 60 * 60 })

  const isAuthenticated = computed(() => !!token.value)
  const isClient = computed(() => (user.value?.role || roleCookie.value) === 'client')

  function setToken(t: string, userData: User) {
    user.value = userData
    token.value = t

    tokenCookie.value = t
    roleCookie.value = userData.role || null
  }

  function clearAuth() {
    user.value = null
    tenant.value = null
    permissions.value = []
    twoFactorEnabled.value = false
    token.value = null
    isImpersonating.value = false

    tokenCookie.value = null
    roleCookie.value = null
    impersonationCookie.value = null

    useSubscription().reset()

    // Clean up any legacy localStorage mirror from older app versions so a
    // returning user doesn't hydrate stale PII on next load. `tenant_info`
    // was previously written by useTenantTheme; dropped 2026-04-23.
    if (import.meta.client) {
      localStorage.removeItem('auth_user')
      localStorage.removeItem('auth_tenant')
      localStorage.removeItem('tenant_info')
    }
  }

  /**
   * Restore the in-memory session from the token cookie only. User profile,
   * tenant, and permissions are intentionally NOT persisted client-side —
   * `plugins/session.client.ts` calls fetchUser() on page load to repopulate
   * them from /me so profile data never lives in XSS-readable storage.
   */
  function loadFromStorage() {
    if (tokenCookie.value) token.value = tokenCookie.value
    if (impersonationCookie.value === '1') isImpersonating.value = true

    // Best-effort cleanup of legacy persisted PII (user/tenant/tenant_info)
    // from older app versions. Drop unconditionally so nothing lingers.
    if (import.meta.client) {
      localStorage.removeItem('auth_user')
      localStorage.removeItem('auth_tenant')
      localStorage.removeItem('tenant_info')
    }
  }

  async function login(payload: LoginPayload) {
    const api = useApi()
    const response = await api.post<LoginResponse>(ENDPOINTS.auth.login, payload)
    setToken(response.data.token, response.data.user)
    // Login response carries user+token only; tenant/permissions/features
    // arrive via fetchUser() which also hydrates the subscription store
    // from /me.tenant.features. The dedicated /subscription endpoint is
    // only called by the subscription page when it needs plan + usage.
    await fetchUser()
    return response
  }

  /**
   * /v1/register — creates the tenant + admin user and issues a Sanctum token.
   * The response carries user/tenant/token; we mirror login() and call
   * fetchUser() so /me hydrates permissions and the subscription store
   * before the user lands on /dashboard.
   */
  async function register(payload: RegisterPayload) {
    const api = useApi()
    const response = await api.post<RegisterResponse>(ENDPOINTS.auth.register, payload)
    setToken(response.data.token, response.data.user)
    await fetchUser()
    return response
  }

  /**
   * Used during 2FA ENROLLMENT (user turns on TOTP from the security page).
   * NOT a session-upgrade mechanism — the backend doesn't currently "promote"
   * the Sanctum token on verify (BACKEND_QUESTIONS 1.1). If a protected
   * endpoint returns `code: "2fa_required"`, the user must go through the
   * enrollment flow under /settings/security to persist `two_factor_enabled`.
   */
  async function verify2fa(code: string) {
    const api = useApi()
    await api.post(ENDPOINTS.auth.twoFactor.verify, { code })
    await fetchUser()
  }

  async function logout() {
    try {
      const api = useApi()
      await api.post(ENDPOINTS.auth.logout)
    } catch {}
    finally {
      clearAuth()
    }
  }

  async function fetchUser() {
    try {
      const api = useApi()
      const response = await api.get<MeResponse>(ENDPOINTS.auth.me)
      const { permissions: perms, tenant: t, spatie_roles: _sr, ...userFields } = response.data
      user.value = userFields as User
      tenant.value = t
      permissions.value = perms ?? []
      // /me doesn't return `two_factor_enabled`; the dedicated /2fa/status
      // endpoint is the source of truth. Reset to false here; the security
      // page calls checkStatus() to populate it when needed.
      twoFactorEnabled.value = false
      roleCookie.value = userFields.role || null

      // Hydrate the subscription store from /me.tenant so the nav and
      // access.global middleware work on a single /me round-trip.
      // `features` is the flag→bool map; `plan` is the active sub's plan
      // summary. The dedicated /subscription endpoint is only needed by
      // the subscription page for richer detail (billing cycle, usage).
      const sub = useSubscription()
      if (t?.features) {
        const enabled = Object.entries(t.features)
          .filter(([, on]) => !!on)
          .map(([key]) => key)
        sub.setFeatures(enabled)
      }
      if (t?.plan) {
        sub.setPlan({ slug: t.plan.slug, name: t.plan.name_en ?? t.plan.name_ar ?? null })
      } else {
        sub.setPlan(null)
      }
    } catch {}
  }

  loadFromStorage()

  function startImpersonation() {
    isImpersonating.value = true
    impersonationCookie.value = '1'
  }

  return {
    user, tenant, permissions, twoFactorEnabled,
    token, isImpersonating,
    isAuthenticated, isClient,
    setToken, clearAuth, login, register, verify2fa, logout, fetchUser,
    startImpersonation,
  }
})
