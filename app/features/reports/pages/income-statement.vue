<template>
  <FeatureBoundary id="reports">
    <div class="px-4 lg:px-6 py-5 max-w-[1400px] mx-auto">
      <UiPageHeader
        icon="i-lucide-trending-up"
        :title="locale === 'ar' ? 'قائمة الدخل' : 'Income Statement'"
        :subtitle="locale === 'ar' ? 'الإيرادات والمصروفات وصافي الربح خلال الفترة' : 'Revenue, expenses and net income over the period'"
      >
        <template #actions>
          <UiDateRangePicker v-model:from="dateFrom" v-model:to="dateTo" />
          <UiAppButton variant="outline" size="sm" icon="i-lucide-refresh-cw" :loading="loading" @click="load">
            {{ locale === 'ar' ? 'تحديث' : 'Refresh' }}
          </UiAppButton>
          <UiAppButton variant="outline" size="sm" icon="i-lucide-download" @click="downloadPdf">
            PDF
          </UiAppButton>
        </template>
      </UiPageHeader>

      <!-- Summary cards -->
      <div v-if="data && !loading" class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <div class="relative bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
          <span class="absolute top-0 start-3 right-3 h-0.5 rounded-b-full bg-success-500" aria-hidden="true" />
          <div class="flex items-start justify-between mb-1">
            <p class="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              {{ locale === 'ar' ? 'إجمالي الإيرادات' : 'Total Revenue' }}
            </p>
            <UIcon name="i-lucide-arrow-up-right" class="w-4 h-4 text-success-500" />
          </div>
          <p class="font-mono text-2xl font-bold tabular-nums text-success-700 dark:text-success-400" dir="ltr">
            {{ formatMoney(data.revenue?.total ?? 0) }}
          </p>
        </div>

        <div class="relative bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
          <span class="absolute top-0 start-3 right-3 h-0.5 rounded-b-full bg-danger-500" aria-hidden="true" />
          <div class="flex items-start justify-between mb-1">
            <p class="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              {{ locale === 'ar' ? 'إجمالي المصروفات' : 'Total Expenses' }}
            </p>
            <UIcon name="i-lucide-arrow-down-right" class="w-4 h-4 text-danger-500" />
          </div>
          <p class="font-mono text-2xl font-bold tabular-nums text-danger-700 dark:text-danger-400" dir="ltr">
            {{ formatMoney(data.expenses?.total ?? 0) }}
          </p>
        </div>

        <div
          class="relative bg-neutral-0 dark:bg-neutral-900 rounded-xl border p-4"
          :class="netIncome >= 0 ? 'border-success-500/30 bg-success-500/5' : 'border-danger-500/30 bg-danger-500/5'"
        >
          <span
            class="absolute top-0 start-3 right-3 h-0.5 rounded-b-full"
            :class="netIncome >= 0 ? 'bg-success-500' : 'bg-danger-500'"
            aria-hidden="true"
          />
          <div class="flex items-start justify-between mb-1">
            <p class="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              {{ locale === 'ar' ? 'صافي الربح' : 'Net Income' }}
            </p>
            <UIcon
              :name="netIncome >= 0 ? 'i-lucide-trending-up' : 'i-lucide-trending-down'"
              class="w-4 h-4"
              :class="netIncome >= 0 ? 'text-success-500' : 'text-danger-500'"
            />
          </div>
          <p
            class="font-mono text-2xl font-bold tabular-nums"
            :class="netIncome >= 0 ? 'text-success-700 dark:text-success-400' : 'text-danger-700 dark:text-danger-400'"
            dir="ltr"
          >
            {{ formatMoney(netIncome) }}
          </p>
          <p
            class="text-xs mt-1"
            :class="netIncome >= 0 ? 'text-success-700 dark:text-success-400' : 'text-danger-700 dark:text-danger-400'"
          >
            {{ marginText }}
          </p>
        </div>
      </div>

      <!-- Body -->
      <div class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        <div v-if="loading" class="p-4 space-y-2">
          <div v-for="i in 10" :key="i" class="h-7 rounded-md bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
        </div>

        <div v-else-if="data" class="divide-y divide-neutral-100 dark:divide-neutral-800/60">
          <!-- Revenue -->
          <ReportSection
            :title="locale === 'ar' ? 'الإيرادات' : 'Revenue'"
            tone="success"
            :total="data.revenue?.total ?? 0"
            :items="data.revenue?.accounts ?? []"
            :locale="locale"
          />

          <!-- Expenses -->
          <ReportSection
            :title="locale === 'ar' ? 'المصروفات' : 'Expenses'"
            tone="danger"
            :total="data.expenses?.total ?? 0"
            :items="data.expenses?.accounts ?? []"
            :locale="locale"
          />

          <!-- Net Income — final row -->
          <div class="p-4 bg-neutral-50/60 dark:bg-neutral-950/40">
            <div class="flex items-center justify-between">
              <span class="font-semibold text-neutral-900 dark:text-neutral-0">
                {{ locale === 'ar' ? 'صافي الربح' : 'Net Income' }}
              </span>
              <span
                class="font-mono text-lg font-bold tabular-nums"
                :class="netIncome >= 0 ? 'text-success-700 dark:text-success-400' : 'text-danger-700 dark:text-danger-400'"
                dir="ltr"
              >
                {{ formatMoney(netIncome) }} {{ locale === 'ar' ? 'ج.م.' : 'EGP' }}
              </span>
            </div>
          </div>
        </div>

        <div v-else class="py-12 text-center">
          <div class="w-12 h-12 mx-auto mb-3 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
            <UIcon name="i-lucide-trending-up" class="w-5 h-5 text-neutral-400" />
          </div>
          <p class="text-sm font-semibold text-neutral-900 dark:text-neutral-0 mb-1">
            {{ locale === 'ar' ? 'لا توجد بيانات' : 'No data for this period' }}
          </p>
          <p class="text-xs text-neutral-500 dark:text-neutral-400">
            {{ locale === 'ar' ? 'جرّب تغيير نطاق التاريخ.' : 'Try a different date range.' }}
          </p>
        </div>
      </div>
    </div>
  </FeatureBoundary>
