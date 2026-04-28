<template>
  <div
    v-motion
    :initial="{ opacity: 0, y: 8 }"
    :enter="{ opacity: 1, y: 0 }"
    class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden"
  >
    <!-- Header bar -->
    <div
      v-if="$slots.header || exportable"
      class="px-3 py-2.5 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-950/40 flex items-center justify-between gap-3 flex-wrap"
    >
      <div class="flex items-center gap-2 flex-1 min-w-0 flex-wrap">
        <slot name="header" />
      </div>
      <div class="flex items-center gap-1 flex-shrink-0">
        <slot name="header-actions" />
        <button
          v-if="exportable && rows.length > 0"
          type="button"
          @click="exportCsv"
          class="h-8 px-2.5 inline-flex items-center gap-1.5 rounded-md text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-0 transition-colors"
          :title="locale === 'ar' ? 'تصدير CSV' : 'Export CSV'"
        >
          <UIcon name="i-lucide-download" class="w-3.5 h-3.5" />
          CSV
        </button>
      </div>
    </div>

    <!-- Bulk actions bar -->
    <Transition name="fade-slide-down">
      <div
        v-if="selectable && selectedIds.length > 0"
        class="px-3 py-2 bg-primary-500/8 dark:bg-primary-500/10 border-b border-primary-500/20 flex items-center justify-between gap-3 flex-wrap"
      >
        <div class="flex items-center gap-2.5">
          <UIcon name="i-lucide-check-square" class="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
          <span class="text-xs font-semibold text-primary-700 dark:text-primary-300 tabular-nums">
            {{ selectedIds.length }}
            <span class="font-normal text-primary-700/80 dark:text-primary-300/80">
              {{ locale === 'ar' ? 'محدد' : selectedIds.length === 1 ? 'item selected' : 'items selected' }}
            </span>
          </span>
          <button
            type="button"
            @click="clearSelection"
            class="text-[11px] font-medium text-primary-700 dark:text-primary-300 hover:text-primary-800 dark:hover:text-primary-200 underline-offset-2 hover:underline transition-colors"
          >
            {{ locale === 'ar' ? 'مسح التحديد' : 'Clear selection' }}
          </button>
        </div>
        <div class="flex items-center gap-1">
          <slot name="bulk-actions" :selectedIds="selectedIds" :selectedCount="selectedIds.length" :clearSelection="clearSelection" />
        </div>
      </div>
    </Transition>

    <!-- Table -->
    <div class="overflow-x-auto">
      <table class="w-full text-sm border-collapse">
        <thead class="bg-neutral-50 dark:bg-neutral-950/40">
          <tr class="border-b border-neutral-200 dark:border-neutral-800">
            <th v-if="selectable" class="px-3 py-2 w-9 text-start">
              <input
                type="checkbox"
                :checked="allVisibleSelected"
                :indeterminate.prop="someSelected && !allVisibleSelected"
                @change="toggleSelectAll"
                class="w-3.5 h-3.5 rounded-sm border-neutral-300 dark:border-neutral-700 text-primary-600 focus:ring-2 focus:ring-primary-500/40 cursor-pointer"
                :title="locale === 'ar' ? 'تحديد الكل' : 'Select all'"
              />
            </th>
            <th
              v-for="col in columns"
              :key="col.key"
              class="px-3 py-2 text-start text-[10px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider whitespace-nowrap"
              :class="col.class"
            >
              <button
                v-if="col.sortable"
                type="button"
                @click="toggleSort(col.key)"
                class="inline-flex items-center gap-1 hover:text-neutral-900 dark:hover:text-neutral-0 transition-colors group/sort"
              >
                {{ col.label }}
                <UIcon
                  :name="sortIconFor(col.key)"
                  class="w-3 h-3 transition-opacity"
                  :class="sortBy === col.key ? 'text-primary-600 dark:text-primary-400 opacity-100' : 'text-neutral-400 opacity-50 group-hover/sort:opacity-100'"
                />
              </button>
              <span v-else>{{ col.label }}</span>
            </th>
          </tr>
        </thead>

        <tbody v-if="loading">
          <tr v-for="i in skeletonRows" :key="i" class="border-b border-neutral-100 dark:border-neutral-900">
            <td v-if="selectable" class="px-3 py-2.5">
              <div class="h-3.5 w-3.5 rounded-sm bg-neutral-100 dark:bg-neutral-800 animate-pulse"></div>
            </td>
            <td v-for="(col, ci) in columns" :key="col.key" class="px-3 py-2.5">
              <div
                class="h-3 rounded bg-neutral-100 dark:bg-neutral-800 animate-pulse"
                :style="{ width: skeletonWidth(ci) }"
              ></div>
            </td>
          </tr>
        </tbody>

        <tbody v-else-if="rows.length > 0">
          <tr
            v-for="(row, index) in rows"
            :key="row.id || index"
            class="border-b border-neutral-100 dark:border-neutral-800/60 hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40 transition-colors group/row"
            :class="[
              selectable && isSelected(row) ? 'bg-primary-500/[0.04] dark:bg-primary-500/[0.08]' : '',
              clickable ? 'cursor-pointer' : '',
            ]"
            @click="onRowClick(row, $event)"
          >
            <td v-if="selectable" class="px-3 py-2 w-9" @click.stop>
              <input
                type="checkbox"
                :checked="isSelected(row)"
                @change="toggleRow(row)"
                class="w-3.5 h-3.5 rounded-sm border-neutral-300 dark:border-neutral-700 text-primary-600 focus:ring-2 focus:ring-primary-500/40 cursor-pointer"
              />
            </td>
            <td
              v-for="col in columns"
              :key="col.key"
              class="px-3 py-2 text-neutral-700 dark:text-neutral-200 align-middle table-row-density"
              :class="col.class"
            >
              <slot :name="`cell-${col.key}`" :row="row" :value="row[col.key]" :index="index">
                <span class="truncate">{{ formatCell(row[col.key]) }}</span>
              </slot>
            </td>
          </tr>
        </tbody>

        <tbody v-else>
          <tr>
            <td :colspan="selectable ? columns.length + 1 : columns.length" class="py-2">
              <slot name="empty">
                <UiEmptyState
                  :icon="emptyIcon"
                  :title="emptyTitle || $t('common.noData')"
                  :description="emptyDescription"
                />
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Footer / pagination -->
    <div
      v-if="showFooter"
      class="px-3 py-2 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-950/40 flex items-center justify-between gap-3 flex-wrap"
    >
      <!-- Per-page + range -->
      <div class="flex items-center gap-3 text-[11px] text-neutral-500 dark:text-neutral-400">
        <div v-if="perPage" class="flex items-center gap-1.5">
          <span>{{ locale === 'ar' ? 'لكل صفحة:' : 'Rows:' }}</span>
          <div class="relative">
            <select
              :value="perPage"
              @change="$emit('perPageChange', Number(($event.target as HTMLSelectElement).value))"
              class="ps-2 pe-6 h-6 text-[11px] rounded-sm border border-neutral-200 dark:border-neutral-800 bg-neutral-0 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-200 appearance-none cursor-pointer focus:border-primary-500 outline-none"
            >
              <option v-for="p in perPageOptions" :key="p" :value="p">{{ p }}</option>
            </select>
            <UIcon name="i-lucide-chevron-down" class="absolute end-1 top-1/2 -translate-y-1/2 w-3 h-3 text-neutral-400 pointer-events-none" />
          </div>
        </div>
        <span v-if="rangeLabel" class="tabular-nums">{{ rangeLabel }}</span>
      </div>

      <!-- Page nav -->
      <div v-if="totalPages > 1" class="flex items-center gap-0.5">
        <button
          type="button"
          :disabled="currentPage <= 1"
          @click="$emit('pageChange', 1)"
          class="page-btn"
          :title="locale === 'ar' ? 'الأولى' : 'First'"
        >
          <UIcon :name="isRtl ? 'i-lucide-chevrons-right' : 'i-lucide-chevrons-left'" class="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          :disabled="currentPage <= 1"
          @click="$emit('pageChange', currentPage - 1)"
          class="page-btn"
          :title="$t('common.previous')"
        >
          <UIcon :name="isRtl ? 'i-lucide-chevron-right' : 'i-lucide-chevron-left'" class="w-3.5 h-3.5" />
        </button>

        <button
          v-for="p in visiblePages"
          :key="p.key"
          type="button"
          :disabled="p.value === '…'"
          :class="['page-btn min-w-[28px] tabular-nums', p.value === currentPage ? 'page-btn--active' : '']"
          @click="typeof p.value === 'number' && $emit('pageChange', p.value)"
        >
          {{ p.value }}
        </button>

        <button
          type="button"
          :disabled="currentPage >= totalPages"
          @click="$emit('pageChange', currentPage + 1)"
          class="page-btn"
          :title="$t('common.next')"
        >
          <UIcon :name="isRtl ? 'i-lucide-chevron-left' : 'i-lucide-chevron-right'" class="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          :disabled="currentPage >= totalPages"
          @click="$emit('pageChange', totalPages)"
          class="page-btn"
          :title="locale === 'ar' ? 'الأخيرة' : 'Last'"
        >
          <UIcon :name="isRtl ? 'i-lucide-chevrons-left' : 'i-lucide-chevrons-right'" class="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { locale } = useI18n()
