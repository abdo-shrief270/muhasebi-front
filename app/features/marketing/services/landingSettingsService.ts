import { ENDPOINTS } from '~/core/api/endpoints'
import type { ItemResponse } from '~/shared/types/common'

/**
 * Shape of the `data` object inside GET/PUT `/landing-page-settings`. Verified
 * against `App\Http\Resources\LandingPageSettingsResource`.
 */
export interface LandingPageSettings {
  name: string
  slug: string
  tagline: string | null
  description: string | null
  primary_color: string | null
  secondary_color: string | null
  logo_path: string | null
  hero_image_path: string | null
  is_landing_page_active: boolean
  landing_page_url: string
}

/**
 * Fields accepted by `PUT /landing-page-settings` per
 * `App\Http\Requests\Tenant\UpdateLandingPageRequest`. `name` and `slug` are
 * intentionally omitted — those are identity fields the tenant cannot
 * self-rename through this endpoint.
 */
export interface LandingPageUpdatePayload {
  tagline?: string | null
  description?: string | null
  primary_color?: string | null
  secondary_color?: string | null
  logo_path?: string | null
  hero_image_path?: string | null
  is_landing_page_active?: boolean
}

export function landingSettingsService() {
  const api = useApi()
  return {
    get: () =>
      api.get<ItemResponse<LandingPageSettings>>(ENDPOINTS.landingPageSettings.root).then(r => r.data),
    update: (payload: LandingPageUpdatePayload) =>
      api.put<ItemResponse<LandingPageSettings>>(ENDPOINTS.landingPageSettings.root, payload).then(r => r.data),
  }
}
