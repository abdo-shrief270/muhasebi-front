<template>
  <div>
    <NuxtLayout name="dashboard">
      <FeatureBoundary id="journal-entries">
      <UiPageHeader :title="$t('nav.journalEntries')" :subtitle="locale === 'ar' ? `${total} قيد` : `${total} entries`">
        <template #actions>
          <UiAppButton variant="primary" @click="navigateTo('/journal-entries/create')">
            {{ locale === 'ar' ? '+ قيد جديد' : '+ New Entry' }}
          </UiAppButton>
        </template>
      </UiPageHeader>

      <UiDataTable
        :columns="columns"
        :rows="rows"
        :loading="loading"
        :current-page="currentPage"
        :total-pages="lastPage"
        :empty-title="locale === 'ar' ? 'لا توجد قيود' : 'No journal entries'"
        @row-click="(row: any) => navigateTo(`/journal-entries/${row.id}`)"
        @page-change="(p: number) => { page = p }"
      >
        <template #header>
          <UiSearchInput v-model="searchInput" class="flex-1 min-w-[200px]" />
          <UiFilterDropdown v-model="statusFilter" :options="statusOptions" :all-label="$t('common.all')" />
        </template>

        <template #cell-entry_number="{ value }">
          <span class="font-mono text-xs text-primary-500 font-semibold">{{ value }}</span>
        </template>

        <template #cell-description="{ row }">
          <div>
            <p class="text-gray-700">{{ row.description }}</p>
            <p v-if="row.reference" class="text-xs text-gray-400">{{ row.reference }}</p>
          </div>
        </template>

        <template #cell-total_debit="{ value }">
          <span class="font-mono text-sm" dir="ltr">{{ Number(value).toLocaleString() }}</span>
        </template>

        <template #cell-status="{ row }">
          <UiBadge :color="statusColor(row.status)" dot>
            {{ statusLabel(row.status) }}
          </UiBadge>
        </template>
      </UiDataTable>
      </FeatureBoundary>
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
import type { JournalEntryListParams } from '~/features/journal-entries/services/journalEntryService'

definePageMeta({ layout: false })

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

const columns = computed(() => [
  { key: 'entry_number', label: locale.value === 'ar' ? 'رقم القيد' : 'Entry #', sortable: true },
  { key: 'date', label: $t('common.date'), sortable: true },
  { key: 'description', label: locale.value === 'ar' ? 'البيان' : 'Description' },
  { key: 'total_debit', label: locale.value === 'ar' ? 'المبلغ' : 'Amount' },
  { key: 'status', label: $t('common.status') },
])

const statusOptions = computed(() => [
  { value: 'draft', label: locale.value === 'ar' ? 'مسودة' : 'Draft' },
  { value: 'posted', label: locale.value === 'ar' ? 'مرحّل' : 'Posted' },
  { value: 'reversed', label: locale.value === 'ar' ? 'معكوس' : 'Reversed' },
])

function statusColor(s: string) {
  return ({ draft: 'gray', posted: 'green', reversed: 'orange' } as Record<string, string>)[s] || 'gray'
}

function statusLabel(s: string) {
  if (locale.value === 'ar') return ({ draft: 'مسودة', posted: 'مرحّل', reversed: 'معكوس' } as Record<string, string>)[s] || s
  return s
}
</script>
