<template>
  <FeatureBoundary id="expenses">
    <div class="px-4 lg:px-6 py-5 max-w-[1400px] mx-auto">
      <UiPageHeader
        icon="i-lucide-credit-card"
        :title="locale === 'ar' ? 'المصروفات' : 'Expenses'"
        :subtitle="totalLabel"
      >
        <template #actions>
          <UiAppButton variant="primary" icon="i-lucide-plus" @click="navigateTo('/expenses/create')">
            {{ locale === 'ar' ? 'مصروف جديد' : 'New Expense' }}
          </UiAppButton>
        </template>
      </UiPageHeader>

      <Can :perm="PERMISSIONS.VIEW_EXPENSES">
        <template #fallback>
          <div class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-12 text-center">
            <div class="w-12 h-12 mx-auto mb-4 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
              <UIcon name="i-lucide-lock" class="w-5 h-5 text-neutral-400" />
            </div>
            <p class="text-sm font-semibold text-neutral-900 dark:text-neutral-0 mb-1">
              {{ locale === 'ar' ? 'لا تملك صلاحية الوصول' : "You don't have access" }}
            </p>
            <p class="text-xs text-neutral-500 dark:text-neutral-400">
              {{ locale === 'ar' ? 'تواصل مع مدير الحساب لتفعيل صلاحية المصروفات.' : 'Contact your admin to enable Expenses.' }}
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
          empty-icon="i-lucide-credit-card"
          :empty-title="locale === 'ar' ? 'لا توجد مصروفات' : 'No expenses yet'"
          :empty-description="locale === 'ar' ? 'سجّل أول مصروف لك.' : 'Record your first expense.'"
          @row-click="(row: any) => navigateTo(`/expenses/${row.id}`)"
          @page-change="(p: number) => { page = p }"
          @per-page-change="(pp: number) => { perPage = pp; page = 1 }"
          @sort="handleSort"
        >
          <template #header>
            <div class="flex items-center gap-2 flex-1 flex-wrap min-w-0">
              <UiSearchInput
                v-model="searchInput"
                class="flex-1 min-w-[200px] max-w-xs"
                :placeholder="locale === 'ar' ? 'بحث في الوصف...' : 'Search by description...'"
              />
              <UiFilterDropdown
                v-model="statusFilter"
                :options="statusOptions"
                :all-label="locale === 'ar' ? 'كل الحالات' : 'All statuses'"
              />
              <UiFilterDropdown
                v-model="categoryFilter"
                :options="categoryOptions"
                :all-label="locale === 'ar' ? 'كل الفئات' : 'All categories'"
              />
            </div>
          </template>

          <template #cell-date="{ value }">
            <span class="text-sm text-neutral-700 dark:text-neutral-200">{{ formatDate(value) }}</span>
          </template>

          <template #cell-category="{ row }">
            <div class="flex items-center gap-1.5 min-w-0">
              <span
                v-if="row.category?.color"
                class="w-2 h-2 rounded-full flex-shrink-0"
                :style="{ backgroundColor: row.category.color }"
                aria-hidden="true"
              />
              <span class="text-sm text-neutral-700 dark:text-neutral-200 truncate">
                {{ categoryName(row.category) }}
              </span>
            </div>
          </template>

          <template #cell-description="{ row }">
            <p class="text-sm text-neutral-900 dark:text-neutral-0 truncate">{{ row.description || '—' }}</p>
            <p v-if="row.vendor_name || row.vendor?.name_ar || row.vendor?.name_en" class="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
              {{ row.vendor_name || (locale === 'ar' ? (row.vendor?.name_ar || row.vendor?.name_en) : (row.vendor?.name_en || row.vendor?.name_ar)) }}
            </p>
          </template>

          <template #cell-payment_method="{ value }">
            <span class="text-xs text-neutral-600 dark:text-neutral-400">{{ paymentMethodLabel(value) }}</span>
          </template>

          <template #cell-amount="{ row }">
            <div class="text-end">
              <p class="font-mono text-sm font-semibold text-neutral-900 dark:text-neutral-0 tabular-nums" dir="ltr">
                {{ formatMoney(row.amount) }}
              </p>
              <p
                v-if="Number(row.vat_amount ?? 0) > 0"
                class="font-mono text-[11px] text-neutral-500 dark:text-neutral-400 tabular-nums"
                dir="ltr"
              >
                +{{ formatMoney(row.vat_amount) }} VAT
              </p>
            </div>
          </template>

          <template #cell-status="{ row }">
            <UiBadge :color="STATUS_BADGE_COLOR[row.status as ExpenseStatus] ?? 'gray'" dot>
              {{ statusLabel(row.status) }}
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
import type {
  Expense,
  ExpenseCategory,
  ExpenseListParams,
  ExpensePaymentMethod,
  ExpenseStatus,
} from '~/features/expenses/services/expenseService'

definePageMeta({ layout: 'dashboard' })

const { locale } = useI18n()

