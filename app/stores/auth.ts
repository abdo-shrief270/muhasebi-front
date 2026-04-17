import { defineStore } from 'pinia'
import type { User, LoginPayload } from '~/shared/types/auth'
import type { SubscriptionSnapshot } from '~/core/subscription/types'

interface LoginResponse {
  message: string
  data: {
    user: User
    token: string
    subscription?: SubscriptionSnapshot
  }
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)

  const tokenCookie = useCookie<string | null>('auth_token', { maxAge: 60 * 60 * 24 * 30 })
  const roleCookie = useCookie<string | null>('auth_role', { maxAge: 60 * 60 * 24 * 30 })
  const tenantCookie = useCookie<string | null>('tenant_id', { maxAge: 60 * 60 * 24 * 30 })

  const isAuthenticated = computed(() => !!token.value)
  const isClient = computed(() => (user.value?.role || roleCookie.value) === 'client')

  function setAuth(userData: User, tokenValue: string) {
    user.value = userData
    token.value = tokenValue

    tokenCookie.value = tokenValue
    roleCookie.value = userData.role || null
    tenantCookie.value = userData.tenant_id ? String(userData.tenant_id) : null

    if (import.meta.client) {
      localStorage.setItem('auth_user', JSON.stringify(userData))
      if (userData.tenant_id) localStorage.setItem('tenant_id', String(userData.tenant_id))
      else localStorage.removeItem('tenant_id')
    }
  }

  function clearAuth() {
    user.value = null
    token.value = null
    tokenCookie.value = null
    roleCookie.value = null
    tenantCookie.value = null

    if (import.meta.client) {
      localStorage.removeItem('auth_user')
      localStorage.removeItem('tenant_id')
      localStorage.removeItem('tenant_info')
    }
  }

  function loadFromStorage() {
    if (tokenCookie.value) token.value = tokenCookie.value

    if (import.meta.client) {
      const storedUser = localStorage.getItem('auth_user')
      if (storedUser) {
        try { user.value = JSON.parse(storedUser) } catch {}
      }
    }
  }

  async function login(payload: LoginPayload) {
    const api = useApi()
    const response = await api.post<LoginResponse>('/login', payload)
    setAuth(response.data.user, response.data.token)
    if (response.data.subscription) useSubscription().hydrate(response.data.subscription)
    await fetchUser()
    return response
  }

  async function logout() {
    try {
      const api = useApi()
      await api.post('/logout')
    } catch {}
    finally {
      clearAuth()
      useSubscription().reset()
    }
  }

  async function fetchUser() {
    try {
      const api = useApi()
      const response = await api.get<{ data: User; subscription?: SubscriptionSnapshot }>('/me')
      user.value = response.data
      roleCookie.value = response.data.role || null
      if (response.subscription) useSubscription().hydrate(response.subscription)
      if (import.meta.client) localStorage.setItem('auth_user', JSON.stringify(response.data))
    } catch {}
  }

  loadFromStorage()

  return {
    user, token,
    isAuthenticated, isClient,
    setAuth, clearAuth, login, logout, fetchUser,
  }
})
