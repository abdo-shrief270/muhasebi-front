import type { Document } from '~/shared/types/document'
import { documentService, type DocumentListParams } from '~/features/documents/services/documentService'
import { invalidateQuery, useMutation, useQuery } from '~/core/api/query'
import { generateRequestId } from '~/core/api/requestId'

export function useDocumentsList(params: Ref<DocumentListParams> | ComputedRef<DocumentListParams>) {
  const svc = documentService()
  return useQuery(() => svc.list(unref(params)), {
    key: () => `documents:list:${JSON.stringify(unref(params))}`,
    staleMs: 20_000,
  })
}

export function useDocumentMutations() {
  const svc = documentService()
  const bust = () => invalidateQuery(/^documents:/)

  return {
    upload: useMutation(async ({ file, data }: { file: File; data?: Record<string, unknown> }) => {
      const r = await svc.upload(file, data, generateRequestId())
      bust()
      return r
    }),
    archive: useMutation(async (id: number) => {
      await svc.archive(id)
      bust()
    }),
    unarchive: useMutation(async (id: number) => {
      await svc.unarchive(id)
      bust()
    }),
    remove: useMutation(async (id: number) => {
      await svc.remove(id)
      bust()
    }),
  }
}

/** Legacy shim. */
export function useDocuments() {
  const svc = documentService()
  const documents = ref<Document[]>([])
  const loading = ref(false)
  const meta = ref({ current_page: 1, last_page: 1, total: 0 })

  async function fetchDocuments(params: Record<string, any> = {}) {
    loading.value = true
    try {
      const data = await svc.list(params as DocumentListParams)
      documents.value = data.data
      meta.value = {
        current_page: data.meta.current_page,
        last_page: data.meta.last_page,
        total: data.meta.total,
      }
    } catch {
      documents.value = []
    } finally {
      loading.value = false
    }
  }

  return {
    documents, loading, meta,
    fetchDocuments,
    uploadDocument:    (file: File, data?: Record<string, any>) => svc.upload(file, data ?? {}, generateRequestId()),
    downloadUrl:       (id: number) => svc.downloadUrl(id),
    archiveDocument:   (id: number) => svc.archive(id),
    unarchiveDocument: (id: number) => svc.unarchive(id),
    deleteDocument:    (id: number) => svc.remove(id),
  }
}