const searchInput = ref('')
const search = refDebounced(searchInput, 400)
const statusFilter = ref('')
const categoryFilter = ref('')
const sortBy = ref<'date' | 'amount' | 'created_at'>('date')
const sortDir = ref<'asc' | 'desc'>('desc')
const page = ref(1)
const perPage = ref(25)

watch([search, statusFilter, categoryFilter], () => { page.value = 1 })

const params = computed<ExpenseListParams>(() => ({
  search: search.value || undefined,
  status: (statusFilter.value || undefined) as ExpenseListParams['status'],
  category_id: categoryFilter.value ? Number(categoryFilter.value) : undefined,
  sort_by: sortBy.value,
  sort_dir: sortDir.value,
  page: page.value,
  per_page: perPage.value,
}))

const { data, loading } = useExpensesList(params)
const { data: categoriesData } = useExpenseCategoriesList()

const rows = computed<Expense[]>(() => data.value?.data ?? [])
const total = computed(() => data.value?.meta?.total ?? 0)
const currentPage = computed(() => data.value?.meta?.current_page ?? 1)
const lastPage = computed(() => data.value?.meta?.last_page ?? 1)

const totalLabel = computed(() => {
  const n = total.value.toLocaleString()
  if (locale.value === 'ar') return `${n} مصروف`
  return `${n} ${total.value === 1 ? 'expense' : 'expenses'}`
})

const columns = computed(() => [
  { key: 'date',           label: locale.value === 'ar' ? 'التاريخ' : 'Date', sortable: true },
  { key: 'category',       label: locale.value === 'ar' ? 'الفئة' : 'Category' },
  { key: 'description',    label: locale.value === 'ar' ? 'الوصف' : 'Description' },
  { key: 'payment_method', label: locale.value === 'ar' ? 'طريقة الدفع' : 'Method' },
  { key: 'amount',         label: locale.value === 'ar' ? 'المبلغ' : 'Amount', sortable: true, class: 'text-end' },
  { key: 'status',         label: locale.value === 'ar' ? 'الحالة' : 'Status' },
])

const statusOptions = computed(() => [
  { value: 'draft',      label: locale.value === 'ar' ? 'مسودة' : 'Draft' },
  { value: 'submitted',  label: locale.value === 'ar' ? 'مقدمة' : 'Submitted' },
  { value: 'approved',   label: locale.value === 'ar' ? 'معتمدة' : 'Approved' },
  { value: 'rejected',   label: locale.value === 'ar' ? 'مرفوضة' : 'Rejected' },
  { value: 'reimbursed', label: locale.value === 'ar' ? 'مسددة' : 'Reimbursed' },
])

const categoryOptions = computed(() => {
  const list = categoriesData.value ?? []
  return list.map(c => ({
    value: String(c.id),
    label: locale.value === 'ar' ? (c.name_ar || c.name_en || '') : (c.name_en || c.name_ar || ''),
  }))
})

function categoryName(c: ExpenseCategory | null | undefined): string {
  if (!c) return '—'
  if (locale.value === 'ar') return c.name_ar || c.name_en || '—'
  return c.name_en || c.name_ar || '—'
}

const STATUS_LABELS_AR: Record<ExpenseStatus, string> = {
  draft: 'مسودة', submitted: 'مقدمة', approved: 'معتمدة', rejected: 'مرفوضة', reimbursed: 'مسددة',
}
const STATUS_LABELS_EN: Record<ExpenseStatus, string> = {
  draft: 'Draft', submitted: 'Submitted', approved: 'Approved', rejected: 'Rejected', reimbursed: 'Reimbursed',
}
function statusLabel(s: ExpenseStatus) {
  const map = locale.value === 'ar' ? STATUS_LABELS_AR : STATUS_LABELS_EN
  return map[s] ?? s
}

type BadgeColor = 'gray' | 'green' | 'blue' | 'orange' | 'red' | 'emerald' | 'purple'
const STATUS_BADGE_COLOR: Record<ExpenseStatus, BadgeColor> = {
  draft: 'gray', submitted: 'blue', approved: 'green', rejected: 'red', reimbursed: 'purple',
}

const PAYMENT_METHOD_AR: Record<string, string> = {
  cash: 'نقد', bank_transfer: 'تحويل بنكي', company_card: 'بطاقة الشركة', personal: 'شخصي',
}
const PAYMENT_METHOD_EN: Record<string, string> = {
  cash: 'Cash', bank_transfer: 'Bank transfer', company_card: 'Company card', personal: 'Personal',
}
function paymentMethodLabel(m: ExpensePaymentMethod | string | null | undefined) {
  if (!m) return '—'
  const map = locale.value === 'ar' ? PAYMENT_METHOD_AR : PAYMENT_METHOD_EN
  return map[m] ?? m
}

function handleSort(key: string, dir: 'asc' | 'desc') {
  const allowed = ['date', 'amount', 'created_at'] as const
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
</script>
