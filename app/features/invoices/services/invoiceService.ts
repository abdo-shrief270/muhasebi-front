import { ENDPOINTS } from '~/core/api/endpoints'
import type { BaseListParams, ItemResponse, ListResponse } from '~/shared/types/common'
import type { Invoice, InvoiceForm } from '~/shared/types/invoice'

export type InvoiceStatus =
  | 'draft' | 'sent' | 'partial' | 'paid' | 'overdue' | 'cancelled' | 'credited'

export type InvoiceType = 'standard' | 'credit' | 'debit'

export interface InvoiceListParams extends BaseListParams {
  client_id?: number
  status?: InvoiceStatus
  from_date?: string
  to_date?: string
  due_from?: string
  due_to?: string
  min_amount?: number
  max_amount?: number
  currency?: string
}

export interface PreCheckPayload {
  client_id: number
  total: number
  date: string
}

export interface PreCheckResult {
  ok: boolean
  warnings: string[]
}

export interface InvoiceCancelPayload {
  reason: string
}

export interface CreditNotePayload {
  date: string
  reason: string
  lines: Array<Partial<InvoiceForm['lines'][number]>>
  notes?: string
}

export interface SendInvoicePayload {
  to: string[]
  cc?: string[]
  subject?: string
  message?: string
  channels: Array<'email' | 'whatsapp'>
}

export interface PaymentForm {
  invoice_id: number
  amount: number
  payment_date: string
  payment_method: 'cash' | 'bank_transfer' | 'cheque' | 'card' | 'paymob' | 'fawry'
  reference?: string
  bank_account_id?: number
  notes?: string
}

export interface PaymentRecord {
  id: number
  invoice_id: number
  amount: number
  payment_date: string
  payment_method: PaymentForm['payment_method']
  reference: string | null
  notes: string | null
  created_at: string
}

export interface PaymentListParams extends BaseListParams {
  client_id?: number
  invoice_id?: number
  from_date?: string
  to_date?: string
  payment_method?: PaymentForm['payment_method']
}

function toQuery(p: Record<string, unknown>): string {
  const q = new URLSearchParams()
  for (const [k, v] of Object.entries(p)) {
    if (v === '' || v == null) continue
    q.set(k, String(v))
  }
  return q.toString() ? `?${q}` : ''
}

export function invoiceService() {
  const api = useApi()

  return {
    list: (params: InvoiceListParams = {}) =>
      api.get<ListResponse<Invoice>>(`${ENDPOINTS.invoices.list}${toQuery(params)}`),
    get: (id: number) =>
      api.get<ItemResponse<Invoice>>(ENDPOINTS.invoices.one(id)).then(r => r.data),
    create: (form: InvoiceForm, idempotencyKey?: string) =>
      api.post<ItemResponse<Invoice>>(ENDPOINTS.invoices.list, form, { idempotencyKey }).then(r => r.data),
    update: (id: number, form: Partial<InvoiceForm>) =>
      api.put<ItemResponse<Invoice>>(ENDPOINTS.invoices.one(id), form).then(r => r.data),
    remove: (id: number) =>
      api.delete<void>(ENDPOINTS.invoices.one(id)),

    preCheck: (payload: PreCheckPayload) =>
      api.post<PreCheckResult>(ENDPOINTS.invoices.preCheck, payload),
    cancel: (id: number, payload: InvoiceCancelPayload, idempotencyKey?: string) =>
      api.post<ItemResponse<Invoice>>(ENDPOINTS.invoices.cancel(id), payload, { idempotencyKey }).then(r => r.data),
    postToGL: (id: number, idempotencyKey?: string) =>
      api.post<ItemResponse<Invoice>>(ENDPOINTS.invoices.postToGL(id), undefined, { idempotencyKey }).then(r => r.data),
    creditNote: (id: number, payload: CreditNotePayload, idempotencyKey?: string) =>
      api.post<ItemResponse<Invoice>>(ENDPOINTS.invoices.creditNote(id), payload, { idempotencyKey }).then(r => r.data),
    pdf: (id: number, locale?: 'ar' | 'en', template?: string) => {
      const qs = toQuery({ locale, template })
      return `${ENDPOINTS.invoices.pdf(id)}${qs}`
    },
    send: (id: number, payload: SendInvoicePayload, idempotencyKey?: string) =>
      api.post<{ message: string }>(ENDPOINTS.invoices.send(id), payload, { idempotencyKey }),

    writeOff: (id: number, payload: { amount: number; account_id: number; reason: string }, idempotencyKey?: string) =>
      api.post<ItemResponse<Invoice>>(ENDPOINTS.invoices.writeOff(id), payload, { idempotencyKey }).then(r => r.data),
    escalate: (id: number, payload: { assigned_to?: number; notes?: string }, idempotencyKey?: string) =>
      api.post<ItemResponse<Invoice>>(ENDPOINTS.invoices.escalate(id), payload, { idempotencyKey }).then(r => r.data),
  }
}

export function paymentsService() {
  const api = useApi()

  return {
    list: (params: PaymentListParams = {}) =>
      api.get<ListResponse<PaymentRecord>>(`${ENDPOINTS.payments.list}${toQuery(params)}`),
    create: (form: PaymentForm, idempotencyKey: string) =>
      api.post<ItemResponse<PaymentRecord>>(ENDPOINTS.payments.list, form, { idempotencyKey }).then(r => r.data),
    void: (id: number) =>
      api.delete<void>(ENDPOINTS.payments.remove(id)),
  }
}
