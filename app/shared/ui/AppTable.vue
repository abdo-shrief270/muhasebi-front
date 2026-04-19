<template>
  <div class="relative flex flex-col">
    <div v-if="$slots.toolbar || exportable" class="flex items-center gap-2 px-3 py-2 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-0 dark:bg-neutral-950">
      <div class="flex-1 flex items-center gap-2">
        <slot name="toolbar" />
      </div>
      <div class="flex items-center gap-1">
        <UiAppColumnChooser
          v-if="showColumnChooser"
          :columns="(columns as unknown) as import('~/shared/ui/table-types').ColumnDef[]"
          :visible="visibleColumnKeys"
          @update:visible="$emit('update:visible-columns', $event)"
        />
        <button
          v-if="exportable"
          type="button"
          class="h-7 px-2 rounded-md text-[11px] text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 inline-flex items-center gap-1"
          @click="exportCsv"
          :title="$t('common.export', 'Export')"
        >
          <UIcon name="i-lucide-download" class="w-3.5 h-3.5" />
          CSV
        </button>
      </div>
    </div>

    <div ref="scrollerRef" class="overflow-auto" tabindex="0" @keydown="onKeydown">
      <table class="w-full text-[13px] border-separate border-spacing-0" :class="densityClass">
        <thead>
          <tr class="bg-neutral-50 dark:bg-neutral-900">
            <th
              v-if="selectable"
              scope="col"
              class="sticky top-0 start-0 z-20 w-10 px-3 py-2 bg-inherit border-b border-neutral-200 dark:border-neutral-800"
            >
              <input
                type="checkbox"
                class="rounded border-neutral-300 text-primary-500 focus:ring-primary-500 focus:ring-offset-0"
                :checked="allVisibleSelected"
                :indeterminate.prop="someSelected && !allVisibleSelected"
                @change="toggleSelectAll"
                :aria-label="locale === 'ar' ? 'تحديد الكل' : 'Select all'"
              />
            </th>
            <th
              v-for="col in visibleColumns"
              :key="col.key"
              scope="col"
              :class="[
                'sticky top-0 z-10 bg-inherit px-3 py-2 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider border-b border-neutral-200 dark:border-neutral-800 whitespace-nowrap',
                col.align === 'end' ? 'text-end' : col.align === 'center' ? 'text-center' : 'text-start',
                col.stickyStart ? 'start-0 z-20 after:absolute after:inset-y-0 after:end-0 after:w-px after:bg-neutral-200 dark:after:bg-neutral-800' : '',
                col.stickyEnd ? 'end-0 z-20 before:absolute before:inset-y-0 before:start-0 before:w-px before:bg-neutral-200 dark:before:bg-neutral-800' : '',
                col.headerClass,
              ]"
              :style="col.width ? { width: typeof col.width === 'number' ? col.width + 'px' : col.width } : undefined"
            >
              <button
                v-if="col.sortable"
                type="button"
                class="inline-flex items-center gap-1 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
                @click="$emit('sort', col.key)"
                :aria-sort="sortAria(col.key)"
              >
                <span>{{ col.label }}</span>
                <UIcon
                  :name="sortIcon(col.key)"
                  class="w-3 h-3"
                  :class="state?.sortBy === col.key ? 'text-primary-500' : 'text-neutral-300'"
                />
              </button>
              <span v-else>{{ col.label }}</span>
            </th>
          </tr>
        </thead>

        <tbody v-if="loading">
          <tr v-for="n in skeletonRowCount" :key="`skel-${n}`" class="border-b border-neutral-100 dark:border-neutral-900">
            <td v-if="selectable" class="px-3 py-2">
              <div class="h-3.5 w-3.5 rounded bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
            </td>
            <td v-for="col in visibleColumns" :key="col.key" class="px-3 py-2">
              <div class="h-3 rounded bg-neutral-100 dark:bg-neutral-800 animate-pulse" :style="{ width: skeletonWidth(col.key) }" />
            </td>
          </tr>
        </tbody>

        <tbody v-else-if="rows.length === 0">
          <tr>
            <td :colspan="totalColumns" class="px-3 py-16">
              <slot name="empty">
                <div class="flex flex-col items-center gap-2 text-center text-neutral-400">
                  <UIcon name="i-lucide-inbox" class="w-8 h-8" />
                  <p class="text-sm font-medium text-neutral-500 dark:text-neutral-400">{{ emptyTitle ?? $t('common.noData') }}</p>
                  <p v-if="emptyDescription" class="text-xs">{{ emptyDescription }}</p>
                </div>
              </slot>
            </td>
          </tr>
        </tbody>

        <tbody v-else>
          <tr
            v-for="(row, rowIndex) in rows"
            :key="rowKey(row, rowIndex)"
            class="group border-b border-neutral-100 dark:border-neutral-900 transition-colors"
            :class="[
              rowIndex === focusIndex ? 'bg-primary-50/40 dark:bg-primary-500/5' : 'hover:bg-neutral-50 dark:hover:bg-neutral-900/50',
              isRowSelected(row) ? 'bg-primary-50/60 dark:bg-primary-500/10' : '',
              rowClickable ? 'cursor-pointer' : '',
            ]"
            @click="onRowClick(row, $event)"
          >
            <td
              v-if="selectable"
              class="sticky start-0 bg-neutral-0 dark:bg-neutral-950 px-3 py-2 z-[1]"
              @click.stop
            >
              <input
                type="checkbox"
                class="rounded border-neutral-300 text-primary-500 focus:ring-primary-500 focus:ring-offset-0"
                :checked="isRowSelected(row)"
                @change="$emit('toggle-select', row)"
                :aria-label="locale === 'ar' ? 'تحديد الصف' : 'Select row'"
              />
            </td>
            <td
              v-for="col in visibleColumns"
              :key="col.key"
              :class="[
                'px-3 py-2 text-neutral-700 dark:text-neutral-300',
                col.align === 'end' ? 'text-end' : col.align === 'center' ? 'text-center' : 'text-start',
                col.stickyStart ? 'sticky start-0 z-[1] bg-neutral-0 dark:bg-neutral-950' : '',
                col.stickyEnd ? 'sticky end-0 z-[1] bg-neutral-0 dark:bg-neutral-950' : '',
                col.cellClass,
                col.render === 'money' || col.render === 'percent' || col.render === 'date' || col.render === 'datetime' ? 'tabular-nums' : '',
              ]"
            >
              <slot :name="`cell-${col.key}`" :row="row" :value="getCellValue(row, col)" :column="col">
                <AppTableCell :value="getCellValue(row, col)" :column="col" />
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div
      v-if="pagination && state"
      class="flex items-center justify-between gap-3 px-3 py-2 border-t border-neutral-200 dark:border-neutral-800 text-xs text-neutral-500"
    >
      <div class="flex items-center gap-2">
        <span>{{ $t('common.rows_per_page', 'Rows:') }}</span>
        <select
          v-model="perPageModel"
          class="h-7 rounded border border-neutral-200 dark:border-neutral-800 bg-neutral-0 dark:bg-neutral-950 px-1.5 text-xs"
        >
          <option v-for="n in perPageOptions" :key="n" :value="n">{{ n }}</option>
        </select>
        <span v-if="totalItems != null">
          {{ rangeLabel }}
        </span>
      </div>

      <div class="flex items-center gap-1">
        <button
          type="button"
          class="h-7 px-2 rounded-md border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900 disabled:opacity-40 disabled:cursor-not-allowed"
          :disabled="state.page <= 1"
          @click="$emit('go-to-page', state.page - 1)"
        >
          <UIcon :name="isRtl ? 'i-lucide-chevron-right' : 'i-lucide-chevron-left'" class="w-3.5 h-3.5" />
        </button>
        <span class="px-2">{{ state.page }} / {{ totalPages || 1 }}</span>
        <button
          type="button"
          class="h-7 px-2 rounded-md border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900 disabled:opacity-40 disabled:cursor-not-allowed"
          :disabled="state.page >= (totalPages || 1)"
          @click="$emit('go-to-page', state.page + 1)"
        >
          <UIcon :name="isRtl ? 'i-lucide-chevron-left' : 'i-lucide-chevron-right'" class="w-3.5 h-3.5" />
        </button>
      </div>
    </div>

    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="selectable && selectedCount > 0"
          class="fixed bottom-6 inset-x-0 mx-auto z-40 pointer-events-none flex justify-center px-4"
        >
          <div class="pointer-events-auto flex items-center gap-3 bg-neutral-900 text-neutral-0 rounded-xl shadow-overlay px-4 py-2 max-w-3xl w-full">
            <span class="text-xs font-medium flex-shrink-0">
              {{ selectedCount }} {{ locale === 'ar' ? 'محدد' : 'selected' }}
            </span>
            <div class="flex-1 flex items-center gap-2 justify-end">
              <slot name="bulk-actions" :selected-ids="selectedIdsArray" :clear-selection="clearSelection" />
              <button
                type="button"
                class="h-7 px-2 rounded-md text-xs text-neutral-300 hover:bg-white/10"
                @click="clearSelection"
              >
                {{ locale === 'ar' ? 'إلغاء' : 'Clear' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts" generic="TRow extends Record<string, unknown>">
import type { ListState } from '~/shared/composables/useListState'
import type { ColumnDef, CellValue } from '~/shared/ui/table-types'

const props = withDefaults(defineProps<{
  columns: ColumnDef<TRow>[]
  rows: TRow[]
  loading?: boolean
  selectable?: boolean
  exportable?: boolean
  state?: ListState<Record<string, unknown>>
  totalItems?: number
  emptyTitle?: string
  emptyDescription?: string
  rowClickable?: boolean
  rowKeyGetter?: (row: TRow, index: number) => string | number
  density?: 'compact' | 'comfortable'
  perPageOptions?: number[]
  pagination?: boolean
  showColumnChooser?: boolean
  skeletonRowCount?: number
}>(), {
  loading: false,
  selectable: false,
  exportable: false,
  rowClickable: true,
  density: 'compact',
  perPageOptions: () => [10, 25, 50, 100],
  pagination: true,
  showColumnChooser: true,
  skeletonRowCount: 6,
})

const emit = defineEmits<{
  'row-click':             [row: TRow]
  'sort':                  [key: string]
  'go-to-page':            [page: number]
  'update:per-page':       [perPage: number]
  'update:visible-columns':[keys: string[]]
  'toggle-select':         [row: TRow]
  'toggle-select-all':     [rows: TRow[]]
  'clear-selection':       []
}>()

const { locale } = useI18n()
const { isRtl } = useDir()

const visibleColumnKeys = computed<string[]>(() => props.state?.visibleColumns?.length ? props.state.visibleColumns : props.columns.map(c => c.key))

const visibleColumns = computed<ColumnDef<TRow>[]>(() => {
  const allowed = new Set(visibleColumnKeys.value)
  return props.columns.filter(c => allowed.has(c.key))
})

const densityClass = computed(() => props.density === 'comfortable' ? '[&_td]:py-2.5 [&_th]:py-2.5' : '[&_td]:py-1.5 [&_th]:py-2')

const totalColumns = computed(() => visibleColumns.value.length + (props.selectable ? 1 : 0))

const rowKey = (row: TRow, index: number): string | number => {
  if (props.rowKeyGetter) return props.rowKeyGetter(row, index)
  return (row as { id?: string | number }).id ?? index
}

const selectedIdsArray = computed<Array<string | number>>(() => props.state ? [...props.state.selectedIds] : [])
const selectedCount = computed(() => selectedIdsArray.value.length)
const someSelected = computed(() => selectedCount.value > 0)
const allVisibleSelected = computed(() => {
  if (!props.state || props.rows.length === 0) return false
  return props.rows.every((row, i) => props.state!.selectedIds.has(rowKey(row, i)))
})

function isRowSelected(row: TRow): boolean {
  if (!props.state) return false
  return props.state.selectedIds.has((row as { id?: string | number }).id ?? -1)
}

function toggleSelectAll() {
  emit('toggle-select-all', props.rows)
}

function clearSelection() {
  emit('clear-selection')
}

function onRowClick(row: TRow, event: MouseEvent) {
  if (!props.rowClickable) return
  if ((event.target as HTMLElement).closest('button, a, input, [data-stop-row-click]')) return
  emit('row-click', row)
}

function getCellValue(row: TRow, col: ColumnDef<TRow>): CellValue {
  const keyPath = col.key.split('.')
  let v: unknown = row
  for (const seg of keyPath) {
    if (v == null || typeof v !== 'object') return undefined as CellValue
    v = (v as Record<string, unknown>)[seg]
  }
  return v as CellValue
}

function sortIcon(key: string): string {
  if (props.state?.sortBy !== key) return 'i-lucide-chevrons-up-down'
  return props.state.sortDirection === 'asc' ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'
}

function sortAria(key: string): 'none' | 'ascending' | 'descending' {
  if (props.state?.sortBy !== key) return 'none'
  return props.state.sortDirection === 'asc' ? 'ascending' : 'descending'
}

const perPageModel = computed({
  get: () => props.state?.perPage ?? 25,
  set: (v: number) => emit('update:per-page', v),
})

const totalPages = computed(() => {
  if (props.totalItems == null || !props.state) return null
  return Math.max(1, Math.ceil(props.totalItems / props.state.perPage))
})

const rangeLabel = computed(() => {
  if (!props.state || props.totalItems == null) return ''
  const start = (props.state.page - 1) * props.state.perPage + 1
  const end = Math.min(props.state.page * props.state.perPage, props.totalItems)
  const of = locale.value === 'ar' ? 'من' : 'of'
  return `${start}–${end} ${of} ${props.totalItems}`
})

// ---- Keyboard navigation: j/k/Enter/x — skip when a text input has focus.
const focusIndex = ref(-1)
const scrollerRef = ref<HTMLElement | null>(null)

function onKeydown(e: KeyboardEvent) {
  const target = e.target as HTMLElement
  if (target.matches('input, textarea, [contenteditable="true"]')) return
  if (props.rows.length === 0) return

  switch (e.key) {
    case 'j':
    case 'ArrowDown':
      e.preventDefault()
      focusIndex.value = Math.min(props.rows.length - 1, focusIndex.value + 1)
      break
    case 'k':
    case 'ArrowUp':
      e.preventDefault()
      focusIndex.value = Math.max(0, focusIndex.value - 1)
      break
    case 'Enter':
      if (focusIndex.value >= 0 && focusIndex.value < props.rows.length) {
        e.preventDefault()
        emit('row-click', props.rows[focusIndex.value] as TRow)
      }
      break
    case 'x':
      if (props.selectable && focusIndex.value >= 0 && focusIndex.value < props.rows.length) {
        e.preventDefault()
        emit('toggle-select', props.rows[focusIndex.value] as TRow)
      }
      break
  }
}

function exportCsv() {
  const exportable = props.columns.filter(c => c.key !== 'actions' && !c.excludeFromExport)
  const header = exportable.map(c => c.label).join(',')
  const lines = props.rows.map((row, idx) =>
    exportable.map(c => {
      const v = getCellValue(row, c)
      const s = v == null ? '' : typeof v === 'object' ? JSON.stringify(v) : String(v)
      return `"${s.replace(/"/g, '""')}"`
    }).join(',')
    // idx is unused but silences tsc "unused param" on some configs
    + (idx < 0 ? '' : ''),
  )
  const csv = '\uFEFF' + [header, ...lines].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `export-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

function skeletonWidth(key: string): string {
  // Deterministic pseudo-random width per column, stable across renders.
  let h = 0
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) & 0xffff
  const pct = 45 + (h % 45)
  return `${pct}%`
}
</script>

<style scoped>
@reference "~/assets/css/tokens.css";

.fade-enter-active, .fade-leave-active {
  transition: all var(--duration-normal) var(--ease-emphasized);
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
