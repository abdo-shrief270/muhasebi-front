<template>
  <FeatureBoundary id="asset-disposals">
    <div class="px-4 lg:px-6 py-5 max-w-[1400px] mx-auto">
      <UiPageHeader
        icon="i-lucide-archive-x"
        :title="locale === 'ar' ? 'التخلص من الأصول' : 'Asset Disposals'"
        :subtitle="locale === 'ar' ? 'سجل بيع واستبعاد الأصول' : 'Record of asset sales and write-offs'"
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
          empty-icon="i-lucide-archive-x"
          :empty-title="locale === 'ar' ? 'لا توجد عمليات استبعاد' : 'No disposals recorded'"
          :empty-description="locale === 'ar'
            ? 'بيع أو استبعاد الأصول مع المكاسب أو الخسائر يظهر هنا.'
            : 'Asset sales and write-offs with their gains or losses appear here.'"
        >
          <template #cell-disposal_date="{ value }">
            <span class="text-sm text-neutral-700 dark:text-neutral-200 tabular-nums" dir="ltr">{{ formatDate(value) }}</span>
          </template>
          <template #cell-asset_name="{ value }">
            <span class="text-sm font-medium text-neutral-900 dark:text-neutral-0">{{ value }}</span>
          </template>
          <template #cell-method="{ value }">
            <span class="text-sm text-neutral-700 dark:text-neutral-200 capitalize">{{ value ?? '—' }}</span>
          </template>
          <template #cell-disposal_amount="{ row }">
            <span class="font-mono text-sm tabular-nums text-neutral-900 dark:text-neutral-0" dir="ltr">{{ formatMoney(row.disposal_amount) }}</span>
          </template>
          <template #cell-gain_loss="{ row }">
            <span
              class="font-mono text-sm font-semibold tabular-nums"
              :class="Number(row.gain_loss) >= 0
                ? 'text-success-700 dark:text-success-400'
                : 'text-danger-600 dark:text-danger-400'"
              dir="ltr"
            >
              {{ formatMoney(row.gain_loss) }}
            </span>
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
  { key: 'disposal_date', label: locale.value === 'ar' ? 'التاريخ' : 'Date' },
  { key: 'asset_name', label: locale.value === 'ar' ? 'الأصل' : 'Asset' },
  { key: 'method', label: locale.value === 'ar' ? 'الطريقة' : 'Method' },
  { key: 'disposal_amount', label: locale.value === 'ar' ? 'المتحصلات' : 'Proceeds', class: 'text-end' },
  { key: 'gain_loss', label: locale.value === 'ar' ? 'ربح / خسارة' : 'Gain / Loss', class: 'text-end' },
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
    const r: any = await api.get('/fixed-assets/disposals').catch(() => ({ data: [] }))
    rows.value = (Array.isArray(r) ? r : (r.data ?? [])).map((d: any) => ({ ...d, asset_name: d.asset?.name ?? '—' }))
  } catch { rows.value = [] } finally { loading.value = false }
}
onMounted(load)
</script>
