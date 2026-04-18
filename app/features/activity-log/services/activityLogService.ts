import { ENDPOINTS } from '~/core/api/endpoints'
import type { BaseListParams, ItemResponse, ListResponse } from '~/shared/types/common'

export interface ActivityEntry {
  id: number
  user: { id: number; name: string; email?: string } | null
  action: string
  entity_type: string
  entity_id: number
  properties: { old?: Record<string, unknown>; new?: Record<string, unknown> }
  ip: string | null
  user_agent: string | null
  created_at: string
}

export interface ActivityStats {
  per_user: Array<{ user_id: number; name: string; count: number }>
  per_action: Array<{ action: string; count: number }>
  per_day: Array<{ date: string; count: number }>
}

export interface ActivityListParams extends BaseListParams {
  user_id?: number
  entity_type?: string
  action?: string
  from_date?: string
  to_date?: string
}

function toQuery(p: Record<string, unknown>): string {
  const q = new URLSearchParams()
  for (const [k, v] of Object.entries(p)) {
    if (v === '' || v == null) continue
    q.set(k, String(v))
  }
  return q.toString() ? `?${q}` : ''
}

export function activityLogService() {
  const api = useApi()

  return {
    list: (params: ActivityListParams = {}) =>
      api.get<ListResponse<ActivityEntry>>(`${ENDPOINTS.activityLog.list}${toQuery(params)}`),
    stats: () =>
      api.get<ItemResponse<ActivityStats>>(ENDPOINTS.activityLog.stats).then(r => r.data),
    get: (id: number) =>
      api.get<ItemResponse<ActivityEntry>>(ENDPOINTS.activityLog.one(id)).then(r => r.data),
  }
}
