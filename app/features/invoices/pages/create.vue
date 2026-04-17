<template>
  <div>
    <NuxtLayout name="dashboard">
      <UiPageHeader :title="locale === 'ar' ? 'فاتورة جديدة' : 'New Invoice'" />

      <div
        v-motion
        :initial="{ opacity: 0, y: 15 }"
        :enter="{ opacity: 1, y: 0 }"
        class="bg-white rounded-2xl border border-gray-100/80 p-6"
      >
        <form @submit.prevent="handleSubmit">
          <!-- Header -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label class="form-label">{{ locale === 'ar' ? 'العميل' : 'Client' }} *</label>
              <select v-model="form.client_id" required class="input-field">
                <option :value="null" disabled>{{ locale === 'ar' ? 'اختر عميل' : 'Select client' }}</option>
                <option v-for="c in clients" :key="c.id" :value="c.id">{{ c.name }}</option>
              </select>
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
                  <th class="px-4 py-3 text-start text-xs font-semibold text-gray-400 uppercase w-[90px]">{{ locale === 'ar' ? 'الكمية' : 'Qty' }}</th>
                  <th class="px-4 py-3 text-start text-xs font-semibold text-gray-400 uppercase w-[120px]">{{ locale === 'ar' ? 'السعر' : 'Price' }}</th>
                  <th class="px-4 py-3 text-start text-xs font-semibold text-gray-400 uppercase w-[80px]">{{ locale === 'ar' ? 'خصم %' : 'Disc %' }}</th>
                  <th class="px-4 py-3 text-start text-xs font-semibold text-gray-400 uppercase w-[80px]">{{ locale === 'ar' ? 'ضريبة %' : 'VAT %' }}</th>
                  <th class="px-4 py-3 text-start text-xs font-semibold text-gray-400 uppercase w-[120px]">{{ locale === 'ar' ? 'الإجمالي' : 'Total' }}</th>
                  <th class="w-10"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(line, i) in form.lines" :key="i" class="border-t border-gray-50">
                  <td class="px-3 py-2">
                    <input v-model="line.description" type="text" required class="input-field-sm" :placeholder="locale === 'ar' ? 'وصف البند' : 'Item description'" />
                  </td>
                  <td class="px-3 py-2">
                    <input v-model="line.quantity" type="number" step="0.01" min="0.01" required class="input-field-sm font-mono" dir="ltr" />
                  </td>
                  <td class="px-3 py-2">
                    <input v-model="line.unit_price" type="number" step="0.01" min="0" required class="input-field-sm font-mono" dir="ltr" />
                  </td>
                  <td class="px-3 py-2">
                    <input v-model="line.discount_percent" type="number" step="0.01" min="0" max="100" class="input-field-sm font-mono" dir="ltr" />
                  </td>
                  <td class="px-3 py-2">
                    <input v-model="line.vat_rate" type="number" step="0.01" min="0" class="input-field-sm font-mono" dir="ltr" />
                  </td>
                  <td class="px-3 py-2 font-mono text-sm text-gray-600" dir="ltr">
                    {{ lineTotal(line).toLocaleString() }}
                  </td>
                  <td class="px-2">
                    <button v-if="form.lines.length > 1" @click="removeLine(i)" type="button" class="text-gray-300 hover:text-red-500 transition">&#10005;</button>
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="border-t border-gray-200">
                  <td colspan="7" class="px-4 py-3">
                    <button type="button" @click="addLine" class="text-sm text-secondary-400 hover:text-secondary-500 font-medium">
                      + {{ locale === 'ar' ? 'إضافة بند' : 'Add line' }}
                    </button>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <!-- Totals -->
          <div
            v-motion
            :initial="{ opacity: 0 }"
            :enter="{ opacity: 1, transition: { delay: 200 } }"
            class="flex justify-end mb-6"
          >
            <div class="w-72 space-y-2 text-sm">
              <div class="flex justify-between text-gray-500">
                <span>{{ locale === 'ar' ? 'الإجمالي الفرعي' : 'Subtotal' }}</span>
                <span class="font-mono" dir="ltr">{{ subtotal.toLocaleString() }}</span>
              </div>
              <div class="flex justify-between text-gray-500">
                <span>{{ locale === 'ar' ? 'ضريبة القيمة المضافة' : 'VAT' }}</span>
                <span class="font-mono" dir="ltr">{{ totalVat.toLocaleString() }}</span>
              </div>
              <div class="flex justify-between font-bold text-gray-800 text-base pt-2 border-t border-gray-200">
                <span>{{ $t('common.total') }}</span>
                <span class="font-mono" dir="ltr">{{ grandTotal.toLocaleString() }} {{ locale === 'ar' ? 'ج.م.' : 'EGP' }}</span>
              </div>
            </div>
          </div>

          <!-- Notes -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label class="form-label">{{ locale === 'ar' ? 'ملاحظات' : 'Notes' }}</label>
              <textarea v-model="form.notes" rows="3" class="input-field resize-none"></textarea>
            </div>
            <div>
              <label class="form-label">{{ locale === 'ar' ? 'شروط الدفع' : 'Payment Terms' }}</label>
              <textarea v-model="form.terms" rows="3" class="input-field resize-none"></textarea>
            </div>
          </div>

          <div class="flex gap-3">
            <UiAppButton type="submit" variant="primary" :loading="submitting">
              {{ locale === 'ar' ? 'إنشاء الفاتورة' : 'Create Invoice' }}
            </UiAppButton>
            <UiAppButton variant="outline" @click="navigateTo('/invoices')">{{ $t('common.cancel') }}</UiAppButton>
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
const { createInvoice } = useInvoices()
const { clients, fetchClients } = useClients()
const toastStore = useToastStore()

