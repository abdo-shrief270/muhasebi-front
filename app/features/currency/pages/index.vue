<template>
  <FeatureBoundary id="currency">
    <div class="px-4 lg:px-6 py-5 max-w-[1400px] mx-auto">
      <UiPageHeader
        icon="i-lucide-coins"
        :title="locale === 'ar' ? 'العملات' : 'Currencies'"
        :subtitle="locale === 'ar' ? 'قائمة العملات المدعومة وأسعار الصرف' : 'Supported currencies and exchange rates'"
      />

      <Can :perm="PERMISSIONS.MANAGE_SETTINGS">
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
          empty-icon="i-lucide-coins"
          :empty-title="locale === 'ar' ? 'لا توجد عملات' : 'No currencies'"
          :empty-description="locale === 'ar'
            ? 'العملات المدعومة وأسعار صرفها مقابل عملة الأساس تظهر هنا.'
            : 'Supported currencies and their exchange rates against the base currency appear here.'"
        >
          <template #cell-code="{ value }">
            <span class="font-mono text-xs font-semibold text-primary-700 dark:text-primary-400">{{ value }}</span>
          </template>
          <template #cell-name="{ value }">
            <span class="text-sm font-medium text-neutral-900 dark:text-neutral-0">{{ value }}</span>
          </template>
          <template #cell-symbol="{ value }">
            <span class="text-sm text-neutral-700 dark:text-neutral-200">{{ value }}</span>
          </template>
          <template #cell-rate="{ row }">
            <span class="font-mono text-sm tabular-nums text-neutral-900 dark:text-neutral-0" dir="ltr">{{ Number(row.rate ?? 1).toLocaleString(undefined, { maximumFractionDigits: 6 }) }}</span>
          </template>
        </UiDataTable>
      </Can>
    </div>
  </FeatureBoundary>
</template>

<script setup lang="ts">
import Can from '~/core/rbac/Can.vue'
import { PERMISSIONS } from '~/core/rbac/permissions'
import { currencyService } from '~/features/currency/services/currencyService'

definePageMeta({ layout: 'dashboard' })
const { locale } = useI18n()

const rows = ref<any[]>([])
const loading = ref(true)

const columns = computed(() => [
  { key: 'code', label: locale.value === 'ar' ? 'الكود' : 'Code' },
  { key: 'name', label: locale.value === 'ar' ? 'الاسم' : 'Name' },
  { key: 'symbol', label: locale.value === 'ar' ? 'الرمز' : 'Symbol' },
  { key: 'rate', label: locale.value === 'ar' ? 'سعر الصرف' : 'Rate', class: 'text-end' },
])

async function load() {
  loading.value = true
  try {
    const svc: any = currencyService()
    const r = typeof svc.list === 'function' ? await svc.list() : { data: [] }
    rows.value = Array.isArray(r) ? r : (r.data ?? [])
  } catch { rows.value = [] }
  finally { loading.value = false }
}

onMounted(load)
</script>