const { isRtl } = useDir()

const props = withDefaults(defineProps<{
  columns: { key: string; label: string; sortable?: boolean; class?: string }[]
  rows: any[]
  loading?: boolean
  currentPage?: number
  totalPages?: number
  total?: number
  perPage?: number
  perPageOptions?: number[]
  sortBy?: string
  sortDir?: 'asc' | 'desc'
  emptyTitle?: string
  emptyDescription?: string
  emptyIcon?: string
  exportable?: boolean
  selectable?: boolean
  clickable?: boolean
}>(), {
  loading: false,
  currentPage: 1,
  totalPages: 1,
  perPageOptions: () => [10, 25, 50, 100],
  exportable: false,
  selectable: false,
  clickable: true,
  emptyIcon: 'i-lucide-inbox',
})

const emit = defineEmits<{
  rowClick: [row: any]
  pageChange: [page: number]
  perPageChange: [perPage: number]
  sort: [key: string, dir: 'asc' | 'desc']
  selectionChange: [selectedIds: (string | number)[]]
}>()

const skeletonRows = computed(() => Math.min(props.perPage ?? 8, 10))
function skeletonWidth(idx: number) {
  const widths = ['80%', '55%', '70%', '45%', '60%', '90%']
  return widths[idx % widths.length]
}

