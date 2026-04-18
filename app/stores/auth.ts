import { defineStore } from 'pinia'
import type { User, TenantInfo, LoginPayload, LoginResponse, MeResponse } from '~/shared/types/auth'
import { ENDPOINTS } from '~/core/api/endpoints'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const tenant = ref<TenantInfo | null>(null)
  const permissions = ref<string[]>([])
  const twoFactorEnabled = ref(false)
  const token = ref<string | null>(null)
  const requires2fa = ref(false)

  const tokenCookie = useCookie<string | null>('auth_token', { maxAge: 60 * 60 * 24 * 30 })
  const roleCookie = useCookie<string | null>('auth_role', { maxAge: 60 * 60 * 24 * 30 })

  const isAuthenticated = computed(() => !!token.value && !requires2fa.value)
  const isClient = computed(() => (user.value?.role || roleCookie.value) === 'client')

  function hydrateSubscriptionFromTenant(t: TenantInfo | null) {
    if (!t) return
    useSubscription().hydrate({
      plan: { slug: t.plan ?? null, name: t.plan ?? null },
      features: t.features ?? [],
    })
  }

  function setAuth(payload: { user: User; tenant: TenantInfo; token: string; requires_2fa?: boolean }) {
    user.value = payload.user
    tenant.value = payload.tenant
    token.value = payload.token
    requires2fa.value = !!payload.requires_2fa

    tokenCookie.value = payload.token
    roleCookie.value = payload.user.role || null

    hydrateSubscriptionFromTenant(payload.tenant)

    if (import.meta.client) {
      localStorage.setItem('auth_user', JSON.stringify(payload.user))
      if (payload.tenant) localStorage.setItem('auth_tenant', JSON.stringify(payload.tenant))
    }
  }

  function clearAuth() {
    user.value = null
    tenant.value = null
    permissions.value = []
    twoFactorEnabled.value = false
    token.value = null
    requires2fa.value = false

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
        try {
          tenant.value = JSON.parse(storedTenant)
          hydrateSubscriptionFromTenant(tenant.value)
        } catch {}
      }
    }
  }

  async function login(payload: LoginPayload) {
    const api = useApi()
    const response = await api.post<LoginResponse>(ENDPOINTS.auth.login, payload)
    setAuth(response.data)
    if (!response.data.requires_2fa) await fetchUser()
    return response
  }

  async function verify2fa(code: string) {
    const api = useApi()
    await api.post(ENDPOINTS.auth.twoFactor.verify, { code })
    requires2fa.value = false
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

      hydrateSubscriptionFromTenant(response.data.tenant)

      if (import.meta.client) {
        localStorage.setItem('auth_user', JSON.stringify(response.data.user))
        localStorage.setItem('auth_tenant', JSON.stringify(response.data.tenant))
      }
    } catch {}
  }

  loadFromStorage()

  return {
    user, tenant, permissions, twoFactorEnabled,
    token, requires2fa,
    isAuthenticated, isClient,
    setAuth, clearAuth, login, verify2fa, logout, fetchUser,
  }
})
