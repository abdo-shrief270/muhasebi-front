<template>
  <FeatureBoundary id="bank-reconciliation">
    <div class="px-4 lg:px-6 py-5 max-w-[1400px] mx-auto">
      <UiPageHeader
        icon="i-lucide-git-compare"
        :title="locale === 'ar' ? 'التسويات البنكية' : 'Bank Reconciliation'"
        :subtitle="locale === 'ar' ? 'مطابقة كشوف الحسابات البنكية مع دفتر الأستاذ' : 'Match bank statements against your ledger'"
      >
        <template #actions>
          <UiAppButton variant="primary" size="sm" icon="i-lucide-plus" @click="navigateTo('/bank-reconciliation/new')">
            {{ locale === 'ar' ? 'تسوية جديدة' : 'New Reconciliation' }}
          </UiAppButton>
        </template>
      </UiPageHeader>

      <Can :perm="PERMISSIONS.MANAGE_ACCOUNTS">
        <template #fallback>
          <div class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-12 text-center">
            <div class="w-12 h-12 mx-auto mb-4 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
              <UIcon name="i-lucide-lock" class="w-5 h-5 text-neutral-400" />
            </div>
            <p class="text-sm font-semibold text-neutral-900 dark:text-neutral-0 mb-1">
              {{ locale === 'ar' ? 'لا تملك صلاحية الوصول' : "You don't have access" }}
            </p>
          </div>
        </template>

        <!-- Summary cards -->
        <div v-if="!loading && rows.length > 0" class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div class="relative bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-3">
            <span class="absolute top-0 start-3 right-3 h-0.5 rounded-b-full bg-neutral-300 dark:bg-neutral-700" aria-hidden="true" />
            <p class="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">
              {{ locale === 'ar' ? 'الإجمالي' : 'Total' }}
            </p>
            <p class="font-mono text-2xl font-bold tabular-nums text-neutral-900 dark:text-neutral-0">{{ rows.length }}</p>
          </div>
          <div class="relative bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-3">
            <span class="absolute top-0 start-3 right-3 h-0.5 rounded-b-full bg-info-500" aria-hidden="true" />
            <p class="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">
              {{ locale === 'ar' ? 'مفتوحة' : 'Open' }}
            </p>
            <p class="font-mono text-2xl font-bold tabular-nums text-info-700 dark:text-info-400">{{ openCount }}</p>
          </div>
          <div class="relative bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-3">
            <span class="absolute top-0 start-3 right-3 h-0.5 rounded-b-full bg-success-500" aria-hidden="true" />
            <p class="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">
              {{ locale === 'ar' ? 'مكتملة' : 'Completed' }}
            </p>
            <p class="font-mono text-2xl font-bold tabular-nums text-success-700 dark:text-success-400">{{ completedCount }}</p>
          </div>
          <div class="relative bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-3">
            <span
              class="absolute top-0 start-3 right-3 h-0.5 rounded-b-full"
              :class="totalVariance === 0 ? 'bg-success-500' : 'bg-warning-500'"
              aria-hidden="true"
            />
            <p class="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">
              {{ locale === 'ar' ? 'فروقات مفتوحة' : 'Open Variance' }}
            </p>
            <p
              class="font-mono text-2xl font-bold tabular-nums"
              :class="totalVariance === 0 ? 'text-success-700 dark:text-success-400' : 'text-warning-700 dark:text-warning-500'"
              dir="ltr"
            >
              {{ formatMoney(totalVariance) }}
            </p>
          </div>
        </div>

        <UiDataTable
          :columns="columns"
          :rows="rows"
          :loading="loading"
          empty-icon="i-lucide-git-compare"
          :empty-title="locale === 'ar' ? 'لا توجد تسويات' : 'No reconciliations yet'"
          :empty-description="locale === 'ar'
            ? 'ابدأ تسوية لاستيراد كشف الحساب ومطابقته بالقيود.'
            : 'Start a reconciliation to import a statement and match it against ledger entries.'"
          @row-click="(row: any) => navigateTo(`/bank-reconciliation/${row.id}`)"
        >
          <template #cell-account="{ row }">
            <div class="flex items-center gap-2 min-w-0">
              <UIcon name="i-lucide-landmark" class="w-4 h-4 text-info-500 flex-shrink-0" />
              <span class="text-sm font-medium text-neutral-900 dark:text-neutral-0 truncate">
                {{ accountLabel(row) }}
              </span>
            </div>
          </template>

          <template #cell-statement_date="{ value }">
            <span class="text-sm text-neutral-700 dark:text-neutral-200 tabular-nums" dir="ltr">{{ formatDate(value) }}</span>
          </template>

          <template #cell-statement_balance="{ value }">
            <span class="font-mono text-sm tabular-nums text-neutral-900 dark:text-neutral-0" dir="ltr">{{ formatMoney(value) }}</span>
          </template>

          <template #cell-gl_balance="{ value }">
            <span class="font-mono text-sm tabular-nums text-neutral-900 dark:text-neutral-0" dir="ltr">{{ formatMoney(value) }}</span>
          </template>

          <template #cell-variance="{ value }">
            <span
              class="font-mono text-sm font-semibold tabular-nums"
              :class="Number(value) === 0
                ? 'text-success-700 dark:text-success-400'
                : 'text-warning-700 dark:text-warning-500'"
              dir="ltr"
            >
              {{ formatMoney(value) }}
            </span>
          </template>

          <template #cell-status="{ row }">
            <UiBadge :color="row.status === 'completed' ? 'green' : 'blue'" dot>
              {{ row.status === 'completed'
                ? (locale === 'ar' ? 'مكتملة' : 'Completed')
                : (locale === 'ar' ? 'مفتوحة' : 'Open') }}
            </UiBadge>
          </template>
        </UiDataTable>
      </Can>
    </div>
  </FeatureBoundary>
