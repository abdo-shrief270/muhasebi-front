/**
 * Composable for fetching CMS pages from the backend.
 * Pages include: terms, privacy, changelog, about, etc.
 */
export function usePages() {
  const api = useApi()

  /** Public: fetch a page by slug */
  async function getPage(slug: string) {
    try {
      const data = await api.get<{ data: CmsPage }>(`/pages/${slug}`)
      return data.data
    } catch {
      return null
    }
  }

  /** Admin: list all pages */
  async function listPages(params?: { page?: number; search?: string }) {
    const q = new URLSearchParams()
    if (params?.page) q.set('page', String(params.page))
    if (params?.search) q.set('search', params.search)
    const qs = q.toString()
    return api.get<PaginatedCmsPages>(`/admin/pages${qs ? `?${qs}` : ''}`)
  }

  /** Admin: get single page */
  async function getAdminPage(id: number) {
    return api.get<{ data: CmsPage }>(`/admin/pages/${id}`)
  }

  /** Admin: create page */
  async function createPage(payload: Partial<CmsPage>) {
    return api.post<{ data: CmsPage }>('/admin/pages', payload)
  }

  /** Admin: update page */
  async function updatePage(id: number, payload: Partial<CmsPage>) {
    return api.put<{ data: CmsPage }>(`/admin/pages/${id}`, payload)
  }

  /** Admin: delete page */
  async function deletePage(id: number) {
    return api.delete(`/admin/pages/${id}`)
  }

  return { getPage, listPages, getAdminPage, createPage, updatePage, deletePage }
}

// Types
export interface CmsPage {
  id: number
  slug: string
  title: { ar: string; en: string }
  content: { ar: string; en: string }
  meta_description: { ar: string; en: string }
  is_published: boolean
  created_at: string
  updated_at: string
}

export interface PaginatedCmsPages {
  data: CmsPage[]
  meta: {
    current_page: number
    last_page: number
    total: number
  }
}
