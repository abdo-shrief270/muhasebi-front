import { ENDPOINTS } from '~/core/api/endpoints'
import type { BaseListParams, ItemResponse, ListResponse } from '~/shared/types/common'

export type AccountType = 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense'

export interface Account {
  id: number
  code: string
  name_en: string
  name_ar: string
  type: AccountType
  sub_type?: string | null
  parent_id: number | null
  currency: string
  is_bank: boolean
  is_group: boolean
  is_active: boolean
  description?: string | null
  children?: Account[]
  balance?: number
  debit_total?: number
  credit_total?: number
}

export type AccountForm = Omit<Partial<Account>, 'id' | 'children' | 'balance' | 'debit_total' | 'credit_total'> & {
  opening_balance?: number
  opening_balance_date?: string
}

export interface AccountListParams extends BaseListParams {
  type?: AccountType
  parent_id?: number
}

export interface AccountSuggestion {
  account_id: number
  confidence: number
  reason: string
  account?: Pick<Account, 'id' | 'code' | 'name_en' | 'name_ar'>
}

export interface SuggestionQuery {
  description?: string
  amount?: number
  type?: 'expense' | 'revenue' | string
}

export interface TrainSuggestionPayload {
  description: string
  amount: number
  chosen_account_id: number
}

function toQuery(p: Record<string, unknown>): string {
  const q = new URLSearchParams()
  for (const [k, v] of Object.entries(p)) {
    if (v === '' || v == null) continue
    q.set(k, String(v))
  }
  return q.toString() ? `?${q}` : ''
}

export function accountService() {
  const api = useApi()

  return {
    list: (params: AccountListParams = {}) =>
      api.get<ListResponse<Account>>(`${ENDPOINTS.accounts.list}${toQuery(params)}`),
    tree: () =>
      api.get<{ data: Account[] }>(ENDPOINTS.accounts.tree).then(r => r.data),
    get: (id: number) =>
      api.get<ItemResponse<Account>>(ENDPOINTS.accounts.one(id)).then(r => r.data),
    create: (form: AccountForm, idempotencyKey?: string) =>
      api.post<ItemResponse<Account>>(ENDPOINTS.accounts.list, form, { idempotencyKey }).then(r => r.data),
    update: (id: number, form: AccountForm) =>
      api.put<ItemResponse<Account>>(ENDPOINTS.accounts.one(id), form).then(r => r.data),
    remove: (id: number) =>
      api.delete<void>(ENDPOINTS.accounts.one(id)),

    suggestions: (q: SuggestionQuery) =>
      api.get<{ data: AccountSuggestion[] }>(`${ENDPOINTS.accounts.suggestions}${toQuery(q)}`).then(r => r.data),
    trainSuggestion: (payload: TrainSuggestionPayload) =>
      api.post<{ message: string }>(ENDPOINTS.accounts.trainSuggestions, payload),

    importCsv: (file: File, idempotencyKey?: string) => {
      const fd = new FormData()
      fd.append('file', file)
      const headers = api.getHeaders()
      delete (headers as any)['Content-Type']
      if (idempotencyKey) headers['Idempotency-Key'] = idempotencyKey
      return api.raw<{ data: { id: number; status: string } }>(ENDPOINTS.imports.accounts, {
        method: 'POST', body: fd, headers,
      })
    },
  }
}
