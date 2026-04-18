import { ofetch, type FetchOptions } from 'ofetch'
import { toApiError } from './errors'
import { generateRequestId } from './requestId'

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

interface AppFetchOptions extends FetchOptions {
  idempotencyKey?: string
}

export function useApi() {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()

  function buildHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      Accept: 'application/json',
      'X-Client-Version': (config.public.appEnv as string) || 'dev',
    }

    const token = authStore.token || useCookie('auth_token').value || ''
    if (token) headers.Authorization = `Bearer ${token}`

    // Tenant is inferred from the authenticated Sanctum user on the server —
    // no explicit X-Tenant-ID header is needed for normal app/portal users.

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
      const requestId = generateRequestId()
      options.headers = {
        ...options.headers,
        ...buildHeaders(),
        'X-Request-ID': requestId,
      }
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
      if (response.status === 429 && import.meta.client) {
        try {
          useToastStore().error(response._data?.message || 'Rate limited. Please retry shortly.')
        } catch {}
      }
    },
  })

  async function request<T>(method: Method, url: string, body?: any, opts?: AppFetchOptions): Promise<T> {
    try {
      const shouldRetry = method === 'GET'
      const headers: Record<string, string> = { ...(opts?.headers as any) }
      if (method !== 'GET' && opts?.idempotencyKey) {
        headers['Idempotency-Key'] = opts.idempotencyKey
      }
      return (await api<T>(url, {
        method,
        body,
        retry: shouldRetry ? 2 : 0,
        ...opts,
        headers,
      } as FetchOptions)) as T
    } catch (e) {
      throw toApiError(e)
    }
  }

  return {
    get:    <T>(url: string, opts?: AppFetchOptions) => request<T>('GET', url, undefined, opts),
    post:   <T>(url: string, body?: any, opts?: AppFetchOptions) => request<T>('POST', url, body, opts),
    put:    <T>(url: string, body?: any, opts?: AppFetchOptions) => request<T>('PUT', url, body, opts),
    patch:  <T>(url: string, body?: any, opts?: AppFetchOptions) => request<T>('PATCH', url, body, opts),
    delete: <T>(url: string, opts?: AppFetchOptions) => request<T>('DELETE', url, undefined, opts),
    raw: api,
    getHeaders: buildHeaders,
  }
}
