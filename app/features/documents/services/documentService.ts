import { ENDPOINTS } from '~/core/api/endpoints'
import type { BaseListParams, ItemResponse, ListResponse } from '~/shared/types/common'

export type DocumentCategory =
  | 'tax_document' | 'invoice' | 'receipt' | 'contract'
  | 'financial_statement' | 'correspondence' | 'working_paper' | 'other'

export interface Document {
  id: number
  name: string
  description: string | null
  category: DocumentCategory | null
  mime_type: string
  size_bytes: number
  size_human: string
  sha256: string
  client_id: number | null
  uploaded_by: number | null
  is_archived: boolean
  metadata: Record<string, unknown> | null
  download_url: string
  created_at: string
  updated_at: string
}

export interface DocumentQuota {
  max_bytes: number
  used_bytes: number
  max_files: number
  used_files: number
  usage_percent: number
  remaining_bytes: number
  max_bytes_human: string
  used_bytes_human: string
}

export interface DocumentListParams extends BaseListParams {
  client_id?: number
  category?: DocumentCategory
  is_archived?: boolean
  uploaded_by?: number
  from?: string
  to?: string
  sort_direction?: 'asc' | 'desc'
}

export interface BulkUploadResult {
  data: Document[]
  errors: Array<{ file: string; error: string }>
  uploaded: number
  failed: number
}

function toQuery(p: Record<string, unknown>): string {
  const q = new URLSearchParams()
  for (const [k, v] of Object.entries(p)) {
    if (v === '' || v == null) continue
    q.set(k, String(v))
  }
  return q.toString() ? `?${q}` : ''
}

export function documentService() {
  const api = useApi()
  const config = useRuntimeConfig()

  return {
    quota: () =>
      api.get<ItemResponse<DocumentQuota>>(ENDPOINTS.documents.quota).then(r => r.data),

    list: (params: DocumentListParams = {}) =>
      api.get<ListResponse<Document>>(`${ENDPOINTS.documents.list}${toQuery(params)}`),
    get: (id: number) =>
      api.get<ItemResponse<Document>>(ENDPOINTS.documents.one(id)).then(r => r.data),
    update: (id: number, form: Partial<Pick<Document, 'name' | 'description' | 'category' | 'metadata' | 'client_id'>>) =>
      api.put<ItemResponse<Document>>(ENDPOINTS.documents.one(id), form).then(r => r.data),
    remove: (id: number) =>
      api.delete<void>(ENDPOINTS.documents.one(id)),

    archive: (id: number) =>
      api.post<ItemResponse<Document>>(ENDPOINTS.documents.archive(id)).then(r => r.data),
    unarchive: (id: number) =>
      api.post<ItemResponse<Document>>(ENDPOINTS.documents.unarchive(id)).then(r => r.data),

    upload: async (file: File, meta: { client_id?: number; category?: DocumentCategory; description?: string; metadata?: Record<string, unknown> } = {}, idempotencyKey?: string) => {
      const fd = new FormData()
      fd.append('file', file)
      if (meta.client_id != null) fd.append('client_id', String(meta.client_id))
      if (meta.category) fd.append('category', meta.category)
      if (meta.description) fd.append('description', meta.description)
      if (meta.metadata) fd.append('metadata', JSON.stringify(meta.metadata))

      const headers = api.getHeaders()
      delete (headers as any)['Content-Type']
      if (idempotencyKey) headers['Idempotency-Key'] = idempotencyKey

      const res = await api.raw<ItemResponse<Document>>(ENDPOINTS.documents.list, {
        method: 'POST', body: fd, headers,
      })
      return res.data
    },

    bulkUpload: async (files: File[], meta: { client_id?: number; category?: DocumentCategory } = {}, idempotencyKey?: string) => {
      if (files.length > 10) throw new Error('bulk upload supports up to 10 files per request')
      const fd = new FormData()
      for (const f of files) fd.append('files[]', f)
      if (meta.client_id != null) fd.append('client_id', String(meta.client_id))
      if (meta.category) fd.append('category', meta.category)

      const headers = api.getHeaders()
      delete (headers as any)['Content-Type']
      if (idempotencyKey) headers['Idempotency-Key'] = idempotencyKey

      return api.raw<BulkUploadResult>(ENDPOINTS.documents.bulk, {
        method: 'POST', body: fd, headers,
      })
    },

    downloadUrl: (id: number) => {
      const token = import.meta.client ? localStorage.getItem('auth_token') : ''
      return `${config.public.apiBase}${ENDPOINTS.documents.download(id)}?token=${token ?? ''}`
    },
  }
}
