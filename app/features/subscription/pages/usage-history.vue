<template>
  <FeatureBoundary id="subscription-usage-history">
    <div class="px-4 lg:px-6 py-5 max-w-[1400px] mx-auto">
      <UiPageHeader
        icon="i-lucide-line-chart"
        :title="locale === 'ar' ? 'سجل الاستخدام' : 'Usage History'"
        :subtitle="locale === 'ar' ? 'تتبع تغير الاستخدام على مدار الفترة' : 'Track how your usage has trended over time'"
      >
        <template #actions>
          <NuxtLink to="/subscription">
            <UiAppButton variant="outline" size="sm" icon="i-lucide-arrow-left" class="rtl:[&_[name=i-lucide-arrow-left]]:rotate-180">
              {{ locale === 'ar' ? 'العودة' : 'Back' }}
            </UiAppButton>
          </NuxtLink>
        </template>
      </UiPageHeader>

      <!-- Range + metric controls -->
      <div class="flex items-center justify-between flex-wrap gap-3 mb-4">
        <div class="inline-flex bg-neutral-0 dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-1 gap-1">
          <button
            v-for="opt in rangeOptions"
            :key="opt.value"
            type="button"
            class="px-3 h-8 text-xs font-semibold rounded-md transition-colors"
            :class="rangeDays === opt.value
              ? 'bg-primary-500 text-white shadow-sm'
              : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-0'"
            @click="rangeDays = opt.value"
          >
            {{ opt.label }}
          </button>
        </div>

        <div class="relative">
          <select v-model="metric" class="uh-input pe-8">
            <option v-for="m in metricOptions" :key="m.value" :value="m.value">{{ m.label }}</option>
          </select>
          <UIcon name="i-lucide-chevron-down" class="absolute end-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
        </div>
      </div>

      <!-- Chart card -->
      <div class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5">
        <div v-if="loading" class="h-[280px] rounded-md bg-neutral-100 dark:bg-neutral-800 animate-pulse" />

        <div v-else-if="!chartData.length" class="h-[280px] flex flex-col items-center justify-center gap-2 text-center">
          <div class="w-12 h-12 mx-auto rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
            <UIcon name="i-lucide-line-chart" class="w-5 h-5 text-neutral-400" />
          </div>
          <p class="text-sm font-semibold text-neutral-900 dark:text-neutral-0">
            {{ locale === 'ar' ? 'لا توجد بيانات بعد' : 'No data yet' }}
          </p>
          <p class="text-xs text-neutral-500 dark:text-neutral-400 max-w-md">
            {{ locale === 'ar'
              ? 'يتم تسجيل الاستخدام يومياً. عُد بعد يوم أو اثنين.'
              : 'Usage is recorded daily. Check back after a day or two.' }}
          </p>
        </div>

        <div v-else>
          <!-- Summary -->
          <div class="flex items-baseline justify-between mb-4 gap-3 flex-wrap">
            <div>
              <p class="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-0.5">
                {{ activeMetricLabel }}
              </p>
              <p class="font-mono text-2xl font-bold tabular-nums text-neutral-900 dark:text-neutral-0" dir="ltr">
                {{ formatValue(chartData[chartData.length - 1].value) }}
                <span v-if="metric === 'storage_bytes'" class="text-sm font-normal text-neutral-500 dark:text-neutral-400">
                  {{ formatBytesSuffix(chartData[chartData.length - 1].value) }}
                </span>
              </p>
            </div>
            <div class="text-end">
              <p class="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-0.5">
                {{ locale === 'ar' ? 'التغير' : 'Change' }}
              </p>
              <p
                class="font-mono text-sm font-semibold tabular-nums"
                :class="deltaPercent >= 0 ? 'text-success-700 dark:text-success-400' : 'text-info-700 dark:text-info-400'"
                dir="ltr"
              >
                {{ deltaPercent >= 0 ? '+' : '' }}{{ deltaPercent.toFixed(1) }}%
              </p>
            </div>
          </div>

          <!-- Chart -->
          <div class="relative h-[260px]">
            <svg
              :viewBox="`0 0 ${chartWidth} ${chartHeight}`"
              class="w-full h-full"
              preserveAspectRatio="none"
              role="img"
              :aria-label="locale === 'ar' ? 'رسم بياني للاستخدام' : 'Usage chart'"
            >
              <!-- Y gridlines (4 levels) -->
              <line
                v-for="(g, i) in yGridLines"
                :key="i"
                :x1="0" :x2="chartWidth"
                :y1="g.y" :y2="g.y"
                class="stroke-neutral-200 dark:stroke-neutral-800"
                stroke-width="1"
                stroke-dasharray="2 4"
              />

              <!-- Filled area -->
              <path :d="areaPath" class="fill-primary-500/15 dark:fill-primary-500/20" />
              <!-- Line -->
              <path :d="linePath" class="stroke-primary-500 dark:stroke-primary-400" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" />

              <!-- Data points -->
              <circle
                v-for="(pt, i) in chartPoints"
                :key="i"
                :cx="pt.x" :cy="pt.y"
                r="3"
                class="fill-primary-500 dark:fill-primary-400"
              >
                <title>{{ formatTooltip(chartData[i]) }}</title>
              </circle>
            </svg>

            <!-- Y-axis labels -->
            <div class="absolute inset-y-0 start-0 -translate-x-2 rtl:translate-x-2 flex flex-col-reverse justify-between text-[10px] text-neutral-400 tabular-nums pointer-events-none" dir="ltr">
              <span v-for="(g, i) in yGridLines" :key="i">{{ formatAxis(g.value) }}</span>
            </div>
          </div>

          <!-- X-axis labels -->
          <div class="flex justify-between mt-2 text-[10px] text-neutral-400 tabular-nums" dir="ltr">
            <span>{{ formatAxisDate(chartData[0].date) }}</span>
            <span v-if="chartData.length > 4">{{ formatAxisDate(chartData[Math.floor(chartData.length / 2)].date) }}</span>
            <span>{{ formatAxisDate(chartData[chartData.length - 1].date) }}</span>
          </div>
        </div>
      </div>
    </div>
  </FeatureBoundary>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })

