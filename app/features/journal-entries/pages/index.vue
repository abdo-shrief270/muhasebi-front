<template>
  <FeatureBoundary id="journal-entries">
    <div class="px-4 lg:px-6 py-5 max-w-[1400px] mx-auto">
      <UiPageHeader
        icon="i-lucide-book-open"
        :title="$t('nav.journalEntries')"
        :subtitle="totalLabel"
      >
        <template #actions>
          <UiAppButton variant="primary" icon="i-lucide-plus" @click="navigateTo('/journal-entries/create')">
            {{ locale === 'ar' ? 'قيد جديد' : 'New Entry' }}
          </UiAppButton>
        </template>
      </UiPageHeader>

      <UiDataTable
        :columns="columns"
        :rows="rows"
        :loading="loading"
        :exportable="true"
        :current-page="currentPage"
        :total-pages="lastPage"
        :total="total"
        empty-icon="i-lucide-book-open"
        :empty-title="locale === 'ar' ? 'لا توجد قيود' : 'No journal entries'"
        :empty-description="locale === 'ar' ? 'القيود المنشورة من المعاملات تظهر هنا.' : 'Journal entries posted from transactions appear here.'"
        @row-click="(row: any) => navigateTo(`/journal-entries/${row.id}`)"
        @page-change="(p: number) => { page = p }"
      >
        <template #header>
          <div class="flex items-center gap-2 flex-1 flex-wrap min-w-0">
            <UiSearchInput
              v-model="searchInput"
              class="flex-1 min-w-[200px] max-w-xs"
              :placeholder="locale === 'ar' ? 'بحث في القيود...' : 'Search entries...'"
            />
            <UiFilterDropdown
              v-model="statusFilter"
              :options="statusOptions"
              :all-label="locale === 'ar' ? 'كل الحالات' : 'All statuses'"
            />
          </div>
        </template>

        <template #cell-entry_number="{ value }">
          <span class="font-mono text-xs font-semibold text-primary-700 dark:text-primary-400">{{ value }}</span>
        </template>

        <template #cell-date="{ value }">
          <span class="text-sm text-neutral-700 dark:text-neutral-200 tabular-nums" dir="ltr">{{ formatDate(value) }}</span>
        </template>

        <template #cell-description="{ row }">
          <div class="min-w-0">
            <p class="text-sm text-neutral-900 dark:text-neutral-0 truncate">{{ row.description || '—' }}</p>
            <p v-if="row.reference" class="text-[11px] font-mono text-neutral-500 dark:text-neutral-400 truncate" dir="ltr">
              {{ row.reference }}
            </p>
          </div>
        </template>

        <template #cell-total_debit="{ value }">
          <span class="font-mono text-sm font-semibold text-neutral-900 dark:text-neutral-0 tabular-nums" dir="ltr">
            {{ formatMoney(value) }}
          </span>
        </template>

        <template #cell-status="{ row }">
          <UiBadge :color="statusColor(row.status)" dot>
            {{ statusLabel(row.status) }}
          </UiBadge>
        </template>
      </UiDataTable>
    </div>
  </FeatureBoundary>
</template>

<script setup lang="ts">
import type { JournalEntryListParams } from '~/features/journal-entries/services/journalEntryService'

definePageMeta({ layout: 'dashboard' })

const { locale } = useI18n()

const searchInput = ref('')
const search = refDebounced(searchInput, 400)
const statusFilter = ref('')
const page = ref(1)

watch([search, statusFilter], () => { page.value = 1 })

const params = computed<JournalEntryListParams & { search?: string }>(() => ({
  search: search.value || undefined,
  status: statusFilter.value || undefined,
  page: page.value,
}))

const { data, loading } = useJournalEntriesList(params)

const rows = computed(() => data.value?.data ?? [])
const total = computed(() => data.value?.meta.total ?? 0)
const currentPage = computed(() => data.value?.meta.current_page ?? 1)
const lastPage = computed(() => data.value?.meta.last_page ?? 1)

const totalLabel = computed(() => {
  const n = total.value.toLocaleString()
  if (locale.value === 'ar') return `${n} قيد`
  return `${n} ${total.value === 1 ? 'entry' : 'entries'}`
})

const columns = computed(() => [
  { key: 'entry_number', label: locale.value === 'ar' ? 'رقم القيد' : 'Entry #', sortable: true },
  { key: 'date',         label: $t('common.date'), sortable: true },
  { key: 'description',  label: locale.value === 'ar' ? 'البيان' : 'Description' },
  { key: 'total_debit',  label: locale.value === 'ar' ? 'المبلغ' : 'Amount', class: 'text-end' },
  { key: 'status',       label: $t('common.status') },
])

const statusOptions = computed(() => [
  { value: 'draft',    label: locale.value === 'ar' ? 'مسودة' : 'Draft' },
  { value: 'posted',   label: locale.value === 'ar' ? 'مرحّل' : 'Posted' },
  { value: 'reversed', label: locale.value === 'ar' ? 'معكوس' : 'Reversed' },
])

function statusColor(s: string) {
  return ({ draft: 'gray', posted: 'green', reversed: 'orange' } as Record<string, string>)[s] || 'gray'
}

function statusLabel(s: string) {
  if (locale.value === 'ar') return ({ draft: 'مسودة', posted: 'مرحّل', reversed: 'معكوس' } as Record<string, string>)[s] || s
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function formatMoney(n: number | string | null | undefined) {
  return Number(n ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
function formatDate(d: string | null | undefined) {
  if (!d) return '—'
  try {
    return new Date(d).toLocaleDateString(locale.value === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    })
  } catch {
    return d
  }
}
</script>
