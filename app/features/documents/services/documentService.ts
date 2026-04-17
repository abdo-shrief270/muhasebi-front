import type { Document } from '~/shared/types/document'
import type { PaginatedResponse } from '~/shared/types/client'

export interface DocumentListParams {
  page?: number
  search?: string
  type?: string
  client_id?: number
  archived?: boolean
  [key: string]: string | number | boolean | undefined
}

function toQuery(params: DocumentListParams): string {
  const q = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v === '' || v == null) continue
    q.set(k, String(v))
  }
  const s = q.toString()
  return s ? `?${s}` : ''
}

export function documentService() {
  const api = useApi()
  const config = useRuntimeConfig()

  return {
    list(params: DocumentListParams = {}) {
      return api.get<PaginatedResponse<Document>>(`/documents${toQuery(params)}`)
    },
    async upload(file: File, data: Record<string, unknown> = {}, idempotencyKey?: string): Promise<Document> {
      const formData = new FormData()
      formData.append('file', file)
      for (const [k, v] of Object.entries(data)) {
        if (v != null && v !== '') formData.append(k, String(v))
      }
      const headers = api.getHeaders()
      delete (headers as any)['Content-Type']
      if (idempotencyKey) headers['Idempotency-Key'] = idempotencyKey

      const response = await $fetch<{ data: Document }>(`${config.public.apiBase}/documents`, {
        method: 'POST',
        body: formData,
        headers,
      })
      return response.data
    },
    downloadUrl(id: number): string {
      const tenantId = useTenantId()
      const token = import.meta.client ? localStorage.getItem('auth_token') : ''
      return `${config.public.apiBase}/documents/${id}/download?token=${token}&tenant=${tenantId}`
    },
    archive(id: number) {
      return api.post<void>(`/documents/${id}/archive`)
    },
    unarchive(id: number) {
      return api.post<void>(`/documents/${id}/unarchive`)
    },
    remove(id: number) {
      return api.delete<void>(`/documents/${id}`)
    },
  }
}
