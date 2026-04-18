import { ENDPOINTS } from '~/core/api/endpoints'
import type { BaseListParams, ItemResponse, ListResponse } from '~/shared/types/common'

export type FxRateSource = 'manual' | 'cbe'

export interface FxRevaluationLine {
  account_id: number
  account_name: string
  currency: string
  foreign_balance: number
  previous_rate: number
  new_rate: number
  unrealized_gain_loss: number
}

export interface FxRevaluation {
  id: number
  reference_date: string
  rate_source: FxRateSource
  status: 'draft' | 'posted' | 'reversed'
  total_unrealized: number
  posted_at: string | null
  reversed_at: string | null
  lines?: FxRevaluationLine[]
}

export interface FxRevaluationForm {
  reference_date: string
  accounts: number[]
  rate_source?: FxRateSource
  manual_rates?: Record<string, number>
}

function toQuery(p: Record<string, unknown>): string {
  const q = new URLSearchParams()
  for (const [k, v] of Object.entries(p)) {
    if (v === '' || v == null) continue
    q.set(k, String(v))
  }
  return q.toString() ? `?${q}` : ''
}

export function fxRevaluationService() {
  const api = useApi()

  return {
    list: (params: BaseListParams = {}) =>
      api.get<ListResponse<FxRevaluation>>(`${ENDPOINTS.fxRevaluations.list}${toQuery(params)}`),
    get: (id: number) =>
      api.get<ItemResponse<FxRevaluation>>(ENDPOINTS.fxRevaluations.one(id)).then(r => r.data),
    create: (form: FxRevaluationForm, idempotencyKey?: string) =>
      api.post<ItemResponse<FxRevaluation>>(ENDPOINTS.fxRevaluations.list, form, { idempotencyKey }).then(r => r.data),
    post: (id: number, idempotencyKey?: string) =>
      api.post<ItemResponse<FxRevaluation>>(ENDPOINTS.fxRevaluations.post(id), undefined, { idempotencyKey }).then(r => r.data),
    reverse: (id: number, idempotencyKey?: string) =>
      api.post<ItemResponse<FxRevaluation>>(ENDPOINTS.fxRevaluations.reverse(id), undefined, { idempotencyKey }).then(r => r.data),
  }
}
