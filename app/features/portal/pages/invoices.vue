<template>
  <div>
    <NuxtLayout name="portal">
      <UiPageHeader :title="locale === 'ar' ? 'فواتيري' : 'My Invoices'" />

      <UiDataTable
        :columns="columns"
        :rows="invoices"
        :loading="loading"
        :current-page="meta.current_page"
        :total-pages="meta.last_page"
        :empty-title="locale === 'ar' ? 'لا توجد فواتير' : 'No invoices'"
        @row-click="(row) => selectedInvoice = row"
        @page-change="(p) => { page = p; load() }"
      >
        <template #cell-invoice_number="{ value }">
          <span class="font-mono text-xs text-primary-500 font-semibold">{{ value }}</span>
        </template>
        <template #cell-total="{ value }">
          <span class="font-mono font-medium" dir="ltr">{{ Number(value).toLocaleString() }}</span>
        </template>
        <template #cell-balance_due="{ value }">
          <span class="font-mono" dir="ltr" :class="value > 0 ? 'text-amber-500 font-medium' : 'text-gray-300'">
            {{ value > 0 ? Number(value).toLocaleString() : '-' }}
          </span>
        </template>
        <template #cell-status="{ row }">
          <UiBadge :color="({ draft: 'gray', sent: 'blue', paid: 'green', partially_paid: 'orange', overdue: 'red' } as any)[row.status] || 'gray'" dot>
            {{ row.status }}
          </UiBadge>
        </template>
      </UiDataTable>

      <!-- Invoice detail SlideOver -->
      <UiSlideOver v-model="detailOpen" :title="`${locale === 'ar' ? 'فاتورة' : 'Invoice'} ${selectedInvoice?.invoice_number || ''}`">
        <div v-if="selectedInvoice" class="space-y-4">
          <div class="grid grid-cols-2 gap-3 text-sm">
            <div><span class="text-gray-400">{{ locale === 'ar' ? 'التاريخ' : 'Date' }}:</span> {{ selectedInvoice.date }}</div>
            <div><span class="text-gray-400">{{ locale === 'ar' ? 'الاستحقاق' : 'Due' }}:</span> {{ selectedInvoice.due_date || '-' }}</div>
            <div><span class="text-gray-400">{{ $t('common.total') }}:</span> <span class="font-mono font-bold" dir="ltr">{{ Number(selectedInvoice.total).toLocaleString() }}</span></div>
            <div><span class="text-gray-400">{{ locale === 'ar' ? 'المستحق' : 'Due' }}:</span> <span class="font-mono font-bold text-amber-500" dir="ltr">{{ Number(selectedInvoice.balance_due).toLocaleString() }}</span></div>
          </div>

          <!-- Lines -->
          <div v-if="selectedInvoice.lines?.length" class="border border-gray-100 rounded-xl overflow-hidden">
            <table class="w-full text-xs">
              <thead><tr class="bg-gray-50"><th class="px-3 py-2 text-start text-gray-400">{{ locale === 'ar' ? 'البند' : 'Item' }}</th><th class="px-3 py-2 text-gray-400">{{ locale === 'ar' ? 'الإجمالي' : 'Total' }}</th></tr></thead>
              <tbody>
                <tr v-for="line in selectedInvoice.lines" :key="line.id" class="border-t border-gray-50">
                  <td class="px-3 py-2 text-gray-700">{{ line.description }}</td>
                  <td class="px-3 py-2 font-mono" dir="ltr">{{ Number(line.total).toLocaleString() }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Payments history -->
          <div v-if="selectedInvoice.payments?.length" class="mt-3">
            <p class="text-xs text-gray-400 mb-2">{{ locale === 'ar' ? 'المدفوعات' : 'Payments' }}</p>
            <div v-for="pmt in selectedInvoice.payments" :key="pmt.id" class="flex justify-between text-xs py-1 border-b border-gray-50">
              <span class="text-gray-500">{{ pmt.date }} — {{ pmt.method }}</span>
              <span class="font-mono text-emerald-600" dir="ltr">{{ Number(pmt.amount).toLocaleString() }}</span>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex gap-2 mt-3">
            <UiAppButton variant="outline" class="flex-1" @click="handleDownloadPdf">
              {{ locale === 'ar' ? 'تحميل PDF' : 'Download PDF' }}
            </UiAppButton>
            <UiAppButton v-if="selectedInvoice.balance_due > 0" variant="primary" class="flex-1" @click="handlePay">
              {{ locale === 'ar' ? 'ادفع الآن' : 'Pay Now' }}
            </UiAppButton>
          </div>
        </div>
      </UiSlideOver>
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })
const { locale } = useI18n()
const api = useApi()
const toastStore = useToastStore()

const invoices = ref<any[]>([])
const loading = ref(true)
const meta = ref({ current_page: 1, last_page: 1 })
const page = ref(1)
const selectedInvoice = ref<any>(null)
const detailOpen = computed({ get: () => !!selectedInvoice.value, set: (v) => { if (!v) selectedInvoice.value = null } })

const columns = computed(() => [
  { key: 'invoice_number', label: locale.value === 'ar' ? 'رقم الفاتورة' : 'Invoice #' },
  { key: 'date', label: locale.value === 'ar' ? 'التاريخ' : 'Date' },
  { key: 'total', label: locale.value === 'ar' ? 'الإجمالي' : 'Total' },
  { key: 'balance_due', label: locale.value === 'ar' ? 'المستحق' : 'Due' },
  { key: 'status', label: locale.value === 'ar' ? 'الحالة' : 'Status' },
])

async function load() {
  loading.value = true
  try {
    const data = await api.get<any>(`/portal/invoices?page=${page.value}`)
    invoices.value = data.data
    meta.value = data.meta || { current_page: 1, last_page: 1 }
  } catch { invoices.value = [] }
  finally { loading.value = false }
}

function handleDownloadPdf() {
  if (!selectedInvoice.value) return
  const config = useRuntimeConfig()
  const authStore = useAuthStore()
  const token = authStore.token || useCookie('auth_token').value || ''
  const tenantId = useTenantId()
  const url = `${config.public.apiBase}/portal/invoices/${selectedInvoice.value.id}/pdf?token=${encodeURIComponent(token)}&tenant=${tenantId}`
  window.open(url, '_blank')
}

async function handlePay() {
  try {
    const data = await api.post<{ data: any }>(`/portal/invoices/${selectedInvoice.value.id}/pay`)
    if (data.data.payment_url) {
      window.open(data.data.payment_url, '_blank')
    } else {
      toastStore.info(locale.value === 'ar' ? 'بوابة الدفع غير مفعلة' : 'Payment gateway not configured')
    }
  } catch (e: any) { toastStore.error(e.data?.message || 'Error') }
}

onMounted(load)
</script>
