import { ENDPOINTS } from '~/core/api/endpoints'
import type { BaseListParams, ItemResponse, ListResponse } from '~/shared/types/common'
import type { JournalEntryForm } from './journalEntryService'

export type RecurringFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'

export interface RecurringJournalEntry {
  id: number
  name: string
  description: string | null
  frequency: RecurringFrequency
  start_date: string
  end_date: string | null
  is_active: boolean
  next_run_at: string | null
  last_run_at: string | null
  template: JournalEntryForm
  created_at: string
}

export type RecurringJournalEntryForm = Omit<RecurringJournalEntry, 'id' | 'is_active' | 'next_run_at' | 'last_run_at' | 'created_at' | 'template'> & {
  lines: JournalEntryForm['lines']
}

function toQuery(p: Record<string, unknown>): string {
  const q = new URLSearchParams()
  for (const [k, v] of Object.entries(p)) {
    if (v === '' || v == null) continue
    q.set(k, String(v))
  }
  return q.toString() ? `?${q}` : ''
}

export function recurringJournalEntryService() {
  const api = useApi()

  return {
    list: (params: BaseListParams = {}) =>
      api.get<ListResponse<RecurringJournalEntry>>(`${ENDPOINTS.recurringJournalEntries.list}${toQuery(params)}`),
    get: (id: number) =>
      api.get<ItemResponse<RecurringJournalEntry>>(ENDPOINTS.recurringJournalEntries.one(id)).then(r => r.data),
    create: (form: RecurringJournalEntryForm, idempotencyKey?: string) =>
      api.post<ItemResponse<RecurringJournalEntry>>(ENDPOINTS.recurringJournalEntries.list, form, { idempotencyKey }).then(r => r.data),
    update: (id: number, form: Partial<RecurringJournalEntryForm>) =>
      api.put<ItemResponse<RecurringJournalEntry>>(ENDPOINTS.recurringJournalEntries.one(id), form).then(r => r.data),
    remove: (id: number) =>
      api.delete<void>(ENDPOINTS.recurringJournalEntries.one(id)),
    toggle: (id: number) =>
      api.post<ItemResponse<RecurringJournalEntry>>(ENDPOINTS.recurringJournalEntries.toggle(id)).then(r => r.data),
  }
}
