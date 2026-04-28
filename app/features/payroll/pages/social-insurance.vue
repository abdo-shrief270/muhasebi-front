<template>
  <FeatureBoundary id="payroll-social-insurance">
    <div class="px-4 lg:px-6 py-5 max-w-[1400px] mx-auto">
      <UiPageHeader
        icon="i-lucide-shield-check"
        :title="locale === 'ar' ? 'التأمينات الاجتماعية' : 'Social Insurance'"
        :subtitle="locale === 'ar' ? 'اشتراكات التأمينات الشهرية وحصص الموظف وصاحب العمل' : 'Monthly contributions split by employee and employer share'"
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
          empty-icon="i-lucide-shield-check"
          :empty-title="locale === 'ar' ? 'لا توجد سجلات تأمينات' : 'No insurance records'"
          :empty-description="locale === 'ar'
            ? 'الإجمالي الشهري لاشتراكات التأمينات الاجتماعية يظهر هنا.'
            : 'Monthly social insurance contribution totals appear here.'"
        >
          <template #cell-period="{ value }">
            <span class="text-sm font-medium text-neutral-900 dark:text-neutral-0 tabular-nums" dir="ltr">{{ value }}</span>
          </template>
          <template #cell-employees_count="{ value }">
            <span class="font-mono text-sm tabular-nums text-neutral-700 dark:text-neutral-200" dir="ltr">{{ value ?? 0 }}</span>
          </template>
          <template #cell-employee_share="{ value }">
            <span class="font-mono text-sm tabular-nums text-neutral-900 dark:text-neutral-0" dir="ltr">{{ formatMoney(value) }}</span>
          </template>
          <template #cell-employer_share="{ value }">
            <span class="font-mono text-sm tabular-nums text-neutral-900 dark:text-neutral-0" dir="ltr">{{ formatMoney(value) }}</span>
          </template>
          <template #cell-total="{ row }">
            <span class="font-mono text-sm font-semibold tabular-nums text-warning-700 dark:text-warning-500" dir="ltr">{{ formatMoney(row.total) }}</span>
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

const columns = computed(() => [
  { key: 'period', label: locale.value === 'ar' ? 'الفترة' : 'Period' },
  { key: 'employees_count', label: locale.value === 'ar' ? 'عدد الموظفين' : 'Employees', class: 'text-end' },
  { key: 'employee_share', label: locale.value === 'ar' ? 'حصة الموظف' : 'Employee Share', class: 'text-end' },
  { key: 'employer_share', label: locale.value === 'ar' ? 'حصة صاحب العمل' : 'Employer Share', class: 'text-end' },
  { key: 'total', label: locale.value === 'ar' ? 'الإجمالي' : 'Total', class: 'text-end' },
])

function formatMoney(n: number | string | null | undefined) {
  return Number(n ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

async function load() {
  loading.value = true
  try {
    const r: any = await api.get('/payroll/social-insurance').catch(() => ({ data: [] }))
    rows.value = Array.isArray(r) ? r : (r.data ?? [])
  } catch { rows.value = [] } finally { loading.value = false }
}
onMounted(load)
</script>
