export function usePages() {
  const api = useApi()

  async function getPage(slug: string) {
    try {
      const data = await api.get<{ data: CmsPage }>(`/pages/${slug}`)
      return data.data
    } catch { return null }
  }

  return { getPage }
}

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
