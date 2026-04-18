import { ENDPOINTS } from '~/core/api/endpoints'
import type { BaseListParams, ItemResponse, ListResponse } from '~/shared/types/common'

export type InvoiceNumberingStrategy = 'per_year' | 'continuous'

export interface InvoiceSettings {
  default_due_days: number
  prefix: string
  numbering_strategy: InvoiceNumberingStrategy
  default_currency: string
  default_vat_rate: number
  logo_url: string | null
  terms: string | null
  footer: string | null
  default_template: string | null
  send_reminder_days_before_due: number
}

export type AgingReminderChannel = 'email' | 'sms' | 'whatsapp'

export interface AgingReminderStep {
  days_past_due: number
  channel: AgingReminderChannel
  template: string
}

export interface AgingReminderSettings {
  enabled: boolean
  schedule: AgingReminderStep[]
  cc_internal: string[]
}

export interface AgingReminderHistoryEntry {
  id: number
  invoice_id: number
  invoice_number: string
  step: AgingReminderStep
  channel: AgingReminderChannel
  dispatched_at: string
  status: 'sent' | 'failed' | 'skipped'
  error: string | null
}

function toQuery(p: Record<string, unknown>): string {
  const q = new URLSearchParams()
  for (const [k, v] of Object.entries(p)) {
    if (v === '' || v == null) continue
    q.set(k, String(v))
  }
  return q.toString() ? `?${q}` : ''
}

export function invoiceSettingsService() {
  const api = useApi()

  return {
    get: () =>
      api.get<ItemResponse<InvoiceSettings>>(ENDPOINTS.invoiceSettings.root).then(r => r.data),
    update: (payload: Partial<InvoiceSettings>) =>
      api.put<ItemResponse<InvoiceSettings>>(ENDPOINTS.invoiceSettings.root, payload).then(r => r.data),

    agingReminders: {
      getSettings: () =>
        api.get<ItemResponse<AgingReminderSettings>>(ENDPOINTS.agingReminders.settings).then(r => r.data),
      updateSettings: (payload: AgingReminderSettings) =>
        api.put<ItemResponse<AgingReminderSettings>>(ENDPOINTS.agingReminders.settings, payload).then(r => r.data),
      history: (params: BaseListParams = {}) =>
        api.get<ListResponse<AgingReminderHistoryEntry>>(`${ENDPOINTS.agingReminders.history}${toQuery(params)}`),
      invoiceHistory: (invoiceId: number) =>
        api.get<{ data: AgingReminderHistoryEntry[] }>(ENDPOINTS.agingReminders.invoiceHistory(invoiceId)).then(r => r.data),
      trigger: (idempotencyKey?: string) =>
        api.post<{ data: { dispatched: number } }>(ENDPOINTS.agingReminders.trigger, undefined, { idempotencyKey }),
    },
  }
}
