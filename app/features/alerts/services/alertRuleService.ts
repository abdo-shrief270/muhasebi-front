import { ENDPOINTS } from '~/core/api/endpoints'
import type { BaseListParams, ItemResponse, ListResponse } from '~/shared/types/common'

export type AlertMetric =
  | 'cash_on_hand' | 'outstanding_ar' | 'outstanding_ap' | 'overdue_ar'
  | 'budget_variance' | 'low_stock' | 'payroll_due' | 'custom'

export type AlertOperator = 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'ne'

export interface AlertRule {
  id: number
  name: string
  metric: AlertMetric
  operator: AlertOperator
  threshold: number
  channels: Array<'email' | 'sms' | 'push' | 'in_app'>
  recipients: string[]
  is_active: boolean
  cooldown_hours: number
  last_fired_at: string | null
  created_at: string
}

export type AlertRuleForm = Omit<AlertRule, 'id' | 'last_fired_at' | 'created_at'>

export interface AlertHistoryEntry {
  id: number
  alert_rule_id: number
  fired_at: string
  value_seen: number
  recipients: string[]
  delivery_status: Array<{ channel: string; status: 'sent' | 'failed'; error?: string }>
}

function toQuery(p: Record<string, unknown>): string {
  const q = new URLSearchParams()
  for (const [k, v] of Object.entries(p)) {
    if (v === '' || v == null) continue
    q.set(k, String(v))
  }
  return q.toString() ? `?${q}` : ''
}

export function alertRuleService() {
  const api = useApi()
  return {
    list: (params: BaseListParams = {}) =>
      api.get<ListResponse<AlertRule>>(`${ENDPOINTS.alertRules.list}${toQuery(params)}`),
    get: (id: number) =>
      api.get<ItemResponse<AlertRule>>(ENDPOINTS.alertRules.one(id)).then(r => r.data),
    create: (form: AlertRuleForm, idempotencyKey?: string) =>
      api.post<ItemResponse<AlertRule>>(ENDPOINTS.alertRules.list, form, { idempotencyKey }).then(r => r.data),
    update: (id: number, form: Partial<AlertRuleForm>) =>
      api.put<ItemResponse<AlertRule>>(ENDPOINTS.alertRules.one(id), form).then(r => r.data),
    remove: (id: number) =>
      api.delete<void>(ENDPOINTS.alertRules.one(id)),
    toggle: (id: number) =>
      api.post<ItemResponse<AlertRule>>(ENDPOINTS.alertRules.toggle(id)).then(r => r.data),
    history: (params: BaseListParams & { alert_rule_id?: number } = {}) =>
      api.get<ListResponse<AlertHistoryEntry>>(`${ENDPOINTS.alertRules.history}${toQuery(params)}`),
  }
}
