import { ENDPOINTS } from '~/core/api/endpoints'
import type { Branding, BrandingAssetUploadResponse, BrandingAssets, BrandingResponse, BrandingUpdate } from '~/core/theme/types'

/**
 * Per-tenant branding API client. Reads the current tenant's effective
 * theme (defaults merged with stored overrides), persists partial patches
 * (deep-merged server-side), and resets the overrides back to platform
 * defaults.
 */
export function brandingService() {
  const api = useApi()

  return {
    get: () =>
      api.get<BrandingResponse>(ENDPOINTS.branding.root).then(r => r.data),

    update: (patch: BrandingUpdate, idempotencyKey?: string) =>
      api
        .put<BrandingResponse & { message: string }>(ENDPOINTS.branding.root, patch, { idempotencyKey })
        .then(r => r.data),

    /** Clear overrides and return to platform defaults. */
    reset: () =>
      api.delete<BrandingResponse & { message: string }>(ENDPOINTS.branding.root).then(r => r.data),

    /**
     * Upload a logo or favicon. Returns the new public URL + the full
     * asset map so the form can re-render the preview without a refetch.
     *
     * Multipart/form-data — we drop the JSON Content-Type the api client
     * usually sets so the browser can write the correct boundary.
     */
    uploadAsset: (kind: 'logo' | 'favicon', file: File) => {
      const fd = new FormData()
      fd.append('file', file)
      const headers = api.getHeaders()
      delete (headers as any)['Content-Type']
      return api.raw<BrandingAssetUploadResponse>(ENDPOINTS.branding.asset(kind), {
        method: 'POST',
        body: fd,
        headers,
      })
    },

    deleteAsset: (kind: 'logo' | 'favicon') =>
      api.delete<{ data: { assets: BrandingAssets }; message: string }>(ENDPOINTS.branding.asset(kind)),
  }
}

export type { Branding, BrandingAssets, BrandingUpdate, BrandingResponse }
