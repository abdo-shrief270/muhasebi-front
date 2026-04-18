/**
 * Shapes for /v1/login, /v1/me, /v1/register response envelopes,
 * aligned with docs/01-authentication.md.
 */

export interface TenantInfo {
  id: number
  name: string
  slug: string
  email: string | null
  phone: string | null
  logo_path: string | null
  tagline: string | null
  primary_color: string | null
  secondary_color: string | null
  city: string | null
  /** Plan slug returned by backend (display-only). */
  plan?: string | null
  /** Feature flags the tenant has access to. Authoritative for gating. */
  features?: string[]
}

export interface User {
  id: number
  name: string
  email: string
  phone: string | null
  role: string
  /** Permission slugs the user holds — top-level on /me, not nested in user. */
  permissions?: string[]
  locale: 'ar' | 'en' | string
  timezone: string | null
  is_active: boolean
  tenant_id: number | null
  client_id: number | null
  last_login_at: string | null
  created_at: string
}

export interface MeResponse {
  data: {
    user: User
    tenant: TenantInfo
    permissions: string[]
    two_factor_enabled: boolean
  }
}

export interface LoginPayload {
  email: string
  password: string
  device_name?: string
}

export interface LoginResponse {
  data: {
    user: User
    tenant: TenantInfo
    token: string
    requires_2fa: boolean
  }
}

export interface RegisterPayload {
  company_name: string
  first_name: string
  last_name: string
  email: string
  password: string
  password_confirmation: string
  phone?: string
  city?: string
}

export interface AuthResponse {
  user: User
  token: string
}

export interface ApiError {
  message: string
  errors?: Record<string, string[]>
}
