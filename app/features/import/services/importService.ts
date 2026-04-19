import { ENDPOINTS } from '~/core/api/endpoints'
import type { BaseListParams, ItemResponse, ListResponse } from '~/shared/types/common'

export type ImportType =
  | 'clients' | 'vendors' | 'products' | 'accounts'
  | 'invoices' | 'bills' | 'opening_balances' | 'journal_entries'

export type MatchStrategy = 'skip' | 'update' | 'upsert'
export type ImportStatus = 'queued' | 'running' | 'completed' | 'failed'

export interface ImportJob {
  id: number
  type: ImportType
  status: ImportStatus
  file_name: string
  total_rows: number
  processed: number
  imported_count: number
  error_count: number
  errors: Array<{ row: number; field?: string; message: string }>
  started_at: string | null
  completed_at: string | null
  created_at: string
}

export interface ImportOptions {
  import_type: ImportType
  match_strategy?: MatchStrategy
  dry_run?: boolean
  mapping?: Record<string, string>
  options?: Record<string, unknown>
}

export interface ImportListParams extends BaseListParams {
  type?: ImportType
  status?: ImportStatus
}

function toQuery(p: Record<string, unknown>): string {
  const q = new URLSearchParams()
  for (const [k, v] of Object.entries(p)) {
    if (v === '' || v == null) continue
    q.set(k, String(v))
  }
  return q.toString() ? `?${q}` : ''
}

export function importService() {
  const api = useApi()
  const config = useRuntimeConfig()

  return {
    list: (params: ImportListParams = {}) =>
      api.get<ListResponse<ImportJob>>(`${ENDPOINTS.imports.list}${toQuery(params)}`),
    get: (id: number) =>
      api.get<ItemResponse<ImportJob>>(ENDPOINTS.imports.one(id)).then(r => r.data),

    submit: (file: File, opts: ImportOptions, idempotencyKey: string) => {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('import_type', opts.import_type)
      if (opts.match_strategy) fd.append('match_strategy', opts.match_strategy)
      if (opts.dry_run != null) fd.append('dry_run', String(opts.dry_run))
      if (opts.mapping) fd.append('mapping', JSON.stringify(opts.mapping))
      if (opts.options) fd.append('options', JSON.stringify(opts.options))

      const headers = api.getHeaders()
      delete (headers as any)['Content-Type']
      headers['Idempotency-Key'] = idempotencyKey

      return api.raw<ItemResponse<ImportJob>>(ENDPOINTS.imports.create, {
        method: 'POST', body: fd, headers,
      })
    },

    /** Absolute URL to download a CSV template for a given type. */
    templateUrl: (type: ImportType) =>
      `${config.public.apiBase}${ENDPOINTS.imports.template(type)}`,
  }
}