function formatCell(value: any) {
  if (value == null || value === '') return '—'
  if (typeof value === 'object') return value.name ?? '—'
  return value
}

const showFooter = computed(() =>
  props.totalPages > 1 || !!props.perPage || !!rangeLabel.value,
)

const rangeLabel = computed(() => {
  if (!props.total || !props.perPage) return ''
  const start = (props.currentPage - 1) * props.perPage + 1
  const end = Math.min(props.currentPage * props.perPage, props.total)
  if (props.total === 0) return ''
  return locale.value === 'ar'
    ? `${start.toLocaleString()}–${end.toLocaleString()} من ${props.total.toLocaleString()}`
    : `${start.toLocaleString()}–${end.toLocaleString()} of ${props.total.toLocaleString()}`
})

const visiblePages = computed<{ key: string; value: number | '…' }[]>(() => {
  const t = props.totalPages
  const c = props.currentPage
  if (t <= 7) {
    return Array.from({ length: t }, (_, i) => ({ key: String(i + 1), value: i + 1 }))
  }
  const out: { key: string; value: number | '…' }[] = []
  const push = (v: number | '…', k?: string) => out.push({ key: k ?? String(v) + '-' + out.length, value: v })
  push(1)
  if (c > 4) push('…', 'l-ellipsis')
  const start = Math.max(2, c - 1)
  const end = Math.min(t - 1, c + 1)
  for (let i = start; i <= end; i++) push(i)
  if (c < t - 3) push('…', 'r-ellipsis')
  push(t)
  return out
})

