import type { Invoice, InvoiceForm, Payment, PaymentForm } from '~/shared/types/invoice'
import type { PaginatedResponse } from '~/shared/types/client'

export interface InvoiceListParams {
  page?: number
  search?: string
  status?: string
  client_id?: number
  from?: string
  to?: string
  [key: string]: string | number | undefined
}

function toQuery(params: InvoiceListParams): string {
  const q = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v === '' || v == null) continue
    q.set(k, String(v))
  }
  const s = q.toString()
  return s ? `?${s}` : ''
}

export function invoiceService() {
  const api = useApi()

  return {
    list(params: InvoiceListParams = {}) {
      return api.get<PaginatedResponse<Invoice>>(`/invoices${toQuery(params)}`)
    },
    get(id: number) {
      return api.get<{ data: Invoice }>(`/invoices/${id}`).then(r => r.data)
    },
    create(form: Partial<InvoiceForm>, idempotencyKey?: string) {
      return api.post<{ data: Invoice }>('/invoices', form, { idempotencyKey }).then(r => r.data)
    },
    update(id: number, form: Partial<InvoiceForm>) {
      return api.put<{ data: Invoice }>(`/invoices/${id}`, form).then(r => r.data)
    },
    remove(id: number) {
      return api.delete<void>(`/invoices/${id}`)
    },
    send(id: number, idempotencyKey?: string) {
      return api.post<{ data: Invoice }>(`/invoices/${id}/send`, undefined, { idempotencyKey }).then(r => r.data)
    },
    cancel(id: number) {
      return api.post<{ data: Invoice }>(`/invoices/${id}/cancel`).then(r => r.data)
    },
    postToGL(id: number) {
      return api.post<{ data: Invoice }>(`/invoices/${id}/post-to-gl`).then(r => r.data)
    },
    createCreditNote(id: number, lines: unknown[]) {
      return api.post<{ data: Invoice }>(`/invoices/${id}/credit-note`, { lines }).then(r => r.data)
    },
    recordPayment(form: PaymentForm, idempotencyKey?: string) {
      return api.post<{ data: Payment }>('/payments', form, { idempotencyKey }).then(r => r.data)
    },
  }
}
