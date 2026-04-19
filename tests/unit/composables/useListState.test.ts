import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock useRoute / useRouter — useListState binds state to URL query.
const routeQuery = { value: {} as Record<string, string | undefined> }
const replaceMock = vi.fn()
const g = globalThis as typeof globalThis & { useRoute?: unknown; useRouter?: unknown }
g.useRoute = () => ({ query: routeQuery.value, path: '/invoices' })
g.useRouter = () => ({ replace: replaceMock })

// Nuxt's `reactive` is exposed by the setup file; nothing to override here.
import { useListState } from '~/shared/composables/useListState'

describe('useListState', () => {
  beforeEach(() => {
    routeQuery.value = {}
    replaceMock.mockClear()
  })

  it('seeds defaults when URL is empty', () => {
    const { state } = useListState({
      id: 'invoices',
      initialFilters: { status: '' },
      initialVisibleColumns: ['number', 'total'],
    })
    expect(state.page).toBe(1)
    expect(state.perPage).toBe(25)
    expect(state.sortDirection).toBe('desc')
    expect(state.sortBy).toBeNull()
    expect(state.search).toBe('')
    expect(state.filters.status).toBe('')
    expect(state.selectedIds.size).toBe(0)
  })

  it('hydrates from URL query', () => {
    routeQuery.value = {
      page: '3',
      per_page: '50',
      sort_by: 'total',
      sort_direction: 'asc',
      q: 'acme',
      status: 'paid',
    }
    const { state } = useListState({
      id: 'invoices',
      initialFilters: { status: '' },
      initialVisibleColumns: [],
      urlFilterKeys: ['status'],
    })
    expect(state.page).toBe(3)
    expect(state.perPage).toBe(50)
    expect(state.sortBy).toBe('total')
    expect(state.sortDirection).toBe('asc')
    expect(state.search).toBe('acme')
    expect(state.filters.status).toBe('paid')
  })

  it('setSort toggles direction when same key is clicked twice', () => {
    const { state, setSort } = useListState({
      id: 'invoices',
      initialFilters: {},
      initialVisibleColumns: [],
    })
    setSort('total')
    expect(state.sortBy).toBe('total')
    expect(state.sortDirection).toBe('asc')

    setSort('total')
    expect(state.sortDirection).toBe('desc')
  })

  it('setSort on a new key resets direction to asc', () => {
    const { state, setSort } = useListState({
      id: 'invoices',
      initialFilters: {},
      initialVisibleColumns: [],
    })
    setSort('total')
    setSort('date')
    expect(state.sortBy).toBe('date')
    expect(state.sortDirection).toBe('asc')
  })

  it('toggleSelect adds and removes ids', () => {
    const { state, toggleSelect } = useListState({
      id: 'invoices',
      initialFilters: {},
      initialVisibleColumns: [],
    })
    toggleSelect(1)
    toggleSelect(2)
    expect(state.selectedIds.size).toBe(2)
    toggleSelect(1)
    expect(state.selectedIds.has(1)).toBe(false)
    expect(state.selectedIds.has(2)).toBe(true)
  })

  it('clearSelection empties the set', () => {
    const { state, toggleSelect, clearSelection } = useListState({
      id: 'invoices',
      initialFilters: {},
      initialVisibleColumns: [],
    })
    toggleSelect(1)
    toggleSelect(2)
    clearSelection()
    expect(state.selectedIds.size).toBe(0)
  })

  it('clearFilters resets filter surface and search', () => {
    const { state, clearFilters } = useListState({
      id: 'invoices',
      initialFilters: { status: '', client_id: null as number | null },
      initialVisibleColumns: [],
    })
    state.filters.status = 'paid'
    state.filters.client_id = 42
    state.search = 'acme'
    clearFilters()
    expect(state.filters.status).toBe('')
    expect(state.filters.client_id).toBeNull()
    expect(state.search).toBe('')
  })

  it('isFiltered reflects search or diverged filters', () => {
    const { state, isFiltered } = useListState({
      id: 'invoices',
      initialFilters: { status: '' },
      initialVisibleColumns: [],
    })
    expect(isFiltered.value).toBe(false)
    state.search = 'acme'
    expect(isFiltered.value).toBe(true)
  })

  it('queryParams flattens filters for backend request', () => {
    const { state, queryParams } = useListState({
      id: 'invoices',
      initialFilters: { status: '' as string, is_active: true },
      initialVisibleColumns: [],
    })
    state.page = 2
    state.sortBy = 'total'
    state.sortDirection = 'desc'
    state.filters.status = 'paid'

    expect(queryParams.value).toMatchObject({
      page: 2,
      per_page: 25,
      sort_by: 'total',
      sort_direction: 'desc',
      status: 'paid',
      is_active: true,
    })
  })
})
