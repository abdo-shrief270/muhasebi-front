<template>
  <FeatureBoundary id="inventory">
    <div class="px-4 lg:px-6 py-5 max-w-[1400px] mx-auto">
      <UiPageHeader
        icon="i-lucide-boxes"
        :title="locale === 'ar' ? 'المخزون' : 'Inventory'"
        :subtitle="locale === 'ar' ? 'قائمة المنتجات والكميات المتاحة' : 'Product catalog and on-hand quantities'"
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
          :current-page="page"
          :total-pages="totalPages"
          empty-icon="i-lucide-boxes"
          :empty-title="locale === 'ar' ? 'لا توجد منتجات' : 'No products yet'"
          :empty-description="locale === 'ar'
            ? 'أضف منتجاتك لتتبع الكميات والأسعار وحركة المخزون.'
            : 'Add products to track quantities, prices, and stock movements.'"
          @page-change="onPage"
        >
          <template #cell-sku="{ value }">
            <span class="font-mono text-xs text-primary-700 dark:text-primary-400" dir="ltr">{{ value }}</span>
          </template>
          <template #cell-name="{ value }">
            <span class="text-sm font-medium text-neutral-900 dark:text-neutral-0">{{ value }}</span>
          </template>
          <template #cell-category="{ value }">
            <span class="text-sm text-neutral-700 dark:text-neutral-200">{{ value }}</span>
          </template>
          <template #cell-unit_price="{ value }">
            <span class="font-mono text-sm tabular-nums text-neutral-900 dark:text-neutral-0" dir="ltr">{{ formatMoney(value) }}</span>
          </template>
          <template #cell-stock="{ row }">
            <span
              class="font-mono text-sm tabular-nums"
              :class="row.stock_quantity <= (row.reorder_level ?? 0)
                ? 'text-warning-700 dark:text-warning-500 font-semibold'
                : 'text-neutral-900 dark:text-neutral-0'"
              dir="ltr"
            >
              {{ Number(row.stock_quantity ?? 0).toLocaleString() }}
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
import { inventoryService } from '~/features/inventory/services/inventoryService'

definePageMeta({ layout: 'dashboard' })
const { locale } = useI18n()

const rows = ref<any[]>([])
const loading = ref(true)
const page = ref(1)
const totalPages = ref(1)

const columns = computed(() => [
  { key: 'sku', label: locale.value === 'ar' ? 'الكود' : 'SKU' },
  { key: 'name', label: locale.value === 'ar' ? 'الاسم' : 'Name' },
  { key: 'category', label: locale.value === 'ar' ? 'الفئة' : 'Category' },
  { key: 'unit_price', label: locale.value === 'ar' ? 'السعر' : 'Price', class: 'text-end' },
  { key: 'stock', label: locale.value === 'ar' ? 'المخزون' : 'Stock', class: 'text-end' },
])

function formatMoney(n: number | string | null | undefined) {
  return Number(n ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

async function load() {
  loading.value = true
  try {
    const svc: any = inventoryService()
    const r = typeof svc.list === 'function' ? await svc.list({ page: page.value, per_page: 25 }) : { data: [], meta: { last_page: 1 } }
    rows.value = (r.data ?? []).map((p: any) => ({ ...p, category: p.category?.name ?? '—' }))
    totalPages.value = r.meta?.last_page ?? 1
  } catch { rows.value = [] }
  finally { loading.value = false }
}

function onPage(p: number) { page.value = p; load() }
onMounted(load)
</script>
