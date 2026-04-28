<template>
  <FeatureBoundary id="reports">
    <div class="px-4 lg:px-6 py-5 max-w-[1400px] mx-auto">
      <UiPageHeader
        icon="i-lucide-scale"
        :title="locale === 'ar' ? 'الميزانية العمومية' : 'Balance Sheet'"
        :subtitle="locale === 'ar'
          ? `كما في ${formatDate(asOfDate)}`
          : `As of ${formatDate(asOfDate)}`"
      >
        <template #actions>
          <div class="flex items-center gap-1.5">
            <span class="text-xs font-medium text-neutral-500 dark:text-neutral-400">
              {{ locale === 'ar' ? 'كما في' : 'As of' }}
            </span>
            <input
              v-model="asOfDate"
              type="date"
              class="bs-date-input"
            />
          </div>
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
          <span class="absolute top-0 start-3 right-3 h-0.5 rounded-b-full bg-info-500" aria-hidden="true" />
          <p class="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">
            {{ locale === 'ar' ? 'إجمالي الأصول' : 'Total Assets' }}
          </p>
          <p class="font-mono text-2xl font-bold tabular-nums text-info-700 dark:text-info-400" dir="ltr">
            {{ formatMoney(data.assets?.total ?? 0) }}
          </p>
        </div>

        <div class="relative bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
          <span class="absolute top-0 start-3 right-3 h-0.5 rounded-b-full bg-warning-500" aria-hidden="true" />
          <p class="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">
            {{ locale === 'ar' ? 'الخصوم + حقوق الملكية' : 'Liabilities + Equity' }}
          </p>
          <p class="font-mono text-2xl font-bold tabular-nums text-warning-700 dark:text-warning-500" dir="ltr">
            {{ formatMoney(liabilitiesAndEquity) }}
          </p>
        </div>

        <div
          class="relative bg-neutral-0 dark:bg-neutral-900 rounded-xl border p-4"
          :class="isBalanced
            ? 'border-success-500/30 bg-success-500/5'
            : 'border-danger-500/30 bg-danger-500/5'"
        >
          <span
            class="absolute top-0 start-3 right-3 h-0.5 rounded-b-full"
            :class="isBalanced ? 'bg-success-500' : 'bg-danger-500'"
            aria-hidden="true"
          />
          <div class="flex items-start justify-between mb-1">
            <p class="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              {{ locale === 'ar' ? 'الفرق' : 'Variance' }}
            </p>
            <UIcon
              :name="isBalanced ? 'i-lucide-check-circle-2' : 'i-lucide-alert-triangle'"
              class="w-4 h-4"
              :class="isBalanced ? 'text-success-500' : 'text-danger-500'"
            />
          </div>
          <p
            class="font-mono text-2xl font-bold tabular-nums"
            :class="isBalanced
              ? 'text-success-700 dark:text-success-400'
              : 'text-danger-700 dark:text-danger-400'"
            dir="ltr"
          >
            {{ formatMoney(Math.abs(Number(data.assets?.total ?? 0) - liabilitiesAndEquity)) }}
          </p>
          <p
            class="text-xs mt-1"
            :class="isBalanced ? 'text-success-700 dark:text-success-400' : 'text-danger-700 dark:text-danger-400'"
          >
            {{ isBalanced
              ? (locale === 'ar' ? 'الميزانية متوازنة' : 'Balanced')
              : (locale === 'ar' ? 'غير متوازن — راجع القيود' : 'Out of balance — review entries') }}
          </p>
        </div>
      </div>

      <!-- Body — two-column layout on desktop: assets on the left, liabilities + equity on the right -->
      <div class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        <div v-if="loading" class="p-4 space-y-2">
          <div v-for="i in 12" :key="i" class="h-7 rounded-md bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
        </div>

        <div v-else-if="data" class="grid grid-cols-1 lg:grid-cols-2 lg:divide-x lg:rtl:divide-x-reverse divide-neutral-200 dark:divide-neutral-800">
          <!-- Left: Assets -->
          <div class="divide-y divide-neutral-100 dark:divide-neutral-800/60">
            <ReportSection
              :title="locale === 'ar' ? 'الأصول' : 'Assets'"
              tone="info"
              :total="data.assets?.total ?? 0"
              :items="data.assets?.accounts ?? []"
              :locale="locale"
            />
          </div>

          <!-- Right: Liabilities + Equity -->
          <div class="divide-y divide-neutral-100 dark:divide-neutral-800/60 border-t lg:border-t-0 border-neutral-200 dark:border-neutral-800">
            <ReportSection
              :title="locale === 'ar' ? 'الخصوم' : 'Liabilities'"
              tone="warning"
              :total="data.liabilities?.total ?? 0"
              :items="data.liabilities?.accounts ?? []"
              :locale="locale"
            />
            <ReportSection
              :title="locale === 'ar' ? 'حقوق الملكية' : 'Equity'"
              tone="purple"
              :total="data.equity?.total ?? 0"
              :items="data.equity?.accounts ?? []"
              :locale="locale"
            />

            <!-- Sum of liabilities + equity -->
            <div class="p-4 bg-neutral-50/60 dark:bg-neutral-950/40">
              <div class="flex items-center justify-between">
                <span class="font-semibold text-neutral-900 dark:text-neutral-0">
                  {{ locale === 'ar' ? 'الخصوم + حقوق الملكية' : 'Liabilities + Equity' }}
                </span>
                <span class="font-mono text-sm font-bold tabular-nums text-neutral-900 dark:text-neutral-0" dir="ltr">
                  {{ formatMoney(liabilitiesAndEquity) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="py-12 text-center">
          <div class="w-12 h-12 mx-auto mb-3 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
            <UIcon name="i-lucide-scale" class="w-5 h-5 text-neutral-400" />
          </div>
          <p class="text-sm font-semibold text-neutral-900 dark:text-neutral-0 mb-1">
            {{ locale === 'ar' ? 'لا توجد بيانات' : 'No data for this date' }}
          </p>
          <p class="text-xs text-neutral-500 dark:text-neutral-400">
            {{ locale === 'ar' ? 'جرّب تغيير التاريخ.' : 'Try a different as-of date.' }}
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

const asOfDate = ref(new Date().toISOString().split('T')[0])
const data = ref<any>(null)
const loading = ref(true)

const liabilitiesAndEquity = computed(() =>
  Number(data.value?.liabilities?.total ?? 0) + Number(data.value?.equity?.total ?? 0)
)
const isBalanced = computed(() =>
  Math.abs(Number(data.value?.assets?.total ?? 0) - liabilitiesAndEquity.value) < 0.01
)

async function load() {
  loading.value = true
  try {
    const res = await api.get<{ data: any }>(`/reports/balance-sheet?date=${asOfDate.value}`)
    data.value = res.data
  } catch (e: any) {
    data.value = null
    toastStore.error(e?.message || (locale.value === 'ar' ? 'تعذر تحميل التقرير' : 'Failed to load report'))
  } finally {
    loading.value = false
  }
}

watch(asOfDate, () => { load() })

function downloadPdf() {
  window.open(`${config.public.apiBase}/reports/balance-sheet/pdf?date=${asOfDate.value}`, '_blank')
}

function formatMoney(n: number | string | null | undefined) {
  return Number(n ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatDate(d: string | null | undefined) {
  if (!d) return '—'
  try {
    return new Date(d).toLocaleDateString(locale.value === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    })
  } catch {
    return d
  }
}

onMounted(load)
</script>

<style scoped>
@reference "~/assets/css/tokens.css";

.bs-date-input {
  height: 2rem;
  padding-inline: 0.5rem;
  font-size: 0.75rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-neutral-200);
  background-color: var(--color-neutral-0, #fff);
  color: var(--color-neutral-900);
  outline: none;
  transition: border-color 150ms var(--ease-standard);
}
.bs-date-input:focus {
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 2px color-mix(in oklab, var(--color-primary-500) 20%, transparent);
}
:global(html.dark) .bs-date-input {
  background-color: var(--color-neutral-900);
  border-color: var(--color-neutral-800);
  color: var(--color-neutral-0);
}
</style>
