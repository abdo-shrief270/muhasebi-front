import { ofetch, type FetchOptions } from 'ofetch'
import { toApiError } from './errors'
import { generateIdempotencyKey, generateRequestId } from './requestId'
import { isMoneyMutationUrl } from './idempotentPaths'

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

// See docs/UI_UX_SPEC.md section 13.2 for the authoritative contract.
//
// Idempotency rules:
//   - Every POST/PUT/PATCH against a money-mutation URL gets an Idempotency-Key.
//   - Callers can opt in explicitly via `opts.idempotencyKey` (wins over auto).
//   - Callers can reuse a key across retries via `opts.idempotencyActionId`,
//     which the useIdempotencyStore caches for 30 seconds.
//   - GET/DELETE never get an Idempotency-Key (servers reject non-mutating ones).
export interface AppFetchOptions extends FetchOptions {
  /** Explicit UUID v4 — wins over every auto path. */
  idempotencyKey?: string
  /** Stable action id for keyFor() caching; used when idempotencyKey is not set. */
  idempotencyActionId?: string
  /** Set to true to force auto-idempotency on a path not in the built-in list. */
  forceIdempotency?: boolean
  /** Set to false to skip the 429/500 toast for this request (caller handles UX). */
  suppressErrorToast?: boolean
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

    try {
      const { locale } = useI18n()
      headers['Accept-Language'] = locale.value
    } catch {
      headers['Accept-Language'] = 'ar'
    }

    const tz = resolveTimezone(authStore)
    if (tz) headers['X-Timezone'] = tz

    return headers
  }

  function handleResponseError(response: { status: number; _data?: { message?: string; code?: string; error?: string } | undefined; headers?: Headers }, suppressed: boolean) {
    if (!import.meta.client) return

    if (response.status === 401) {
      authStore.clearAuth()
      try { useSubscription().reset() } catch {}
      if (!window.location.pathname.startsWith('/auth')) {
        const redirect = encodeURIComponent(window.location.pathname + window.location.search)
        navigateTo(`/auth/login?redirect=${redirect}`)
      }
      return
    }

    if (response.status === 403) {
      // 2FA enrollment is a specific 403 variant; route to the flow rather than toasting.
      if (response._data?.code === '2fa_required') {
        navigateTo('/settings/security')
        return
      }
      if (!suppressed) {
        try { useAppToast().error(response._data?.message || 'Permission denied') } catch {}
      }
      return
    }

    if (response.status === 422) {
      // Field errors are the caller's job — surface through thrown ApiError.fieldErrors.
      return
    }

    if (response.status === 409 && response._data?.error === 'request_in_progress') {
      // Concurrent idempotent submission; backend holds a 30s lock. Callers decide
      // whether to retry; UI surfaces via the thrown ApiError.
      return
    }

    if (response.status === 429) {
      if (suppressed) return
      const retryAfter = readRetryAfter(response.headers)
      const suffix = retryAfter ? ` Retry in ${retryAfter}s.` : ''
      try {
        useAppToast().warning(response._data?.message || `Rate limited.${suffix}`)
      } catch {}
      return
    }

    if (response.status >= 500) {
      if (suppressed) return
      try {
        useAppToast().error(response._data?.message || 'Server error. Our team has been notified.')
      } catch {}
    }
  }

  const api = ofetch.create({
    baseURL: config.public.apiBase as string,
    retry: 1,                                // spec §13.2
    retryDelay: 300,
    retryStatusCodes: [408, 425, 429, 500, 502, 503, 504],
    timeout: 30_000,

    onRequest({ options }) {
      options.headers = {
        ...options.headers,
        ...buildHeaders(),
        'X-Request-ID': generateRequestId(),
      }
    },
  })

  async function request<T>(method: Method, url: string, body?: unknown, opts?: AppFetchOptions): Promise<T> {
    try {
      const headers: Record<string, string> = { ...((opts?.headers as Record<string, string>) ?? {}) }

      const wantsIdempotency =
        method !== 'GET' && method !== 'DELETE' &&
        (opts?.forceIdempotency || isMoneyMutationUrl(url))

      if (wantsIdempotency) {
        if (opts?.idempotencyKey) {
          headers['Idempotency-Key'] = opts.idempotencyKey
        } else if (opts?.idempotencyActionId) {
          headers['Idempotency-Key'] = useIdempotencyStore().keyFor(opts.idempotencyActionId)
        } else {
          headers['Idempotency-Key'] = generateIdempotencyKey()
        }
      } else if (opts?.idempotencyKey) {
        // Caller explicitly set a key on a non-mutation path — still honor it.
        headers['Idempotency-Key'] = opts.idempotencyKey
      }

      return (await api<T>(url, {
        method,
        body: body as FetchOptions['body'],
        retry: method === 'GET' ? 1 : 0,
        ...opts,
        headers,
        onResponseError: ({ response }) => handleResponseError(response, opts?.suppressErrorToast ?? false),
      } as FetchOptions)) as T
    } catch (e) {
      throw toApiError(e)
    }
  }

  return {
    get:    <T>(url: string, opts?: AppFetchOptions)                   => request<T>('GET',    url, undefined, opts),
    post:   <T>(url: string, body?: unknown, opts?: AppFetchOptions)   => request<T>('POST',   url, body,      opts),
    put:    <T>(url: string, body?: unknown, opts?: AppFetchOptions)   => request<T>('PUT',    url, body,      opts),
    patch:  <T>(url: string, body?: unknown, opts?: AppFetchOptions)   => request<T>('PATCH',  url, body,      opts),
    delete: <T>(url: string, opts?: AppFetchOptions)                   => request<T>('DELETE', url, undefined, opts),
    raw: api,
    getHeaders: buildHeaders,
  }
}

function resolveTimezone(authStore: ReturnType<typeof useAuthStore>): string | null {
  const user = authStore.user as (typeof authStore.user & { tenant?: { timezone?: string } }) | null
  const fromUser = user?.timezone
  const fromTenant = user?.tenant?.timezone
  const fromEnv = import.meta.client ? Intl.DateTimeFormat().resolvedOptions().timeZone : null
  return fromTenant || fromUser || fromEnv || null
}

function readRetryAfter(headers?: Headers): number | null {
  if (!headers) return null
  const raw = headers.get('Retry-After')
  if (!raw) return null
  const n = parseInt(raw, 10)
  return Number.isFinite(n) ? n : null
}
