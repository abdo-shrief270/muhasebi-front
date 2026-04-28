<template>
  <FeatureBoundary id="expense-reports">
    <div class="px-4 lg:px-6 py-5 max-w-[1400px] mx-auto">
      <UiPageHeader
        icon="i-lucide-file-spreadsheet"
        :title="locale === 'ar' ? 'تقارير المصروفات' : 'Expense Reports'"
        :subtitle="totalLabel"
      />

      <Can :perm="PERMISSIONS.MANAGE_EXPENSES">
        <template #fallback>
          <div class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-12 text-center">
            <div class="w-12 h-12 mx-auto mb-4 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
              <UIcon name="i-lucide-lock" class="w-5 h-5 text-neutral-400" />
            </div>
            <p class="text-sm font-semibold text-neutral-900 dark:text-neutral-0 mb-1">
              {{ locale === 'ar' ? 'لا تملك صلاحية الوصول' : "You don't have access" }}
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
          empty-icon="i-lucide-file-spreadsheet"
          :empty-title="locale === 'ar' ? 'لا توجد تقارير مصروفات' : 'No expense reports yet'"
          :empty-description="locale === 'ar' ? 'تقارير المصروفات تجمع عدة مصروفات لموظف واحد في حزمة للاعتماد.' : 'Expense reports bundle multiple expenses for a single employee into one approval batch.'"
          @page-change="(p: number) => { page = p; load() }"
          @per-page-change="(pp: number) => { perPage = pp; page = 1; load() }"
        >
          <template #cell-reference="{ value }">
            <span class="font-mono text-xs font-semibold text-primary-700 dark:text-primary-400">{{ value || '—' }}</span>
          </template>

          <template #cell-employee_name="{ value }">
            <span class="text-sm text-neutral-900 dark:text-neutral-0 truncate">{{ value || '—' }}</span>
          </template>

          <template #cell-period="{ row }">
            <span class="text-xs text-neutral-600 dark:text-neutral-400 tabular-nums" dir="ltr">
              {{ formatPeriod(row.period_from, row.period_to) }}
            </span>
          </template>

          <template #cell-expenses_count="{ value }">
            <span class="text-xs text-neutral-700 dark:text-neutral-200 tabular-nums">{{ value ?? 0 }}</span>
          </template>

          <template #cell-total="{ row }">
            <span class="font-mono text-sm font-semibold text-neutral-900 dark:text-neutral-0 tabular-nums" dir="ltr">
              {{ formatMoney(row.total) }}
            </span>
          </template>

          <template #cell-status="{ row }">
            <UiBadge :color="STATUS_BADGE_COLOR[row.status as Status] ?? 'gray'" dot>
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

definePageMeta({ layout: 'dashboard' })

const { locale } = useI18n()
const api = useApi()
const toastStore = useToastStore()

type Status = 'draft' | 'submitted' | 'approved' | 'rejected' | 'reimbursed'

const rows = ref<any[]>([])
const loading = ref(true)
const page = ref(1)
const perPage = ref(25)
const total = ref(0)
const lastPage = ref(1)
const currentPage = ref(1)

const totalLabel = computed(() => {
  const n = total.value.toLocaleString()
  if (locale.value === 'ar') return `${n} تقرير`
  return `${n} ${total.value === 1 ? 'report' : 'reports'}`
})

const columns = computed(() => [
  { key: 'reference',       label: locale.value === 'ar' ? 'المرجع' : 'Reference' },
  { key: 'employee_name',   label: locale.value === 'ar' ? 'الموظف' : 'Employee' },
  { key: 'period',          label: locale.value === 'ar' ? 'الفترة' : 'Period' },
  { key: 'expenses_count',  label: locale.value === 'ar' ? 'المصروفات' : 'Items' },
  { key: 'total',           label: locale.value === 'ar' ? 'الإجمالي' : 'Total', class: 'text-end' },
  { key: 'status',          label: locale.value === 'ar' ? 'الحالة' : 'Status' },
])

const STATUS_LABELS_AR: Record<Status, string> = {
  draft: 'مسودة', submitted: 'مقدمة', approved: 'معتمدة', rejected: 'مرفوضة', reimbursed: 'مسددة',
}
const STATUS_LABELS_EN: Record<Status, string> = {
  draft: 'Draft', submitted: 'Submitted', approved: 'Approved', rejected: 'Rejected', reimbursed: 'Reimbursed',
}
function statusLabel(s: string): string {
  const map = locale.value === 'ar' ? STATUS_LABELS_AR : STATUS_LABELS_EN
  return map[s as Status] ?? s
}

type BadgeColor = 'gray' | 'green' | 'blue' | 'orange' | 'red' | 'emerald' | 'purple'
const STATUS_BADGE_COLOR: Record<Status, BadgeColor> = {
  draft: 'gray', submitted: 'blue', approved: 'green', rejected: 'red', reimbursed: 'purple',
}

function formatMoney(n: number | string | null | undefined) {
  return Number(n ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatPeriod(from: string | null | undefined, to: string | null | undefined) {
  if (!from && !to) return '—'
  const fmt = (d: string) => {
    try {
      return new Date(d).toLocaleDateString(locale.value === 'ar' ? 'ar-EG' : 'en-US', { month: 'short', day: 'numeric' })
    } catch {
      return d
    }
  }
  if (from && to) return `${fmt(from)} → ${fmt(to)}`
  return fmt(from || to || '')
}

async function load() {
  loading.value = true
  try {
    const r: any = await api.get(`/expense-reports?page=${page.value}&per_page=${perPage.value}`)
    const list: any[] = r.data ?? []
    rows.value = list.map((e: any) => ({
      ...e,
      employee_name: e.employee?.name ?? e.created_by_user?.name ?? '—',
    }))
    total.value = r.meta?.total ?? rows.value.length
    currentPage.value = r.meta?.current_page ?? page.value
    lastPage.value = r.meta?.last_page ?? 1
  } catch (e: any) {
    rows.value = []
    toastStore.error(e?.message || (locale.value === 'ar' ? 'تعذر تحميل التقارير' : 'Failed to load expense reports'))
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>
