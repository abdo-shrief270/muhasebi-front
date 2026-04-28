<template>
  <FeatureBoundary id="reports">
    <div class="px-4 lg:px-6 py-5 max-w-[1400px] mx-auto">
      <UiPageHeader
        icon="i-lucide-receipt-text"
        :title="locale === 'ar' ? 'دفتر الأستاذ' : 'Account Ledger'"
        :subtitle="accountLabel"
      >
        <template #actions>
          <div class="relative">
            <select
              v-model.number="accountId"
              class="lg-account-input"
              @change="onAccountChange"
            >
              <option :value="null">{{ locale === 'ar' ? 'اختر حساباً...' : 'Select account...' }}</option>
              <option v-for="a in accountOptions" :key="a.id" :value="a.id">{{ a.label }}</option>
            </select>
            <UIcon name="i-lucide-chevron-down" class="absolute end-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
          </div>
          <UiDateRangePicker v-model:from="dateFrom" v-model:to="dateTo" />
          <UiAppButton variant="outline" size="sm" icon="i-lucide-refresh-cw" :loading="loading" @click="load">
            {{ locale === 'ar' ? 'تحديث' : 'Refresh' }}
          </UiAppButton>
        </template>
      </UiPageHeader>

      <!-- Summary cards -->
      <div v-if="entries.length > 0 && !loading" class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div class="relative bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-3">
          <span class="absolute top-0 start-3 right-3 h-0.5 rounded-b-full bg-neutral-300 dark:bg-neutral-700" aria-hidden="true" />
          <p class="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">
            {{ locale === 'ar' ? 'القيود' : 'Entries' }}
          </p>
          <p class="font-mono text-xl font-bold tabular-nums text-neutral-900 dark:text-neutral-0">{{ entries.length }}</p>
        </div>

        <div class="relative bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-3">
          <span class="absolute top-0 start-3 right-3 h-0.5 rounded-b-full bg-success-500" aria-hidden="true" />
          <p class="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">
            {{ locale === 'ar' ? 'إجمالي المدين' : 'Total Debit' }}
          </p>
          <p class="font-mono text-base font-bold tabular-nums text-success-700 dark:text-success-400" dir="ltr">
            {{ formatMoney(totalDebit) }}
          </p>
        </div>

        <div class="relative bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-3">
          <span class="absolute top-0 start-3 right-3 h-0.5 rounded-b-full bg-info-500" aria-hidden="true" />
          <p class="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">
            {{ locale === 'ar' ? 'إجمالي الدائن' : 'Total Credit' }}
          </p>
          <p class="font-mono text-base font-bold tabular-nums text-info-700 dark:text-info-400" dir="ltr">
            {{ formatMoney(totalCredit) }}
          </p>
        </div>

        <div class="relative bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-3">
          <span
            class="absolute top-0 start-3 right-3 h-0.5 rounded-b-full"
            :class="closingBalance >= 0 ? 'bg-primary-500' : 'bg-danger-500'"
            aria-hidden="true"
          />
          <p class="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">
            {{ locale === 'ar' ? 'الرصيد الختامي' : 'Closing Balance' }}
          </p>
          <p
            class="font-mono text-base font-bold tabular-nums"
            :class="closingBalance >= 0 ? 'text-neutral-900 dark:text-neutral-0' : 'text-danger-700 dark:text-danger-400'"
            dir="ltr"
          >
            {{ formatMoney(closingBalance) }}
          </p>
        </div>
      </div>

      <!-- Table / states -->
      <div class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        <div v-if="loading" class="p-4 space-y-2">
          <div v-for="i in 8" :key="i" class="h-7 rounded-md bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
        </div>

        <table v-else-if="entries.length > 0" class="w-full text-sm">
          <thead class="bg-neutral-50/60 dark:bg-neutral-950/40 text-[11px] uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            <tr>
              <th class="text-start px-4 py-2 font-semibold w-[110px]">{{ $t('common.date') }}</th>
              <th class="text-start px-4 py-2 font-semibold w-[140px]">{{ locale === 'ar' ? 'رقم القيد' : 'Entry #' }}</th>
              <th class="text-start px-4 py-2 font-semibold">{{ locale === 'ar' ? 'البيان' : 'Description' }}</th>
              <th class="text-end px-4 py-2 font-semibold w-[140px]">{{ locale === 'ar' ? 'مدين' : 'Debit' }}</th>
              <th class="text-end px-4 py-2 font-semibold w-[140px]">{{ locale === 'ar' ? 'دائن' : 'Credit' }}</th>
              <th class="text-end px-4 py-2 font-semibold w-[140px]">{{ locale === 'ar' ? 'الرصيد' : 'Balance' }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-neutral-100 dark:divide-neutral-800/60">
            <tr
              v-for="(entry, index) in entries"
              :key="index"
              class="hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40 transition-colors"
            >
              <td class="px-4 py-2.5 text-xs text-neutral-500 dark:text-neutral-400">{{ formatDate(entry.date) }}</td>
              <td class="px-4 py-2.5">
                <span class="font-mono text-xs text-primary-700 dark:text-primary-400" dir="ltr">{{ entry.entry_number }}</span>
              </td>
              <td class="px-4 py-2.5 text-neutral-700 dark:text-neutral-200 truncate">{{ entry.description }}</td>
              <td class="px-4 py-2.5 text-end font-mono tabular-nums" dir="ltr">
                <span v-if="Number(entry.debit) > 0" class="text-success-700 dark:text-success-400 font-semibold">
                  {{ formatMoney(entry.debit) }}
                </span>
                <span v-else class="text-neutral-300 dark:text-neutral-700">—</span>
              </td>
              <td class="px-4 py-2.5 text-end font-mono tabular-nums" dir="ltr">
                <span v-if="Number(entry.credit) > 0" class="text-info-700 dark:text-info-400 font-semibold">
                  {{ formatMoney(entry.credit) }}
                </span>
                <span v-else class="text-neutral-300 dark:text-neutral-700">—</span>
              </td>
              <td
                class="px-4 py-2.5 text-end font-mono tabular-nums font-medium"
                :class="Number(entry.balance) >= 0 ? 'text-neutral-900 dark:text-neutral-0' : 'text-danger-700 dark:text-danger-400'"
                dir="ltr"
              >
                {{ formatMoney(entry.balance) }}
              </td>
            </tr>
          </tbody>
        </table>

        <div v-else class="py-12 text-center">
          <div class="w-12 h-12 mx-auto mb-3 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
            <UIcon name="i-lucide-receipt-text" class="w-5 h-5 text-neutral-400" />
          </div>
          <p class="text-sm font-semibold text-neutral-900 dark:text-neutral-0 mb-1">
            {{ accountId
              ? (locale === 'ar' ? 'لا توجد حركات' : 'No transactions')
              : (locale === 'ar' ? 'اختر حساباً' : 'Select an account') }}
          </p>
          <p class="text-xs text-neutral-500 dark:text-neutral-400">
            {{ accountId
              ? (locale === 'ar' ? 'جرّب نطاق تاريخ مختلف.' : 'Try a different date range.')
              : (locale === 'ar' ? 'اختر حساباً من القائمة أعلاه لعرض دفتر الأستاذ.' : 'Pick an account from the dropdown to view its ledger.') }}
          </p>
        </div>
      </div>
    </div>
  </FeatureBoundary>
</template>

<script setup lang="ts">
import type { LedgerEntry } from '~/shared/types/accounting'

definePageMeta({ layout: 'dashboard' })

const { locale } = useI18n()
const route = useRoute()
const router = useRouter()
const api = useApi()
const toastStore = useToastStore()

// `account_id` arrives via query string from places like the trial balance
// (drill-down on a row). We mirror the active selection back to the URL so
// share links and refreshes work.
const accountId = ref<number | null>(route.query.account_id ? Number(route.query.account_id) : null)
const accountName = ref('')
const now = new Date()
const dateFrom = ref(`${now.getFullYear()}-01-01`)
const dateTo = ref(now.toISOString().split('T')[0])
const entries = ref<LedgerEntry[]>([])
const loading = ref(false)

const accountParams = computed(() => ({ per_page: 500, is_group: false } as any))
const { data: accountsData } = useAccountsList(accountParams as any)
const accountOptions = computed(() => {
  return (accountsData.value?.data ?? []).map(a => ({
    id: a.id,
    label: `${a.code} — ${locale.value === 'ar' ? (a.name_ar || a.name_en) : (a.name_en || a.name_ar)}`,
  }))
})

const accountLabel = computed(() => {
  if (accountName.value) return accountName.value
  if (!accountId.value) return locale.value === 'ar' ? 'اختر حساباً لعرض دفتر الأستاذ' : 'Pick an account to view its ledger'
  const opt = accountOptions.value.find(o => o.id === accountId.value)
  return opt?.label ?? ''
})

const totalDebit = computed(() => entries.value.reduce((s, e) => s + Number(e.debit ?? 0), 0))
const totalCredit = computed(() => entries.value.reduce((s, e) => s + Number(e.credit ?? 0), 0))
const closingBalance = computed(() => Number(entries.value[entries.value.length - 1]?.balance ?? 0))

async function load() {
  if (!accountId.value) {
    entries.value = []
    return
  }
  loading.value = true
  try {
    const data = await api.get<{ data: { entries?: LedgerEntry[]; account_name_ar?: string; account_name_en?: string } | LedgerEntry[] }>(
      `/reports/accounts/${accountId.value}/ledger?from=${dateFrom.value}&to=${dateTo.value}`,
    )
    // Backend may return either { entries: [], account_name_* } or a bare array.
    // Probe for both shapes so the page works against either.
    const payload: any = (data as any).data ?? data
    entries.value = Array.isArray(payload) ? payload : (payload.entries ?? [])
    accountName.value = locale.value === 'ar'
      ? (payload.account_name_ar || '')
      : (payload.account_name_en || '')
  } catch (e: any) {
    entries.value = []
    toastStore.error(e?.message || (locale.value === 'ar' ? 'تعذر تحميل دفتر الأستاذ' : 'Failed to load ledger'))
  } finally {
    loading.value = false
  }
}

function onAccountChange() {
  // Sync to URL so refresh keeps the selection.
  router.replace({ query: { ...route.query, account_id: accountId.value || undefined } })
  load()
}

watch([dateFrom, dateTo], () => { if (accountId.value) load() })

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

.lg-account-input {
  height: 2rem;
  min-width: 240px;
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
.lg-account-input:focus {
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 2px color-mix(in oklab, var(--color-primary-500) 20%, transparent);
}
:global(html.dark) .lg-account-input {
  background-color: var(--color-neutral-900);
  border-color: var(--color-neutral-800);
  color: var(--color-neutral-0);
}
</style>
