<template>
  <div>
    <NuxtLayout name="dashboard">
      <UiPageHeader :title="$t('nav.journalEntries')" :subtitle="locale === 'ar' ? `${meta.total} قيد` : `${meta.total} entries`">
        <template #actions>
          <UiAppButton variant="primary" @click="navigateTo('/journal-entries/create')">
            {{ locale === 'ar' ? '+ قيد جديد' : '+ New Entry' }}
          </UiAppButton>
        </template>
      </UiPageHeader>

      <UiDataTable
        :columns="columns"
        :rows="entries"
        :loading="loading"
        :current-page="meta.current_page"
        :total-pages="meta.last_page"
        :empty-title="locale === 'ar' ? 'لا توجد قيود' : 'No journal entries'"
        @row-click="(row) => navigateTo(`/journal-entries/${row.id}`)"
        @page-change="(p) => { page = p; load() }"
      >
        <template #header>
          <UiSearchInput v-model="search" class="flex-1 min-w-[200px]" @update:model-value="debouncedLoad" />
          <UiFilterDropdown v-model="statusFilter" :options="statusOptions" :all-label="$t('common.all')" @update:model-value="load" />
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
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const { locale } = useI18n()
const { entries, loading, meta, fetchEntries } = useJournalEntries()

const search = ref('')
const statusFilter = ref('')
const page = ref(1)

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

function load() {
  fetchEntries({ search: search.value, status: statusFilter.value || undefined, page: page.value })
}

const debouncedLoad = useDebounceFn(() => { page.value = 1; load() }, 400)

function statusColor(s: string) {
  return { draft: 'gray', posted: 'green', reversed: 'orange' }[s] || 'gray'
}

function statusLabel(s: string) {
  if (locale.value === 'ar') return { draft: 'مسودة', posted: 'مرحّل', reversed: 'معكوس' }[s] || s
  return s
}

onMounted(load)
</script>
