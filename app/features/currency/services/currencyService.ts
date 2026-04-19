import { ENDPOINTS } from '~/core/api/endpoints'
import type { ItemResponse } from '~/shared/types/common'

export interface Currency {
  code: string
  name_ar: string
  name_en: string
  symbol: string
  decimal_places: number
  is_active: boolean
}

export interface ConvertPayload {
  amount: number
  from: string
  to: string
  date?: string
}

export interface ConvertResult {
  amount: number
  from: string
  to: string
  rate: number
  converted: number
}

export interface RateHistoryEntry {
  date: string
  from: string
  to: string
  rate: number
}

function toQuery(p: Record<string, unknown>): string {
  const q = new URLSearchParams()
  for (const [k, v] of Object.entries(p)) {
    if (v === '' || v == null) continue
    q.set(k, String(v))
  }
  return q.toString() ? `?${q}` : ''
}

export function currencyService() {
  const api = useApi()

  return {
    list: () =>
      api.get<{ data: Currency[] }>(ENDPOINTS.currencies.list).then(r => r.data),
    convert: (payload: ConvertPayload) =>
      api.post<ItemResponse<ConvertResult>>(ENDPOINTS.currencies.convert, payload).then(r => r.data),
    rateHistory: (params: { from: string; to: string; days?: number }) =>
      api.get<{ data: RateHistoryEntry[] }>(`${ENDPOINTS.currencies.rateHistory}${toQuery(params)}`).then(r => r.data),
  }
}
