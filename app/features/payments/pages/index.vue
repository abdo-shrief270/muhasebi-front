<template>
  <FeatureBoundary id="payments">
    <div class="px-4 lg:px-6 py-5 max-w-[1400px] mx-auto">
      <UiPageHeader
        icon="i-lucide-wallet"
        :title="locale === 'ar' ? 'المدفوعات المستلَمة' : 'Payments Received'"
        :subtitle="totalLabel"
      />

      <Can :perm="PERMISSIONS.MANAGE_PAYMENTS">
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
          empty-icon="i-lucide-wallet"
          :empty-title="locale === 'ar' ? 'لا توجد مدفوعات' : 'No payments yet'"
          :empty-description="locale === 'ar' ? 'ستظهر مدفوعات العملاء هنا فور تسجيلها على الفواتير.' : 'Client payments appear here once recorded against invoices.'"
          @row-click="(row: any) => row.invoice_id && navigateTo(`/invoices/${row.invoice_id}`)"
          @page-change="(p: number) => { page = p; load() }"
          @per-page-change="(pp: number) => { perPage = pp; page = 1; load() }"
        >
          <template #cell-payment_date="{ value }">
            <span class="text-sm text-neutral-700 dark:text-neutral-200 tabular-nums" dir="ltr">{{ formatDate(value) }}</span>
          </template>

          <template #cell-payment_number="{ value }">
            <span class="font-mono text-xs font-semibold text-primary-700 dark:text-primary-400">{{ value || '—' }}</span>
          </template>

          <template #cell-client="{ row }">
            <NuxtLink
              v-if="row.client_id"
              :to="`/clients/${row.client_id}`"
              class="text-sm text-neutral-900 dark:text-neutral-0 hover:text-primary-600 dark:hover:text-primary-400 transition-colors truncate"
              @click.stop
            >
              {{ row.client_name }}
            </NuxtLink>
            <span v-else class="text-sm text-neutral-700 dark:text-neutral-200">{{ row.client_name }}</span>
          </template>

          <template #cell-invoice="{ row }">
            <NuxtLink
              v-if="row.invoice_id"
              :to="`/invoices/${row.invoice_id}`"
              class="font-mono text-xs text-info-700 dark:text-info-400 hover:underline"
              @click.stop
            >
              {{ row.invoice_number }}
            </NuxtLink>
            <span v-else class="font-mono text-xs text-neutral-400">—</span>
          </template>

          <template #cell-method="{ value }">
            <span class="text-xs text-neutral-600 dark:text-neutral-400">{{ methodLabel(value) }}</span>
          </template>

          <template #cell-amount="{ row }">
            <span class="font-mono text-sm font-semibold text-success-700 dark:text-success-400 tabular-nums" dir="ltr">
              {{ formatMoney(row.amount) }}
              <span class="text-[11px] font-normal text-neutral-500 dark:text-neutral-400 ms-1">{{ row.currency || 'EGP' }}</span>
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
  { key: 'payment_date',   label: locale.value === 'ar' ? 'التاريخ' : 'Date' },
  { key: 'payment_number', label: locale.value === 'ar' ? 'رقم الإيصال' : 'Receipt #' },
  { key: 'client',         label: locale.value === 'ar' ? 'العميل' : 'Client' },
  { key: 'invoice',        label: locale.value === 'ar' ? 'الفاتورة' : 'Invoice' },
  { key: 'method',         label: locale.value === 'ar' ? 'طريقة الدفع' : 'Method' },
  { key: 'amount',         label: locale.value === 'ar' ? 'المبلغ' : 'Amount', class: 'text-end' },
])

const METHOD_AR: Record<string, string> = {
  cash: 'نقد', bank_transfer: 'تحويل بنكي', check: 'شيك', cheque: 'شيك',
  card: 'بطاقة', mobile_wallet: 'محفظة إلكترونية', other: 'أخرى',
}
const METHOD_EN: Record<string, string> = {
  cash: 'Cash', bank_transfer: 'Bank transfer', check: 'Check', cheque: 'Check',
  card: 'Card', mobile_wallet: 'Mobile wallet', other: 'Other',
}
function methodLabel(m: string | null | undefined) {
  if (!m) return '—'
  const map = locale.value === 'ar' ? METHOD_AR : METHOD_EN
  return map[m] ?? m
}

async function load() {
  loading.value = true
  try {
    // Endpoint not wrapped in a typed composable yet; use the raw client.
    // Probe both `data.meta` (Resource shape) and bare `meta` (paginator
    // shape) so the page works against either response style.
    const r: any = await api.get(`/payments?page=${page.value}&per_page=${perPage.value}`)
    const list: any[] = r.data ?? []
    rows.value = list.map((p: any) => ({
      ...p,
      client_id: p.client?.id ?? p.invoice?.client?.id ?? null,
      client_name: p.client?.name ?? p.invoice?.client?.name ?? '—',
      invoice_id: p.invoice?.id ?? p.invoice_id ?? null,
      invoice_number: p.invoice?.invoice_number ?? '—',
    }))
    total.value = r.meta?.total ?? rows.value.length
    currentPage.value = r.meta?.current_page ?? page.value
    lastPage.value = r.meta?.last_page ?? 1
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
