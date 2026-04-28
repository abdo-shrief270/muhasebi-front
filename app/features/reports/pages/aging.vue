<template>
  <FeatureBoundary id="reports">
    <div class="px-4 lg:px-6 py-5 max-w-[1400px] mx-auto">
      <UiPageHeader
        icon="i-lucide-clock-alert"
        :title="locale === 'ar' ? 'تقرير أعمار الديون' : 'Aging Report'"
        :subtitle="activeTab === 'ar'
          ? (locale === 'ar' ? 'الذمم المدينة — مستحق على العملاء' : 'Receivables — owed by clients')
          : (locale === 'ar' ? 'الذمم الدائنة — مستحق للموردين' : 'Payables — owed to vendors')"
      >
        <template #actions>
          <UiAppButton
            variant="outline"
            size="sm"
            icon="i-lucide-refresh-cw"
            :loading="refreshing"
            @click="refreshActive"
          >
            {{ locale === 'ar' ? 'تحديث' : 'Refresh' }}
          </UiAppButton>
        </template>
      </UiPageHeader>

      <!-- Tabs: AR / AP -->
      <div class="border-b border-neutral-200 dark:border-neutral-800 mb-4">
        <nav class="-mb-px flex gap-4" :aria-label="locale === 'ar' ? 'تبويب التقرير' : 'Report tabs'">
          <button
            type="button"
            class="aging-tab"
            :class="activeTab === 'ar' && 'aging-tab--active'"
            @click="activeTab = 'ar'"
          >
            <UIcon name="i-lucide-arrow-down-to-line" class="w-3.5 h-3.5" />
            {{ locale === 'ar' ? 'مدينون (AR)' : 'Receivables (AR)' }}
          </button>
          <button
            type="button"
            class="aging-tab"
            :class="activeTab === 'ap' && 'aging-tab--active'"
            @click="activeTab = 'ap'"
          >
            <UIcon name="i-lucide-arrow-up-from-line" class="w-3.5 h-3.5" />
            {{ locale === 'ar' ? 'دائنون (AP)' : 'Payables (AP)' }}
          </button>
        </nav>
      </div>

      <!-- Bucket summary cards -->
      <div
        v-if="!loading && currentRows.length > 0"
        class="grid grid-cols-2 md:grid-cols-5 gap-2 mb-4"
      >
        <div
          v-for="bucket in BUCKETS"
          :key="bucket.key"
          class="relative bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-3"
        >
          <span
            class="absolute top-0 start-3 right-3 h-0.5 rounded-b-full"
            :class="bucket.tint"
            aria-hidden="true"
          />
          <p class="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">
            {{ locale === 'ar' ? bucket.labelAr : bucket.labelEn }}
          </p>
          <p class="font-mono text-base font-bold tabular-nums text-neutral-900 dark:text-neutral-0" dir="ltr">
            {{ formatMoney(currentTotals[bucket.key]) }}
          </p>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 space-y-2">
        <div v-for="i in 6" :key="i" class="h-7 rounded-md bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
      </div>

      <!-- Empty state -->
      <div
        v-else-if="currentRows.length === 0"
        class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 py-12 text-center"
      >
        <div class="w-12 h-12 mx-auto mb-3 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
          <UIcon name="i-lucide-file-bar-chart" class="w-5 h-5 text-neutral-400" />
        </div>
        <p class="text-sm font-semibold text-neutral-900 dark:text-neutral-0 mb-1">
          {{ locale === 'ar' ? 'لا توجد أرصدة قائمة' : 'No outstanding balances' }}
        </p>
        <p class="text-xs text-neutral-500 dark:text-neutral-400">
          {{ activeTab === 'ar'
            ? (locale === 'ar' ? 'كل الفواتير محصَّلة. لا شيء للتحصيل حالياً.' : 'All invoices are settled. Nothing to chase right now.')
            : (locale === 'ar' ? 'كل فواتير الموردين مدفوعة.' : 'All vendor bills are paid.') }}
        </p>
      </div>

      <!-- Aging table -->
      <div
        v-else
        class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden"
      >
        <table class="w-full text-sm">
          <thead class="bg-neutral-50/60 dark:bg-neutral-950/40 text-[11px] uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            <tr>
              <th class="text-start px-4 py-2 font-semibold">
                {{ activeTab === 'ar'
                  ? (locale === 'ar' ? 'العميل' : 'Client')
                  : (locale === 'ar' ? 'المورد' : 'Vendor') }}
              </th>
              <th
                v-for="bucket in BUCKETS"
                :key="bucket.key"
                class="text-end px-3 py-2 font-semibold"
              >
                {{ locale === 'ar' ? bucket.labelAr : bucket.labelEn }}
              </th>
              <th class="text-end px-4 py-2 font-semibold">{{ locale === 'ar' ? 'الإجمالي' : 'Total' }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-neutral-100 dark:divide-neutral-800/60">
            <tr
              v-for="row in currentRows"
              :key="row.id"
              class="hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40 transition-colors cursor-pointer"
              @click="navigateToRow(row)"
            >
              <td class="px-4 py-2.5">
                <p class="text-sm font-medium text-neutral-900 dark:text-neutral-0 truncate">{{ row.name }}</p>
                <p v-if="row.code" class="text-[11px] font-mono text-neutral-500 dark:text-neutral-400">{{ row.code }}</p>
              </td>
              <td
                v-for="bucket in BUCKETS"
                :key="bucket.key"
                class="px-3 py-2.5 text-end font-mono tabular-nums"
                :class="bucketCellClass(bucket.key, row[bucket.key])"
                dir="ltr"
              >
                {{ formatMoney(row[bucket.key]) }}
              </td>
              <td class="px-4 py-2.5 text-end font-mono font-bold tabular-nums text-neutral-900 dark:text-neutral-0" dir="ltr">
                {{ formatMoney(row.total) }}
              </td>
            </tr>
          </tbody>
          <tfoot class="bg-neutral-50/60 dark:bg-neutral-950/40 font-semibold border-t-2 border-neutral-200 dark:border-neutral-800">
            <tr>
              <td class="px-4 py-2.5 text-sm text-neutral-900 dark:text-neutral-0">
                {{ locale === 'ar' ? 'الإجمالي' : 'Total' }}
              </td>
              <td
                v-for="bucket in BUCKETS"
                :key="bucket.key"
                class="px-3 py-2.5 text-end font-mono tabular-nums text-neutral-900 dark:text-neutral-0"
                :class="bucket.key === 'over_90' ? 'text-danger-700 dark:text-danger-400' : ''"
                dir="ltr"
              >
                {{ formatMoney(currentTotals[bucket.key]) }}
              </td>
              <td class="px-4 py-2.5 text-end font-mono font-bold tabular-nums text-neutral-900 dark:text-neutral-0" dir="ltr">
                {{ formatMoney(currentTotals.total) }}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  </FeatureBoundary>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })

