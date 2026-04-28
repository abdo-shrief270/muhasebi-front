<template>
  <FeatureBoundary id="reports">
    <div class="px-4 lg:px-6 py-5 max-w-[1400px] mx-auto">
      <UiPageHeader
        icon="i-lucide-user-square"
        :title="locale === 'ar' ? 'كشف حساب العميل' : 'Client Statement'"
        :subtitle="clientLabel"
      >
        <template #actions>
          <div class="relative">
            <select v-model.number="clientId" class="cs-input cs-input--client" @change="onClientChange">
              <option :value="null">{{ locale === 'ar' ? 'اختر عميلاً...' : 'Select client...' }}</option>
              <option v-for="c in clientOptions" :key="c.id" :value="c.id">{{ c.label }}</option>
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
      <div v-if="statement && !loading" class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <div class="relative bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
          <span class="absolute top-0 start-3 right-3 h-0.5 rounded-b-full bg-primary-500" aria-hidden="true" />
          <p class="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">
            {{ locale === 'ar' ? 'إجمالي الفواتير' : 'Total Invoiced' }}
          </p>
          <p class="font-mono text-2xl font-bold tabular-nums text-neutral-900 dark:text-neutral-0" dir="ltr">
            {{ formatMoney(statement.total_invoiced) }}
          </p>
        </div>

        <div class="relative bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
          <span class="absolute top-0 start-3 right-3 h-0.5 rounded-b-full bg-success-500" aria-hidden="true" />
          <p class="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">
            {{ locale === 'ar' ? 'إجمالي المدفوع' : 'Total Paid' }}
          </p>
          <p class="font-mono text-2xl font-bold tabular-nums text-success-700 dark:text-success-400" dir="ltr">
            {{ formatMoney(statement.total_paid) }}
          </p>
        </div>

        <div class="relative bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
          <span
            class="absolute top-0 start-3 right-3 h-0.5 rounded-b-full"
            :class="Number(statement.balance_due ?? 0) > 0 ? 'bg-warning-500' : 'bg-neutral-300 dark:bg-neutral-700'"
            aria-hidden="true"
          />
          <p class="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">
            {{ locale === 'ar' ? 'الرصيد المستحق' : 'Balance Due' }}
          </p>
          <p
            class="font-mono text-2xl font-bold tabular-nums"
            :class="Number(statement.balance_due ?? 0) > 0 ? 'text-warning-700 dark:text-warning-500' : 'text-neutral-700 dark:text-neutral-200'"
            dir="ltr"
          >
            {{ formatMoney(statement.balance_due) }}
          </p>
        </div>
      </div>

      <!-- Body -->
      <div class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        <div v-if="loading" class="p-4 space-y-2">
          <div v-for="i in 8" :key="i" class="h-7 rounded-md bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
        </div>

        <table v-else-if="statement?.transactions?.length" class="w-full text-sm">
          <thead class="bg-neutral-50/60 dark:bg-neutral-950/40 text-[11px] uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            <tr>
              <th class="text-start px-4 py-2 font-semibold w-[110px]">{{ locale === 'ar' ? 'التاريخ' : 'Date' }}</th>
              <th class="text-start px-4 py-2 font-semibold">{{ locale === 'ar' ? 'الوصف' : 'Description' }}</th>
              <th class="text-end px-4 py-2 font-semibold w-[140px]">{{ locale === 'ar' ? 'مدين' : 'Debit' }}</th>
              <th class="text-end px-4 py-2 font-semibold w-[140px]">{{ locale === 'ar' ? 'دائن' : 'Credit' }}</th>
              <th class="text-end px-4 py-2 font-semibold w-[140px]">{{ locale === 'ar' ? 'الرصيد' : 'Balance' }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-neutral-100 dark:divide-neutral-800/60">
            <tr
              v-for="tx in statement.transactions"
              :key="tx.id"
              class="hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40 transition-colors"
            >
              <td class="px-4 py-2.5 text-xs text-neutral-500 dark:text-neutral-400">{{ formatDate(tx.date) }}</td>
              <td class="px-4 py-2.5 text-neutral-700 dark:text-neutral-200 truncate">{{ tx.description }}</td>
              <td class="px-4 py-2.5 text-end font-mono tabular-nums" dir="ltr">
                <span v-if="Number(tx.debit) > 0" class="text-success-700 dark:text-success-400 font-semibold">
                  {{ formatMoney(tx.debit) }}
                </span>
                <span v-else class="text-neutral-300 dark:text-neutral-700">—</span>
              </td>
              <td class="px-4 py-2.5 text-end font-mono tabular-nums" dir="ltr">
                <span v-if="Number(tx.credit) > 0" class="text-info-700 dark:text-info-400 font-semibold">
                  {{ formatMoney(tx.credit) }}
                </span>
                <span v-else class="text-neutral-300 dark:text-neutral-700">—</span>
              </td>
              <td
                class="px-4 py-2.5 text-end font-mono tabular-nums font-medium"
                :class="Number(tx.balance) >= 0 ? 'text-neutral-900 dark:text-neutral-0' : 'text-danger-700 dark:text-danger-400'"
                dir="ltr"
              >
                {{ formatMoney(tx.balance) }}
              </td>
            </tr>
          </tbody>
        </table>

        <div v-else class="py-12 text-center">
          <div class="w-12 h-12 mx-auto mb-3 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
            <UIcon name="i-lucide-user-square" class="w-5 h-5 text-neutral-400" />
          </div>
          <p class="text-sm font-semibold text-neutral-900 dark:text-neutral-0 mb-1">
            {{ clientId
              ? (locale === 'ar' ? 'لا توجد حركات' : 'No transactions')
              : (locale === 'ar' ? 'اختر عميلاً' : 'Select a client') }}
          </p>
          <p class="text-xs text-neutral-500 dark:text-neutral-400">
            {{ clientId
              ? (locale === 'ar' ? 'لا توجد حركات لهذا العميل في النطاق المحدد.' : 'No transactions for this client in the selected range.')
              : (locale === 'ar' ? 'اختر عميلاً من القائمة أعلاه.' : 'Pick a client from the dropdown above.') }}
          </p>
        </div>
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

const clientId = ref<number | null>(route.query.client_id ? Number(route.query.client_id) : null)
const now = new Date()
const dateFrom = ref(`${now.getFullYear()}-01-01`)
const dateTo = ref(now.toISOString().split('T')[0])
const statement = ref<any>(null)
const loading = ref(false)

// Use the same composable + per_page=200 the catalog page uses so the
// dropdown covers most tenants without paging.
const clientsParams = computed(() => ({ per_page: 200, is_active: true, sort_by: 'name', sort_dir: 'asc' as const }))
const { data: clientsData } = useClientsList(clientsParams)
const clientOptions = computed(() => {
  return (clientsData.value?.data ?? []).map((c: any) => ({
    id: c.id,
    label: c.name as string,
  }))
})

const clientLabel = computed(() => {
  if (!clientId.value) return locale.value === 'ar' ? 'اختر عميلاً لعرض كشف الحساب' : 'Pick a client to view their statement'
  const opt = clientOptions.value.find(o => o.id === clientId.value)
  return opt?.label ?? ''
})

async function load() {
  if (!clientId.value) {
    statement.value = null
    return
  }
  loading.value = true
  try {
    const res = await api.get<{ data: any }>(
      `/reports/clients/${clientId.value}/statement?from=${dateFrom.value}&to=${dateTo.value}`,
    )
    statement.value = res.data
  } catch (e: any) {
    statement.value = null
    toastStore.error(e?.message || (locale.value === 'ar' ? 'تعذر تحميل كشف الحساب' : 'Failed to load statement'))
  } finally {
    loading.value = false
  }
}

function onClientChange() {
  router.replace({ query: { ...route.query, client_id: clientId.value || undefined } })
  load()
}

watch([dateFrom, dateTo], () => { if (clientId.value) load() })

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

.cs-input {
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
.cs-input--client { min-width: 240px; }
.cs-input:focus {
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 2px color-mix(in oklab, var(--color-primary-500) 20%, transparent);
}
:global(html.dark) .cs-input {
  background-color: var(--color-neutral-900);
  border-color: var(--color-neutral-800);
  color: var(--color-neutral-0);
}
</style>
