import { ENDPOINTS } from '~/core/api/endpoints'
import type { BaseListParams, ItemResponse, ListResponse } from '~/shared/types/common'

export interface BankAccountGlAccount {
  id: number
  code: string | null
  name_ar: string | null
  name_en: string | null
}

/**
 * Bank account — a tenant-owned account at a bank. Distinct from the GL
 * chart-of-accounts row it points at via `gl_account_id` (which carries
 * the ledger balance). See backend migration for the rationale.
 */
export interface BankAccount {
  id: number
  tenant_id: number

  account_name: string
  bank_name: string
  branch: string | null
  account_number: string | null
  iban: string | null
  swift_code: string | null
  currency: string

  gl_account_id: number | null
  gl_account: BankAccountGlAccount | null

  opening_balance: number | string
  is_active: boolean
  notes: string | null

  created_at: string
  updated_at: string
}

export interface BankAccountForm {
  account_name: string
  bank_name: string
  branch?: string | null
  account_number?: string | null
  iban?: string | null
  swift_code?: string | null
  currency?: string
  gl_account_id?: number | null
  opening_balance?: number
  is_active?: boolean
  notes?: string | null
}

export interface BankAccountListParams extends BaseListParams {
  is_active?: boolean
  currency?: string
}

function toQuery(p: Record<string, unknown>): string {
  const q = new URLSearchParams()
  for (const [k, v] of Object.entries(p)) {
    if (v === '' || v == null) continue
    q.set(k, String(v))
  }
  return q.toString() ? `?${q}` : ''
}

export function bankAccountService() {
  const api = useApi()

  return {
    list: (params: BankAccountListParams = {}) =>
      api.get<ListResponse<BankAccount>>(`${ENDPOINTS.bankAccounts.list}${toQuery(params)}`),
    get: (id: number) =>
      api.get<ItemResponse<BankAccount>>(ENDPOINTS.bankAccounts.one(id)).then(r => r.data),
    create: (form: BankAccountForm, idempotencyKey?: string) =>
      api.post<ItemResponse<BankAccount>>(ENDPOINTS.bankAccounts.list, form, { idempotencyKey }).then(r => r.data),
    update: (id: number, form: Partial<BankAccountForm>) =>
      api.put<ItemResponse<BankAccount>>(ENDPOINTS.bankAccounts.one(id), form).then(r => r.data),
    remove: (id: number) =>
      api.delete<void>(ENDPOINTS.bankAccounts.one(id)),
  }
}
