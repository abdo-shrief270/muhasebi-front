<template>
  <FeatureBoundary id="fx-revaluation">
    <div class="px-4 lg:px-6 py-5 max-w-[1400px] mx-auto">
      <UiPageHeader
        icon="i-lucide-arrow-right-left"
        :title="locale === 'ar' ? 'إعادة تقييم العملات الأجنبية' : 'FX Revaluation'"
        :subtitle="locale === 'ar' ? 'إعادة تقييم الأرصدة بالعملات الأجنبية في نهاية الفترة' : 'Period-end revaluation of foreign-currency balances'"
      />

      <Can :perm="PERMISSIONS.MANAGE_ACCOUNTS">
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
          empty-icon="i-lucide-arrow-right-left"
          :empty-title="locale === 'ar' ? 'لا توجد عمليات إعادة تقييم' : 'No revaluation runs'"
          :empty-description="locale === 'ar'
            ? 'فروقات أسعار الصرف بين السعر الدفتري وسعر الإقفال تظهر هنا.'
            : 'Differences between book rates and closing rates for FX balances appear here.'"
        >
          <template #cell-period="{ value }">
            <span class="text-sm font-medium text-neutral-900 dark:text-neutral-0 tabular-nums" dir="ltr">{{ value }}</span>
          </template>
          <template #cell-currency="{ value }">
            <span class="font-mono text-xs font-semibold text-primary-700 dark:text-primary-400">{{ value }}</span>
          </template>
          <template #cell-book_rate="{ value }">
            <span class="font-mono text-sm tabular-nums text-neutral-700 dark:text-neutral-200" dir="ltr">{{ Number(value ?? 0).toLocaleString(undefined, { maximumFractionDigits: 6 }) }}</span>
          </template>
          <template #cell-closing_rate="{ value }">
            <span class="font-mono text-sm tabular-nums text-neutral-700 dark:text-neutral-200" dir="ltr">{{ Number(value ?? 0).toLocaleString(undefined, { maximumFractionDigits: 6 }) }}</span>
          </template>
          <template #cell-amount="{ row }">
            <span
              class="font-mono text-sm font-semibold tabular-nums"
              :class="Number(row.unrealized_gain_loss ?? 0) >= 0
                ? 'text-success-700 dark:text-success-400'
                : 'text-danger-600 dark:text-danger-400'"
              dir="ltr"
            >
              {{ Number(row.unrealized_gain_loss ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
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
  { key: 'period', label: locale.value === 'ar' ? 'الفترة' : 'Period' },
  { key: 'currency', label: locale.value === 'ar' ? 'العملة' : 'Currency' },
  { key: 'book_rate', label: locale.value === 'ar' ? 'السعر الدفتري' : 'Book Rate', class: 'text-end' },
  { key: 'closing_rate', label: locale.value === 'ar' ? 'سعر الإقفال' : 'Closing Rate', class: 'text-end' },
  { key: 'amount', label: locale.value === 'ar' ? 'فرق التقييم' : 'Unrealized G/L', class: 'text-end' },
])

async function load() {
  loading.value = true
  try {
    const r: any = await api.get('/fx-revaluation').catch(() => ({ data: [] }))
    rows.value = Array.isArray(r) ? r : (r.data ?? [])
  } catch { rows.value = [] }
  finally { loading.value = false }
}

onMounted(load)
</script>