const { locale } = useI18n()
const api = useApi()
const toastStore = useToastStore()

const rangeDays = ref<30 | 60 | 90>(30)
const metric = ref<string>('users_count')
const loading = ref(true)
const rawHistory = ref<Array<Record<string, number | string>>>([])

const rangeOptions = computed(() => [
  { value: 30 as const, label: locale.value === 'ar' ? '30 يوم' : '30 days' },
  { value: 60 as const, label: locale.value === 'ar' ? '60 يوم' : '60 days' },
  { value: 90 as const, label: locale.value === 'ar' ? '90 يوم' : '90 days' },
])

const metricOptions = computed(() => [
  { value: 'users_count', label: locale.value === 'ar' ? 'المستخدمون' : 'Users' },
  { value: 'clients_count', label: locale.value === 'ar' ? 'العملاء' : 'Clients' },
  { value: 'invoices_count', label: locale.value === 'ar' ? 'الفواتير' : 'Invoices' },
  { value: 'bills_count', label: locale.value === 'ar' ? 'فواتير الموردين' : 'Bills' },
  { value: 'journal_entries_count', label: locale.value === 'ar' ? 'القيود اليومية' : 'Journal entries' },
  { value: 'bank_imports_count', label: locale.value === 'ar' ? 'استيراد البنوك' : 'Bank imports' },
  { value: 'documents_count', label: locale.value === 'ar' ? 'المستندات' : 'Documents' },
  { value: 'storage_bytes', label: locale.value === 'ar' ? 'التخزين' : 'Storage' },
])

const activeMetricLabel = computed(() => {
  return metricOptions.value.find(o => o.value === metric.value)?.label ?? metric.value
})

interface Sample {
  date: string
  value: number
}

const chartData = computed<Sample[]>(() => {
  // History rows arrive newest-first; reverse to chronological order so the
  // chart reads left → right (oldest → newest), matching reading direction
  // even in RTL since the SVG itself is direction-agnostic.
  return rawHistory.value
    .slice()
    .reverse()
    .map(row => ({
      date: String(row.recorded_at ?? ''),
      value: Number(row[metric.value] ?? 0),
    }))
})

const deltaPercent = computed(() => {
  const arr = chartData.value
  if (arr.length < 2) return 0
  const first = arr[0].value
  const last = arr[arr.length - 1].value
  if (first === 0) return last === 0 ? 0 : 100
  return ((last - first) / first) * 100
})

// SVG layout — viewBox coordinates only, the wrapper scales to fit.
const chartWidth = 600
const chartHeight = 260
const padX = 8
const padY = 12

