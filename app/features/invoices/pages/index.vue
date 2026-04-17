<template>
  <div>
    <NuxtLayout name="dashboard">
      <FeatureBoundary id="invoices">
      <UiPageHeader :title="$t('nav.invoices')" :subtitle="locale === 'ar' ? `${meta.total} فاتورة` : `${meta.total} invoices`">
        <template #actions>
          <UiAppButton variant="primary" @click="navigateTo('/invoices/create')">
            {{ locale === 'ar' ? '+ فاتورة جديدة' : '+ New Invoice' }}
          </UiAppButton>
        </template>
      </UiPageHeader>

      <UiDataTable
        :columns="columns"
        :rows="invoices"
        :loading="loading"
        :current-page="meta.current_page"
        :total-pages="meta.last_page"
        :empty-title="locale === 'ar' ? 'لا توجد فواتير' : 'No invoices yet'"
        @row-click="(row) => navigateTo(`/invoices/${row.id}`)"
        @page-change="(p) => { page = p; load() }"
      >
        <template #header>
          <UiSearchInput v-model="search" class="flex-1 min-w-[200px]" @update:model-value="debouncedLoad" />
          <UiFilterDropdown v-model="statusFilter" :options="statusOptions" :all-label="$t('common.all')" @update:model-value="load" />
          <UiFilterDropdown v-model="typeFilter" :options="typeOptions" :all-label="locale === 'ar' ? 'كل الأنواع' : 'All Types'" @update:model-value="load" />
        </template>

        <template #cell-invoice_number="{ value }">
          <span class="font-mono text-xs text-primary-500 font-semibold">{{ value }}</span>
        </template>

        <template #cell-client="{ row }">
          <span class="text-gray-700">{{ row.client?.name || '-' }}</span>
        </template>

        <template #cell-total="{ value }">
          <span class="font-mono text-sm font-medium" dir="ltr">{{ Number(value).toLocaleString() }}</span>
        </template>

        <template #cell-balance_due="{ value }">
          <span class="font-mono text-sm" dir="ltr" :class="value > 0 ? 'text-amber-500' : 'text-gray-300'">
            {{ value > 0 ? Number(value).toLocaleString() : '-' }}
          </span>
        </template>

        <template #cell-status="{ row }">
          <UiBadge :color="statusColor(row.status)" dot>
            {{ statusLabel(row.status) }}
          </UiBadge>
        </template>

        <template #cell-eta_status="{ row }">
          <UiBadge v-if="row.eta_document" :color="etaColor(row.eta_document.status)" size="xs">
            {{ row.eta_document.status }}
          </UiBadge>
          <span v-else class="text-gray-300 text-xs">-</span>
        </template>
      </UiDataTable>
      </FeatureBoundary>
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const { locale } = useI18n()
const { invoices, loading, meta, fetchInvoices } = useInvoices()

const search = ref('')
const statusFilter = ref('')
const typeFilter = ref('')
const page = ref(1)

const columns = computed(() => [
  { key: 'invoice_number', label: locale.value === 'ar' ? 'رقم الفاتورة' : 'Invoice #' },
  { key: 'date', label: locale.value === 'ar' ? 'التاريخ' : 'Date', sortable: true },
  { key: 'client', label: locale.value === 'ar' ? 'العميل' : 'Client' },
  { key: 'total', label: locale.value === 'ar' ? 'الإجمالي' : 'Total' },
  { key: 'balance_due', label: locale.value === 'ar' ? 'المستحق' : 'Balance Due' },
  { key: 'status', label: locale.value === 'ar' ? 'الحالة' : 'Status' },
  { key: 'eta_status', label: 'ETA' },
])

const statusOptions = computed(() => [
  { value: 'draft', label: locale.value === 'ar' ? 'مسودة' : 'Draft' },
  { value: 'sent', label: locale.value === 'ar' ? 'مرسلة' : 'Sent' },
  { value: 'paid', label: locale.value === 'ar' ? 'مدفوعة' : 'Paid' },
  { value: 'partially_paid', label: locale.value === 'ar' ? 'مدفوعة جزئياً' : 'Partially Paid' },
  { value: 'overdue', label: locale.value === 'ar' ? 'متأخرة' : 'Overdue' },
  { value: 'cancelled', label: locale.value === 'ar' ? 'ملغاة' : 'Cancelled' },
])

const typeOptions = computed(() => [
  { value: 'invoice', label: locale.value === 'ar' ? 'فاتورة' : 'Invoice' },
  { value: 'credit_note', label: locale.value === 'ar' ? 'إشعار دائن' : 'Credit Note' },
])

function load() {
  fetchInvoices({
    search: search.value,
    status: statusFilter.value || undefined,
    type: typeFilter.value || undefined,
    page: page.value,
  })
}

const debouncedLoad = useDebounceFn(() => { page.value = 1; load() }, 400)

function statusColor(s: string) {
  return ({ draft: 'gray', sent: 'blue', paid: 'green', partially_paid: 'orange', overdue: 'red', cancelled: 'gray' } as Record<string, string>)[s] || 'gray'
}

function etaColor(s: string) {
  return ({ pending: 'gray', submitted: 'blue', valid: 'green', invalid: 'red', cancelled: 'gray' } as Record<string, string>)[s] || 'gray'
}

function statusLabel(s: string) {
  if (locale.value === 'ar') {
    return ({ draft: 'مسودة', sent: 'مرسلة', paid: 'مدفوعة', partially_paid: 'مدفوعة جزئياً', overdue: 'متأخرة', cancelled: 'ملغاة' } as Record<string, string>)[s] || s
  }
  return s.replace('_', ' ')
}

onMounted(load)
</script>
