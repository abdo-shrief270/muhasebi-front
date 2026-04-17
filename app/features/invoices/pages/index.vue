<template>
  <div>
    <NuxtLayout name="dashboard">
      <FeatureBoundary id="invoices">
      <UiPageHeader :title="$t('nav.invoices')" :subtitle="locale === 'ar' ? `${total} فاتورة` : `${total} invoices`">
        <template #actions>
          <UiAppButton variant="primary" @click="navigateTo('/invoices/create')">
            {{ locale === 'ar' ? '+ فاتورة جديدة' : '+ New Invoice' }}
          </UiAppButton>
        </template>
      </UiPageHeader>

      <UiDataTable
        :columns="columns"
        :rows="rows"
        :loading="loading"
        :current-page="currentPage"
        :total-pages="lastPage"
        :empty-title="locale === 'ar' ? 'لا توجد فواتير' : 'No invoices yet'"
        @row-click="(row: any) => navigateTo(`/invoices/${row.id}`)"
        @page-change="(p: number) => { page = p }"
      >
        <template #header>
          <UiSearchInput v-model="searchInput" class="flex-1 min-w-[200px]" />
          <UiFilterDropdown v-model="statusFilter" :options="statusOptions" :all-label="$t('common.all')" />
          <UiFilterDropdown v-model="typeFilter" :options="typeOptions" :all-label="locale === 'ar' ? 'كل الأنواع' : 'All Types'" />
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
import type { InvoiceListParams } from '~/features/invoices/services/invoiceService'

definePageMeta({ layout: false })

const { locale } = useI18n()

const searchInput = ref('')
const search = refDebounced(searchInput, 400)
const statusFilter = ref('')
const typeFilter = ref('')
const page = ref(1)

watch([search, statusFilter, typeFilter], () => { page.value = 1 })

const params = computed<InvoiceListParams>(() => ({
  search: search.value || undefined,
  status: statusFilter.value || undefined,
  type: typeFilter.value || undefined,
  page: page.value,
}))

const { data, loading } = useInvoicesList(params)

const rows = computed(() => data.value?.data ?? [])
const total = computed(() => data.value?.meta.total ?? 0)
const currentPage = computed(() => data.value?.meta.current_page ?? 1)
const lastPage = computed(() => data.value?.meta.last_page ?? 1)

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
</script>
