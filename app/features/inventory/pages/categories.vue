<template>
  <FeatureBoundary id="inventory-categories">
    <div class="px-4 lg:px-6 py-5 max-w-[1400px] mx-auto">
      <UiPageHeader
        icon="i-lucide-folder-tree"
        :title="locale === 'ar' ? 'فئات المنتجات' : 'Product Categories'"
        :subtitle="locale === 'ar' ? 'تصنيفات لتنظيم المنتجات في المخزون' : 'Classifications to group products in your catalog'"
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
          empty-icon="i-lucide-folder-tree"
          :empty-title="locale === 'ar' ? 'لا توجد فئات' : 'No categories'"
          :empty-description="locale === 'ar'
            ? 'الفئات تساعدك على تنظيم المنتجات وتتبع المبيعات حسب النوع.'
            : 'Categories help you organize products and track sales by type.'"
        >
          <template #cell-name="{ value }">
            <span class="text-sm font-medium text-neutral-900 dark:text-neutral-0">{{ value }}</span>
          </template>
          <template #cell-description="{ value }">
            <span class="text-sm text-neutral-700 dark:text-neutral-200">{{ value || '—' }}</span>
          </template>
          <template #cell-products_count="{ value }">
            <span class="font-mono text-sm tabular-nums text-neutral-700 dark:text-neutral-200" dir="ltr">{{ value ?? 0 }}</span>
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
  { key: 'description', label: locale.value === 'ar' ? 'الوصف' : 'Description' },
  { key: 'products_count', label: locale.value === 'ar' ? 'عدد المنتجات' : 'Products', class: 'text-end' },
])

async function load() {
  loading.value = true
  try {
    const r: any = await api.get('/inventory/categories').catch(() => ({ data: [] }))
    rows.value = Array.isArray(r) ? r : (r.data ?? [])
  } catch { rows.value = [] } finally { loading.value = false }
}
onMounted(load)
</script>
