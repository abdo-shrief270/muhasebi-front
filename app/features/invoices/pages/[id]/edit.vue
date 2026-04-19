<template>
  <div>
    <NuxtLayout name="dashboard">
      <FeatureBoundary id="invoices">
      <UiPageHeader :title="locale === 'ar' ? 'تعديل الفاتورة' : 'Edit Invoice'" />

      <div v-if="loading"><UiLoadingSkeleton :lines="8" :height="24" /></div>

      <div v-else-if="invoice" v-motion :initial="{ opacity: 0, y: 15 }" :enter="{ opacity: 1, y: 0 }" class="bg-white rounded-2xl border border-gray-100/80 p-6">
        <form @submit.prevent="onSubmit">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label class="form-label">{{ locale === 'ar' ? 'العميل' : 'Client' }}</label>
              <p class="text-sm text-gray-700 py-2.5">{{ invoice.client?.name || '-' }}</p>
            </div>
            <div>
              <label class="form-label">{{ locale === 'ar' ? 'التاريخ' : 'Date' }} *</label>
              <input v-model="values.date" type="date" class="input-field" :class="{ 'input-error': errors.date }" @input="clearError('date')" />
              <p v-if="errors.date" class="form-error">{{ errors.date }}</p>
            </div>
            <div>
              <label class="form-label">{{ locale === 'ar' ? 'تاريخ الاستحقاق' : 'Due Date' }} *</label>
              <input v-model="values.due_date" type="date" class="input-field" :class="{ 'input-error': errors.due_date }" @input="clearError('due_date')" />
              <p v-if="errors.due_date" class="form-error">{{ errors.due_date }}</p>
            </div>
          </div>

          <div class="border border-gray-100 rounded-xl overflow-hidden mb-1" :class="{ 'border-red-300': errors.lines }">
            <table class="w-full text-sm">
              <thead>
                <tr class="bg-gray-50/80">
                  <th class="px-4 py-3 text-start text-xs font-semibold text-gray-400 uppercase">{{ locale === 'ar' ? 'الوصف' : 'Description' }}</th>
                  <th class="px-4 py-3 text-xs font-semibold text-gray-400 uppercase w-[90px]">{{ locale === 'ar' ? 'الكمية' : 'Qty' }}</th>
                  <th class="px-4 py-3 text-xs font-semibold text-gray-400 uppercase w-[120px]">{{ locale === 'ar' ? 'السعر' : 'Price' }}</th>
                  <th class="px-4 py-3 text-xs font-semibold text-gray-400 uppercase w-[80px]">{{ locale === 'ar' ? 'خصم %' : 'Disc %' }}</th>
                  <th class="px-4 py-3 text-xs font-semibold text-gray-400 uppercase w-[80px]">{{ locale === 'ar' ? 'ضريبة %' : 'VAT %' }}</th>
                  <th class="w-10"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(line, i) in values.lines" :key="i" class="border-t border-gray-50">
                  <td class="px-3 py-2"><input v-model="line.description" type="text" class="input-field-sm" /></td>
                  <td class="px-3 py-2"><input v-model="line.quantity" type="number" step="0.01" min="0.01" class="input-field-sm font-mono" dir="ltr" /></td>
                  <td class="px-3 py-2"><input v-model="line.unit_price" type="number" step="0.01" min="0" class="input-field-sm font-mono" dir="ltr" /></td>
                  <td class="px-3 py-2"><input v-model="line.discount_percent" type="number" step="0.01" min="0" max="100" class="input-field-sm font-mono" dir="ltr" /></td>
                  <td class="px-3 py-2"><input v-model="line.vat_rate" type="number" step="0.01" min="0" class="input-field-sm font-mono" dir="ltr" /></td>
                  <td class="px-2">
                    <button v-if="values.lines.length > 1" @click="values.lines.splice(i, 1)" type="button" class="text-gray-300 hover:text-red-500 transition">&#10005;</button>
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="border-t border-gray-200">
                  <td colspan="6" class="px-4 py-3">
                    <button type="button" @click="values.lines.push({ description: '', quantity: 1, unit_price: 0, discount_percent: 0, vat_rate: 14 })" class="text-sm text-secondary-400 hover:text-secondary-500 font-medium">
                      + {{ locale === 'ar' ? 'إضافة بند' : 'Add line' }}
                    </button>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
          <p v-if="errors.lines" class="form-error mb-4">{{ errors.lines }}</p>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label class="form-label">{{ locale === 'ar' ? 'ملاحظات' : 'Notes' }}</label>
              <textarea v-model="values.notes" rows="3" class="input-field resize-none"></textarea>
            </div>
            <div>
              <label class="form-label">{{ locale === 'ar' ? 'شروط الدفع' : 'Terms' }}</label>
              <textarea v-model="values.terms" rows="3" class="input-field resize-none"></textarea>
            </div>
          </div>

          <div class="flex gap-3">
            <UiAppButton type="submit" variant="primary" :loading="submitting || updateMutation.loading.value">{{ $t('common.save') }}</UiAppButton>
            <UiAppButton variant="outline" @click="navigateTo(`/invoices/${invoice.id}`)">{{ $t('common.cancel') }}</UiAppButton>
          </div>
        </form>
      </div>
      </FeatureBoundary>
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
import { invoiceFormDefaults, invoiceFormSchema, type InvoiceFormInput } from '~/features/invoices/schemas'
import type { ApiError } from '~/core/api/errors'
import type { Invoice } from '~/shared/types/invoice'

