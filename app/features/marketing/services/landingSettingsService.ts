import { ENDPOINTS } from '~/core/api/endpoints'
import type { ItemResponse } from '~/shared/types/common'

export interface LandingPageSettings {
  enabled: boolean
  hero_title: { ar: string; en: string }
  hero_subtitle?: { ar: string; en: string }
  logo_url: string | null
  primary_color: string | null
  secondary_color: string | null
  pages: Array<{
    slug: string
    title: string
    body: string
  }>
}

export function landingSettingsService() {
  const api = useApi()
  return {
    get: () =>
      api.get<ItemResponse<LandingPageSettings>>(ENDPOINTS.landingPageSettings.root).then(r => r.data),
    update: (payload: Partial<LandingPageSettings>) =>
      api.put<ItemResponse<LandingPageSettings>>(ENDPOINTS.landingPageSettings.root, payload).then(r => r.data),
  }
}
