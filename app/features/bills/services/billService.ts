import { ENDPOINTS } from '~/core/api/endpoints'
import type { BaseListParams, ItemResponse, ListResponse } from '~/shared/types/common'

export type BillStatus = 'draft' | 'pending_approval' | 'approved' | 'paid' | 'partial' | 'cancelled'

export interface BillLine {
  id?: number
  description: string
  quantity: number
  unit_price: number
  account_id: number
  cost_center_id?: number | null
  project_id?: number | null
  vat_rate?: number
  wht_rate?: number
  eta_item_code?: string | null
}

export interface Bill {
  id: number
  vendor_id: number
  bill_number: string
  bill_date: string
  due_date: string
  currency: string
  exchange_rate: number
  reference: string | null
  notes: string | null
  status: BillStatus
  subtotal: number
  vat_total: number
  wht_total: number
  total: number
  amount_paid: number
  balance_due: number
  attachments?: Array<{ id: number; name: string; url: string }>
  lines?: BillLine[]
  payments?: BillPayment[]
  vendor?: { id: number; name: string }
  created_at: string
  approved_at: string | null
  cancelled_at: string | null
}

export interface BillForm {
  vendor_id: number
  bill_number: string
  bill_date: string
  due_date: string
  currency?: string
  exchange_rate?: number
  reference?: string
  notes?: string
  attachments?: number[]
  lines: BillLine[]
}

export interface BillListParams extends BaseListParams {
  vendor_id?: number
  status?: BillStatus
  from_date?: string
  to_date?: string
  due_from?: string
  due_to?: string
}

export interface BillPayment {
  id: number
  bill_id: number
  amount: number
  payment_date: string
  payment_method: 'cash' | 'bank_transfer' | 'cheque' | 'card'
  bank_account_id: number | null
  reference: string | null
  wht_amount: number
  notes: string | null
  voided_at: string | null
  created_at: string
}

export interface BillPaymentForm {
  amount: number
  payment_date: string
  payment_method: BillPayment['payment_method']
  bank_account_id?: number
  reference?: string
  wht_amount?: number
  notes?: string
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

    approve: (id: number, payload: { notes?: string } = {}, idempotencyKey?: string) =>
      api.post<ItemResponse<Bill>>(ENDPOINTS.bills.approve(id), payload, { idempotencyKey }).then(r => r.data),
    cancel: (id: number, payload: { reason: string }, idempotencyKey?: string) =>
      api.post<ItemResponse<Bill>>(ENDPOINTS.bills.cancel(id), payload, { idempotencyKey }).then(r => r.data),

    listPayments: (id: number) =>
      api.get<{ data: BillPayment[] }>(ENDPOINTS.bills.payments(id)).then(r => r.data),
    createPayment: (id: number, form: BillPaymentForm, idempotencyKey: string) =>
      api.post<ItemResponse<BillPayment>>(ENDPOINTS.bills.payments(id), form, { idempotencyKey }).then(r => r.data),
    voidPayment: (paymentId: number) =>
      api.delete<void>(ENDPOINTS.billPayments.void(paymentId)),
  }
}
