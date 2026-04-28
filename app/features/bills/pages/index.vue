<template>
  <FeatureBoundary id="bills">
    <div class="px-4 lg:px-6 py-5 max-w-[1400px] mx-auto">
      <UiPageHeader
        icon="i-lucide-receipt"
        :title="locale === 'ar' ? 'فواتير الموردين' : 'Bills'"
        :subtitle="totalLabel"
      >
        <template #actions>
          <UiAppButton variant="primary" icon="i-lucide-plus" @click="navigateTo('/bills/create')">
            {{ locale === 'ar' ? 'فاتورة جديدة' : 'New Bill' }}
          </UiAppButton>
        </template>
      </UiPageHeader>

      <Can :perm="PERMISSIONS.MANAGE_BILLS">
        <template #fallback>
          <div class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-12 text-center">
            <div class="w-12 h-12 mx-auto mb-4 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
              <UIcon name="i-lucide-lock" class="w-5 h-5 text-neutral-400" />
            </div>
            <p class="text-sm font-semibold text-neutral-900 dark:text-neutral-0 mb-1">
              {{ locale === 'ar' ? 'لا تملك صلاحية الوصول' : "You don't have access" }}
            </p>
            <p class="text-xs text-neutral-500 dark:text-neutral-400">
              {{ locale === 'ar' ? 'تواصل مع مدير الحساب لتفعيل صلاحية إدارة فواتير الموردين.' : 'Contact your admin to enable Bills management.' }}
            </p>
          </div>
        </template>

        <UiDataTable
          :columns="columns"
          :rows="rows"
          :loading="loading"
          :exportable="true"
          :current-page="currentPage"
          :total-pages="lastPage"
          :total="total"
          :per-page="perPage"
          :sort-by="sortBy"
          :sort-dir="sortDir"
          empty-icon="i-lucide-receipt"
          :empty-title="locale === 'ar' ? 'لا توجد فواتير' : 'No bills yet'"
          :empty-description="locale === 'ar' ? 'أنشئ أول فاتورة من مورد.' : 'Create your first vendor bill.'"
          @row-click="(row: any) => navigateTo(`/bills/${row.id}`)"
          @page-change="(p: number) => { page = p }"
          @per-page-change="(pp: number) => { perPage = pp; page = 1 }"
          @sort="handleSort"
        >
          <template #header>
            <div class="flex items-center gap-2 flex-1 flex-wrap min-w-0">
              <UiSearchInput
                v-model="searchInput"
                class="flex-1 min-w-[200px] max-w-xs"
                :placeholder="locale === 'ar' ? 'بحث برقم الفاتورة أو ملاحظات...' : 'Search by number or notes...'"
              />
              <UiFilterDropdown
                v-model="statusFilter"
                :options="statusOptions"
                :all-label="locale === 'ar' ? 'كل الحالات' : 'All statuses'"
              />
              <UiFilterDropdown
                v-model="vendorFilter"
                :options="vendorOptions"
                :all-label="locale === 'ar' ? 'كل الموردين' : 'All vendors'"
              />
            </div>
          </template>

          <template #cell-bill_number="{ row }">
            <span class="font-mono text-xs font-semibold text-primary-700 dark:text-primary-400">{{ row.bill_number }}</span>
          </template>

          <template #cell-vendor="{ row }">
            <span class="text-sm text-neutral-900 dark:text-neutral-0 truncate">
              {{ billVendorName(row.vendor, locale) || '—' }}
            </span>
          </template>

          <template #cell-date="{ value }">
            <span class="text-sm text-neutral-700 dark:text-neutral-200">{{ formatDate(value) }}</span>
          </template>

          <template #cell-due_date="{ row }">
            <span
              class="text-sm tabular-nums"
              :class="isOverdue(row) ? 'text-danger-600 dark:text-danger-400 font-medium' : 'text-neutral-700 dark:text-neutral-200'"
            >
              {{ formatDate(row.due_date) }}
            </span>
          </template>

          <template #cell-total="{ row }">
            <div class="text-end">
              <p class="font-mono text-sm font-semibold text-neutral-900 dark:text-neutral-0 tabular-nums" dir="ltr">
                {{ formatMoney(row.total) }}
              </p>
              <p
                v-if="Number(row.balance_due ?? 0) > 0 && row.status !== 'cancelled'"
                class="font-mono text-[11px] text-warning-600 dark:text-warning-500 tabular-nums"
                dir="ltr"
              >
                {{ formatMoney(row.balance_due) }} {{ locale === 'ar' ? 'متبقي' : 'due' }}
              </p>
            </div>
          </template>

          <template #cell-status="{ row }">
            <UiBadge :color="STATUS_BADGE_COLOR[row.status as BillStatus] ?? 'gray'" dot>
              {{ locale === 'ar' ? row.status_label_ar : row.status_label }}
            </UiBadge>
          </template>
        </UiDataTable>
      </Can>
    </div>
  </FeatureBoundary>
</template>

