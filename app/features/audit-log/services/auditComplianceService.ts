import { ENDPOINTS } from '~/core/api/endpoints'
import type { ItemResponse, ListResponse } from '~/shared/types/common'

export interface AuditDateRange {
  from_date?: string
  to_date?: string
}

export interface UserAccessEntry {
  id: number
  user_id: number
  user_name: string
  action: 'login' | 'permission_change' | 'sensitive_view' | string
  details: string
  ip: string | null
  user_agent: string | null
  created_at: string
}

export interface ChangeLogEntry {
  id: number
  user_id: number
  user_name: string
  entity_type: string
  entity_id: number
  action: 'create' | 'update' | 'delete'
  diff: { old?: Record<string, unknown>; new?: Record<string, unknown> }
  created_at: string
}

export interface HighRiskEntry {
  id: number
  entity_type: string
  entity_id: number
  risk_reason: string
  amount?: number
  flagged_at: string
}

export interface SegregationViolation {
  id: number
  user_id: number
  user_name: string
  entity_type: string
  entity_id: number
  actions: string[]
  created_at: string
}

export interface AuditSummary {
  period: { from: string; to: string }
  total_events: number
  by_risk: Record<string, number>
  top_actors: Array<{ user_id: number; name: string; count: number }>
  entity_hotspots: Array<{ entity_type: string; count: number }>
}

function toQuery(p: Record<string, unknown>): string {
  const q = new URLSearchParams()
  for (const [k, v] of Object.entries(p)) {
    if (v === '' || v == null) continue
    q.set(k, String(v))
  }
  return q.toString() ? `?${q}` : ''
}

export function auditComplianceService() {
  const api = useApi()

  return {
    userAccess: (params: AuditDateRange & { user_id?: number } = {}) =>
      api.get<ListResponse<UserAccessEntry>>(`${ENDPOINTS.auditCompliance.userAccess}${toQuery(params)}`),
    changes: (params: AuditDateRange & { entity_type?: string; entity_id?: number; user_id?: number } = {}) =>
      api.get<ListResponse<ChangeLogEntry>>(`${ENDPOINTS.auditCompliance.changes}${toQuery(params)}`),
    highRisk: (params: AuditDateRange = {}) =>
      api.get<ListResponse<HighRiskEntry>>(`${ENDPOINTS.auditCompliance.highRisk}${toQuery(params)}`),
    segregation: (params: AuditDateRange = {}) =>
      api.get<ListResponse<SegregationViolation>>(`${ENDPOINTS.auditCompliance.segregation}${toQuery(params)}`),
    summary: (params: AuditDateRange = {}) =>
      api.get<ItemResponse<AuditSummary>>(`${ENDPOINTS.auditCompliance.summary}${toQuery(params)}`).then(r => r.data),
    /** Returns a CSV string when the backend honors Accept: text/csv. */
    exportCsv: (params: AuditDateRange = {}) =>
      api.get<string>(`${ENDPOINTS.auditCompliance.export}${toQuery(params)}`, {
        headers: { Accept: 'text/csv' },
      }),
  }
}
