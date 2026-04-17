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
}

export interface User {
  id: number
  name: string
  email: string
  phone: string | null
  role: string
  permissions: string[]
  locale: string
  timezone: string | null
  is_active: boolean
  tenant_id: number | null
  client_id: number | null
  last_login_at: string | null
  created_at: string
  tenant: TenantInfo | null
}

export interface LoginPayload {
  email: string
  password: string
}

export interface AuthResponse {
  user: User
  token: string
}

export interface ApiError {
  message: string
  errors?: Record<string, string[]>
}
