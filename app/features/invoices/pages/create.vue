<template>
    <FeatureBoundary id="invoices">
      <div class="px-4 lg:px-6 py-5 max-w-[1200px] mx-auto">
        <UiPageHeader
          icon="i-lucide-file-plus"
          :title="locale === 'ar' ? 'فاتورة جديدة' : 'New Invoice'"
          :subtitle="locale === 'ar' ? 'أضف بنود الفاتورة وأرسلها للعميل.' : 'Add line items and send to your client.'"
          :breadcrumb="[
            { label: $t('nav.invoices'), to: '/invoices' },
            { label: locale === 'ar' ? 'فاتورة جديدة' : 'New Invoice' },
          ]"
        />

        <form @submit.prevent="onSubmit" class="space-y-5">
          <!-- Client + dates -->
          <section class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5">
            <h3 class="text-sm font-semibold text-neutral-900 dark:text-neutral-0 mb-4 flex items-center gap-2">
              <UIcon name="i-lucide-info" class="w-4 h-4 text-neutral-400" />
              {{ locale === 'ar' ? 'بيانات الفاتورة' : 'Invoice details' }}
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="form-label">
                  {{ locale === 'ar' ? 'العميل' : 'Client' }}
                  <span class="text-danger-500">*</span>
                </label>
                <div class="relative">
                  <UIcon
                    name="i-lucide-user"
                    class="absolute start-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none"
                  />
                  <select
                    v-model.number="values.client_id"
                    class="form-input form-input--leading-icon"
                    :class="{ 'form-input--error': errors.client_id }"
                    @change="clearError('client_id')"
                  >
                    <option :value="0" disabled>{{ locale === 'ar' ? 'اختر عميلاً' : 'Select a client' }}</option>
                    <option v-for="c in clients" :key="c.id" :value="c.id">{{ c.name }}</option>
                  </select>
                  <UIcon
                    name="i-lucide-chevron-down"
                    class="absolute end-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none"
                  />
                </div>
                <p v-if="errors.client_id" class="form-error">{{ errors.client_id }}</p>
              </div>
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
            :client-id="values.client_id || null"
          />

          <!-- Totals + notes -->
          <section class="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <!-- Notes (left, span 2) -->
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

            <!-- Totals card (right) -->
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
              @click="navigateTo('/invoices')"
            >
              {{ $t('common.cancel') }}
            </UiAppButton>
            <UiAppButton
              type="submit"
              variant="primary"
              icon="i-lucide-check"
              :loading="submitting || createMutation.loading.value"
            >
              {{ locale === 'ar' ? 'إنشاء الفاتورة' : 'Create Invoice' }}
            </UiAppButton>
          </div>
        </form>
      </div>
    </FeatureBoundary>
</template>

<script setup lang="ts">
import { invoiceFormDefaults, invoiceFormSchema, type InvoiceFormInput } from '~/features/invoices/schemas'
import { sumSubtotal, sumVat, grandTotal as computeGrandTotal } from '~/features/invoices/utils/lineMath'
import type { ApiError } from '~/core/api/errors'

definePageMeta({ layout: 'dashboard' })

const { locale } = useI18n()
const route = useRoute()
const { create: createMutation } = useInvoiceMutations()
const { clients, fetchClients } = useClients()
const toastStore = useToastStore()

const prefillClientId = route.query.client_id ? Number(route.query.client_id) : 0

const { values, errors, submitting, clearError, handleSubmit, applyApiErrors } = useZodForm<InvoiceFormInput>({
  schema: invoiceFormSchema,
  initial: {
    ...invoiceFormDefaults,
    client_id: prefillClientId,
    lines: invoiceFormDefaults.lines.map(l => ({ ...l })),
  },
})

// Aggregates for the summary card. Per-line math lives inside the
// LineItemsEditor component; the helpers below operate on the full array.
const subtotal = computed(() => sumSubtotal(values.lines))
const totalVat = computed(() => sumVat(values.lines))
const grandTotal = computed(() => computeGrandTotal(values.lines))

async function onSubmit() {
  // Product-only mode: every line must be linked to a saved client_product.
  // The line editor surfaces orphans inline, but we also block submission
  // here so a stale state can't slip past the form-level validation.
  const orphan = values.lines.findIndex(l => !(l as any).client_product_id)
  if (orphan !== -1) {
    errors.lines = locale.value === 'ar'
      ? `البند رقم ${orphan + 1}: اختر منتجاً لهذا البند.`
      : `Line ${orphan + 1}: pick a product for this line.`
    toastStore.error(errors.lines)
    return
  }

  const result = await handleSubmit(async (data) => {
    await createMutation.mutate(data as any)
  })

  if (result.ok) {
    toastStore.success(locale.value === 'ar' ? 'تم إنشاء الفاتورة' : 'Invoice created')
    navigateTo('/invoices')
  } else if ('error' in result && result.error) {
    const err = result.error as ApiError
    applyApiErrors(err)
    toastStore.error(err.message || 'Error')
  }
}

onMounted(() => fetchClients({ per_page: 100 }))
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
.form-input--leading-icon { padding-inline-start: 2rem; padding-inline-end: 2rem; }
.form-input--error { border-color: color-mix(in oklab, var(--color-danger-500) 60%, transparent); }
.form-input--error:focus { border-color: var(--color-danger-500); box-shadow: 0 0 0 2px color-mix(in oklab, var(--color-danger-500) 25%, transparent); }

:global(html.dark) .form-input {
  background-color: var(--color-neutral-900);
  border-color: var(--color-neutral-800);
  color: var(--color-neutral-0);
}

/* Line-item cell inputs live inside the LineItemsEditor component now. */
</style>
