<template>
    <FeatureBoundary id="invoices">
      <div class="px-4 lg:px-6 py-5 max-w-[1400px] mx-auto">
        <UiPageHeader
          icon="i-lucide-file-text"
          :title="$t('nav.invoices')"
          :subtitle="totalLabel"
        >
          <template #actions>
            <UiAppButton
              variant="outline"
              icon="i-lucide-rotate-ccw"
              @click="navigateTo('/invoices/recurring')"
            >
              {{ locale === 'ar' ? 'متكررة' : 'Recurring' }}
            </UiAppButton>
            <UiAppButton variant="primary" icon="i-lucide-plus" @click="navigateTo('/invoices/create')">
              {{ locale === 'ar' ? 'فاتورة جديدة' : 'New Invoice' }}
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
          :per-page="perPage"
          empty-icon="i-lucide-file-text"
          :empty-title="locale === 'ar' ? 'لا توجد فواتير' : 'No invoices yet'"
          :empty-description="locale === 'ar' ? 'أنشئ أول فاتورة لتبدأ.' : 'Create your first invoice to get started.'"
          @row-click="(row: any) => navigateTo(`/invoices/${row.id}`)"
          @page-change="(p: number) => { page = p }"
          @per-page-change="(pp: number) => { perPage = pp; page = 1 }"
        >
          <template #header>
            <div class="flex items-center gap-2 flex-1 min-w-0 flex-wrap">
              <UiSearchInput
                v-model="searchInput"
                class="flex-1 min-w-[200px] max-w-xs"
                :placeholder="locale === 'ar' ? 'بحث برقم الفاتورة أو العميل...' : 'Search by invoice # or client...'"
              />
              <UiFilterDropdown
                v-model="statusFilter"
                :options="statusOptions"
                :all-label="locale === 'ar' ? 'كل الحالات' : 'All statuses'"
              />
              <UiFilterDropdown
                v-model="typeFilter"
                :options="typeOptions"
                :all-label="locale === 'ar' ? 'كل الأنواع' : 'All types'"
              />
            </div>
          </template>

          <template #cell-invoice_number="{ value }">
            <span class="font-mono text-xs text-primary-700 dark:text-primary-400 font-semibold" dir="ltr">
              {{ value }}
            </span>
          </template>

          <template #cell-date="{ value }">
            <span class="text-neutral-600 dark:text-neutral-400 tabular-nums">{{ formatDate(value) }}</span>
          </template>

          <template #cell-client="{ row }">
            <div class="flex items-center gap-2 min-w-0">
              <div
                class="w-6 h-6 rounded-md bg-primary-500/10 text-primary-700 dark:text-primary-300 inline-flex items-center justify-center text-[10px] font-semibold flex-shrink-0"
              >
                {{ (row.client?.name || '?').charAt(0).toUpperCase() }}
              </div>
              <span class="text-neutral-900 dark:text-neutral-0 truncate">{{ row.client?.name || '—' }}</span>
            </div>
          </template>

          <template #cell-total="{ value }">
            <span class="font-mono text-sm font-semibold tabular-nums text-neutral-900 dark:text-neutral-0" dir="ltr">
              {{ Number(value).toLocaleString() }}
            </span>
          </template>

          <template #cell-balance_due="{ value }">
            <span
              class="font-mono text-sm tabular-nums"
              dir="ltr"
              :class="Number(value) > 0
                ? 'text-warning-600 dark:text-warning-500 font-semibold'
                : 'text-neutral-300 dark:text-neutral-600'"
            >
              {{ Number(value) > 0 ? Number(value).toLocaleString() : '—' }}
            </span>
          </template>

          <template #cell-status="{ row }">
            <UiBadge :color="statusColor(row.status)" dot>
              {{ statusLabel(row.status) }}
            </UiBadge>
          </template>

          <template #cell-eta_status="{ row }">
            <UiBadge v-if="row.eta_document" :color="etaColor(row.eta_document.status)" size="xs">
              {{ etaLabel(row.eta_document.status) }}
            </UiBadge>
            <span v-else class="text-neutral-300 dark:text-neutral-600 text-xs">—</span>
          </template>
        </UiDataTable>
      </div>
    </FeatureBoundary>
</template>

<script setup lang="ts">
import type { InvoiceListParams } from '~/features/invoices/services/invoiceService'

definePageMeta({ layout: 'dashboard' })

const { locale } = useI18n()

const searchInput = ref('')
const search = refDebounced(searchInput, 400)
const statusFilter = ref('')
const typeFilter = ref('')
const page = ref(1)
const perPage = ref(25)

watch([search, statusFilter, typeFilter], () => { page.value = 1 })

const params = computed<InvoiceListParams>(() => ({
  search: search.value || undefined,
  status: statusFilter.value || undefined,
  type: typeFilter.value || undefined,
  page: page.value,
  per_page: perPage.value,
}))

const { data, loading } = useInvoicesList(params)

const rows = computed(() => data.value?.data ?? [])
const total = computed(() => data.value?.meta.total ?? 0)
const currentPage = computed(() => data.value?.meta.current_page ?? 1)
const lastPage = computed(() => data.value?.meta.last_page ?? 1)

const totalLabel = computed(() => {
  const n = total.value.toLocaleString()
  if (locale.value === 'ar') return `${n} فاتورة`
  return `${n} ${total.value === 1 ? 'invoice' : 'invoices'}`
})

const columns = computed(() => [
  { key: 'invoice_number', label: locale.value === 'ar' ? 'رقم الفاتورة' : 'Invoice #' },
  { key: 'date', label: locale.value === 'ar' ? 'التاريخ' : 'Date', sortable: true },
  { key: 'client', label: locale.value === 'ar' ? 'العميل' : 'Client' },
  { key: 'total', label: locale.value === 'ar' ? 'الإجمالي' : 'Total', class: 'text-end' },
  { key: 'balance_due', label: locale.value === 'ar' ? 'المستحق' : 'Balance Due', class: 'text-end' },
  { key: 'status', label: $t('common.status') },
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

const STATUS_COLOR: Record<string, 'gray' | 'blue' | 'green' | 'orange' | 'red'> = {
  draft: 'gray',
  sent: 'blue',
  paid: 'green',
  partially_paid: 'orange',
  overdue: 'red',
  cancelled: 'gray',
}
function statusColor(s: string) {
  return STATUS_COLOR[s] ?? 'gray'
}

function statusLabel(s: string) {
  if (locale.value !== 'ar') return s.replace('_', ' ')
  const map: Record<string, string> = {
    draft: 'مسودة',
    sent: 'مرسلة',
    paid: 'مدفوعة',
    partially_paid: 'مدفوعة جزئياً',
    overdue: 'متأخرة',
    cancelled: 'ملغاة',
  }
  return map[s] ?? s
}

const ETA_COLOR: Record<string, 'gray' | 'blue' | 'green' | 'red'> = {
  pending: 'gray',
  submitted: 'blue',
  valid: 'green',
  invalid: 'red',
  cancelled: 'gray',
}
function etaColor(s: string) {
  return ETA_COLOR[s] ?? 'gray'
}

function etaLabel(s: string) {
  if (locale.value !== 'ar') return s
  const map: Record<string, string> = {
    pending: 'قيد الإرسال',
    submitted: 'مُرسلة',
    valid: 'صالحة',
    invalid: 'مرفوضة',
    cancelled: 'ملغاة',
  }
  return map[s] ?? s
}

function formatDate(d: string | undefined | null) {
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
