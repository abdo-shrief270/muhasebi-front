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
  // 2026-04-23: backend now returns `features` on /me.tenant as a flag→bool
  // map merged from the active subscription's plan + per-tenant overrides
  // (AuthController::tenantFeatures). This replaces the separate
  // /subscription.enabled_features fetch for nav gating.
  features?: Record<string, boolean>
  // Active subscription's plan summary — added 2026-04-23 so the SPA can
  // evaluate manifest `plans: [...]` gates from /me alone. The dedicated
  // /subscription endpoint still exists for richer detail (billing cycle,
  // periods, limits, usage) when the subscription page needs it.
  plan?: {
    id: number
    slug: string
    name_en: string | null
    name_ar: string | null
  } | null
  subscription_status?: string | null
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

/**
 * `GET /me` returns user fields directly on `data` (flat shape), not nested
 * under `data.user`. Tenant is nested at `data.tenant`, permissions at
 * `data.permissions`. The earlier `{ data: { user, tenant, permissions,
 * two_factor_enabled } }` shape was a stale doc; the real backend has
 * always returned the flat shape.
 */
export interface MeResponse {
  data: User & {
    permissions: string[]
    spatie_roles?: string[]
    tenant: TenantInfo | null
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

/**
 * Matches the REAL `/v1/register` contract (RegisterRequest::rules).
 * Backend requires `tenant_name` + `tenant_slug` (alpha_dash, unique). The SPA
 * derives a slug from `tenant_name` at submit time; users can rename it later
 * from tenant settings.
 */
export interface RegisterPayload {
  name: string
  email: string
  password: string
  password_confirmation: string
  phone?: string
  tenant_name: string
  tenant_slug: string
}

/** /v1/register response shape (AuthController::register). */
export interface RegisterResponse {
  message: string
  data: {
    user: User
    token: string
    tenant: {
      id: number
      name: string
      slug: string
      status: string
      trial_ends_at: string | null
    }
  }
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