const yMax = computed(() => {
  const max = chartData.value.reduce((m, d) => Math.max(m, d.value), 0)
  // Round up so the top gridline sits a bit above the highest sample.
  if (max === 0) return 1
  const magnitude = Math.pow(10, Math.floor(Math.log10(max)))
  return Math.ceil((max * 1.1) / magnitude) * magnitude
})

const chartPoints = computed(() => {
  const arr = chartData.value
  if (!arr.length) return []
  const innerW = chartWidth - padX * 2
  const innerH = chartHeight - padY * 2
  const stepX = arr.length > 1 ? innerW / (arr.length - 1) : 0
  const max = yMax.value || 1
  return arr.map((d, i) => ({
    x: padX + i * stepX,
    y: padY + innerH - (d.value / max) * innerH,
  }))
})

const linePath = computed(() => {
  return chartPoints.value
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
    .join(' ')
})

const areaPath = computed(() => {
  const pts = chartPoints.value
  if (pts.length < 2) return ''
  const baseY = chartHeight - padY
  const start = pts[0]
  const end = pts[pts.length - 1]
  return [
    `M ${start.x.toFixed(2)} ${baseY.toFixed(2)}`,
    ...pts.map(p => `L ${p.x.toFixed(2)} ${p.y.toFixed(2)}`),
    `L ${end.x.toFixed(2)} ${baseY.toFixed(2)}`,
    'Z',
  ].join(' ')
})

const yGridLines = computed(() => {
  const max = yMax.value || 1
  // 4 lines including 0 and max — top, 2/3, 1/3, baseline.
  return [0, 1, 2, 3].map(i => ({
    value: max * (1 - i / 3),
    y: padY + ((chartHeight - padY * 2) * i) / 3,
  }))
})

function formatValue(n: number): string {
  if (metric.value === 'storage_bytes') {
    return formatBytesValue(n)
  }
  return Number(n ?? 0).toLocaleString(locale.value === 'ar' ? 'ar-EG' : 'en-US')
}

function formatBytesValue(bytes: number): string {
  if (bytes >= 1073741824) return (bytes / 1073741824).toFixed(2)
  if (bytes >= 1048576) return (bytes / 1048576).toFixed(2)
  if (bytes >= 1024) return (bytes / 1024).toFixed(2)
  return String(bytes)
}

function formatBytesSuffix(bytes: number): string {
  if (bytes >= 1073741824) return 'GB'
  if (bytes >= 1048576) return 'MB'
  if (bytes >= 1024) return 'KB'
  return 'B'
}

function formatAxis(n: number): string {
  if (metric.value === 'storage_bytes') {
    return `${formatBytesValue(n)} ${formatBytesSuffix(n)}`
  }
  if (n >= 1000) return `${Math.round(n / 1000)}k`
  return Math.round(n).toString()
}

function formatAxisDate(d: string): string {
  if (!d) return ''
  try {
    return new Date(d).toLocaleDateString(locale.value === 'ar' ? 'ar-EG' : 'en-US', {
      month: 'short', day: 'numeric',
    })
  } catch { return d }
}

function formatTooltip(s: Sample): string {
  return `${formatAxisDate(s.date)} — ${formatValue(s.value)}`
}

async function load() {
  loading.value = true
  try {
    const res = await api.get<{ data: Array<Record<string, number | string>> }>(`/subscription/usage-history?days=${rangeDays.value}`)
    rawHistory.value = res.data ?? []
  } catch {
    toastStore.error(locale.value === 'ar' ? 'فشل تحميل السجل' : 'Failed to load history')
    rawHistory.value = []
  } finally {
    loading.value = false
  }
}

watch(rangeDays, load)
onMounted(load)
</script>

<style scoped>
@reference "~/assets/css/tokens.css";

.uh-input {
  padding-inline: 0.75rem;
  height: 2rem;
  font-size: 0.8125rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-neutral-200);
  background-color: var(--color-neutral-0, #fff);
  color: var(--color-neutral-900);
  outline: none;
  transition: border-color 150ms var(--ease-standard);
  appearance: none;
}
.uh-input:focus {
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 2px color-mix(in oklab, var(--color-primary-500) 20%, transparent);
}
:global(html.dark) .uh-input {
  background-color: var(--color-neutral-900);
  border-color: var(--color-neutral-800);
  color: var(--color-neutral-0);
}
</style>
