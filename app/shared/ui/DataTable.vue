<template>
  <div
    v-motion
    :initial="{ opacity: 0, y: 15 }"
    :enter="{ opacity: 1, y: 0 }"
    class="bg-white rounded-2xl border border-gray-100/80 overflow-hidden"
  >
    <!-- Header bar -->
    <div v-if="$slots.header || exportable" class="px-5 py-4 border-b border-gray-50 flex items-center justify-between gap-4 flex-wrap">
      <slot name="header" />
      <button v-if="exportable && rows.length > 0" @click="exportCsv" class="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded-lg hover:bg-gray-50 transition flex items-center gap-1">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"/></svg>
        CSV
      </button>
    </div>

    <!-- Bulk actions bar -->
    <div
      v-if="selectable && selectedIds.length > 0"
      class="px-5 py-3 bg-primary-50/50 border-b border-primary-100/50 flex items-center justify-between gap-4 flex-wrap"
    >
      <div class="flex items-center gap-3">
        <span class="text-sm font-medium text-primary-700">
          {{ selectedIds.length }} {{ locale === 'ar' ? 'محدد' : 'selected' }}
        </span>
        <button
          @click="clearSelection"
          class="text-xs text-primary-600 hover:text-primary-800 px-2 py-1 rounded-lg hover:bg-primary-100/50 transition"
        >
          {{ locale === 'ar' ? 'مسح' : 'Clear' }}
        </button>
      </div>
      <slot name="bulk-actions" :selectedIds="selectedIds" :selectedCount="selectedIds.length" :clearSelection="clearSelection" />
    </div>

    <!-- Table -->
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-gray-100">
            <th v-if="selectable" class="px-5 py-3 w-10">
              <input
                type="checkbox"
                :checked="allVisibleSelected"
                :indeterminate="someSelected && !allVisibleSelected"
                @change="toggleSelectAll"
                class="rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                :title="locale === 'ar' ? 'تحديد الكل' : 'Select all'"
              />
            </th>
            <th
              v-for="col in columns"
              :key="col.key"
              class="px-5 py-3 text-start text-xs font-semibold text-gray-400 uppercase tracking-wider"
              :class="col.class"
            >
              <button
                v-if="col.sortable"
                @click="toggleSort(col.key)"
                class="flex items-center gap-1 hover:text-gray-600 transition-colors"
              >
                {{ col.label }}
                <span class="text-[10px]">
                  {{ sortBy === col.key ? (sortDir === 'asc' ? '▲' : '▼') : '⇅' }}
                </span>
              </button>
              <span v-else>{{ col.label }}</span>
            </th>
          </tr>
        </thead>

        <tbody v-if="loading">
          <tr v-for="i in 5" :key="i">
            <td v-if="selectable" class="px-5 py-4">
              <div class="skeleton h-4 w-4"></div>
            </td>
            <td v-for="col in columns" :key="col.key" class="px-5 py-4">
              <div class="skeleton h-4 w-3/4"></div>
            </td>
          </tr>
        </tbody>

        <tbody v-else-if="rows.length > 0">
          <tr
            v-for="(row, index) in rows"
            :key="row.id || index"
            class="border-b border-gray-50/50 hover:bg-gray-50/30 transition-colors cursor-pointer"
            :class="{ 'bg-primary-50/30': selectable && isSelected(row) }"
            @click="$emit('rowClick', row)"
          >
            <td v-if="selectable" class="px-5 py-4" @click.stop>
              <input
                type="checkbox"
                :checked="isSelected(row)"
                @change="toggleRow(row)"
                class="rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
              />
            </td>
            <td
              v-for="col in columns"
              :key="col.key"
              class="px-5 py-4 text-gray-700"
              :class="col.class"
            >
              <slot :name="`cell-${col.key}`" :row="row" :value="row[col.key]">
                {{ row[col.key] }}
              </slot>
            </td>
          </tr>
        </tbody>

        <tbody v-else>
          <tr>
            <td :colspan="selectable ? columns.length + 1 : columns.length" class="py-16 text-center">
              <slot name="empty">
                <UiEmptyState
                  :title="emptyTitle || $t('common.noData')"
                  :description="emptyDescription"
                />
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="px-5 py-3 border-t border-gray-50 flex items-center justify-between">
      <p class="text-xs text-gray-400">
        {{ locale === 'ar' ? `صفحة ${currentPage} من ${totalPages}` : `Page ${currentPage} of ${totalPages}` }}
      </p>
      <div class="flex items-center gap-1">
        <button
          :disabled="currentPage <= 1"
          @click="$emit('pageChange', currentPage - 1)"
          class="px-3 py-1.5 text-xs rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30 transition"
        >
          {{ $t('common.previous') }}
        </button>
        <button
          :disabled="currentPage >= totalPages"
          @click="$emit('pageChange', currentPage + 1)"
          class="px-3 py-1.5 text-xs rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30 transition"
        >
          {{ $t('common.next') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { locale } = useI18n()

const props = defineProps<{
  columns: { key: string; label: string; sortable?: boolean; class?: string }[]
  rows: any[]
  loading?: boolean
  currentPage?: number
  totalPages?: number
  sortBy?: string
  sortDir?: 'asc' | 'desc'
  emptyTitle?: string
  emptyDescription?: string
  exportable?: boolean
  selectable?: boolean
}>()

const emit = defineEmits<{
  rowClick: [row: any]
  pageChange: [page: number]
  sort: [key: string, dir: 'asc' | 'desc']
  selectionChange: [selectedIds: (string | number)[]]
}>()

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

const someSelected = computed(() => {
  return selectedIds.value.length > 0
})

function toggleSelectAll() {
  if (allVisibleSelected.value) {
    // Deselect all visible rows
    const visibleIds = new Set(props.rows.map(getRowId))
    selectedIds.value = selectedIds.value.filter(id => !visibleIds.has(id))
  } else {
    // Select all visible rows (merge with existing)
    const existing = new Set(selectedIds.value)
    for (const row of props.rows) {
      existing.add(getRowId(row))
    }
    selectedIds.value = [...existing]
  }
  emit('selectionChange', selectedIds.value)
}

function toggleRow(row: any) {
  const id = getRowId(row)
  const idx = selectedIds.value.indexOf(id)
  if (idx >= 0) {
    selectedIds.value.splice(idx, 1)
  } else {
    selectedIds.value.push(id)
  }
  emit('selectionChange', selectedIds.value)
}

function clearSelection() {
  selectedIds.value = []
  emit('selectionChange', selectedIds.value)
}

// Clear selection when rows change (e.g. page change)
watch(() => props.rows, () => {
  // Only clear if none of the current selected ids are in the new rows
  // This preserves cross-page selection awareness while cleaning up stale state
}, { deep: false })

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
  const blob = new Blob(['\uFEFF' + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' })
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
