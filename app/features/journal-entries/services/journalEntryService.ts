import { ENDPOINTS } from '~/core/api/endpoints'
import type { BaseListParams, ItemResponse, ListResponse } from '~/shared/types/common'

export type JournalEntryStatus = 'draft' | 'posted' | 'reversed'

export interface JournalEntryLine {
  id?: number
  account_id: number
  debit: number
  credit: number
  description?: string | null
  cost_center_id?: number | null
  project_id?: number | null
  account?: { id: number; code: string; name_ar: string; name_en: string }
}

export interface JournalEntry {
  id: number
  entry_number: string
  date: string
  description: string
  reference: string | null
  status: JournalEntryStatus
  currency: string
  exchange_rate: number
  total_debit: number
  total_credit: number
  posted_at: string | null
  reversed_at: string | null
  reversal_of?: number | null
  created_at: string
  lines?: JournalEntryLine[]
  created_by_user?: { id: number; name: string }
}

export interface JournalEntryForm {
  date: string
  description: string
  reference?: string
  currency?: string
  exchange_rate?: number
  lines: Array<{
    account_id: number
    debit?: number
    credit?: number
    description?: string
    cost_center_id?: number
    project_id?: number
  }>
}

export interface JournalEntryListParams extends BaseListParams {
  from_date?: string
  to_date?: string
  status?: JournalEntryStatus
  reference?: string
  account_id?: number
  cost_center_id?: number
}

export interface ReversePayload {
  date?: string
  reason?: string
}

function toQuery(p: Record<string, unknown>): string {
  const q = new URLSearchParams()
  for (const [k, v] of Object.entries(p)) {
    if (v === '' || v == null) continue
    q.set(k, String(v))
  }
  return q.toString() ? `?${q}` : ''
}

export function journalEntryService() {
  const api = useApi()

  return {
    list: (params: JournalEntryListParams = {}) =>
      api.get<ListResponse<JournalEntry>>(`${ENDPOINTS.journalEntries.list}${toQuery(params)}`),
    get: (id: number) =>
      api.get<ItemResponse<JournalEntry>>(ENDPOINTS.journalEntries.one(id)).then(r => r.data),
    create: (form: JournalEntryForm, idempotencyKey?: string) =>
      api.post<ItemResponse<JournalEntry>>(ENDPOINTS.journalEntries.list, form, { idempotencyKey }).then(r => r.data),
    update: (id: number, form: Partial<JournalEntryForm>) =>
      api.put<ItemResponse<JournalEntry>>(ENDPOINTS.journalEntries.one(id), form).then(r => r.data),
    remove: (id: number) =>
      api.delete<void>(ENDPOINTS.journalEntries.one(id)),
    post: (id: number, idempotencyKey?: string) =>
      api.post<ItemResponse<JournalEntry>>(ENDPOINTS.journalEntries.post(id), undefined, { idempotencyKey }).then(r => r.data),
    reverse: (id: number, payload: ReversePayload = {}, idempotencyKey?: string) =>
      api.post<ItemResponse<JournalEntry>>(ENDPOINTS.journalEntries.reverse(id), payload, { idempotencyKey }).then(r => r.data),

    importOpeningBalances: (file: File, idempotencyKey?: string) => {
      const fd = new FormData()
      fd.append('file', file)
      const headers = api.getHeaders()
      delete (headers as any)['Content-Type']
      if (idempotencyKey) headers['Idempotency-Key'] = idempotencyKey
      return api.raw<{ data: { id: number; status: string } }>(ENDPOINTS.imports.openingBalances, {
        method: 'POST', body: fd, headers,
      })
    },
  }
}