const { locale } = useI18n()
const route = useRoute()
const router = useRouter()
const api = useApi()
const toastStore = useToastStore()

const initialTab = route.query.tab === 'ap' ? 'ap' : 'ar'
const activeTab = ref<'ar' | 'ap'>(initialTab)
watch(activeTab, (t) => {
  router.replace({ query: { ...route.query, tab: t === 'ar' ? undefined : t } })
})

/**
 * Bucket definitions — single source of truth for column order, labels,
 * and tint classes. Keys here are the *normalized* names; each side's raw
 * response uses different keys (AR uses days_1_30/31_60/61_90/over_90,
 * AP uses days_30/60/90/over_90) and gets mapped onto these in the row
 * normalizers below.
 */
const BUCKETS = [
  { key: 'current', labelEn: 'Current',  labelAr: 'جاري',     tint: 'bg-success-500' },
  { key: 'days_30', labelEn: '1–30',     labelAr: '1–30',     tint: 'bg-info-500' },
  { key: 'days_60', labelEn: '31–60',    labelAr: '31–60',    tint: 'bg-warning-500' },
  { key: 'days_90', labelEn: '61–90',    labelAr: '61–90',    tint: 'bg-orange-500' },
  { key: 'over_90', labelEn: '90+',      labelAr: '90+',      tint: 'bg-danger-500' },
] as const

type BucketKey = typeof BUCKETS[number]['key']
type AgingTotals = Record<BucketKey | 'total', number>
interface AgingRow extends AgingTotals {
  id: number
  name: string
  code: string | null
  link: string
}

// --- AR fetch ---
const arRows = ref<AgingRow[]>([])
const arTotals = ref<AgingTotals>({ current: 0, days_30: 0, days_60: 0, days_90: 0, over_90: 0, total: 0 })
const arLoading = ref(false)