<script setup lang="ts">
import Can from '~/core/rbac/Can.vue'
import { PERMISSIONS } from '~/core/rbac/permissions'
import {
  billVendorName,
  type Bill,
  type BillStatus,
  type BillListParams,
} from '~/features/bills/services/billService'

definePageMeta({ layout: 'dashboard' })

const { locale } = useI18n()

const searchInput = ref('')
const search = refDebounced(searchInput, 400)
const statusFilter = ref('')
const vendorFilter = ref('')
const sortBy = ref<'date' | 'due_date' | 'bill_number' | 'total'>('date')
const sortDir = ref<'asc' | 'desc'>('desc')
const page = ref(1)
const perPage = ref(25)

watch([search, statusFilter, vendorFilter], () => { page.value = 1 })

const params = computed<BillListParams>(() => ({
  search: search.value || undefined,
  status: (statusFilter.value || undefined) as BillListParams['status'],
  vendor_id: vendorFilter.value ? Number(vendorFilter.value) : undefined,
  sort_by: sortBy.value,
  sort_dir: sortDir.value,
  page: page.value,
  per_page: perPage.value,
}))

const { data, loading } = useBillsList(params)

// Vendor list for the filter dropdown — load once at page open with a
// generous per_page so most tenants fit. The dropdown is searchable for
// long lists; this is a deliberate trade-off vs. an extra typeahead.
const vendorParams = computed(() => ({ per_page: 200, sort_by: 'name_ar' as const, sort_dir: 'asc' as const }))
const { data: vendorListData } = useVendorsList(vendorParams)

const rows = computed<Bill[]>(() => data.value?.data ?? [])
const total = computed(() => data.value?.meta?.total ?? 0)
const currentPage = computed(() => data.value?.meta?.current_page ?? 1)
const lastPage = computed(() => data.value?.meta?.last_page ?? 1)

const totalLabel = computed(() => {
  const n = total.value.toLocaleString()
  if (locale.value === 'ar') return `${n} فاتورة`
  return `${n} ${total.value === 1 ? 'bill' : 'bills'}`
})

const columns = computed(() => [
  { key: 'bill_number', label: locale.value === 'ar' ? 'الرقم' : 'Bill #', sortable: true },
  { key: 'vendor',      label: locale.value === 'ar' ? 'المورد' : 'Vendor' },
  { key: 'date',        label: locale.value === 'ar' ? 'التاريخ' : 'Date', sortable: true },
  { key: 'due_date',    label: locale.value === 'ar' ? 'الاستحقاق' : 'Due', sortable: true },
  { key: 'total',       label: locale.value === 'ar' ? 'الإجمالي' : 'Total', sortable: true, class: 'text-end' },
  { key: 'status',      label: locale.value === 'ar' ? 'الحالة' : 'Status' },
])

const statusOptions = computed(() => [
  { value: 'draft',          label: locale.value === 'ar' ? 'مسودة' : 'Draft' },
  { value: 'approved',       label: locale.value === 'ar' ? 'معتمدة' : 'Approved' },
  { value: 'partially_paid', label: locale.value === 'ar' ? 'مدفوعة جزئياً' : 'Partially Paid' },
  { value: 'paid',           label: locale.value === 'ar' ? 'مدفوعة' : 'Paid' },
  { value: 'cancelled',      label: locale.value === 'ar' ? 'ملغاة' : 'Cancelled' },
])

const vendorOptions = computed(() => {
  const list = vendorListData.value?.data ?? []
  return list.map(v => ({
    value: String(v.id),
    label: billVendorName({ id: v.id, name_ar: v.name_ar, name_en: v.name_en, currency: v.currency }, locale.value),
  }))
})

// Backend BillStatus::color() returns 'yellow' for partially_paid which the
// shared Badge doesn't carry — map to 'orange' for visual parity.
type BadgeColor = 'gray' | 'green' | 'blue' | 'orange' | 'red' | 'emerald' | 'purple'
const STATUS_BADGE_COLOR: Record<BillStatus, BadgeColor> = {
  draft: 'gray',
  approved: 'blue',
  partially_paid: 'orange',
  paid: 'green',
  cancelled: 'red',
}

function handleSort(key: string, dir: 'asc' | 'desc') {
  // Only the columns marked `sortable` reach this; whitelist on backend filters.
  const allowed = ['date', 'due_date', 'bill_number', 'total'] as const
  if ((allowed as readonly string[]).includes(key)) {
    sortBy.value = key as typeof sortBy.value
    sortDir.value = dir
  }
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
/**
 * "Overdue" highlighting for the due-date column. Only meaningful while the
 * bill still has an open balance — paid/cancelled bills don't get coloured
 * even if their due date is in the past.
 */
function isOverdue(b: Bill): boolean {
  if (b.status === 'paid' || b.status === 'cancelled') return false
  if (Number(b.balance_due ?? 0) <= 0) return false
  return new Date(b.due_date) < new Date(new Date().toDateString())
}
</script>
