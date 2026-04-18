import { ENDPOINTS } from '~/core/api/endpoints'
import type { BaseListParams, ItemResponse, ListResponse } from '~/shared/types/common'
import type { InvoiceForm } from '~/shared/types/invoice'

export type RecurringInvoiceFrequency = 'weekly' | 'monthly' | 'quarterly' | 'yearly'

export interface RecurringInvoice {
  id: number
  client_id: number
  frequency: RecurringInvoiceFrequency
  start_date: string
  end_date: string | null
  day_of_month: number | null
  auto_send: boolean
  is_active: boolean
  next_run_at: string | null
  last_run_at: string | null
  lines?: InvoiceForm['lines']
  created_at: string
}

export type RecurringInvoiceForm = Pick<RecurringInvoice, 'client_id' | 'frequency' | 'start_date' | 'end_date' | 'day_of_month' | 'auto_send'> & {
  lines: InvoiceForm['lines']
}

function toQuery(p: Record<string, unknown>): string {
  const q = new URLSearchParams()
  for (const [k, v] of Object.entries(p)) {
    if (v === '' || v == null) continue
    q.set(k, String(v))
  }
  return q.toString() ? `?${q}` : ''
}

export function recurringInvoiceService() {
  const api = useApi()

  return {
    list: (params: BaseListParams = {}) =>
      api.get<ListResponse<RecurringInvoice>>(`${ENDPOINTS.recurringInvoices.list}${toQuery(params)}`),
    get: (id: number) =>
      api.get<ItemResponse<RecurringInvoice>>(ENDPOINTS.recurringInvoices.one(id)).then(r => r.data),
    create: (form: RecurringInvoiceForm, idempotencyKey?: string) =>
      api.post<ItemResponse<RecurringInvoice>>(ENDPOINTS.recurringInvoices.list, form, { idempotencyKey }).then(r => r.data),
    update: (id: number, form: Partial<RecurringInvoiceForm>) =>
      api.put<ItemResponse<RecurringInvoice>>(ENDPOINTS.recurringInvoices.one(id), form).then(r => r.data),
    remove: (id: number) =>
      api.delete<void>(ENDPOINTS.recurringInvoices.one(id)),
  }
}
