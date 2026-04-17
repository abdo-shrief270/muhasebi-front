<template>
  <div>
    <NuxtLayout name="dashboard">
      <UiPageHeader :title="locale === 'ar' ? 'تعديل الفاتورة' : 'Edit Invoice'" />

      <div v-if="loading"><UiLoadingSkeleton :lines="8" :height="24" /></div>

      <div v-else-if="invoice" v-motion :initial="{ opacity: 0, y: 15 }" :enter="{ opacity: 1, y: 0 }" class="bg-white rounded-2xl border border-gray-100/80 p-6">
        <form @submit.prevent="handleSubmit">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label class="form-label">{{ locale === 'ar' ? 'العميل' : 'Client' }}</label>
              <p class="text-sm text-gray-700 py-2.5">{{ invoice.client?.name || '-' }}</p>
            </div>
            <div>
              <label class="form-label">{{ locale === 'ar' ? 'التاريخ' : 'Date' }} *</label>
              <input v-model="form.date" type="date" required class="input-field" />
            </div>
            <div>
              <label class="form-label">{{ locale === 'ar' ? 'تاريخ الاستحقاق' : 'Due Date' }}</label>
              <input v-model="form.due_date" type="date" class="input-field" />
            </div>
          </div>

          <!-- Line items -->
          <div class="border border-gray-100 rounded-xl overflow-hidden mb-4">
            <table class="w-full text-sm">
              <thead>
                <tr class="bg-gray-50/80">
                  <th class="px-4 py-3 text-start text-xs font-semibold text-gray-400 uppercase">{{ locale === 'ar' ? 'الوصف' : 'Description' }}</th>
                  <th class="px-4 py-3 text-xs font-semibold text-gray-400 uppercase w-[90px]">{{ locale === 'ar' ? 'الكمية' : 'Qty' }}</th>
                  <th class="px-4 py-3 text-xs font-semibold text-gray-400 uppercase w-[120px]">{{ locale === 'ar' ? 'السعر' : 'Price' }}</th>
                  <th class="px-4 py-3 text-xs font-semibold text-gray-400 uppercase w-[80px]">{{ locale === 'ar' ? 'ضريبة %' : 'VAT %' }}</th>
                  <th class="w-10"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(line, i) in form.lines" :key="i" class="border-t border-gray-50">
                  <td class="px-3 py-2"><input v-model="line.description" type="text" required class="input-field-sm" /></td>
                  <td class="px-3 py-2"><input v-model="line.quantity" type="number" step="0.01" min="0.01" required class="input-field-sm font-mono" dir="ltr" /></td>
                  <td class="px-3 py-2"><input v-model="line.unit_price" type="number" step="0.01" min="0" required class="input-field-sm font-mono" dir="ltr" /></td>
                  <td class="px-3 py-2"><input v-model="line.vat_rate" type="number" step="0.01" min="0" class="input-field-sm font-mono" dir="ltr" /></td>
                  <td class="px-2">
                    <button v-if="form.lines.length > 1" @click="form.lines.splice(i, 1)" type="button" class="text-gray-300 hover:text-red-500 transition">✕</button>
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="border-t border-gray-200">
                  <td colspan="5" class="px-4 py-3">
                    <button type="button" @click="form.lines.push({ description: '', quantity: 1, unit_price: 0, discount_percent: 0, vat_rate: 14 })" class="text-sm text-secondary-400 hover:text-secondary-500 font-medium">
                      + {{ locale === 'ar' ? 'إضافة بند' : 'Add line' }}
                    </button>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label class="form-label">{{ locale === 'ar' ? 'ملاحظات' : 'Notes' }}</label>
              <textarea v-model="form.notes" rows="3" class="input-field resize-none"></textarea>
            </div>
            <div>
              <label class="form-label">{{ locale === 'ar' ? 'شروط الدفع' : 'Terms' }}</label>
              <textarea v-model="form.terms" rows="3" class="input-field resize-none"></textarea>
            </div>
          </div>

          <div class="flex gap-3">
            <UiAppButton type="submit" variant="primary" :loading="submitting">{{ $t('common.save') }}</UiAppButton>
            <UiAppButton variant="outline" @click="navigateTo(`/invoices/${invoice.id}`)">{{ $t('common.cancel') }}</UiAppButton>
          </div>
        </form>
      </div>
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })
const { locale } = useI18n()
const route = useRoute()
const { getInvoice, updateInvoice } = useInvoices()
const toastStore = useToastStore()

const invoice = ref<any>(null)
const loading = ref(true)
const submitting = ref(false)

const form = reactive({
  date: '',
  due_date: '',
  notes: '',
  terms: '',
  lines: [] as any[],
})

onMounted(async () => {
  try {
    invoice.value = await getInvoice(Number(route.params.id))
    if (invoice.value.status !== 'draft') {
      toastStore.error(locale.value === 'ar' ? 'يمكن تعديل المسودات فقط' : 'Only drafts can be edited')
      navigateTo(`/invoices/${route.params.id}`)
      return
    }
    form.date = invoice.value.date
    form.due_date = invoice.value.due_date || ''
    form.notes = invoice.value.notes || ''
    form.terms = invoice.value.terms || ''
    form.lines = (invoice.value.lines || []).map((l: any) => ({
      description: l.description,
      quantity: l.quantity,
      unit_price: l.unit_price,
      discount_percent: l.discount_percent || 0,
      vat_rate: l.vat_rate || 14,
    }))
    if (form.lines.length === 0) {
      form.lines.push({ description: '', quantity: 1, unit_price: 0, discount_percent: 0, vat_rate: 14 })
    }
  } catch {
    toastStore.error('Not found')
    navigateTo('/invoices')
  } finally {
    loading.value = false
  }
})

async function handleSubmit() {
  submitting.value = true
  try {
    await updateInvoice(Number(route.params.id), {
      date: form.date,
      due_date: form.due_date || undefined,
      notes: form.notes || undefined,
      terms: form.terms || undefined,
      lines: form.lines.filter(l => l.description),
    })
    toastStore.success(locale.value === 'ar' ? 'تم التحديث' : 'Updated')
    navigateTo(`/invoices/${route.params.id}`)
  } catch (e: any) { toastStore.error(e.data?.message || 'Error') }
  finally { submitting.value = false }
}
</script>

<style scoped>
.input-field { @apply w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-sm bg-gray-50/50; }
.input-field-sm { @apply w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-sm bg-transparent; }
.form-label { @apply block text-sm font-medium text-gray-600 mb-1; }
</style>