</template>

<script setup lang="ts">
import Can from '~/core/rbac/Can.vue'
import { PERMISSIONS } from '~/core/rbac/permissions'
import {
  bankReconciliationService,
  type BankReconciliation,
} from '~/features/bank-reconciliation/services/bankReconciliationService'

definePageMeta({ layout: 'dashboard' })

const { locale } = useI18n()
const toastStore = useToastStore()

const rows = ref<BankReconciliation[]>([])
const loading = ref(true)

const openCount = computed(() => rows.value.filter(r => r.status === 'open').length)
const completedCount = computed(() => rows.value.filter(r => r.status === 'completed').length)
// Sum |variance| of open recs only — completed ones are zero by definition.
// Absolute values so a +5 and a −5 don't cancel and read as "all balanced".
const totalVariance = computed(() =>
  rows.value
    .filter(r => r.status === 'open')
    .reduce((s, r) => s + Math.abs(Number(r.variance ?? 0)), 0)
)

// Map account_id → label using the bank-accounts list. Loaded once at
// page open. Falls back to "Account #ID" when the account isn't visible
// (deleted, soft-deleted, or different tenant).
const bankAccountsParams = computed(() => ({ per_page: 200 }))
const { data: bankAccountsData } = useBankAccountsList(bankAccountsParams)
const accountById = computed(() => {
  const map = new Map<number, any>()
  for (const a of (bankAccountsData.value?.data ?? [])) map.set(a.id, a)
  return map
})
function accountLabel(row: BankReconciliation): string {
  const acc = accountById.value.get(row.account_id)
  if (!acc) return locale.value === 'ar' ? `حساب #${row.account_id}` : `Account #${row.account_id}`
  return `${acc.bank_name} · ${acc.account_name}`
}

const columns = computed(() => [
  { key: 'account',           label: locale.value === 'ar' ? 'الحساب البنكي' : 'Bank Account' },
  { key: 'statement_date',    label: locale.value === 'ar' ? 'تاريخ الكشف' : 'Statement Date' },
  { key: 'statement_balance', label: locale.value === 'ar' ? 'رصيد الكشف' : 'Statement Bal.', class: 'text-end' },
  { key: 'gl_balance',        label: locale.value === 'ar' ? 'رصيد الأستاذ' : 'GL Bal.', class: 'text-end' },
  { key: 'variance',          label: locale.value === 'ar' ? 'الفرق' : 'Variance', class: 'text-end' },
  { key: 'status',            label: locale.value === 'ar' ? 'الحالة' : 'Status' },
])

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

async function load() {
  loading.value = true
  try {
    const r = await bankReconciliationService().list({})
    rows.value = r.data ?? []
  } catch (e: any) {
    rows.value = []
    if (e?.status && e.status !== 404) {
      toastStore.error(e?.message || (locale.value === 'ar' ? 'تعذر تحميل التسويات' : 'Failed to load reconciliations'))
    }
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>
