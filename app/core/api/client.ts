import { ofetch, type FetchOptions } from 'ofetch'
import { toApiError } from './errors'

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export function useApi() {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()

  function buildHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      Accept: 'application/json',
    }

    const token = authStore.token || useCookie('auth_token').value || ''
    if (token) headers.Authorization = `Bearer ${token}`

    const tenantId = useTenantId()
    if (tenantId) headers['X-Tenant'] = tenantId

    try {
      const { locale } = useI18n()
      headers['Accept-Language'] = locale.value
    } catch {
      headers['Accept-Language'] = 'ar'
    }
    return headers
  }

  const api = ofetch.create({
    baseURL: config.public.apiBase as string,
    retry: 2,
    retryDelay: 300,
    retryStatusCodes: [408, 425, 429, 500, 502, 503, 504],
    timeout: 30_000,

    onRequest({ options }) {
      options.headers = { ...options.headers, ...buildHeaders() }
    },

    onResponseError({ response }) {
      if (response.status === 401) {
        authStore.clearAuth()
        useSubscription().reset()
        if (import.meta.client) navigateTo('/auth/login')
      }
      if (response.status === 403 && import.meta.client) {
        try {
          useToastStore().error(response._data?.message || 'Insufficient permissions.')
        } catch {}
      }
    },
  })

  async function request<T>(method: Method, url: string, body?: any, opts?: FetchOptions): Promise<T> {
    try {
      const shouldRetry = method === 'GET'
      return (await api<T>(url, {
        method,
        body,
        retry: shouldRetry ? 2 : 0,
        ...opts,
      } as FetchOptions)) as T
    } catch (e) {
      throw toApiError(e)
    }
  }

  return {
    get:    <T>(url: string, opts?: FetchOptions) => request<T>('GET', url, undefined, opts),
    post:   <T>(url: string, body?: any, opts?: FetchOptions) => request<T>('POST', url, body, opts),
    put:    <T>(url: string, body?: any, opts?: FetchOptions) => request<T>('PUT', url, body, opts),
    patch:  <T>(url: string, body?: any, opts?: FetchOptions) => request<T>('PATCH', url, body, opts),
    delete: <T>(url: string, opts?: FetchOptions) => request<T>('DELETE', url, undefined, opts),
    raw: api,
  }
}
