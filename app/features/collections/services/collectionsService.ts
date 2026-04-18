import { ENDPOINTS } from '~/core/api/endpoints'
import type { BaseListParams, ItemResponse, ListResponse } from '~/shared/types/common'

export type CollectionActionType = 'email' | 'sms' | 'call' | 'visit'
export type CollectionOutcome = 'promised' | 'unreachable' | 'disputed' | 'paid'

export interface CollectionsOverview {
  total_ar: number
  overdue_total: number
  aging: { '0_30': number; '31_60': number; '61_90': number; '90_plus': number }
  top_debtors: Array<{ client_id: number; name: string; balance: number }>
}

export interface CollectionAction {
  id: number
  action_type: CollectionActionType
  invoice_id: number | null
  client_id: number | null
  outcome: CollectionOutcome
  notes: string
  performed_by: { id: number; name: string } | null
  created_at: string
}

export interface CollectionActionPayload {
  action_type: CollectionActionType
  invoice_id?: number
  client_id?: number
  outcome: CollectionOutcome
  notes: string
}

export interface ClientCollectionSummary {
  client_id: number
  name: string
  total_ar: number
  overdue: number
  last_action?: CollectionAction
  actions: CollectionAction[]
}

export interface EffectivenessReport {
  period: { from: string; to: string }
  rows: Array<{
    collector_id: number
    name: string
    actions: number
    amount_collected: number
    promises: number
    promises_kept: number
  }>
}

function toQuery(p: Record<string, unknown>): string {
  const q = new URLSearchParams()
  for (const [k, v] of Object.entries(p)) {
    if (v === '' || v == null) continue
    q.set(k, String(v))
  }
  return q.toString() ? `?${q}` : ''
}

export function collectionsService() {
  const api = useApi()

  return {
    overview: () =>
      api.get<ItemResponse<CollectionsOverview>>(ENDPOINTS.collections.overview).then(r => r.data),
    actions: (params: BaseListParams = {}) =>
      api.get<ListResponse<CollectionAction>>(`${ENDPOINTS.collections.actions}${toQuery(params)}`),
    logAction: (payload: CollectionActionPayload, idempotencyKey?: string) =>
      api.post<ItemResponse<CollectionAction>>(ENDPOINTS.collections.actions, payload, { idempotencyKey }).then(r => r.data),
    client: (clientId: number) =>
      api.get<ItemResponse<ClientCollectionSummary>>(ENDPOINTS.collections.client(clientId)).then(r => r.data),
    effectiveness: (params: { from?: string; to?: string } = {}) =>
      api.get<ItemResponse<EffectivenessReport>>(`${ENDPOINTS.collections.effectiveness}${toQuery(params)}`).then(r => r.data),
  }
}
