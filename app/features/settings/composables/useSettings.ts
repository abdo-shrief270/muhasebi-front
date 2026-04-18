import { settingsService, type DeviceTokenRegisterPayload, type NotificationPreferences, type UserPreferencesPatch } from '~/features/settings/services/settingsService'
import { invalidateQuery, useMutation, useQuery } from '~/core/api/query'

export function useUserPreferences() {
  const svc = settingsService()
  return useQuery(() => svc.preferences.get(), {
    key: 'settings:prefs',
    staleMs: 5 * 60_000,
  })
}

export function useShortcuts() {
  const svc = settingsService()
  return useQuery(() => svc.preferences.shortcuts(), {
    key: 'settings:shortcuts',
    staleMs: 60 * 60_000,
  })
}

export function useNotificationPrefs() {
  const svc = settingsService()
  return useQuery(() => svc.notificationPrefs.get(), {
    key: 'settings:notifPrefs',
    staleMs: 5 * 60_000,
  })
}

export function useDeviceTokens() {
  const svc = settingsService()
  return useQuery(() => svc.deviceTokens.list(), {
    key: 'settings:deviceTokens',
    staleMs: 60_000,
  })
}

export function useSettingsMutations() {
  const svc = settingsService()
  const bust = (pattern: RegExp) => invalidateQuery(pattern)

  return {
    updatePreferences: useMutation(async (patch: UserPreferencesPatch) => {
      const r = await svc.preferences.update(patch)
      bust(/^settings:prefs/)
      return r
    }),
    resetPreferences: useMutation(async () => {
      const r = await svc.preferences.reset()
      bust(/^settings:prefs/)
      return r
    }),
    updateNotificationPrefs: useMutation(async (payload: NotificationPreferences) => {
      const r = await svc.notificationPrefs.update(payload)
      bust(/^settings:notifPrefs/)
      return r
    }),
    registerDeviceToken: useMutation(async (payload: DeviceTokenRegisterPayload) => {
      const r = await svc.deviceTokens.register(payload)
      bust(/^settings:deviceTokens/)
      return r
    }),
    unregisterDeviceToken: useMutation(async (token: string) => {
      await svc.deviceTokens.unregister(token)
      bust(/^settings:deviceTokens/)
    }),
  }
}
