<template>
    <FeatureBoundary id="invoices">
      <div class="px-4 lg:px-6 py-5 max-w-[1200px] mx-auto">
        <!-- Loading skeleton -->
        <template v-if="loading">
          <div class="space-y-4">
            <div class="h-12 rounded-md bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
            <div class="h-32 rounded-xl bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
            <div class="h-64 rounded-xl bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
          </div>
        </template>

        <template v-else-if="invoice">
          <UiPageHeader
            icon="i-lucide-file-pen"
            :title="locale === 'ar' ? 'تعديل الفاتورة' : 'Edit Invoice'"
            :subtitle="invoice.invoice_number"
            :breadcrumb="[
              { label: $t('nav.invoices'), to: '/invoices' },
              { label: invoice.invoice_number, to: `/invoices/${invoice.id}` },
              { label: locale === 'ar' ? 'تعديل' : 'Edit' },
            ]"
          />

          <form @submit.prevent="onSubmit" class="space-y-5">
            <!-- Invoice details -->
            <section class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5">
              <h3 class="text-sm font-semibold text-neutral-900 dark:text-neutral-0 mb-4 flex items-center gap-2">
                <UIcon name="i-lucide-info" class="w-4 h-4 text-neutral-400" />
                {{ locale === 'ar' ? 'بيانات الفاتورة' : 'Invoice details' }}
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <!-- Client (read-only — locked once an invoice is created) -->
                <div>
                  <label class="form-label">{{ locale === 'ar' ? 'العميل' : 'Client' }}</label>
                  <div class="form-input form-input--readonly inline-flex items-center gap-2">
                    <div class="w-5 h-5 rounded-sm bg-primary-500/10 text-primary-700 dark:text-primary-300 inline-flex items-center justify-center text-[10px] font-semibold flex-shrink-0">
                      {{ (invoice.client?.name || '?').charAt(0).toUpperCase() }}
                    </div>
                    <span class="truncate">{{ invoice.client?.name || '—' }}</span>
                  </div>
                  <p class="text-[11px] text-neutral-400 mt-1">
                    {{ locale === 'ar' ? 'لا يمكن تغيير العميل بعد الإنشاء.' : 'Client cannot be changed after creation.' }}
                  </p>
                </div>
                <!-- Date -->
                <div>
                  <label class="form-label">
                    {{ locale === 'ar' ? 'التاريخ' : 'Date' }}
                    <span class="text-danger-500">*</span>
                  </label>
                  <input
                    v-model="values.date"
                    type="date"
                    class="form-input"
                    :class="{ 'form-input--error': errors.date }"
                    @input="clearError('date')"
                  />
                  <p v-if="errors.date" class="form-error">{{ errors.date }}</p>
                </div>
                <!-- Due date -->
                <div>
                  <label class="form-label">
                    {{ locale === 'ar' ? 'تاريخ الاستحقاق' : 'Due date' }}
                    <span class="text-danger-500">*</span>
                  </label>
                  <input
                    v-model="values.due_date"
                    type="date"
                    class="form-input"
                    :class="{ 'form-input--error': errors.due_date }"
                    @input="clearError('due_date')"
                  />
                  <p v-if="errors.due_date" class="form-error">{{ errors.due_date }}</p>
                </div>
              </div>
            </section>

            <!-- Line items -->
            <LineItemsEditor
              v-model="values.lines"
              :error="errors.lines"
              :client-id="invoice.client_id || null"
            />

            <!-- Notes + Totals -->
            <section class="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div class="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
                  <label class="form-label flex items-center gap-1.5">
                    <UIcon name="i-lucide-sticky-note" class="w-3.5 h-3.5 text-neutral-400" />
                    {{ locale === 'ar' ? 'ملاحظات' : 'Notes' }}
                  </label>
                  <textarea
                    v-model="values.notes"
                    rows="4"
                    class="form-input resize-none"
                    :placeholder="locale === 'ar' ? 'اختياري — تظهر للعميل.' : 'Optional — visible to the client.'"
                  />
                </div>
                <div class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
                  <label class="form-label flex items-center gap-1.5">
                    <UIcon name="i-lucide-handshake" class="w-3.5 h-3.5 text-neutral-400" />
                    {{ locale === 'ar' ? 'شروط الدفع' : 'Payment terms' }}
                  </label>
                  <textarea
                    v-model="values.terms"
                    rows="4"
                    class="form-input resize-none"
                    :placeholder="locale === 'ar' ? 'مثال: الدفع خلال 30 يوماً.' : 'e.g. Net 30, payment within 30 days.'"
                  />
                </div>
              </div>

              <aside
                v-motion
                :initial="{ opacity: 0, x: locale === 'ar' ? -8 : 8 }"
                :enter="{ opacity: 1, x: 0, transition: { delay: 80 } }"
                class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5 h-fit lg:sticky lg:top-16"
              >
                <h3 class="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-3">
                  {{ locale === 'ar' ? 'ملخص' : 'Summary' }}
                </h3>
                <dl class="space-y-2 text-sm">
                  <div class="flex justify-between items-center">
                    <dt class="text-neutral-500 dark:text-neutral-400">{{ locale === 'ar' ? 'الإجمالي الفرعي' : 'Subtotal' }}</dt>
                    <dd class="font-mono tabular-nums text-neutral-900 dark:text-neutral-0" dir="ltr">{{ subtotal.toLocaleString() }}</dd>
                  </div>
                  <div class="flex justify-between items-center">
                    <dt class="text-neutral-500 dark:text-neutral-400">{{ locale === 'ar' ? 'ضريبة القيمة المضافة' : 'VAT' }}</dt>
                    <dd class="font-mono tabular-nums text-neutral-900 dark:text-neutral-0" dir="ltr">{{ totalVat.toLocaleString() }}</dd>
                  </div>
                  <div class="flex justify-between items-center pt-3 border-t border-neutral-200 dark:border-neutral-800">
                    <dt class="font-semibold text-neutral-900 dark:text-neutral-0">{{ $t('common.total') }}</dt>
                    <dd class="font-mono tabular-nums text-base font-bold text-neutral-900 dark:text-neutral-0" dir="ltr">
                      {{ grandTotal.toLocaleString() }}
                      <span class="text-xs text-neutral-500 dark:text-neutral-400 ms-1 font-sans">
                        {{ locale === 'ar' ? 'ج.م.' : 'EGP' }}
                      </span>
                    </dd>
                  </div>
                </dl>
              </aside>
            </section>

            <!-- Actions -->
            <div class="flex items-center justify-end gap-2">
              <UiAppButton
                type="button"
                variant="outline"
                icon="i-lucide-arrow-left"
                @click="navigateTo(`/invoices/${invoice.id}`)"
              >
                {{ $t('common.cancel') }}
              </UiAppButton>
              <UiAppButton
                type="submit"
                variant="primary"
                icon="i-lucide-save"
                :loading="submitting || updateMutation.loading.value"
              >
                {{ $t('common.save') }}
              </UiAppButton>
            </div>
          </form>
        </template>
      </div>
    </FeatureBoundary>