const submitting = ref(false)

// Prefill client from query param (?client_id=X)
const prefillClientId = route.query.client_id ? Number(route.query.client_id) : null

const form = reactive({
  client_id: prefillClientId as number | null,
  date: new Date().toISOString().split('T')[0],
  due_date: '',
  notes: '',
  terms: '',
  lines: [
    { description: '', quantity: 1, unit_price: 0, discount_percent: 0, vat_rate: 14 },
  ],
})

function addLine() {
  form.lines.push({ description: '', quantity: 1, unit_price: 0, discount_percent: 0, vat_rate: 14 })
}

function removeLine(i: number) {
  form.lines.splice(i, 1)
}

function lineTotal(line: any) {
  const qty = Number(line.quantity) || 0
  const price = Number(line.unit_price) || 0
  const disc = Number(line.discount_percent) || 0
  const vat = Number(line.vat_rate) || 0
  const sub = qty * price * (1 - disc / 100)
  return Math.round((sub + sub * vat / 100) * 100) / 100
}

const subtotal = computed(() => {
  return form.lines.reduce((sum, l) => {
    const qty = Number(l.quantity) || 0
    const price = Number(l.unit_price) || 0
    const disc = Number(l.discount_percent) || 0
    return sum + qty * price * (1 - disc / 100)
  }, 0)
})

const totalVat = computed(() => {
  return form.lines.reduce((sum, l) => {
    const qty = Number(l.quantity) || 0
    const price = Number(l.unit_price) || 0
    const disc = Number(l.discount_percent) || 0
    const vat = Number(l.vat_rate) || 0
    const sub = qty * price * (1 - disc / 100)
    return sum + sub * vat / 100
  }, 0)
})

const grandTotal = computed(() => Math.round((subtotal.value + totalVat.value) * 100) / 100)

async function handleSubmit() {
  submitting.value = true
  try {
    await createInvoice({
      client_id: form.client_id!,
      date: form.date,
      due_date: form.due_date || undefined,
      notes: form.notes || undefined,
      terms: form.terms || undefined,
      lines: form.lines.filter(l => l.description),
    })
    toastStore.success(locale.value === 'ar' ? 'تم إنشاء الفاتورة' : 'Invoice created')
    navigateTo('/invoices')
  } catch (e: any) {
    toastStore.error(e.data?.message || 'Error')
  } finally {
    submitting.value = false
  }
}

onMounted(() => fetchClients({ per_page: 100 }))
</script>

<style scoped>
.input-field { @apply w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-sm bg-gray-50/50; }
.input-field-sm { @apply w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-sm bg-transparent; }
.form-label { @apply block text-sm font-medium text-gray-600 mb-1; }
</style>