</template>

<script setup lang="ts">
import ReportSection from '~/features/reports/components/ReportSection.vue'

definePageMeta({ layout: 'dashboard' })

const { locale } = useI18n()
const api = useApi()
const config = useRuntimeConfig()
const toastStore = useToastStore()

const now = new Date()
const dateFrom = ref(`${now.getFullYear()}-01-01`)
const dateTo = ref(now.toISOString().split('T')[0])
const data = ref<any>(null)
const loading = ref(true)

const netIncome = computed(() => Number(data.value?.revenue?.total ?? 0) - Number(data.value?.expenses?.total ?? 0))

/**
 * Profit margin sub-text on the Net Income card. Computed against revenue
 * since "loss as % of expenses" is rarely what an accountant wants. Shows
 * a clean placeholder when revenue is zero (no division by zero, no NaN).
 */
const marginText = computed(() => {
  const rev = Number(data.value?.revenue?.total ?? 0)
  if (rev <= 0) return locale.value === 'ar' ? 'لا توجد إيرادات' : 'no revenue'
  const pct = (netIncome.value / rev) * 100
  const label = locale.value === 'ar' ? 'هامش' : 'margin'
  return `${pct.toFixed(1)}% ${label}`
})

async function load() {
  loading.value = true
  try {
    const res = await api.get<{ data: any }>(`/reports/income-statement?from=${dateFrom.value}&to=${dateTo.value}`)
    data.value = res.data
  } catch (e: any) {
    data.value = null
    toastStore.error(e?.message || (locale.value === 'ar' ? 'تعذر تحميل التقرير' : 'Failed to load report'))
  } finally {
    loading.value = false
  }
}

watch([dateFrom, dateTo], () => { load() })

function downloadPdf() {
  window.open(`${config.public.apiBase}/reports/income-statement/pdf?from=${dateFrom.value}&to=${dateTo.value}`, '_blank')
}

function formatMoney(n: number | string | null | undefined) {
  return Number(n ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

onMounted(load)
</script>
