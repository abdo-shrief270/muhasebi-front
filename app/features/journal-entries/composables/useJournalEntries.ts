import type { JournalEntry, JournalEntryForm } from '~/shared/types/accounting'
import { journalEntryService, type JournalEntryListParams } from '~/features/journal-entries/services/journalEntryService'
import { invalidateQuery, useMutation, useQuery } from '~/core/api/query'
import { generateRequestId } from '~/core/api/requestId'

export function useJournalEntriesList(params: Ref<JournalEntryListParams> | ComputedRef<JournalEntryListParams>) {
  const svc = journalEntryService()
  return useQuery(() => svc.list(unref(params)), {
    key: () => `journal:list:${JSON.stringify(unref(params))}`,
    staleMs: 15_000,
  })
}

export function useJournalEntry(id: Ref<number | null> | ComputedRef<number | null>) {
  const svc = journalEntryService()
  return useQuery(
    () => {
      const v = unref(id)
      if (v == null) return Promise.reject(new Error('missing id'))
      return svc.get(v)
    },
    {
      key: () => `journal:one:${unref(id) ?? ''}`,
      enabled: computed(() => unref(id) != null),
    },
  )
}

export function useJournalEntryMutations() {
  const svc = journalEntryService()
  const bust = () => invalidateQuery(/^journal:/)

  return {
    create: useMutation(async (form: JournalEntryForm) => {
      const r = await svc.create(form, generateRequestId())
      bust()
      return r
    }),
    post: useMutation(async (id: number) => {
      const r = await svc.post(id, generateRequestId())
      bust()
      return r
    }),
    reverse: useMutation(async (id: number) => {
      const r = await svc.reverse(id, generateRequestId())
      bust()
      return r
    }),
    remove: useMutation(async (id: number) => {
      await svc.remove(id)
      bust()
    }),
  }
}

/** Legacy shim. */
export function useJournalEntries() {
  const svc = journalEntryService()
  const entries = ref<JournalEntry[]>([])
  const loading = ref(false)
  const meta = ref({ current_page: 1, last_page: 1, total: 0 })

  async function fetchEntries(params: Record<string, any> = {}) {
    loading.value = true
    try {
      const data = await svc.list(params as JournalEntryListParams)
      entries.value = data.data
      meta.value = {
        current_page: data.meta.current_page,
        last_page: data.meta.last_page,
        total: data.meta.total,
      }
    } catch {
      entries.value = []
    } finally {
      loading.value = false
    }
  }

  return {
    entries, loading, meta,
    fetchEntries,
    getEntry:     (id: number) => svc.get(id),
    createEntry:  (f: JournalEntryForm) => svc.create(f, generateRequestId()),
    postEntry:    (id: number) => svc.post(id, generateRequestId()),
    reverseEntry: (id: number) => svc.reverse(id, generateRequestId()),
    deleteEntry:  (id: number) => svc.remove(id),
  }
}
