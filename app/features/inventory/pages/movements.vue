<template>
  <FeatureBoundary id="inventory-movements">
    <div class="px-4 lg:px-6 py-5 max-w-[1400px] mx-auto">
      <UiPageHeader
        icon="i-lucide-arrow-down-up"
        :title="locale === 'ar' ? 'حركات المخزون' : 'Stock Movements'"
        :subtitle="locale === 'ar' ? 'سجل الإدخال والصرف والتحويل' : 'Record of stock in / out / transfers'"
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
          empty-icon="i-lucide-arrow-down-up"
          :empty-title="locale === 'ar' ? 'لا توجد حركات' : 'No movements'"
          :empty-description="locale === 'ar'
            ? 'كل عملية إدخال أو صرف أو تحويل تظهر هنا مع المرجع المرتبط.'
            : 'Every stock-in, stock-out, or transfer appears here with its source reference.'"
          @page-change="onPage"
        >
          <template #cell-date="{ value }">
            <span class="text-sm text-neutral-700 dark:text-neutral-200 tabular-nums" dir="ltr">{{ formatDate(value) }}</span>
          </template>
          <template #cell-product_name="{ value }">
            <span class="text-sm font-medium text-neutral-900 dark:text-neutral-0">{{ value }}</span>
          </template>
          <template #cell-type="{ row }">
            <UiBadge :color="row.type === 'in' ? 'green' : row.type === 'out' ? 'red' : 'blue'" dot>{{ typeLabel(row.type) }}</UiBadge>
          </template>
          <template #cell-quantity="{ value }">
            <span class="font-mono text-sm tabular-nums text-neutral-900 dark:text-neutral-0" dir="ltr">{{ Number(value ?? 0).toLocaleString() }}</span>
          </template>
          <template #cell-reference="{ value }">
            <span class="font-mono text-xs text-neutral-500 dark:text-neutral-400" dir="ltr">{{ value || '—' }}</span>
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
  { key: 'date', label: locale.value === 'ar' ? 'التاريخ' : 'Date' },
  { key: 'product_name', label: locale.value === 'ar' ? 'المنتج' : 'Product' },
  { key: 'type', label: locale.value === 'ar' ? 'النوع' : 'Type' },
  { key: 'quantity', label: locale.value === 'ar' ? 'الكمية' : 'Qty', class: 'text-end' },
  { key: 'reference', label: locale.value === 'ar' ? 'المرجع' : 'Reference' },
])

function typeLabel(t: string): string {
  if (locale.value === 'ar') {
    const map: Record<string, string> = { in: 'إدخال', out: 'صرف', transfer: 'تحويل' }
    return map[t] || t
  }
  return t.charAt(0).toUpperCase() + t.slice(1)
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
    const r: any = await api.get(`/inventory/movements?page=${page.value}&per_page=25`).catch(() => ({ data: [], meta: { last_page: 1 } }))
    rows.value = (r.data ?? []).map((m: any) => ({ ...m, product_name: m.product?.name ?? '—' }))
    totalPages.value = r.meta?.last_page ?? 1
  } catch { rows.value = [] } finally { loading.value = false }
}
function onPage(p: number) { page.value = p; load() }
onMounted(load)
</script>
