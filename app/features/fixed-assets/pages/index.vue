<template>
  <FeatureBoundary id="fixed-assets">
    <div class="px-4 lg:px-6 py-5 max-w-[1400px] mx-auto">
      <UiPageHeader
        icon="i-lucide-building-2"
        :title="locale === 'ar' ? 'الأصول الثابتة' : 'Fixed Assets'"
        :subtitle="locale === 'ar' ? 'سجل الأصول الثابتة وصافي قيمتها الدفترية' : 'Asset register with cost and net book value'"
      />

      <Can :perm="PERMISSIONS.MANAGE_FIXED_ASSETS">
        <template #fallback>
          <div class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-12 text-center">
            <div class="w-12 h-12 mx-auto mb-4 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
              <UIcon name="i-lucide-lock" class="w-5 h-5 text-neutral-400" />
            </div>
            <p class="text-sm font-semibold text-neutral-900 dark:text-neutral-0 mb-1">
              {{ locale === 'ar' ? 'لا تملك صلاحية الوصول' : "You don't have access" }}
            </p>
            <p class="text-xs text-neutral-500 dark:text-neutral-400">
              {{ locale === 'ar' ? 'إدارة الأصول الثابتة تتطلب صلاحية مخصصة' : 'Managing fixed assets requires a dedicated permission' }}
            </p>
          </div>
        </template>

        <UiDataTable
          :columns="columns"
          :rows="rows"
          :loading="loading"
          :current-page="page"
          :total-pages="totalPages"
          empty-icon="i-lucide-building-2"
          :empty-title="locale === 'ar' ? 'لا توجد أصول' : 'No assets registered'"
          :empty-description="locale === 'ar'
            ? 'سجّل أول أصل ثابت لبدء تتبع التكلفة والإهلاك.'
            : 'Register your first asset to begin tracking cost and depreciation.'"
          @page-change="onPage"
        >
          <template #cell-asset_code="{ value }">
            <span class="font-mono text-xs text-primary-700 dark:text-primary-400">{{ value }}</span>
          </template>
          <template #cell-name="{ value }">
            <span class="text-sm font-medium text-neutral-900 dark:text-neutral-0">{{ value }}</span>
          </template>
          <template #cell-category="{ value }">
            <span class="text-sm text-neutral-700 dark:text-neutral-200">{{ value }}</span>
          </template>
          <template #cell-acquisition_date="{ value }">
            <span class="text-sm text-neutral-700 dark:text-neutral-200 tabular-nums" dir="ltr">{{ formatDate(value) }}</span>
          </template>
          <template #cell-cost="{ row }">
            <span class="font-mono text-sm tabular-nums text-neutral-900 dark:text-neutral-0" dir="ltr">{{ formatMoney(row.cost) }}</span>
          </template>
          <template #cell-net_book_value="{ row }">
            <span class="font-mono text-sm font-semibold tabular-nums text-success-700 dark:text-success-400" dir="ltr">{{ formatMoney(row.net_book_value) }}</span>
          </template>
        </UiDataTable>
      </Can>
    </div>
  </FeatureBoundary>
</template>

<script setup lang="ts">
import Can from '~/core/rbac/Can.vue'
import { PERMISSIONS } from '~/core/rbac/permissions'
import { fixedAssetService } from '~/features/fixed-assets/services/fixedAssetService'

definePageMeta({ layout: 'dashboard' })
const { locale } = useI18n()

const rows = ref<any[]>([])
const loading = ref(true)
const page = ref(1)
const totalPages = ref(1)

const columns = computed(() => [
  { key: 'asset_code', label: locale.value === 'ar' ? 'كود الأصل' : 'Code' },
  { key: 'name', label: locale.value === 'ar' ? 'الاسم' : 'Name' },
  { key: 'category', label: locale.value === 'ar' ? 'الفئة' : 'Category' },
  { key: 'acquisition_date', label: locale.value === 'ar' ? 'تاريخ الاقتناء' : 'Acquired' },
  { key: 'cost', label: locale.value === 'ar' ? 'التكلفة' : 'Cost', class: 'text-end' },
  { key: 'net_book_value', label: locale.value === 'ar' ? 'صافي القيمة' : 'NBV', class: 'text-end' },
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
    const r = await fixedAssetService().list({ page: page.value, per_page: 25 })
    rows.value = (r.data ?? []).map((a: any) => ({ ...a, category: a.category?.name ?? '—' }))
    totalPages.value = r.meta?.last_page ?? 1
  } catch { rows.value = [] }
  finally { loading.value = false }
}

function onPage(p: number) { page.value = p; load() }
onMounted(load)
</script>
