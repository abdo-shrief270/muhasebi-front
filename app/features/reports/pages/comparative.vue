<template>
  <FeatureBoundary id="reports">
    <div class="px-4 lg:px-6 py-5 max-w-[1400px] mx-auto">
      <UiPageHeader
        icon="i-lucide-arrow-left-right"
        :title="locale === 'ar' ? 'تقارير مقارنة' : 'Comparative Reports'"
        :subtitle="locale === 'ar' ? 'مقارنة بين فترتين ماليتين' : 'Side-by-side comparison of two financial periods'"
      >
        <template #actions>
          <div class="relative">
            <select v-model="reportType" class="cmp-input">
              <option value="income-statement">{{ locale === 'ar' ? 'قائمة الدخل' : 'Income Statement' }}</option>
              <option value="balance-sheet">{{ locale === 'ar' ? 'الميزانية' : 'Balance Sheet' }}</option>
            </select>
            <UIcon name="i-lucide-chevron-down" class="absolute end-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
          </div>
          <UiAppButton variant="primary" size="sm" icon="i-lucide-arrow-left-right" :loading="loading" @click="load">
            {{ locale === 'ar' ? 'مقارنة' : 'Compare' }}
          </UiAppButton>
        </template>
      </UiPageHeader>

      <!-- Period selectors as paired cards — color-coded so the user can
           map "info-blue Period 1" / "purple Period 2" to the table headers
           below at a glance. -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        <div class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
          <p class="text-[10px] font-semibold uppercase tracking-wider text-info-700 dark:text-info-400 mb-2">
            {{ locale === 'ar' ? 'الفترة 1' : 'Period 1' }}
          </p>
          <UiDateRangePicker v-model:from="period1From" v-model:to="period1To" />
        </div>
        <div class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
          <p class="text-[10px] font-semibold uppercase tracking-wider text-purple-700 dark:text-purple-400 mb-2">
            {{ locale === 'ar' ? 'الفترة 2' : 'Period 2' }}
          </p>
          <UiDateRangePicker v-model:from="period2From" v-model:to="period2To" />
        </div>
      </div>

      <!-- Body -->
      <div class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        <div v-if="loading" class="p-4 space-y-2">
          <div v-for="i in 10" :key="i" class="h-7 rounded-md bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
        </div>

        <table v-else-if="data?.rows?.length" class="w-full text-sm">
          <thead class="bg-neutral-50/60 dark:bg-neutral-950/40 text-[11px] uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            <tr>
              <th class="text-start px-4 py-2 font-semibold">{{ locale === 'ar' ? 'البند' : 'Item' }}</th>
              <th class="text-end px-4 py-2 font-semibold w-[160px]">
                <span class="text-info-700 dark:text-info-400">{{ locale === 'ar' ? 'الفترة 1' : 'Period 1' }}</span>
              </th>
              <th class="text-end px-4 py-2 font-semibold w-[160px]">
                <span class="text-purple-700 dark:text-purple-400">{{ locale === 'ar' ? 'الفترة 2' : 'Period 2' }}</span>
              </th>
              <th class="text-end px-4 py-2 font-semibold w-[180px]">{{ locale === 'ar' ? 'التغير' : 'Change' }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-neutral-100 dark:divide-neutral-800/60">
            <tr
              v-for="row in data.rows"
              :key="row.name"
              class="hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40 transition-colors"
              :class="row.is_total ? 'bg-neutral-50/60 dark:bg-neutral-950/40 font-semibold' : ''"
            >
              <td class="px-4 py-2.5 text-neutral-900 dark:text-neutral-0">{{ row.name }}</td>
              <td class="px-4 py-2.5 text-end font-mono tabular-nums text-neutral-700 dark:text-neutral-200" dir="ltr">
                {{ formatMoney(row.period1) }}
              </td>
              <td class="px-4 py-2.5 text-end font-mono tabular-nums text-neutral-700 dark:text-neutral-200" dir="ltr">
                {{ formatMoney(row.period2) }}
              </td>
              <td
                class="px-4 py-2.5 text-end font-mono tabular-nums"
                :class="changeColorClass(row.change)"
                dir="ltr"
              >
                <span class="inline-flex items-center gap-1 justify-end">
                  <UIcon
                    v-if="Number(row.change) !== 0"
                    :name="Number(row.change) > 0 ? 'i-lucide-trending-up' : 'i-lucide-trending-down'"
                    class="w-3 h-3"
                  />
                  {{ Number(row.change) > 0 ? '+' : '' }}{{ formatMoney(row.change) }}
                </span>
                <span v-if="row.change_percent != null" class="text-[10px] text-neutral-400 ms-1.5">
                  ({{ Number(row.change_percent) > 0 ? '+' : '' }}{{ Number(row.change_percent).toFixed(1) }}%)
                </span>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-else class="py-12 text-center">
          <div class="w-12 h-12 mx-auto mb-3 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
            <UIcon name="i-lucide-arrow-left-right" class="w-5 h-5 text-neutral-400" />
          </div>
          <p class="text-sm font-semibold text-neutral-900 dark:text-neutral-0 mb-1">
            {{ locale === 'ar' ? 'حدد الفترتين ثم اضغط مقارنة' : 'Pick two periods, then click Compare' }}
          </p>
          <p class="text-xs text-neutral-500 dark:text-neutral-400">
            {{ locale === 'ar' ? 'الفترتان تستخدمان لمقارنة كل بند جنباً إلى جنب.' : 'The two periods are compared item by item.' }}
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
const toastStore = useToastStore()

const now = new Date()
const reportType = ref<'income-statement' | 'balance-sheet'>('income-statement')
// Default to H1 this year vs H1 last year — operators rarely compare disjoint
// halves, so this gives a useful YoY starting point.
const period1From = ref(`${now.getFullYear()}-01-01`)
const period1To = ref(`${now.getFullYear()}-06-30`)
const period2From = ref(`${now.getFullYear() - 1}-01-01`)
const period2To = ref(`${now.getFullYear() - 1}-06-30`)
const data = ref<any>(null)
const loading = ref(false)

async function load() {
  loading.value = true
  try {
    const endpoint = reportType.value === 'income-statement'
      ? '/reports/comparative/income-statement'
      : '/reports/comparative/balance-sheet'
    const res = await api.get<{ data: any }>(
      `${endpoint}?from1=${period1From.value}&to1=${period1To.value}&from2=${period2From.value}&to2=${period2To.value}`,
    )
    data.value = res.data
  } catch (e: any) {
    data.value = null
    toastStore.error(e?.message || (locale.value === 'ar' ? 'تعذر تحميل المقارنة' : 'Failed to load comparison'))
  } finally {
    loading.value = false
  }
}

function formatMoney(n: number | string | null | undefined) {
  return Number(n ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

/**
 * Direction-only color: positive = green, negative = red. Deliberately NOT
 * inject "good/bad" semantics — for revenue +% is good, for expenses +% is
 * bad, and the accountant reads the numbers themselves. This just helps
 * the eye see direction.
 */
function changeColorClass(change: number | string | null | undefined) {
  const n = Number(change ?? 0)
  if (n > 0) return 'text-success-700 dark:text-success-400 font-semibold'
  if (n < 0) return 'text-danger-700 dark:text-danger-400 font-semibold'
  return 'text-neutral-400'
}
</script>

<style scoped>
@reference "~/assets/css/tokens.css";

.cmp-input {
  height: 2rem;
  padding-inline: 0.5rem 1.5rem;
  font-size: 0.75rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-neutral-200);
  background-color: var(--color-neutral-0, #fff);
  color: var(--color-neutral-900);
  outline: none;
  appearance: none;
  transition: border-color 150ms var(--ease-standard);
}
.cmp-input:focus {
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 2px color-mix(in oklab, var(--color-primary-500) 20%, transparent);
}
:global(html.dark) .cmp-input {
  background-color: var(--color-neutral-900);
  border-color: var(--color-neutral-800);
  color: var(--color-neutral-0);
}
</style>
