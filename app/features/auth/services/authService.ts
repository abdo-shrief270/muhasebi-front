import type { LoginPayload, LoginResponse, MeResponse, RegisterPayload, User, TenantInfo } from '~/shared/types/auth'
import type { ItemResponse } from '~/shared/types/common'
import { ENDPOINTS } from '~/core/api/endpoints'

export interface ProfileUpdatePayload {
  name?: string
  phone?: string
  locale?: 'ar' | 'en'
  timezone?: string
}

export interface PasswordChangePayload {
  current_password: string
  new_password: string
  new_password_confirmation: string
}

export interface TwoFactorEnableResponse {
  data: {
    secret: string
    qr_code_url: string
    recovery_codes: string[]
  }
}

export interface TwoFactorStatusResponse {
  data: {
    enabled: boolean
    pending: boolean
    recovery_codes_remaining: number
  }
}

export function authService() {
  const api = useApi()

  return {
    register: (payload: RegisterPayload) =>
      api.post<LoginResponse>(ENDPOINTS.auth.register, payload),
    login: (payload: LoginPayload) =>
      api.post<LoginResponse>(ENDPOINTS.auth.login, payload),
    logout: () => api.post<{ message: string }>(ENDPOINTS.auth.logout),
    me: () => api.get<MeResponse>(ENDPOINTS.auth.me),
    updateProfile: (payload: ProfileUpdatePayload) =>
      api.put<ItemResponse<User>>(ENDPOINTS.auth.profile, payload).then(r => r.data),
    changePassword: (payload: PasswordChangePayload) =>
      api.post<{ message: string }>(ENDPOINTS.auth.changePassword, payload),

    twoFactor: {
      status: () => api.get<TwoFactorStatusResponse>(ENDPOINTS.auth.twoFactor.status),
      enable: () => api.post<TwoFactorEnableResponse>(ENDPOINTS.auth.twoFactor.enable),
      verify: (code: string) => api.post<{ message: string }>(ENDPOINTS.auth.twoFactor.verify, { code }),
      disable: (code: string, password: string) =>
        api.post<{ message: string }>(ENDPOINTS.auth.twoFactor.disable, { code, password }),
    },
  }
}
