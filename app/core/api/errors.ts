export type ApiErrorCode =
  | 'network'
  | 'timeout'
  | 'unauthorized'
  | 'forbidden'
  | 'not_found'
  | 'validation'
  | 'rate_limited'
  | 'server'
  | 'unknown'

export class ApiError extends Error {
  code: ApiErrorCode
  status: number
  details?: unknown
  fieldErrors?: Record<string, string[]>

  constructor(init: { code: ApiErrorCode; status: number; message: string; details?: unknown; fieldErrors?: Record<string, string[]> }) {
    super(init.message)
    this.name = 'ApiError'
    this.code = init.code
    this.status = init.status
    this.details = init.details
    this.fieldErrors = init.fieldErrors
  }
}

export function toApiError(raw: any): ApiError {
  if (raw instanceof ApiError) return raw

  const status: number = raw?.response?.status ?? raw?.status ?? 0
  const body = raw?.response?._data ?? raw?.data ?? {}
  const message: string = body?.message ?? raw?.message ?? 'Request failed'
  const fieldErrors = body?.errors

  const code: ApiErrorCode =
    status === 0 ? 'network' :
    status === 401 ? 'unauthorized' :
    status === 403 ? 'forbidden' :
    status === 404 ? 'not_found' :
    status === 422 ? 'validation' :
    status === 429 ? 'rate_limited' :
    status >= 500 ? 'server' :
    'unknown'

  return new ApiError({ code, status, message, details: body, fieldErrors })
}
