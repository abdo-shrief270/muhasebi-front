import type { JournalEntry, JournalEntryForm, PaginatedResponse } from '~/shared/types/accounting'

export function useJournalEntries() {
  const api = useApi()
  const entries = ref<JournalEntry[]>([])
  const loading = ref(false)
  const meta = ref({ current_page: 1, last_page: 1, total: 0 })

  async function fetchEntries(params: Record<string, any> = {}) {
    loading.value = true
    try {
      const query = new URLSearchParams()
      Object.entries(params).forEach(([k, v]) => {
        if (v !== '' && v != null) query.set(k, String(v))
      })
      const data = await api.get<PaginatedResponse<JournalEntry>>(`/journal-entries?${query}`)
      entries.value = data.data
      meta.value = { current_page: data.meta.current_page, last_page: data.meta.last_page, total: data.meta.total }
    } catch {
      entries.value = []
    } finally {
      loading.value = false
    }
  }

  async function getEntry(id: number): Promise<JournalEntry> {
    const data = await api.get<{ data: JournalEntry }>(`/journal-entries/${id}`)
    return data.data
  }

  async function createEntry(form: JournalEntryForm): Promise<JournalEntry> {
    const data = await api.post<{ data: JournalEntry }>('/journal-entries', form)
    return data.data
  }

  async function postEntry(id: number): Promise<JournalEntry> {
    const data = await api.post<{ data: JournalEntry }>(`/journal-entries/${id}/post`)
    return data.data
  }

  async function reverseEntry(id: number): Promise<JournalEntry> {
    const data = await api.post<{ data: JournalEntry }>(`/journal-entries/${id}/reverse`)
    return data.data
  }

  async function deleteEntry(id: number): Promise<void> {
    await api.delete(`/journal-entries/${id}`)
  }

  return { entries, loading, meta, fetchEntries, getEntry, createEntry, postEntry, reverseEntry, deleteEntry }
}
