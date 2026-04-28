/**
 * Per-tenant theme contract. Mirrors `app/Domain/Tenant/Services/TenantBrandingService::defaults()`
 * on the backend — keep them in sync. Test in branding.test.ts asserts shape parity.
 *
 * Effective payload always has every key set (defaults merged onto overrides).
 * Overrides may have any subset; null leaves are stripped server-side.
 */

export type NeutralTone = 'cool' | 'warm' | 'neutral'
export type TypeScale = 'compact' | 'default' | 'comfortable'
export type RadiusScale = 'sharp' | 'default' | 'rounded'
export type ShadowScale = 'flat' | 'default' | 'heavy'

export interface BrandingColors {
  primary: string
  secondary: string
  success: string
  warning: string
  danger: string
  info: string
  neutral_tone: NeutralTone
}

export interface BrandingTypography {
  /** Free-form Google Fonts family name, e.g. "Inter" or "Cairo". */
  font_latin: string
  font_arabic: string
  font_mono: string
  scale: TypeScale
}

export interface BrandingShape {
  radius_scale: RadiusScale
  shadow_scale: ShadowScale
}

export interface BrandingMotion {
  /** Master switch. When false, all transitions collapse to instant. */
  enabled: boolean
}

export interface Branding {
  colors: BrandingColors
  typography: BrandingTypography
  shape: BrandingShape
  motion: BrandingMotion
}

/** Public-disk URLs + storage paths for tenant logo + favicon. */
export interface BrandingAssets {
  logo_path:    string | null
  logo_url:     string | null
  favicon_path: string | null
  favicon_url:  string | null
}

/** Server response from /v1/branding. */
export interface BrandingResponse {
  data: {
    effective: Branding
    overrides: DeepPartial<Branding>
    defaults?: Branding
    assets?:   BrandingAssets
  }
}

/** Server response from POST /v1/branding/asset/{kind}. */
export interface BrandingAssetUploadResponse {
  data: {
    path:   string
    url:    string
    assets: BrandingAssets
  }
  message: string
}

/** Update payload — every key is optional, deep-merged server-side. */
export type BrandingUpdate = DeepPartial<Branding>

type DeepPartial<T> = T extends object ? { [P in keyof T]?: DeepPartial<T[P]> } : T
