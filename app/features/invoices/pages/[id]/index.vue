<template>
  <div>
    <NuxtLayout name="dashboard">
      <template v-if="loading">
        <UiLoadingSkeleton :lines="8" :height="24" />
      </template>

      <template v-else-if="invoice">
        <!-- Header -->
        <div v-motion :initial="{ opacity: 0, y: -10 }" :enter="{ opacity: 1, y: 0 }" class="flex items-start justify-between mb-8">
          <div class="flex items-center gap-4">
            <button @click="navigateTo('/invoices')" class="text-gray-300 hover:text-gray-500 transition">&#8592;</button>
            <div>
              <div class="flex items-center gap-3">
                <h1 class="text-2xl font-bold text-gray-800 font-mono">{{ invoice.invoice_number }}</h1>
                <UiBadge :color="statusColor(invoice.status)" dot>{{ statusLabel(invoice.status) }}</UiBadge>
                <UiBadge color="gray">{{ typeLabel(invoice.type) }}</UiBadge>
              </div>
              <p class="text-sm text-gray-400 mt-0.5">
                {{ invoice.client?.name }} &middot; {{ invoice.date }}
                <span v-if="invoice.due_date"> &middot; {{ locale === 'ar' ? 'مستحقة' : 'Due' }}: {{ invoice.due_date }}</span>
              </p>
            </div>
          </div>

          <div class="flex gap-2 flex-wrap">
            <!-- Edit draft -->
            <UiAppButton v-if="invoice.status === 'draft'" variant="outline" size="sm" @click="navigateTo(`/invoices/${invoice.id}/edit`)">
              {{ locale === 'ar' ? 'تعديل' : 'Edit' }}
            </UiAppButton>
            <UiAppButton v-if="invoice.status === 'draft'" variant="secondary" size="sm" :loading="actionLoading" @click="handleSend">
              {{ locale === 'ar' ? 'إرسال' : 'Send' }}
            </UiAppButton>
            <UiAppButton v-if="['sent','partially_paid','overdue'].includes(invoice.status)" variant="primary" size="sm" @click="paymentOpen = true">
              {{ locale === 'ar' ? 'تسجيل دفعة' : 'Record Payment' }}
            </UiAppButton>
            <UiAppButton v-if="['sent','partially_paid','paid','overdue'].includes(invoice.status) && !invoice.journal_entry_id" variant="outline" size="sm" :loading="actionLoading" @click="handlePostGL">
              {{ locale === 'ar' ? 'ترحيل للقيود' : 'Post to GL' }}
            </UiAppButton>
            <UiAppButton v-if="invoice.status !== 'cancelled' && invoice.status !== 'draft'" variant="outline" size="sm" :loading="actionLoading" @click="handleCancel">
              {{ locale === 'ar' ? 'إلغاء' : 'Cancel' }}
            </UiAppButton>
            <UiAppButton v-if="invoice.status === 'draft'" variant="danger" size="sm" @click="deleteOpen = true">
              {{ $t('common.delete') }}
            </UiAppButton>
            <!-- PDF Download -->
            <UiAppButton variant="outline" size="sm" @click="handleDownloadPdf">
              {{ locale === 'ar' ? 'تحميل PDF' : 'Download PDF' }}
            </UiAppButton>
            <!-- ETA Prepare -->
            <UiAppButton v-if="['sent','partially_paid','paid','overdue'].includes(invoice.status) && can('manage_eta')" variant="outline" size="sm" :loading="etaLoading" @click="handleEtaPrepare">
              {{ locale === 'ar' ? 'تجهيز ETA' : 'Prepare ETA' }}
            </UiAppButton>
          </div>
        </div>

        <!-- Summary cards -->
        <div v-motion :initial="{ opacity: 0, y: 15 }" :enter="{ opacity: 1, y: 0, transition: { delay: 100 } }" class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div class="bg-white rounded-xl border border-gray-100/80 p-4 text-center">
            <p class="text-xs text-gray-400 mb-1">{{ locale === 'ar' ? 'الإجمالي الفرعي' : 'Subtotal' }}</p>
            <p class="font-mono font-bold text-gray-700" dir="ltr">{{ Number(invoice.subtotal).toLocaleString() }}</p>
          </div>
          <div class="bg-white rounded-xl border border-gray-100/80 p-4 text-center">
            <p class="text-xs text-gray-400 mb-1">{{ locale === 'ar' ? 'الضريبة' : 'VAT' }}</p>
            <p class="font-mono font-bold text-blue-500" dir="ltr">{{ Number(invoice.vat_amount).toLocaleString() }}</p>
          </div>
          <div class="bg-white rounded-xl border border-gray-100/80 p-4 text-center">
            <p class="text-xs text-gray-400 mb-1">{{ $t('common.total') }}</p>
            <p class="font-mono font-bold text-gray-800 text-lg" dir="ltr">{{ Number(invoice.total).toLocaleString() }}</p>
          </div>
          <div class="bg-white rounded-xl border border-gray-100/80 p-4 text-center">
            <p class="text-xs text-gray-400 mb-1">{{ locale === 'ar' ? 'المستحق' : 'Balance Due' }}</p>
            <p class="font-mono font-bold" dir="ltr" :class="invoice.balance_due > 0 ? 'text-amber-500' : 'text-emerald-500'">
              {{ Number(invoice.balance_due).toLocaleString() }}
            </p>
          </div>
        </div>

        <!-- Line items -->
        <div v-motion :initial="{ opacity: 0, y: 15 }" :enter="{ opacity: 1, y: 0, transition: { delay: 200 } }" class="bg-white rounded-2xl border border-gray-100/80 overflow-hidden mb-6">
          <h3 class="px-5 py-3 border-b border-gray-50 font-semibold text-gray-700 text-sm">
            {{ locale === 'ar' ? 'البنود' : 'Line Items' }}
          </h3>
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-gray-50/50">
                <th class="px-5 py-2.5 text-start text-xs font-semibold text-gray-400 uppercase">{{ locale === 'ar' ? 'الوصف' : 'Description' }}</th>
                <th class="px-5 py-2.5 text-start text-xs font-semibold text-gray-400 uppercase w-20">{{ locale === 'ar' ? 'الكمية' : 'Qty' }}</th>
                <th class="px-5 py-2.5 text-start text-xs font-semibold text-gray-400 uppercase w-24">{{ locale === 'ar' ? 'السعر' : 'Price' }}</th>
                <th class="px-5 py-2.5 text-start text-xs font-semibold text-gray-400 uppercase w-20">{{ locale === 'ar' ? 'ضريبة' : 'VAT' }}</th>
                <th class="px-5 py-2.5 text-start text-xs font-semibold text-gray-400 uppercase w-24">{{ locale === 'ar' ? 'الإجمالي' : 'Total' }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="line in invoice.lines" :key="line.id" class="border-t border-gray-50">
                <td class="px-5 py-3 text-gray-700">{{ line.description }}</td>
                <td class="px-5 py-3 font-mono text-gray-500" dir="ltr">{{ line.quantity }}</td>
                <td class="px-5 py-3 font-mono text-gray-500" dir="ltr">{{ Number(line.unit_price).toLocaleString() }}</td>
                <td class="px-5 py-3 font-mono text-gray-400" dir="ltr">{{ line.vat_rate }}%</td>
                <td class="px-5 py-3 font-mono font-medium text-gray-700" dir="ltr">{{ Number(line.total).toLocaleString() }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Payments -->
        <div v-if="invoice.payments && invoice.payments.length > 0" v-motion :initial="{ opacity: 0, y: 15 }" :enter="{ opacity: 1, y: 0, transition: { delay: 300 } }" class="bg-white rounded-2xl border border-gray-100/80 overflow-hidden mb-6">
          <h3 class="px-5 py-3 border-b border-gray-50 font-semibold text-gray-700 text-sm">
            {{ locale === 'ar' ? 'المدفوعات' : 'Payments' }}
          </h3>
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-gray-50/50">
                <th class="px-5 py-2.5 text-start text-xs font-semibold text-gray-400 uppercase">{{ locale === 'ar' ? 'التاريخ' : 'Date' }}</th>
                <th class="px-5 py-2.5 text-start text-xs font-semibold text-gray-400 uppercase">{{ locale === 'ar' ? 'المبلغ' : 'Amount' }}</th>
                <th class="px-5 py-2.5 text-start text-xs font-semibold text-gray-400 uppercase">{{ locale === 'ar' ? 'الطريقة' : 'Method' }}</th>
                <th class="px-5 py-2.5 text-start text-xs font-semibold text-gray-400 uppercase">{{ locale === 'ar' ? 'المرجع' : 'Reference' }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="pmt in invoice.payments" :key="pmt.id" class="border-t border-gray-50">
                <td class="px-5 py-3 text-gray-500">{{ pmt.date }}</td>
                <td class="px-5 py-3 font-mono font-medium text-emerald-600" dir="ltr">{{ Number(pmt.amount).toLocaleString() }}</td>
                <td class="px-5 py-3 text-gray-500">{{ pmt.method }}</td>
                <td class="px-5 py-3 text-gray-400 font-mono text-xs">{{ pmt.reference || '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Notes -->
        <div v-if="invoice.notes || invoice.terms" class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500">
          <div v-if="invoice.notes" class="bg-white rounded-xl border border-gray-100/80 p-4">
            <h4 class="text-xs font-semibold text-gray-400 uppercase mb-2">{{ locale === 'ar' ? 'ملاحظات' : 'Notes' }}</h4>
            <p class="whitespace-pre-line">{{ invoice.notes }}</p>
          </div>
          <div v-if="invoice.terms" class="bg-white rounded-xl border border-gray-100/80 p-4">
            <h4 class="text-xs font-semibold text-gray-400 uppercase mb-2">{{ locale === 'ar' ? 'شروط الدفع' : 'Terms' }}</h4>
            <p class="whitespace-pre-line">{{ invoice.terms }}</p>
          </div>
        </div>

        <!-- Record Payment SlideOver -->
        <UiSlideOver v-model="paymentOpen" :title="locale === 'ar' ? 'تسجيل دفعة' : 'Record Payment'">
          <form @submit.prevent="handlePayment" class="space-y-4">
            <div>
              <label class="form-label">{{ locale === 'ar' ? 'المبلغ' : 'Amount' }} *</label>
              <input v-model="paymentForm.amount" type="number" step="0.01" :max="invoice.balance_due" required class="input-field font-mono" dir="ltr" />
              <p class="text-xs text-gray-400 mt-1">{{ locale === 'ar' ? 'المستحق:' : 'Due:' }} {{ Number(invoice.balance_due).toLocaleString() }}</p>
            </div>
            <div>
              <label class="form-label">{{ locale === 'ar' ? 'التاريخ' : 'Date' }} *</label>
              <input v-model="paymentForm.date" type="date" required class="input-field" />
            </div>
            <div>
              <label class="form-label">{{ locale === 'ar' ? 'طريقة الدفع' : 'Method' }} *</label>
              <select v-model="paymentForm.method" required class="input-field">
                <option value="cash">{{ locale === 'ar' ? 'نقدي' : 'Cash' }}</option>
                <option value="bank_transfer">{{ locale === 'ar' ? 'تحويل بنكي' : 'Bank Transfer' }}</option>
                <option value="check">{{ locale === 'ar' ? 'شيك' : 'Check' }}</option>
                <option value="credit_card">{{ locale === 'ar' ? 'بطاقة ائتمان' : 'Credit Card' }}</option>
              </select>
            </div>
            <div>
              <label class="form-label">{{ locale === 'ar' ? 'المرجع' : 'Reference' }}</label>
              <input v-model="paymentForm.reference" type="text" class="input-field" />
            </div>
            <div class="flex gap-3 pt-4 border-t border-gray-100">
              <UiAppButton type="submit" variant="primary" :loading="paymentLoading">
                {{ locale === 'ar' ? 'تسجيل الدفعة' : 'Record Payment' }}
              </UiAppButton>
              <UiAppButton variant="outline" @click="paymentOpen = false">{{ $t('common.cancel') }}</UiAppButton>
            </div>
          </form>
        </UiSlideOver>

        <!-- Delete confirm -->
        <UiConfirmModal
          v-model="deleteOpen"
          :title="locale === 'ar' ? 'حذف الفاتورة' : 'Delete Invoice'"
          :description="locale === 'ar' ? 'هل أنت متأكد؟' : 'Are you sure?'"
          icon="&#9888;"
          variant="danger"
          :confirm-label="$t('common.delete')"
          @confirm="handleDelete"
        />
      </template>
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
import type { Invoice } from '~/shared/types/invoice'

definePageMeta({ layout: false })

const { locale } = useI18n()
const route = useRoute()
const { getInvoice, sendInvoice, cancelInvoice, postToGL, deleteInvoice, recordPayment } = useInvoices()
const toastStore = useToastStore()

const invoice = ref<Invoice | null>(null)
const loading = ref(true)
const actionLoading = ref(false)
const paymentOpen = ref(false)
const paymentLoading = ref(false)
const deleteOpen = ref(false)

const paymentForm = reactive({
  amount: '',
  date: new Date().toISOString().split('T')[0],
  method: 'bank_transfer',
  reference: '',
  notes: '',
})

async function loadInvoice() {
  loading.value = true
  try {
    invoice.value = await getInvoice(Number(route.params.id))
  } catch {
    toastStore.error('Invoice not found')
    navigateTo('/invoices')
  } finally {
    loading.value = false
  }
}

async function handleSend() {
  actionLoading.value = true
  try {
    invoice.value = await sendInvoice(invoice.value!.id)
    toastStore.success(locale.value === 'ar' ? 'تم إرسال الفاتورة' : 'Invoice sent')
  } catch (e: any) { toastStore.error(e.data?.message || 'Error') }
  finally { actionLoading.value = false }
}

async function handleCancel() {
  actionLoading.value = true
  try {
    invoice.value = await cancelInvoice(invoice.value!.id)
    toastStore.success(locale.value === 'ar' ? 'تم إلغاء الفاتورة' : 'Invoice cancelled')
  } catch (e: any) { toastStore.error(e.data?.message || 'Error') }
  finally { actionLoading.value = false }
}

async function handlePostGL() {
  actionLoading.value = true
  try {
    invoice.value = await postToGL(invoice.value!.id)
    toastStore.success(locale.value === 'ar' ? 'تم الترحيل' : 'Posted to GL')
  } catch (e: any) { toastStore.error(e.data?.message || 'Error') }
  finally { actionLoading.value = false }
}

async function handlePayment() {
  paymentLoading.value = true
  try {
    await recordPayment({
      invoice_id: invoice.value!.id,
      amount: Number(paymentForm.amount),
      date: paymentForm.date,
      method: paymentForm.method,
      reference: paymentForm.reference,
      notes: paymentForm.notes,
    })
    toastStore.success(locale.value === 'ar' ? 'تم تسجيل الدفعة' : 'Payment recorded')
    paymentOpen.value = false
    paymentForm.amount = ''
    paymentForm.reference = ''
    loadInvoice()
  } catch (e: any) { toastStore.error(e.data?.message || 'Error') }
  finally { paymentLoading.value = false }
}

async function handleDelete() {
  try {
    await deleteInvoice(invoice.value!.id)
    toastStore.success(locale.value === 'ar' ? 'تم الحذف' : 'Deleted')
    navigateTo('/invoices')
  } catch (e: any) { toastStore.error(e.data?.message || 'Error') }
  deleteOpen.value = false
}

function statusColor(s: string) {
  return ({ draft: 'gray', sent: 'blue', paid: 'green', partially_paid: 'orange', overdue: 'red', cancelled: 'gray' } as Record<string, string>)[s] || 'gray'
}

function statusLabel(s: string) {
  if (locale.value === 'ar') return ({ draft: 'مسودة', sent: 'مرسلة', paid: 'مدفوعة', partially_paid: 'مدفوعة جزئياً', overdue: 'متأخرة', cancelled: 'ملغاة' } as Record<string, string>)[s] || s
  return s.replace('_', ' ')
}

function typeLabel(t: string) {
  if (locale.value === 'ar') return ({ invoice: 'فاتورة', credit_note: 'إشعار دائن', debit_note: 'إشعار مدين' } as Record<string, string>)[t] || t
  return t.replace('_', ' ')
}

// PDF download
function handleDownloadPdf() {
  const config = useRuntimeConfig()
  const token = authStore.token || useCookie('auth_token').value || ''
  const tenantId = useTenantId()
  const url = `${config.public.apiBase}/invoices/${invoice.value!.id}/pdf?token=${encodeURIComponent(token)}&tenant=${tenantId}`
  window.open(url, '_blank')
}

const authStore = useAuthStore()

// ETA
const etaLoading = ref(false)
const { can } = usePermissions()

async function handleEtaPrepare() {
  etaLoading.value = true
  try {
    const { prepareDocument } = useEta()
    await prepareDocument(invoice.value!.id)
    toastStore.success(locale.value === 'ar' ? 'تم تجهيز المستند الإلكتروني' : 'ETA document prepared')
  } catch (e: any) { toastStore.error(e.data?.message || 'Error') }
  finally { etaLoading.value = false }
}

onMounted(loadInvoice)
</script>

<style scoped>
.input-field { @apply w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-sm bg-gray-50/50; }
.form-label { @apply block text-sm font-medium text-gray-600 mb-1; }
</style>
