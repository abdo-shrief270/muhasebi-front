import type { JournalEntry, JournalEntryForm, PaginatedResponse } from '~/shared/types/accounting'

export interface JournalEntryListParams {
  page?: number
  from?: string
  to?: string
  status?: string
  [key: string]: string | number | undefined
}

function toQuery(params: JournalEntryListParams): string {
  const q = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v === '' || v == null) continue
    q.set(k, String(v))
  }
  const s = q.toString()
  return s ? `?${s}` : ''
}

export function journalEntryService() {
  const api = useApi()

  return {
    list(params: JournalEntryListParams = {}) {
      return api.get<PaginatedResponse<JournalEntry>>(`/journal-entries${toQuery(params)}`)
    },
    get(id: number) {
      return api.get<{ data: JournalEntry }>(`/journal-entries/${id}`).then(r => r.data)
    },
    create(form: JournalEntryForm, idempotencyKey?: string) {
      return api.post<{ data: JournalEntry }>('/journal-entries', form, { idempotencyKey }).then(r => r.data)
    },
    post(id: number, idempotencyKey?: string) {
      return api.post<{ data: JournalEntry }>(`/journal-entries/${id}/post`, undefined, { idempotencyKey }).then(r => r.data)
    },
    reverse(id: number, idempotencyKey?: string) {
      return api.post<{ data: JournalEntry }>(`/journal-entries/${id}/reverse`, undefined, { idempotencyKey }).then(r => r.data)
    },
    remove(id: number) {
      return api.delete<void>(`/journal-entries/${id}`)
    },
  }
}
