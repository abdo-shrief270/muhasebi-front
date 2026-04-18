import { ENDPOINTS } from '~/core/api/endpoints'
import type { ItemResponse } from '~/shared/types/common'

// ---- User preferences (UI state) ----
export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  language: 'ar' | 'en'
  sidebar_collapsed: boolean
  shortcuts_enabled: boolean
  density: 'compact' | 'comfortable'
  date_format: string
  number_format: string
}

export type UserPreferencesPatch = Partial<UserPreferences>

// ---- Notification preferences (channel x event matrix) ----
export interface NotificationPreferences {
  channels: { email: boolean; sms: boolean; push: boolean }
  events: Record<string, Array<'email' | 'sms' | 'push'>>
}

// ---- Device tokens (push notifications) ----
export interface DeviceToken {
  id: number
  token: string
  device_type: 'android' | 'ios' | 'web'
  device_name: string | null
  created_at: string
}

export interface DeviceTokenRegisterPayload {
  token: string
  device_type: 'android' | 'ios' | 'web'
  device_name?: string
}

export function settingsService() {
  const api = useApi()

  return {
    preferences: {
      get: () =>
        api.get<ItemResponse<UserPreferences>>(ENDPOINTS.auth.preferences.root).then(r => r.data),
      update: (patch: UserPreferencesPatch) =>
        api.put<ItemResponse<UserPreferences>>(ENDPOINTS.auth.preferences.root, patch).then(r => r.data),
      reset: () =>
        api.post<ItemResponse<UserPreferences>>(ENDPOINTS.auth.preferences.reset).then(r => r.data),
      shortcuts: () =>
        api.get<ItemResponse<Record<string, string>>>(ENDPOINTS.auth.preferences.shortcuts).then(r => r.data),
    },

    notificationPrefs: {
      get: () =>
        api.get<ItemResponse<NotificationPreferences>>(ENDPOINTS.auth.notificationPreferences).then(r => r.data),
      update: (payload: NotificationPreferences) =>
        api.put<ItemResponse<NotificationPreferences>>(ENDPOINTS.auth.notificationPreferences, payload).then(r => r.data),
    },

    deviceTokens: {
      list: () =>
        api.get<{ data: DeviceToken[] }>(ENDPOINTS.auth.deviceTokens).then(r => r.data),
      register: (payload: DeviceTokenRegisterPayload) =>
        api.post<ItemResponse<DeviceToken>>(ENDPOINTS.auth.deviceTokens, payload).then(r => r.data),
      unregister: (token: string) =>
        api.delete<void>(ENDPOINTS.auth.deviceTokens, { body: { token } }),
    },
  }
}