definePageMeta({ layout: false })

const { locale } = useI18n()
const route = useRoute()
const { getInvoice } = useInvoices()
const { update: updateMutation } = useInvoiceMutations()
const toastStore = useToastStore()

const invoice = ref<Invoice | null>(null)
const loading = ref(true)

const { values, errors, submitting, setValues, clearError, handleSubmit, applyApiErrors } = useZodForm<InvoiceFormInput>({
  schema: invoiceFormSchema,
  initial: {
    ...invoiceFormDefaults,
    lines: invoiceFormDefaults.lines.map(l => ({ ...l })),
  },
})

onMounted(async () => {
  try {
    const inv = await getInvoice(Number(route.params.id))
    invoice.value = inv
    if (inv.status !== 'draft') {
      toastStore.error(locale.value === 'ar' ? 'يمكن تعديل المسودات فقط' : 'Only drafts can be edited')
      navigateTo(`/invoices/${route.params.id}`)
      return
    }

    const lines = (inv.lines ?? []).map(l => ({
      description: l.description,
      quantity: l.quantity,
      unit_price: l.unit_price,
      discount_percent: l.discount_percent ?? 0,
      vat_rate: l.vat_rate ?? 14,
    }))

    setValues({
      client_id: inv.client_id,
      date: inv.date,
      due_date: inv.due_date ?? '',
      notes: inv.notes ?? '',
      terms: inv.terms ?? '',
      lines: lines.length ? lines : invoiceFormDefaults.lines.map(l => ({ ...l })),
    })
  } catch {
    toastStore.error('Not found')
    navigateTo('/invoices')
  } finally {
    loading.value = false
  }
})

async function onSubmit() {
  const result = await handleSubmit(async (data) => {
    await updateMutation.mutate({ id: Number(route.params.id), form: data as any })
  })

  if (result.ok) {
    toastStore.success(locale.value === 'ar' ? 'تم التحديث' : 'Updated')
    navigateTo(`/invoices/${route.params.id}`)
  } else if ('error' in result && result.error) {
    const err = result.error as ApiError
    applyApiErrors(err)
    toastStore.error(err.message || 'Error')
  }
}
</script>

<style scoped>
@reference "~/assets/css/tokens.css";
.input-field { @apply w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-sm bg-gray-50/50; }
.input-field-sm { @apply w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-sm bg-transparent; }
.input-error { @apply border-red-300 focus:ring-red-500/20 focus:border-red-500; }
.form-label { @apply block text-sm font-medium text-gray-600 mb-1; }
.form-error { @apply mt-1 text-xs text-red-500; }
</style>
