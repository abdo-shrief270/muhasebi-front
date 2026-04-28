<template>
  <FeatureBoundary id="asset-depreciation">
    <div class="px-4 lg:px-6 py-5 max-w-[1400px] mx-auto">
      <UiPageHeader
        icon="i-lucide-trending-down"
        :title="locale === 'ar' ? 'إهلاك الأصول' : 'Depreciation Runs'"
        :subtitle="locale === 'ar' ? 'دفعات حساب الإهلاك الشهري' : 'Monthly depreciation runs'"
      />

      <Can :perm="PERMISSIONS.MANAGE_FIXED_ASSETS">
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
          empty-icon="i-lucide-trending-down"
          :empty-title="locale === 'ar' ? 'لا توجد دفعات إهلاك' : 'No depreciation runs'"
          :empty-description="locale === 'ar'
            ? 'كل دفعة إهلاك شهرية مُسجَّلة تظهر هنا مع إجمالي القيمة المخصومة.'
            : 'Each monthly depreciation run appears here with the total amount expensed.'"
        >
          <template #cell-period="{ value }">
            <span class="text-sm font-medium text-neutral-900 dark:text-neutral-0 tabular-nums" dir="ltr">{{ value }}</span>
          </template>
          <template #cell-run_date="{ value }">
            <span class="text-sm text-neutral-700 dark:text-neutral-200 tabular-nums" dir="ltr">{{ formatDate(value) }}</span>
          </template>
          <template #cell-assets_count="{ value }">
            <span class="font-mono text-sm tabular-nums text-neutral-700 dark:text-neutral-200" dir="ltr">{{ value ?? 0 }}</span>
          </template>
          <template #cell-total_depreciation="{ row }">
            <span class="font-mono text-sm font-semibold tabular-nums text-warning-700 dark:text-warning-500" dir="ltr">{{ formatMoney(row.total_depreciation) }}</span>
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
  { key: 'run_date', label: locale.value === 'ar' ? 'تاريخ التشغيل' : 'Run date' },
  { key: 'assets_count', label: locale.value === 'ar' ? 'عدد الأصول' : 'Assets', class: 'text-end' },
  { key: 'total_depreciation', label: locale.value === 'ar' ? 'إجمالي الإهلاك' : 'Total', class: 'text-end' },
])

function formatMoney(n: number | string | null | undefined) {
  return Number(n ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
function formatDate(d: string | null | undefined) {
  if (!d) return '—'
  try {
    return new Date(d).toLocaleDateString(locale.value === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    })
  } catch { return d }
}

async function load() {
  loading.value = true
  try {
    const r: any = await api.get('/fixed-assets/depreciation-runs').catch(() => ({ data: [] }))
    rows.value = Array.isArray(r) ? r : (r.data ?? [])
  } catch { rows.value = [] } finally { loading.value = false }
}
onMounted(load)
</script>
