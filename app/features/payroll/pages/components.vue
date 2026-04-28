<template>
  <FeatureBoundary id="payroll-components">
    <div class="px-4 lg:px-6 py-5 max-w-[1400px] mx-auto">
      <UiPageHeader
        icon="i-lucide-puzzle"
        :title="locale === 'ar' ? 'مكونات الراتب' : 'Salary Components'"
        :subtitle="locale === 'ar' ? 'بدلات وخصومات قابلة للتعريف' : 'Reusable earnings and deductions'"
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
          empty-icon="i-lucide-puzzle"
          :empty-title="locale === 'ar' ? 'لا توجد مكونات' : 'No components defined'"
          :empty-description="locale === 'ar'
            ? 'بدلات (مواصلات، سكن) وخصومات (تأخير) قابلة لإعادة الاستخدام عبر مسيرات الرواتب.'
            : 'Earnings (transport, housing) and deductions (late) reusable across payroll runs.'"
        >
          <template #cell-name="{ value }">
            <span class="text-sm font-medium text-neutral-900 dark:text-neutral-0">{{ value }}</span>
          </template>
          <template #cell-code="{ value }">
            <span class="font-mono text-xs text-primary-700 dark:text-primary-400" dir="ltr">{{ value }}</span>
          </template>
          <template #cell-kind="{ row }">
            <UiBadge :color="row.kind === 'earning' ? 'green' : 'red'" dot>
              {{ kindLabel(row.kind) }}
            </UiBadge>
          </template>
          <template #cell-taxable="{ value }">
            <UiBadge :color="value ? 'blue' : 'gray'">
              {{ value ? (locale === 'ar' ? 'نعم' : 'Yes') : (locale === 'ar' ? 'لا' : 'No') }}
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
const rows = ref<any[]>([])
const loading = ref(true)

const columns = computed(() => [
  { key: 'name', label: locale.value === 'ar' ? 'الاسم' : 'Name' },
  { key: 'code', label: locale.value === 'ar' ? 'الكود' : 'Code' },
  { key: 'kind', label: locale.value === 'ar' ? 'النوع' : 'Type' },
  { key: 'taxable', label: locale.value === 'ar' ? 'خاضع للضريبة' : 'Taxable' },
])

function kindLabel(k: string): string {
  if (locale.value === 'ar') {
    return ({ earning: 'بدل', deduction: 'خصم' } as Record<string, string>)[k] || k
  }
  return k.charAt(0).toUpperCase() + k.slice(1)
}

async function load() {
  loading.value = true
  try {
    const r: any = await api.get('/payroll/salary-components').catch(() => ({ data: [] }))
    rows.value = Array.isArray(r) ? r : (r.data ?? [])
  } catch { rows.value = [] } finally { loading.value = false }
}
onMounted(load)
</script>
