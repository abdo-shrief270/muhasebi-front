<template>
  <FeatureBoundary id="payroll-payslips">
    <div class="px-4 lg:px-6 py-5 max-w-[1400px] mx-auto">
      <UiPageHeader
        icon="i-lucide-receipt"
        :title="locale === 'ar' ? 'قسائم الرواتب' : 'Payslips'"
        :subtitle="locale === 'ar' ? 'قسائم الرواتب الشهرية للموظفين' : 'Monthly employee pay statements'"
      />

      <Can :perm="PERMISSIONS.MANAGE_PAYROLL">
        <template #fallback>
          <div class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-12 text-center">
            <div class="w-12 h-12 mx-auto mb-4 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
              <UIcon name="i-lucide-lock" class="w-5 h-5 text-neutral-400" />
            </div>
            <p class="text-sm font-semibold text-neutral-900 dark:text-neutral-0">
              {{ locale === 'ar' ? 'لا تملك صلاحية الوصول' : "You don't have access" }}
            </p>
          </div>
        </template>

        <UiDataTable
          :columns="columns"
          :rows="rows"
          :loading="loading"
          :current-page="page"
          :total-pages="totalPages"
          empty-icon="i-lucide-receipt"
          :empty-title="locale === 'ar' ? 'لا توجد قسائم' : 'No payslips yet'"
          :empty-description="locale === 'ar'
            ? 'قسائم الرواتب تظهر هنا بعد اعتماد مسير الرواتب.'
            : 'Payslips appear here once a payroll run is approved.'"
          @page-change="onPage"
        >
          <template #cell-period="{ value }">
            <span class="text-sm font-medium text-neutral-900 dark:text-neutral-0 tabular-nums" dir="ltr">{{ value }}</span>
          </template>
          <template #cell-employee_name="{ value }">
            <span class="text-sm text-neutral-700 dark:text-neutral-200">{{ value }}</span>
          </template>
          <template #cell-gross_pay="{ value }">
            <span class="font-mono text-sm tabular-nums text-neutral-900 dark:text-neutral-0" dir="ltr">{{ formatMoney(value) }}</span>
          </template>
          <template #cell-net_pay="{ row }">
            <span class="font-mono text-sm font-semibold tabular-nums text-success-700 dark:text-success-400" dir="ltr">{{ formatMoney(row.net_pay) }}</span>
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
const rows = ref<any[]>([])
const loading = ref(true)
const page = ref(1)
const totalPages = ref(1)

const columns = computed(() => [
  { key: 'period', label: locale.value === 'ar' ? 'الفترة' : 'Period' },
  { key: 'employee_name', label: locale.value === 'ar' ? 'الموظف' : 'Employee' },
  { key: 'gross_pay', label: locale.value === 'ar' ? 'الإجمالي' : 'Gross', class: 'text-end' },
  { key: 'net_pay', label: locale.value === 'ar' ? 'الصافي' : 'Net', class: 'text-end' },
])

function formatMoney(n: number | string | null | undefined) {
  return Number(n ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

async function load() {
  loading.value = true
  try {
    const r: any = await api.get(`/payroll/payslips?page=${page.value}&per_page=25`).catch(() => ({ data: [], meta: { last_page: 1 } }))
    rows.value = (r.data ?? []).map((s: any) => ({ ...s, employee_name: s.employee?.name ?? '—' }))
    totalPages.value = r.meta?.last_page ?? 1
  } catch { rows.value = [] } finally { loading.value = false }
}
function onPage(p: number) { page.value = p; load() }
onMounted(load)
</script>
