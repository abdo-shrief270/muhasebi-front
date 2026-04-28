<template>
  <FeatureBoundary id="bill-payments">
    <div class="px-4 lg:px-6 py-5 max-w-[1400px] mx-auto">
      <UiPageHeader
        icon="i-lucide-banknote"
        :title="locale === 'ar' ? 'مدفوعات الموردين' : 'Bill Payments'"
        :subtitle="totalLabel"
      />

      <Can :perm="PERMISSIONS.MANAGE_BILLS">
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

        <UiDataTable
          :columns="columns"
          :rows="rows"
          :loading="loading"
          :exportable="true"
          :current-page="currentPage"
          :total-pages="lastPage"
          :total="total"
          :per-page="perPage"
          empty-icon="i-lucide-banknote"
          :empty-title="locale === 'ar' ? 'لا توجد مدفوعات' : 'No payments yet'"
          :empty-description="locale === 'ar' ? 'ستظهر مدفوعات الموردين هنا فور تسجيلها على الفواتير.' : 'Vendor payments appear here once recorded against bills.'"
          @row-click="(row: any) => row.bill_id && navigateTo(`/bills/${row.bill_id}`)"
          @page-change="(p: number) => { page = p; load() }"
          @per-page-change="(pp: number) => { perPage = pp; page = 1; load() }"
        >
          <template #cell-payment_date="{ value }">
            <span class="text-sm text-neutral-700 dark:text-neutral-200 tabular-nums" dir="ltr">{{ formatDate(value) }}</span>
          </template>

          <template #cell-reference="{ row }">
            <span class="font-mono text-xs text-neutral-700 dark:text-neutral-200" dir="ltr">
              <template v-if="row.check_number">#{{ row.check_number }}</template>
              <template v-else-if="row.reference">{{ row.reference }}</template>
              <span v-else class="text-neutral-400">—</span>
            </span>
          </template>

          <template #cell-vendor="{ row }">
            <NuxtLink
              v-if="row.vendor_id"
              :to="`/vendors/${row.vendor_id}`"
              class="text-sm text-neutral-900 dark:text-neutral-0 hover:text-primary-600 dark:hover:text-primary-400 transition-colors truncate"
              @click.stop
            >
              {{ row.vendor_name }}
            </NuxtLink>
            <span v-else class="text-sm text-neutral-700 dark:text-neutral-200">{{ row.vendor_name }}</span>
          </template>

          <template #cell-bill="{ row }">
            <NuxtLink
              v-if="row.bill_id"
              :to="`/bills/${row.bill_id}`"
              class="font-mono text-xs text-info-700 dark:text-info-400 hover:underline"
              @click.stop
            >
              {{ row.bill_number }}
            </NuxtLink>
            <span v-else class="font-mono text-xs text-neutral-400">—</span>
          </template>

          <template #cell-method="{ row }">
            <span class="text-xs text-neutral-600 dark:text-neutral-400">{{ methodLabel(row.method) }}</span>
          </template>

          <template #cell-amount="{ row }">
            <span class="font-mono text-sm font-semibold text-warning-700 dark:text-warning-500 tabular-nums" dir="ltr">
              −{{ formatMoney(row.amount) }}
            </span>
          </template>
        </UiDataTable>
      </Can>
    </div>
  </FeatureBoundary>
</template>

<script setup lang="ts">
import Can from '~/core/rbac/Can.vue'
import { PERMISSIONS } from '~/core/rbac/permissions'

definePageMeta({ layout: 'dashboard' })

const { locale } = useI18n()
const api = useApi()
const toastStore = useToastStore()

const rows = ref<any[]>([])
const loading = ref(true)
const page = ref(1)
const perPage = ref(25)
const total = ref(0)
const lastPage = ref(1)
const currentPage = ref(1)

const totalLabel = computed(() => {
  const n = total.value.toLocaleString()
  if (locale.value === 'ar') return `${n} دفعة`
  return `${n} ${total.value === 1 ? 'payment' : 'payments'}`
})

const columns = computed(() => [
  { key: 'payment_date', label: locale.value === 'ar' ? 'التاريخ' : 'Date' },
  { key: 'reference',    label: locale.value === 'ar' ? 'المرجع' : 'Reference' },
  { key: 'vendor',       label: locale.value === 'ar' ? 'المورد' : 'Vendor' },
  { key: 'bill',         label: locale.value === 'ar' ? 'الفاتورة' : 'Bill' },
  { key: 'method',       label: locale.value === 'ar' ? 'طريقة الدفع' : 'Method' },
  { key: 'amount',       label: locale.value === 'ar' ? 'المبلغ' : 'Amount', class: 'text-end' },
])

const METHOD_AR: Record<string, string> = {
  cash: 'نقد', bank_transfer: 'تحويل بنكي', check: 'شيك',
  mobile_wallet: 'محفظة إلكترونية', other: 'أخرى',
}
const METHOD_EN: Record<string, string> = {
  cash: 'Cash', bank_transfer: 'Bank transfer', check: 'Check',
  mobile_wallet: 'Mobile wallet', other: 'Other',
}
function methodLabel(m: string | null | undefined) {
  if (!m) return '—'
  const map = locale.value === 'ar' ? METHOD_AR : METHOD_EN
  return map[m] ?? m
}

async function load() {
  loading.value = true
  try {
    // BillPaymentController returns the raw paginator inside `data` (legacy
    // `$this->success($paginator)` shape, not API-Resource-wrapped). Probe
    // both shapes so the page works either way.
    const r: any = await api.get(`/bill-payments?page=${page.value}&per_page=${perPage.value}`)
    const payload: any = r.data ?? r
    const list: any[] = Array.isArray(payload) ? payload : (payload.data ?? [])

    rows.value = list.map((p: any) => ({
      ...p,
      vendor_id: p.vendor?.id ?? p.bill?.vendor?.id ?? p.vendor_id ?? null,
      vendor_name: locale.value === 'ar'
        ? (p.vendor?.name_ar || p.bill?.vendor?.name_ar || p.vendor?.name || p.bill?.vendor?.name || '—')
        : (p.vendor?.name_en || p.bill?.vendor?.name_en || p.vendor?.name || p.bill?.vendor?.name || '—'),
      bill_id: p.bill?.id ?? p.bill_id ?? null,
      bill_number: p.bill?.bill_number ?? p.bill_number ?? '—',
      // payment_method is an enum cast — the JSON shape can be either the
      // raw string value or the enum object. Normalize for the column.
      method: typeof p.payment_method === 'string'
        ? p.payment_method
        : (p.payment_method?.value ?? p.method ?? null),
    }))
    // Resource meta first, bare-paginator keys second, row count fallback.
    total.value = payload.meta?.total ?? payload.total ?? rows.value.length
    currentPage.value = payload.meta?.current_page ?? payload.current_page ?? page.value
    lastPage.value = payload.meta?.last_page ?? payload.last_page ?? 1
  } catch (e: any) {
    rows.value = []
    toastStore.error(e?.message || (locale.value === 'ar' ? 'تعذر تحميل المدفوعات' : 'Failed to load payments'))
  } finally {
    loading.value = false
  }
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