</template>

<script setup lang="ts">
import { invoiceFormDefaults, invoiceFormSchema, type InvoiceFormInput } from '~/features/invoices/schemas'
import { sumSubtotal, sumVat, grandTotal as computeGrandTotal } from '~/features/invoices/utils/lineMath'
import type { ApiError } from '~/core/api/errors'
import type { Invoice } from '~/shared/types/invoice'

definePageMeta({ layout: 'dashboard' })

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

const subtotal = computed(() => sumSubtotal(values.lines))
const totalVat = computed(() => sumVat(values.lines))
const grandTotal = computed(() => computeGrandTotal(values.lines))

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
    toastStore.error(locale.value === 'ar' ? 'الفاتورة غير موجودة' : 'Invoice not found')
    navigateTo('/invoices')
  } finally {
    loading.value = false
  }
})

async function onSubmit() {
  // Product-only mode: every line must be linked to a saved client_product.
  // Drafts created before this rule may have legacy freeform lines — the
  // editor surfaces them with a warning and we block save until they're
  // either picked or removed.
  const orphan = values.lines.findIndex(l => !(l as any).client_product_id)
  if (orphan !== -1) {
    errors.lines = locale.value === 'ar'
      ? `البند رقم ${orphan + 1}: اختر منتجاً لهذا البند.`
      : `Line ${orphan + 1}: pick a product for this line.`
    toastStore.error(errors.lines)
    return
  }

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

.form-label { @apply block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5; }
.form-error { @apply mt-1 text-xs text-danger-600 dark:text-danger-500 flex items-center gap-1; }

.form-input {
  width: 100%;
  padding-inline: 0.75rem;
  height: 2.25rem;
  font-size: 0.875rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-neutral-200);
  background-color: var(--color-neutral-0, #fff);
  color: var(--color-neutral-900);
  outline: none;
  transition: border-color 150ms var(--ease-standard);
  appearance: none;
}
.form-input:focus {
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 2px color-mix(in oklab, var(--color-primary-500) 20%, transparent);
}
textarea.form-input { height: auto; padding-block: 0.5rem; }
.form-input--error { border-color: color-mix(in oklab, var(--color-danger-500) 60%, transparent); }
.form-input--error:focus { border-color: var(--color-danger-500); box-shadow: 0 0 0 2px color-mix(in oklab, var(--color-danger-500) 25%, transparent); }
.form-input--readonly {
  background-color: var(--color-neutral-50);
  color: var(--color-neutral-600);
  cursor: not-allowed;
}

:global(html.dark) .form-input {
  background-color: var(--color-neutral-900);
  border-color: var(--color-neutral-800);
  color: var(--color-neutral-0);
}
:global(html.dark) .form-input--readonly { background-color: var(--color-neutral-800); color: var(--color-neutral-400); }
</style>
