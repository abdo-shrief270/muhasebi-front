import type { LocationQueryValue } from 'vue-router'

// List page state — see docs/UI_UX_SPEC.md section 11.3.
//
// Every list page holds page, perPage, sort, filters, selection in a
// reactive object. Page, sort, search and filters sync bidirectionally
// with the URL query so links, browser back/forward, and saved views
// all work. Selection and column visibility are page-session-local.
export interface ListState<TFilters extends Record<string, unknown> = Record<string, unknown>> {
  page: number
  perPage: number
  sortBy: string | null
  sortDirection: 'asc' | 'desc'
  search: string
  filters: TFilters
  selectedIds: Set<string | number>
  visibleColumns: string[]
  savedView: string | null
}

export interface UseListStateOptions<TFilters extends Record<string, unknown>> {
  /** Stable list identifier — used for saved-view storage keys. */
  id: string
  /** Default per-page, default sort. */
  defaults?: Partial<Pick<ListState<TFilters>, 'perPage' | 'sortBy' | 'sortDirection'>>
  /** Initial filter shape. Values become the baseline for `isFiltered`. */
  initialFilters: TFilters
  /** Columns visible on first load (keys from the AppTable column config). */
  initialVisibleColumns: string[]
  /**
   * Filter keys to persist in the URL. Unlisted filter keys live only in
   * memory — use this to skip huge objects or ephemeral toggles.
   */
  urlFilterKeys?: Array<keyof TFilters>
}

const DEFAULTS = {
  perPage: 25,
  sortDirection: 'desc' as const,
}

function toStr(v: LocationQueryValue | LocationQueryValue[] | undefined): string | null {
  if (v == null) return null
  if (Array.isArray(v)) return v[0] ?? null
  return v
}

function parseInt10(v: string | null, fallback: number): number {
  if (!v) return fallback
  const n = parseInt(v, 10)
  return Number.isFinite(n) ? n : fallback
}

export function useListState<TFilters extends Record<string, unknown>>(
  opts: UseListStateOptions<TFilters>,
) {
  const route = useRoute()
  const router = useRouter()

  const perPageDefault       = opts.defaults?.perPage       ?? DEFAULTS.perPage
  const sortByDefault        = opts.defaults?.sortBy        ?? null
  const sortDirectionDefault = opts.defaults?.sortDirection ?? DEFAULTS.sortDirection

  function readFromQuery(): ListState<TFilters> {
    const q = route.query
    const filters = { ...opts.initialFilters } as TFilters
    for (const key of (opts.urlFilterKeys ?? [])) {
      const raw = toStr(q[key as string])
      if (raw !== null) (filters as Record<string, unknown>)[key as string] = raw
    }
    return {
      page:          parseInt10(toStr(q.page),     1),
      perPage:       parseInt10(toStr(q.per_page), perPageDefault),
      sortBy:        toStr(q.sort_by) ?? sortByDefault,
      sortDirection: (toStr(q.sort_direction) === 'asc' ? 'asc' : sortDirectionDefault) as 'asc' | 'desc',
      search:        toStr(q.q) ?? '',
      filters,
      selectedIds:    new Set<string | number>(),
      visibleColumns: [...opts.initialVisibleColumns],
      savedView:      toStr(q.view),
    }
  }

  const state = reactive(readFromQuery()) as ListState<TFilters>

  // Watch state → URL (debounced via a micro delay so rapid updates coalesce).
  let pending = false
  function syncUrl() {
    if (pending) return
    pending = true
    nextTick(() => {
      pending = false
      const next: Record<string, string | undefined> = {
        page:           state.page === 1 ? undefined : String(state.page),
        per_page:       state.perPage === perPageDefault ? undefined : String(state.perPage),
        sort_by:        state.sortBy ?? undefined,
        sort_direction: state.sortDirection === sortDirectionDefault ? undefined : state.sortDirection,
        q:              state.search || undefined,
        view:           state.savedView ?? undefined,
      }
      for (const key of (opts.urlFilterKeys ?? [])) {
        const v = (state.filters as Record<string, unknown>)[key as string]
        next[key as string] = v == null || v === '' ? undefined : String(v)
      }
      router.replace({ query: { ...route.query, ...next } })
    })
  }

  watch(
    () => [state.page, state.perPage, state.sortBy, state.sortDirection, state.search, state.savedView, { ...state.filters }] as const,
    syncUrl,
    { deep: true },
  )

  // Reset page to 1 whenever the filter surface or search changes.
  watch(
    () => [state.search, { ...state.filters }] as const,
    () => { if (state.page !== 1) state.page = 1 },
    { deep: true },
  )

  function setSort(key: string) {
    if (state.sortBy === key) {
      state.sortDirection = state.sortDirection === 'asc' ? 'desc' : 'asc'
    } else {
      state.sortBy = key
      state.sortDirection = 'asc'
    }
  }

  function clearFilters() {
    Object.assign(state.filters, opts.initialFilters)
    state.search = ''
  }

  function toggleSelect(id: string | number) {
    if (state.selectedIds.has(id)) state.selectedIds.delete(id)
    else state.selectedIds.add(id)
  }

  function clearSelection() {
    state.selectedIds.clear()
  }

  const isFiltered = computed(() => {
    if (state.search) return true
    const init = opts.initialFilters as Record<string, unknown>
    for (const k of Object.keys(state.filters)) {
      if ((state.filters as Record<string, unknown>)[k] !== init[k]) return true
    }
    return false
  })

  /**
   * Shape the backend expects: flatten filters at the root alongside
   * page / per_page / sort_by / sort_direction.
   */
  const queryParams = computed(() => ({
    page: state.page,
    per_page: state.perPage,
    ...(state.sortBy ? { sort_by: state.sortBy, sort_direction: state.sortDirection } : {}),
    ...(state.search ? { q: state.search } : {}),
    ...(state.filters as Record<string, unknown>),
  }))

  return {
    state,
    queryParams,
    isFiltered,
    setSort,
    clearFilters,
    toggleSelect,
    clearSelection,
  }
}