async function loadAr() {
  arLoading.value = true
  try {
    // The endpoint isn't wrapped in `{ data }` — it returns `{ clients, totals }`
    // at the top level. Probe both shapes for resilience.
    const res = await api.get<any>('/reports/aging')
    const payload = res?.data ?? res
    arRows.value = (payload.clients ?? []).map((r: any) => ({
      id: Number(r.client_id),
      name: r.client_name ?? '—',
      code: r.code ?? null,
      current: Number(r.current ?? 0),
      days_30: Number(r.days_1_30 ?? 0),
      days_60: Number(r.days_31_60 ?? 0),
      days_90: Number(r.days_61_90 ?? 0),
      over_90: Number(r.days_over_90 ?? 0),
      total: Number(r.total ?? 0),
      link: `/clients/${r.client_id}`,
    } as AgingRow))
    const t = payload.totals ?? {}
    arTotals.value = {
      current: Number(t.current ?? 0),
      days_30: Number(t.days_1_30 ?? 0),
      days_60: Number(t.days_31_60 ?? 0),
      days_90: Number(t.days_61_90 ?? 0),
      over_90: Number(t.days_over_90 ?? 0),
      total: Number(t.total ?? 0),
    }
  } catch (e: any) {
    arRows.value = []
    arTotals.value = { current: 0, days_30: 0, days_60: 0, days_90: 0, over_90: 0, total: 0 }
    toastStore.error(e?.message || (locale.value === 'ar' ? 'تعذر تحميل التقرير' : 'Failed to load report'))
  } finally {
    arLoading.value = false
  }
}

// --- AP fetch ---
const apRows = ref<AgingRow[]>([])
const apTotals = ref<AgingTotals>({ current: 0, days_30: 0, days_60: 0, days_90: 0, over_90: 0, total: 0 })
const apLoading = ref(false)

async function loadAp() {
  apLoading.value = true
  try {
    const res = await api.get<any>('/vendors/reports/aging')
    const payload = res?.data ?? res
    apRows.value = (payload.rows ?? []).map((r: any) => ({
      id: Number(r.vendor_id),
      // Vendor rows are bilingual — pick the locale-appropriate display
      // with a fallback so a row never renders blank.
      name: locale.value === 'ar'
        ? (r.name_ar || r.name_en || '—')
        : (r.name_en || r.name_ar || '—'),
      code: r.code ?? null,
      current: Number(r.current ?? 0),
      days_30: Number(r.days_30 ?? 0),
      days_60: Number(r.days_60 ?? 0),
      days_90: Number(r.days_90 ?? 0),
      over_90: Number(r.over_90 ?? 0),
      total: Number(r.total ?? 0),
      link: `/vendors/${r.vendor_id}`,
    } as AgingRow))
    const t = payload.totals ?? {}
    apTotals.value = {
      current: Number(t.current ?? 0),
      days_30: Number(t.days_30 ?? 0),
      days_60: Number(t.days_60 ?? 0),
      days_90: Number(t.days_90 ?? 0),
      over_90: Number(t.over_90 ?? 0),
      total: Number(t.total ?? 0),
    }
  } catch (e: any) {
    apRows.value = []
    apTotals.value = { current: 0, days_30: 0, days_60: 0, days_90: 0, over_90: 0, total: 0 }
    toastStore.error(e?.message || (locale.value === 'ar' ? 'تعذر تحميل التقرير' : 'Failed to load report'))
  } finally {
    apLoading.value = false
  }
}

// Lazy-load each side on first tab activation; subsequent visits reuse the
// cached arrays. The Refresh button forces a reload of whichever tab is
// currently shown.
const arLoaded = ref(false)
const apLoaded = ref(false)

watch(activeTab, async (t) => {
  if (t === 'ar' && !arLoaded.value) { await loadAr(); arLoaded.value = true }
  if (t === 'ap' && !apLoaded.value) { await loadAp(); apLoaded.value = true }
}, { immediate: true })

const refreshing = ref(false)
async function refreshActive() {
  refreshing.value = true
  try {
    if (activeTab.value === 'ar') await loadAr()
    else await loadAp()
  } finally {
    refreshing.value = false
  }
}

// --- Active tab projections ---
const currentRows = computed<AgingRow[]>(() => activeTab.value === 'ar' ? arRows.value : apRows.value)
const currentTotals = computed<AgingTotals>(() => activeTab.value === 'ar' ? arTotals.value : apTotals.value)
const loading = computed(() => activeTab.value === 'ar' ? arLoading.value : apLoading.value)

// --- Helpers ---
function formatMoney(n: number | string | null | undefined) {
  return Number(n ?? 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })
}

/**
 * Tint over_90 cells red when non-zero — visual cue for the rows the
 * collections / payables team should look at first. Other buckets stay
 * neutral so the table doesn't read like a Christmas tree.
 */
function bucketCellClass(key: BucketKey, value: number) {
  if (key === 'over_90' && Number(value) > 0) return 'text-danger-700 dark:text-danger-400 font-semibold'
  return 'text-neutral-700 dark:text-neutral-200'
}

function navigateToRow(row: AgingRow) {
  if (row.id) navigateTo(row.link)
}
</script>

<style scoped>
@reference "~/assets/css/tokens.css";

.aging-tab {
  @apply inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-0 transition-colors;
}
.aging-tab--active {
  @apply text-primary-700 dark:text-primary-400 border-primary-500;
}
</style>
