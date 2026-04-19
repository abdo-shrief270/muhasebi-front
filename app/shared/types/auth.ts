/**
 * Shapes for /v1/login, /v1/me, /v1/register response envelopes.
 *
 * Reconciled with the real backend on 2026-04-19 (see docs/BACKEND_QUESTIONS.md):
 *   - `POST /login` returns { message, data: { user, token } }. No `tenant`, no
 *     `requires_2fa`, no `permissions` — despite what docs/01 claims.
 *   - `GET /me` returns { data: { user, tenant, permissions, two_factor_enabled } }.
 *     `tenant` here does NOT carry plan or features[] yet; fetch via /subscription.
 *   - 2FA enforcement is driven by a 403 + `code: "2fa_required"` response from
 *     any protected endpoint when the user is admin/super-admin without 2FA set up.
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
  // NOTE (BACKEND_QUESTIONS 9.1): `plan` + `features` are NOT on the /me.tenant
  // payload today. They live on `/v1/subscription`. Kept optional for forward
  // compatibility when the backend ships the merge into /me.
  plan?: string | null
  features?: string[]
}

export interface User {
  id: number
  name: string
  email: string
  phone: string | null
  role: string
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

/** Matches the REAL `/v1/login` response (not the doc's aspirational shape). */
export interface LoginResponse {
  message: string
  data: {
    user: User
    token: string
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

/** 2FA enforcement signal — 403 body shape when a protected route needs 2FA. */
export interface TwoFactorRequiredError {
  code: '2fa_required'
  message: string
  setup_url: string
}
