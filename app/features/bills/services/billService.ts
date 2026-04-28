import { ENDPOINTS } from '~/core/api/endpoints'
import type { BaseListParams, ItemResponse, ListResponse } from '~/shared/types/common'

/**
 * Bill — aligned with backend `bills` table + BillResource. Money fields
 * arrive as decimal strings (`'12345.67'`); the SPA casts to Number for
 * display only.
 *
 * Status values exactly match BillStatus enum on the PHP side:
 *   draft → approved | partially_paid → paid (or cancelled at any non-paid state)
 */
export type BillStatus = 'draft' | 'approved' | 'partially_paid' | 'paid' | 'cancelled'

export interface BillVendorRef {
  id: number
  name_ar: string
  name_en: string | null
  currency: string
}

export interface BillLineAccountRef {
  id: number
  code: string | null
  name: string | null
}

export interface BillLine {
  id?: number
  description: string | null
  account_id: number
  account?: BillLineAccountRef | null
  quantity: number | string
  unit_price: number | string
  discount_percent: number | string
  vat_rate: number | string
  wht_rate: number | string
  line_total?: number | string
  vat_amount?: number | string
  wht_amount?: number | string
  total?: number | string
  sort_order?: number
}

/**
 * Wire values match the backend `payment_method` enum exactly:
 *   cash | bank_transfer | check | mobile_wallet | other
 *
 * Note: backend uses `check` (US spelling), not `cheque`. `check_number` is
 * required when `payment_method === 'check'` (validated server-side).
 */
export type BillPaymentMethod = 'cash' | 'bank_transfer' | 'check' | 'mobile_wallet' | 'other'

export interface BillPayment {
  id: number
  amount: number | string
  payment_date: string
  payment_method: BillPaymentMethod
  reference: string | null
  check_number: string | null
  notes: string | null
}

export interface Bill {
  id: number
  tenant_id: number
  vendor_id: number

  bill_number: string
  date: string
  due_date: string

  status: BillStatus
  status_label: string
  status_label_ar: string
  status_color: string

  subtotal: number | string
  vat_amount: number | string
  wht_amount: number | string
  total: number | string
  amount_paid: number | string
  balance_due: number | string

  currency: string
  notes: string | null

  cancelled_at: string | null
  cancelled_by: number | null
  journal_entry_id: number | null

  lines_count?: number
  vendor?: BillVendorRef | null
  lines?: BillLine[]
  payments?: BillPayment[]

  created_at: string
  updated_at: string
}

/**
 * Form payload for create/update. Backend `BillService::create` auto-generates
 * `bill_number` so we never send it. `status` is set internally (always Draft
 * on create) — the SPA transitions via /approve and /cancel actions, never
 * via PUT.
 */
export interface BillForm {
  vendor_id: number
  date: string
  due_date: string
  currency?: string
  notes?: string | null
  lines: Array<{
    description?: string | null
    account_id: number
    /** Optional FK to a saved vendor product. Drives `last_used_at` recency. */
    vendor_product_id?: number | null
    quantity: number
    unit_price: number
    discount_percent?: number
    vat_rate?: number
    wht_rate?: number
    sort_order?: number
  }>
}

export interface BillListParams extends BaseListParams {
  vendor_id?: number
  status?: BillStatus
  from_date?: string
  to_date?: string
  due_from?: string
  due_to?: string
}

export interface BillPaymentForm {
  amount: number
  payment_date: string
  payment_method: BillPaymentMethod
  /** Required when `payment_method === 'check'`. */
  check_number?: string | null
  reference?: string | null
  notes?: string | null
}

/**
 * Resolve a vendor ref's display name in the active locale, falling back
 * across languages so a row never renders blank.
 */
export function billVendorName(v: BillVendorRef | null | undefined, locale: 'ar' | 'en' | string): string {
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

export function billService() {
  const api = useApi()

  return {
    list: (params: BillListParams = {}) =>
      api.get<ListResponse<Bill>>(`${ENDPOINTS.bills.list}${toQuery(params)}`),
    get: (id: number) =>
      api.get<ItemResponse<Bill>>(ENDPOINTS.bills.one(id)).then(r => r.data),
    create: (form: BillForm, idempotencyKey?: string) =>
      api.post<ItemResponse<Bill>>(ENDPOINTS.bills.list, form, { idempotencyKey }).then(r => r.data),
    update: (id: number, form: Partial<BillForm>) =>
      api.put<ItemResponse<Bill>>(ENDPOINTS.bills.one(id), form).then(r => r.data),
    remove: (id: number) =>
      api.delete<void>(ENDPOINTS.bills.one(id)),

    approve: (id: number, idempotencyKey?: string) =>
      api.post<ItemResponse<Bill>>(ENDPOINTS.bills.approve(id), {}, { idempotencyKey }).then(r => r.data),
    cancel: (id: number, idempotencyKey?: string) =>
      api.post<ItemResponse<Bill>>(ENDPOINTS.bills.cancel(id), {}, { idempotencyKey }).then(r => r.data),

    listPayments: (id: number) =>
      api.get<{ data: BillPayment[] }>(ENDPOINTS.bills.payments(id)).then(r => r.data),
    createPayment: (id: number, form: BillPaymentForm, idempotencyKey: string) =>
      api.post<ItemResponse<BillPayment>>(ENDPOINTS.bills.payments(id), form, { idempotencyKey }).then(r => r.data),
    voidPayment: (paymentId: number) =>
      api.delete<void>(ENDPOINTS.billPayments.void(paymentId)),
  }
}
