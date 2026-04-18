import { ENDPOINTS } from '~/core/api/endpoints'
import type { BaseListParams, ItemResponse, ListResponse } from '~/shared/types/common'

export type VendorStatus = 'active' | 'inactive' | 'archived'

export interface Vendor {
  id: number
  name: string
  email: string | null
  phone: string | null
  tax_id: string | null
  commercial_registration: string | null
  address: string | null
  city: string | null
  country: string
  default_account_id: number | null
  payment_terms: string | null
  currency: string
  contact_person: string | null
  notes: string | null
  status: VendorStatus
  created_at: string
}

export interface VendorDetail extends Vendor {
  balance: number
  open_bills_count: number
  aging_buckets: { '0_30': number; '31_60': number; '61_90': number; '90_plus': number }
  last_payment_at: string | null
}

export type VendorForm = Partial<Omit<Vendor, 'id' | 'status' | 'created_at'>>

export interface VendorListParams extends BaseListParams {
  status?: VendorStatus
  city?: string
  country?: string
}

export interface VendorStatement {
  vendor: Pick<Vendor, 'id' | 'name' | 'currency'>
  period: { from: string; to: string }
  opening_balance: number
  closing_balance: number
  entries: Array<{
    date: string
    type: 'bill' | 'payment' | 'adjustment'
    reference: string
    debit: number
    credit: number
    balance: number
  }>
}

export interface StatementQuery {
  from_date?: string
  to_date?: string
  format?: 'json' | 'pdf' | 'csv'
}

export interface VendorAgingRow {
  vendor_id: number
  name: string
  total: number
  buckets: { '0_30': number; '31_60': number; '61_90': number; '90_plus': number }
}

function toQuery(p: Record<string, unknown>): string {
  const q = new URLSearchParams()
  for (const [k, v] of Object.entries(p)) {
    if (v === '' || v == null) continue
    q.set(k, String(v))
  }
  return q.toString() ? `?${q}` : ''
}

export function vendorService() {
  const api = useApi()

  return {
    list: (params: VendorListParams = {}) =>
      api.get<ListResponse<Vendor>>(`${ENDPOINTS.vendors.list}${toQuery(params)}`),
    get: (id: number) =>
      api.get<ItemResponse<VendorDetail>>(ENDPOINTS.vendors.one(id)).then(r => r.data),
    create: (form: VendorForm, idempotencyKey?: string) =>
      api.post<ItemResponse<Vendor>>(ENDPOINTS.vendors.list, form, { idempotencyKey }).then(r => r.data),
    update: (id: number, form: VendorForm) =>
      api.put<ItemResponse<Vendor>>(ENDPOINTS.vendors.one(id), form).then(r => r.data),
    remove: (id: number) =>
      api.delete<void>(ENDPOINTS.vendors.one(id)),

    statement: (id: number, q: StatementQuery = {}) =>
      api.get<ItemResponse<VendorStatement>>(`${ENDPOINTS.vendors.statement(id)}${toQuery(q)}`).then(r => r.data),
    aging: (params: { from_date?: string; to_date?: string } = {}) =>
      api.get<{ data: VendorAgingRow[] }>(`${ENDPOINTS.vendors.aging}${toQuery(params)}`).then(r => r.data),
  }
}
