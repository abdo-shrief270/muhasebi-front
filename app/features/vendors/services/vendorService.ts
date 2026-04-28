import { ENDPOINTS } from '~/core/api/endpoints'
import type { BaseListParams, ItemResponse, ListResponse } from '~/shared/types/common'

export interface VendorContact {
  name: string
  role?: string | null
  email?: string | null
  phone?: string | null
  is_primary?: boolean
}

/**
 * Vendor — aligned with backend `vendors` table (bilingual columns,
 * JSON contacts array, bank info, is_active boolean — no status enum).
 */
export interface Vendor {
  id: number
  tenant_id: number

  name_ar: string
  name_en: string | null
  code: string | null

  tax_id: string | null
  commercial_register: string | null
  vat_registration: string | null

  email: string | null
  phone: string | null

  address_ar: string | null
  address_en: string | null
  city: string | null
  country: string

  bank_name: string | null
  bank_account: string | null
  iban: string | null
  swift_code: string | null

  payment_terms: string
  credit_limit: string | number
  currency: string

  contacts: VendorContact[] | null
  notes: string | null
  is_active: boolean
  created_at: string
}

/**
 * Detail variant: `show()` enriches the vendor with computed financials.
 * Backend VendorController::show() populates these via VendorService.
 */
export interface VendorDetail extends Vendor {
  balance: number | string
  open_bills_count: number
  bills_count: number
  aging_buckets: { '0_30': number; '31_60': number; '61_90': number; '90_plus': number }
  last_payment_at: string | null
}

export type VendorForm = Partial<Omit<Vendor, 'id' | 'tenant_id' | 'created_at'>>

export interface VendorListParams extends BaseListParams {
  is_active?: boolean
  city?: string
  country?: string
}

export interface VendorStatement {
  vendor: Pick<Vendor, 'id' | 'name_ar' | 'name_en' | 'currency'>
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

/**
 * Resolve the display name for a vendor based on the active UI locale.
 * Backend keeps `name_ar` (required) + `name_en` (optional). When the
 * locale-preferred one is empty we fall back to the other so the row
 * never renders blank.
 */
export function vendorDisplayName(v: Pick<Vendor, 'name_ar' | 'name_en'> | null | undefined, locale: 'ar' | 'en' | string): string {
  if (!v) return ''
  if (locale === 'ar') return v.name_ar || v.name_en || ''
  return v.name_en || v.name_ar || ''
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
