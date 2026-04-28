<template>
  <FeatureBoundary id="reports">
    <div class="px-4 lg:px-6 py-5 max-w-[1400px] mx-auto">
      <UiPageHeader
        icon="i-lucide-arrow-left-right"
        :title="locale === 'ar' ? 'التدفقات النقدية' : 'Cash Flow Statement'"
        :subtitle="locale === 'ar' ? 'حركة النقد التشغيلي والاستثماري والتمويلي' : 'Operating, investing, and financing activities'"
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
      <div v-if="data && !loading" class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div
          v-for="card in summaryCards"
          :key="card.key"
          class="relative bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-3"
        >
          <span class="absolute top-0 start-3 right-3 h-0.5 rounded-b-full" :class="card.tint" aria-hidden="true" />
          <p class="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">
            {{ card.label }}
          </p>
          <p
            class="font-mono text-base font-bold tabular-nums"
            :class="card.value >= 0 ? 'text-success-700 dark:text-success-400' : 'text-danger-700 dark:text-danger-400'"
            dir="ltr"
          >
            {{ formatMoney(card.value) }}
          </p>
        </div>
      </div>

      <!-- Body -->
      <div class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        <div v-if="loading" class="p-4 space-y-2">
          <div v-for="i in 10" :key="i" class="h-7 rounded-md bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
        </div>

        <div v-else-if="data" class="divide-y divide-neutral-100 dark:divide-neutral-800/60">
          <div v-for="(section, key) in sections" :key="key" class="p-4">
            <h3 class="text-sm font-semibold mb-3" :class="section.textClass">
              {{ section.title }}
            </h3>

            <div v-if="(data[key]?.items || []).length > 0" class="space-y-1">
              <div
                v-for="item in data[key].items"
                :key="item.name"
                class="flex items-baseline justify-between py-1.5 px-2 rounded-sm text-sm hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40 transition-colors -mx-2"
              >
                <span class="text-neutral-700 dark:text-neutral-200 truncate">{{ item.name }}</span>
                <span
                  class="font-mono tabular-nums flex-shrink-0 ms-3"
                  :class="Number(item.amount) >= 0 ? 'text-success-700 dark:text-success-400' : 'text-danger-700 dark:text-danger-400'"
                  dir="ltr"
                >
                  {{ formatMoney(item.amount) }}
                </span>
              </div>
            </div>
            <p v-else class="text-xs text-neutral-400 italic px-2 py-1">
              {{ locale === 'ar' ? 'لا توجد حركات' : 'No activity' }}
            </p>

            <div class="flex items-baseline justify-between pt-2 mt-2 border-t border-neutral-200 dark:border-neutral-800">
              <span class="text-sm font-semibold text-neutral-900 dark:text-neutral-0">{{ section.totalLabel }}</span>
              <span
                class="font-mono text-sm font-bold tabular-nums"
                :class="Number(data[key]?.total || 0) >= 0 ? 'text-success-700 dark:text-success-400' : 'text-danger-700 dark:text-danger-400'"
                dir="ltr"
              >
                {{ formatMoney(data[key]?.total || 0) }}
              </span>
            </div>
          </div>

          <!-- Net Change in Cash -->
          <div class="p-4 bg-neutral-50/60 dark:bg-neutral-950/40">
            <div class="flex items-center justify-between">
              <span class="font-semibold text-neutral-900 dark:text-neutral-0">
                {{ locale === 'ar' ? 'صافي التغير في النقد' : 'Net Change in Cash' }}
              </span>
              <span
                class="font-mono text-lg font-bold tabular-nums"
                :class="netChange >= 0 ? 'text-success-700 dark:text-success-400' : 'text-danger-700 dark:text-danger-400'"
                dir="ltr"
              >
                {{ formatMoney(netChange) }} {{ locale === 'ar' ? 'ج.م.' : 'EGP' }}
              </span>
            </div>
          </div>
        </div>

        <div v-else class="py-12 text-center">
          <div class="w-12 h-12 mx-auto mb-3 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
            <UIcon name="i-lucide-arrow-left-right" class="w-5 h-5 text-neutral-400" />
          </div>
          <p class="text-sm font-semibold text-neutral-900 dark:text-neutral-0 mb-1">
            {{ locale === 'ar' ? 'لا توجد بيانات' : 'No data for this period' }}
          </p>
        </div>
      </div>
    </div>
  </FeatureBoundary>
</template>

<script setup lang="ts">
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

const sections = computed(() => ({
  operating: {
    title: locale.value === 'ar' ? 'الأنشطة التشغيلية' : 'Operating Activities',
    textClass: 'text-info-700 dark:text-info-400',
    totalLabel: locale.value === 'ar' ? 'صافي التشغيلية' : 'Net Operating',
  },
  investing: {
    title: locale.value === 'ar' ? 'الأنشطة الاستثمارية' : 'Investing Activities',
    textClass: 'text-warning-700 dark:text-warning-500',
    totalLabel: locale.value === 'ar' ? 'صافي الاستثمارية' : 'Net Investing',
  },
  financing: {
    title: locale.value === 'ar' ? 'الأنشطة التمويلية' : 'Financing Activities',
    textClass: 'text-purple-700 dark:text-purple-400',
    totalLabel: locale.value === 'ar' ? 'صافي التمويلية' : 'Net Financing',
  },
}))

const netChange = computed(() => {
  // Backend usually emits `net_change`; fall back to summing the three
  // sections so the page still works against a slightly older response.
  const fromBackend = Number(data.value?.net_change ?? NaN)
  if (Number.isFinite(fromBackend)) return fromBackend
  return ['operating', 'investing', 'financing']
    .reduce((s, k) => s + Number(data.value?.[k]?.total ?? 0), 0)
})

const summaryCards = computed(() => [
  {
    key: 'operating',
    label: locale.value === 'ar' ? 'تشغيلية' : 'Operating',
    value: Number(data.value?.operating?.total ?? 0),
    tint: 'bg-info-500',
  },
  {
    key: 'investing',
    label: locale.value === 'ar' ? 'استثمارية' : 'Investing',
    value: Number(data.value?.investing?.total ?? 0),
    tint: 'bg-warning-500',
  },
  {
    key: 'financing',
    label: locale.value === 'ar' ? 'تمويلية' : 'Financing',
    value: Number(data.value?.financing?.total ?? 0),
    tint: 'bg-purple-500',
  },
  {
    key: 'net_change',
    label: locale.value === 'ar' ? 'صافي التغير' : 'Net Change',
    value: netChange.value,
    tint: netChange.value >= 0 ? 'bg-success-500' : 'bg-danger-500',
  },
])

async function load() {
  loading.value = true
  try {
    const res = await api.get<{ data: any }>(`/reports/cash-flow?from=${dateFrom.value}&to=${dateTo.value}`)
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
  window.open(`${config.public.apiBase}/reports/cash-flow/pdf?from=${dateFrom.value}&to=${dateTo.value}`, '_blank')
}

function formatMoney(n: number | string | null | undefined) {
  return Number(n ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

onMounted(load)
</script>