function sortIconFor(key: string) {
  if (props.sortBy !== key) return 'i-lucide-chevrons-up-down'
  return props.sortDir === 'asc' ? 'i-lucide-arrow-up' : 'i-lucide-arrow-down'
}

function onRowClick(row: any, e: MouseEvent) {
  if (!props.clickable) return
  // Don't fire on interactive elements inside the row
  const target = e.target as HTMLElement
  if (target.closest('button, a, input, select, [data-no-row-click]')) return
  emit('rowClick', row)
}

// --- Selection state ---
const selectedIds = ref<(string | number)[]>([])

function getRowId(row: any): string | number {
  return row.id ?? row._id ?? ''
}

function isSelected(row: any): boolean {
  return selectedIds.value.includes(getRowId(row))
}

const allVisibleSelected = computed(() => {
  if (props.rows.length === 0) return false
  return props.rows.every(row => selectedIds.value.includes(getRowId(row)))
})

const someSelected = computed(() => selectedIds.value.length > 0)

function toggleSelectAll() {
  if (allVisibleSelected.value) {
    const visibleIds = new Set(props.rows.map(getRowId))
    selectedIds.value = selectedIds.value.filter(id => !visibleIds.has(id))
  } else {
    const existing = new Set(selectedIds.value)
    for (const row of props.rows) existing.add(getRowId(row))
    selectedIds.value = [...existing]
  }
  emit('selectionChange', selectedIds.value)
}

function toggleRow(row: any) {
  const id = getRowId(row)
  const idx = selectedIds.value.indexOf(id)
  if (idx >= 0) selectedIds.value.splice(idx, 1)
  else selectedIds.value.push(id)
  emit('selectionChange', selectedIds.value)
}

function clearSelection() {
  selectedIds.value = []
  emit('selectionChange', selectedIds.value)
}

// --- CSV export ---
function exportCsv() {
  const headers = props.columns.filter(c => c.key !== 'actions').map(c => c.label)
  const keys = props.columns.filter(c => c.key !== 'actions').map(c => c.key)
  const csvRows = [headers.join(',')]
  for (const row of props.rows) {
    const values = keys.map(k => {
      let val = row[k]
      if (typeof val === 'object' && val !== null) val = val.name || JSON.stringify(val)
      return `"${String(val ?? '').replace(/"/g, '""')}"`
    })
    csvRows.push(values.join(','))
  }
  const blob = new Blob(['﻿' + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `export-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

function toggleSort(key: string) {
  const newDir = props.sortBy === key && props.sortDir === 'asc' ? 'desc' : 'asc'
  emit('sort', key, newDir)
}
</script>

<style scoped>
.page-btn {
  height: 1.75rem;
  padding-inline: 0.5rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 500;
  color: var(--color-neutral-600);
  border-radius: var(--radius-sm);
  transition: background-color 150ms var(--ease-standard), color 150ms var(--ease-standard);
}
.page-btn:hover:not(:disabled) {
  background-color: var(--color-neutral-100);
  color: var(--color-neutral-900);
}
:global(html.dark) .page-btn { color: var(--color-neutral-400); }
:global(html.dark) .page-btn:hover:not(:disabled) {
  background-color: var(--color-neutral-800);
  color: var(--color-neutral-0);
}
.page-btn:disabled { opacity: 0.35; cursor: not-allowed; }
.page-btn--active {
  background-color: var(--color-primary-600);
  color: white !important;
}
.page-btn--active:hover { background-color: var(--color-primary-700); color: white !important; }

.fade-slide-down-enter-active,
.fade-slide-down-leave-active {
  transition: opacity 180ms var(--ease-standard), transform 180ms var(--ease-standard);
}
.fade-slide-down-enter-from,
.fade-slide-down-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
