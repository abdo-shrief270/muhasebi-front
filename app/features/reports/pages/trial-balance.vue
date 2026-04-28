<template>
  <FeatureBoundary id="reports">
    <div class="px-4 lg:px-6 py-5 max-w-[1400px] mx-auto">
      <UiPageHeader
        icon="i-lucide-list-checks"
        :title="locale === 'ar' ? 'ميزان المراجعة' : 'Trial Balance'"
        :subtitle="locale === 'ar' ? 'مجاميع المدين والدائن لكل الحسابات' : 'Debit and credit totals across all accounts'"
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
      <div v-if="rows.length > 0" class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <div class="relative bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
          <span class="absolute top-0 start-3 right-3 h-0.5 rounded-b-full bg-success-500" aria-hidden="true" />
          <p class="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">
            {{ locale === 'ar' ? 'إجمالي المدين' : 'Total Debit' }}
          </p>
          <p class="font-mono text-2xl font-bold tabular-nums text-success-700 dark:text-success-400" dir="ltr">
            {{ formatMoney(totalDebit) }}
          </p>
        </div>

        <div class="relative bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
          <span class="absolute top-0 start-3 right-3 h-0.5 rounded-b-full bg-info-500" aria-hidden="true" />
          <p class="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">
            {{ locale === 'ar' ? 'إجمالي الدائن' : 'Total Credit' }}
          </p>
          <p class="font-mono text-2xl font-bold tabular-nums text-info-700 dark:text-info-400" dir="ltr">
            {{ formatMoney(totalCredit) }}
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
            {{ formatMoney(Math.abs(totalDebit - totalCredit)) }}
          </p>
          <p class="text-xs mt-1" :class="isBalanced ? 'text-success-700 dark:text-success-400' : 'text-danger-700 dark:text-danger-400'">
            {{ isBalanced
              ? (locale === 'ar' ? 'الميزان متوازن' : 'Balanced')
              : (locale === 'ar' ? 'الميزان غير متوازن — راجع القيود' : 'Out of balance — review entries') }}
          </p>
        </div>
      </div>

      <!-- Table -->
      <div class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        <div v-if="loading" class="p-4 space-y-2">
          <div v-for="i in 8" :key="i" class="h-7 rounded-md bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
        </div>

        <table v-else-if="rows.length > 0" class="w-full text-sm">
          <thead class="bg-neutral-50/60 dark:bg-neutral-950/40 text-[11px] uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            <tr>
              <th class="text-start px-4 py-2 font-semibold w-[110px]">{{ locale === 'ar' ? 'الكود' : 'Code' }}</th>
              <th class="text-start px-4 py-2 font-semibold">{{ locale === 'ar' ? 'اسم الحساب' : 'Account Name' }}</th>
              <th class="text-end px-4 py-2 font-semibold w-[160px]">{{ locale === 'ar' ? 'مدين' : 'Debit' }}</th>
              <th class="text-end px-4 py-2 font-semibold w-[160px]">{{ locale === 'ar' ? 'دائن' : 'Credit' }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-neutral-100 dark:divide-neutral-800/60">
            <tr
              v-for="(row, index) in rows"
              :key="index"
              class="hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40 transition-colors cursor-pointer"
              @click="navigateTo(`/reports/ledger?account_id=${row.account_id}`)"
            >
              <td class="px-4 py-2.5 font-mono text-xs text-neutral-500 dark:text-neutral-400" dir="ltr">
                {{ row.code }}
              </td>
              <td class="px-4 py-2.5 text-neutral-900 dark:text-neutral-0">
                {{ locale === 'ar' ? (row.name_ar || row.name_en) : (row.name_en || row.name_ar) }}
              </td>
              <td class="px-4 py-2.5 text-end font-mono tabular-nums" dir="ltr">
                <span v-if="Number(row.debit) > 0" class="text-success-700 dark:text-success-400 font-semibold">
                  {{ formatMoney(row.debit) }}
                </span>
                <span v-else class="text-neutral-300 dark:text-neutral-700">—</span>
              </td>
              <td class="px-4 py-2.5 text-end font-mono tabular-nums" dir="ltr">
                <span v-if="Number(row.credit) > 0" class="text-info-700 dark:text-info-400 font-semibold">
                  {{ formatMoney(row.credit) }}
                </span>
                <span v-else class="text-neutral-300 dark:text-neutral-700">—</span>
              </td>
            </tr>
          </tbody>
          <tfoot class="bg-neutral-50/60 dark:bg-neutral-950/40 border-t-2 border-neutral-200 dark:border-neutral-800">
            <tr>
              <td colspan="2" class="px-4 py-2.5 font-bold text-neutral-900 dark:text-neutral-0">
                {{ $t('common.total') }}
              </td>
              <td
                class="px-4 py-2.5 text-end font-mono font-bold tabular-nums"
                :class="isBalanced ? 'text-success-700 dark:text-success-400' : 'text-danger-700 dark:text-danger-400'"
                dir="ltr"
              >
                {{ formatMoney(totalDebit) }}
              </td>
              <td
                class="px-4 py-2.5 text-end font-mono font-bold tabular-nums"
                :class="isBalanced ? 'text-info-700 dark:text-info-400' : 'text-danger-700 dark:text-danger-400'"
                dir="ltr"
              >
                {{ formatMoney(totalCredit) }}
              </td>
            </tr>
          </tfoot>
        </table>

        <div v-else class="py-12 text-center">
          <div class="w-12 h-12 mx-auto mb-3 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
            <UIcon name="i-lucide-list-checks" class="w-5 h-5 text-neutral-400" />
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
import type { TrialBalanceRow } from '~/shared/types/accounting'

definePageMeta({ layout: 'dashboard' })

const { locale } = useI18n()
const api = useApi()
const toastStore = useToastStore()

// Default range: year-to-date so the user lands on something meaningful.
// Year-end runs adjust it from the date picker actions in the page header.
const now = new Date()
const dateFrom = ref(`${now.getFullYear()}-01-01`)
const dateTo = ref(now.toISOString().split('T')[0])
const rows = ref<TrialBalanceRow[]>([])
const loading = ref(true)

const totalDebit = computed(() => rows.value.reduce((s, r) => s + Number(r.debit ?? 0), 0))
const totalCredit = computed(() => rows.value.reduce((s, r) => s + Number(r.credit ?? 0), 0))
const isBalanced = computed(() => Math.abs(totalDebit.value - totalCredit.value) < 0.01)

async function load() {
  loading.value = true
  try {
    const data = await api.get<{ data: TrialBalanceRow[] }>(
      `/reports/trial-balance?from=${dateFrom.value}&to=${dateTo.value}`,
    )
    rows.value = data.data ?? []
  } catch (e: any) {
    rows.value = []
    toastStore.error(e?.message || (locale.value === 'ar' ? 'تعذر تحميل التقرير' : 'Failed to load report'))
  } finally {
    loading.value = false
  }
}

// Refetch when the date range changes — debounce-free since the picker
// only emits on close/apply, not on every key.
watch([dateFrom, dateTo], () => { load() })

function downloadPdf() {
  const base = useRuntimeConfig().public.apiBase
  window.open(`${base}/reports/trial-balance/pdf?from=${dateFrom.value}&to=${dateTo.value}`, '_blank')
}

function formatMoney(n: number | string | null | undefined) {
  return Number(n ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

onMounted(load)
</script>
