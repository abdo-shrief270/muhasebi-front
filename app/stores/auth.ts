import { defineStore } from 'pinia'
import type { User, TenantInfo, LoginPayload, LoginResponse, MeResponse } from '~/shared/types/auth'
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

  const tokenCookie = useCookie<string | null>('auth_token', { maxAge: 60 * 60 * 24 * 30 })
  const roleCookie = useCookie<string | null>('auth_role', { maxAge: 60 * 60 * 24 * 30 })

  const isAuthenticated = computed(() => !!token.value)
  const isClient = computed(() => (user.value?.role || roleCookie.value) === 'client')

  function setToken(t: string, userData: User) {
    user.value = userData
    token.value = t

    tokenCookie.value = t
    roleCookie.value = userData.role || null

    if (import.meta.client) {
      localStorage.setItem('auth_user', JSON.stringify(userData))
    }
  }

  function clearAuth() {
    user.value = null
    tenant.value = null
    permissions.value = []
    twoFactorEnabled.value = false
    token.value = null

    tokenCookie.value = null
    roleCookie.value = null

    useSubscription().reset()

    if (import.meta.client) {
      localStorage.removeItem('auth_user')
      localStorage.removeItem('auth_tenant')
    }
  }

  function loadFromStorage() {
    if (tokenCookie.value) token.value = tokenCookie.value

    if (import.meta.client) {
      const storedUser = localStorage.getItem('auth_user')
      if (storedUser) {
        try { user.value = JSON.parse(storedUser) } catch {}
      }
      const storedTenant = localStorage.getItem('auth_tenant')
      if (storedTenant) {
        try { tenant.value = JSON.parse(storedTenant) } catch {}
      }
    }
  }

  async function login(payload: LoginPayload) {
    const api = useApi()
    const response = await api.post<LoginResponse>(ENDPOINTS.auth.login, payload)
    setToken(response.data.token, response.data.user)
    // Login response carries user+token only; tenant/permissions/subscription
    // arrive via fetchUser() + subscription.fetch().
    await fetchUser()
    await useSubscription().fetch()
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
      user.value = response.data.user
      tenant.value = response.data.tenant
      permissions.value = response.data.permissions ?? []
      twoFactorEnabled.value = !!response.data.two_factor_enabled
      roleCookie.value = response.data.user.role || null

      if (import.meta.client) {
        localStorage.setItem('auth_user', JSON.stringify(response.data.user))
        localStorage.setItem('auth_tenant', JSON.stringify(response.data.tenant))
      }
    } catch {}
  }

  loadFromStorage()

  return {
    user, tenant, permissions, twoFactorEnabled,
    token,
    isAuthenticated, isClient,
    setToken, clearAuth, login, verify2fa, logout, fetchUser,
  }
})
