import { ENDPOINTS } from '~/core/api/endpoints'
import type { BaseListParams, ItemResponse, ListResponse } from '~/shared/types/common'

export type PeriodLength = 'monthly' | 'quarterly'

export interface FiscalPeriod {
  id: number
  fiscal_year_id: number
  period_number: number
  start_date: string
  end_date: string
  is_closed: boolean
  closed_at: string | null
  reopened_at: string | null
}

export interface FiscalYear {
  id: number
  name: string
  start_date: string
  end_date: string
  is_closed: boolean
  period_length: PeriodLength
  periods?: FiscalPeriod[]
}

export interface FiscalYearForm {
  name: string
  start_date: string
  end_date: string
  auto_generate_periods?: boolean
  period_length?: PeriodLength
}

function toQuery(p: Record<string, unknown>): string {
  const q = new URLSearchParams()
  for (const [k, v] of Object.entries(p)) {
    if (v === '' || v == null) continue
    q.set(k, String(v))
  }
  return q.toString() ? `?${q}` : ''
}

export function fiscalYearService() {
  const api = useApi()

  return {
    list: (params: BaseListParams = {}) =>
      api.get<ListResponse<FiscalYear>>(`${ENDPOINTS.fiscalYears.list}${toQuery(params)}`),
    get: (id: number) =>
      api.get<ItemResponse<FiscalYear>>(ENDPOINTS.fiscalYears.one(id)).then(r => r.data),
    create: (form: FiscalYearForm, idempotencyKey?: string) =>
      api.post<ItemResponse<FiscalYear>>(ENDPOINTS.fiscalYears.list, form, { idempotencyKey }).then(r => r.data),

    closePeriod: (periodId: number, idempotencyKey?: string) =>
      api.post<ItemResponse<FiscalPeriod>>(ENDPOINTS.fiscalPeriods.close(periodId), undefined, { idempotencyKey }).then(r => r.data),
    reopenPeriod: (periodId: number, idempotencyKey?: string) =>
      api.post<ItemResponse<FiscalPeriod>>(ENDPOINTS.fiscalPeriods.reopen(periodId), undefined, { idempotencyKey }).then(r => r.data),
  }
}
