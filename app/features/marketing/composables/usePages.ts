import type { CmsPage } from '~/features/marketing/services/marketingService'

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
