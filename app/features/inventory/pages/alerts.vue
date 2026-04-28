<template>
  <FeatureBoundary id="inventory-alerts">
    <div class="px-4 lg:px-6 py-5 max-w-[1400px] mx-auto">
      <UiPageHeader
        icon="i-lucide-package-x"
        :title="locale === 'ar' ? 'تنبيهات المخزون' : 'Stock Alerts'"
        :subtitle="locale === 'ar' ? 'منتجات وصلت إلى حد إعادة الطلب أو دونه' : 'Products at or below reorder level'"
      />

      <Can :perm="PERMISSIONS.MANAGE_INVENTORY">
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
          empty-icon="i-lucide-package-check"
          :empty-title="locale === 'ar' ? 'كل المنتجات بمستوى آمن' : 'All products above reorder level'"
          :empty-description="locale === 'ar'
            ? 'سيظهر هنا أي منتج وصل لحد إعادة الطلب لتنبيهك قبل نفاذه.'
            : 'Products that drop to or below their reorder level will surface here for restock.'"
        >
          <template #cell-sku="{ value }">
            <span class="font-mono text-xs text-primary-700 dark:text-primary-400" dir="ltr">{{ value }}</span>
          </template>
          <template #cell-name="{ value }">
            <span class="text-sm font-medium text-neutral-900 dark:text-neutral-0">{{ value }}</span>
          </template>
          <template #cell-stock="{ row }">
            <span class="font-mono text-sm font-semibold tabular-nums text-warning-700 dark:text-warning-500" dir="ltr">
              {{ Number(row.stock_quantity ?? 0).toLocaleString() }}
              <span class="text-neutral-400 dark:text-neutral-500 mx-1">/</span>
              {{ Number(row.reorder_level ?? 0).toLocaleString() }}
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
  { key: 'sku', label: 'SKU' },
  { key: 'name', label: locale.value === 'ar' ? 'المنتج' : 'Product' },
  { key: 'stock', label: locale.value === 'ar' ? 'المتاح / حد الطلب' : 'On hand / Reorder', class: 'text-end' },
])

async function load() {
  loading.value = true
  try {
    const r: any = await api.get('/inventory/alerts').catch(() => ({ data: [] }))
    rows.value = Array.isArray(r) ? r : (r.data ?? [])
  } catch { rows.value = [] } finally { loading.value = false }
}
onMounted(load)
</script>
