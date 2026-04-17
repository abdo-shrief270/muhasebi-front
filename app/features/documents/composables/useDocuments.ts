import type { Document } from '~/shared/types/document'
import type { PaginatedResponse } from '~/shared/types/client'

export function useDocuments() {
  const api = useApi()
  const config = useRuntimeConfig()
  const documents = ref<Document[]>([])
  const loading = ref(false)
  const meta = ref({ current_page: 1, last_page: 1, total: 0 })

  async function fetchDocuments(params: Record<string, any> = {}) {
    loading.value = true
    try {
      const query = new URLSearchParams()
      Object.entries(params).forEach(([k, v]) => { if (v !== '' && v != null) query.set(k, String(v)) })
      const data = await api.get<PaginatedResponse<Document>>(`/documents?${query}`)
      documents.value = data.data
      meta.value = { current_page: data.meta.current_page, last_page: data.meta.last_page, total: data.meta.total }
    } catch { documents.value = [] }
    finally { loading.value = false }
  }

  async function uploadDocument(file: File, data: Record<string, any> = {}): Promise<Document> {
    const formData = new FormData()
    formData.append('file', file)
    Object.entries(data).forEach(([k, v]) => { if (v) formData.append(k, String(v)) })

    // Use shared headers from useApi to ensure X-Tenant is always included
    const headers = api.getHeaders()
    // Remove Accept header — let browser set multipart content-type
    delete (headers as any)['Content-Type']

    const response = await $fetch<{ data: Document }>(`${config.public.apiBase}/documents`, {
      method: 'POST',
      body: formData,
      headers,
    })
    return response.data
  }

  function downloadUrl(id: number): string {
    const tenantId = useTenantId()
    const token = import.meta.client ? localStorage.getItem('auth_token') : ''
    return `${config.public.apiBase}/documents/${id}/download?token=${token}&tenant=${tenantId}`
  }

  async function archiveDocument(id: number): Promise<void> {
    await api.post(`/documents/${id}/archive`)
  }

  async function unarchiveDocument(id: number): Promise<void> {
    await api.post(`/documents/${id}/unarchive`)
  }

  async function deleteDocument(id: number): Promise<void> {
    await api.delete(`/documents/${id}`)
  }

  return { documents, loading, meta, fetchDocuments, uploadDocument, downloadUrl, archiveDocument, unarchiveDocument, deleteDocument }
}
