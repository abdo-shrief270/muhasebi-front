import { ENDPOINTS } from '~/core/api/endpoints'
import type { BaseListParams, ListResponse, ItemResponse } from '~/shared/types/common'

export interface AppNotification {
  id: string
  type: string
  data: Record<string, unknown>
  read_at: string | null
  created_at: string
}

export interface NotificationsListParams extends BaseListParams {
  read?: boolean
  type?: string
}

function toQuery(p: Record<string, unknown>): string {
  const q = new URLSearchParams()
  for (const [k, v] of Object.entries(p)) {
    if (v === '' || v == null) continue
    q.set(k, String(v))
  }
  return q.toString() ? `?${q}` : ''
}

export function notificationsService() {
  const api = useApi()

  return {
    list: (params: NotificationsListParams = {}) =>
      api.get<ListResponse<AppNotification>>(`${ENDPOINTS.notifications.list}${toQuery(params)}`),
    unreadCount: () =>
      api.get<ItemResponse<{ count: number }>>(ENDPOINTS.notifications.unreadCount).then(r => r.data.count),
    markRead: (id: string) =>
      api.post<{ message: string }>(ENDPOINTS.notifications.read(id)),
    markAllRead: () =>
      api.post<{ message: string }>(ENDPOINTS.notifications.readAll),
    remove: (id: string) =>
      api.delete<void>(ENDPOINTS.notifications.remove(id)),
  }
}
