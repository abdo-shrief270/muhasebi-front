<template>
  <FeatureBoundary id="expenses">
    <div class="px-4 lg:px-6 py-5 max-w-3xl mx-auto">
      <div class="mb-5">
        <NuxtLink
          to="/expenses"
          class="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-0 transition-colors mb-3"
        >
          <UIcon name="i-lucide-arrow-left" class="w-3.5 h-3.5 rtl:rotate-180" />
          {{ locale === 'ar' ? 'المصروفات' : 'Expenses' }}
        </NuxtLink>
        <h1 class="text-xl font-bold text-neutral-900 dark:text-neutral-0 tracking-tight">
          {{ locale === 'ar' ? 'مصروف جديد' : 'New Expense' }}
        </h1>
        <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          {{ locale === 'ar'
            ? 'يحفظ كمسودة. قدّمه للاعتماد لاحقاً من صفحة التفاصيل.'
            : 'Saved as a draft. Submit later for approval from the detail page.' }}
        </p>
      </div>

      <Can :perm="PERMISSIONS.MANAGE_EXPENSES">
        <form @submit.prevent="onSubmit" class="space-y-5">
          <!-- Identity -->
          <section class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
            <h3 class="form-section-title">
              <UIcon name="i-lucide-credit-card" class="w-3.5 h-3.5 text-neutral-400" />
              {{ locale === 'ar' ? 'بيانات المصروف' : 'Expense Details' }}
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div class="md:col-span-2">
                <label class="form-label">
                  {{ locale === 'ar' ? 'الوصف' : 'Description' }}
                  <span class="text-danger-500">*</span>
                </label>
                <input
                  v-model="values.description"
                  type="text"
                  class="form-input"
                  :class="{ 'form-input--error': errors.description }"
                  :placeholder="locale === 'ar' ? 'مثال: وقود سيارة الشركة' : 'e.g. Company car fuel'"
                  required
                />
                <p v-if="errors.description" class="form-error">{{ errors.description }}</p>
              </div>

              <div>
                <label class="form-label">
                  {{ locale === 'ar' ? 'الفئة' : 'Category' }}
                  <span class="text-danger-500">*</span>
                </label>
                <div class="relative">
                  <select
                    v-model.number="values.expense_category_id"
                    class="form-input"
                    :class="{ 'form-input--error': errors.expense_category_id }"
                    required
                  >
                    <option :value="0" disabled>{{ locale === 'ar' ? 'اختر فئة...' : 'Select category...' }}</option>
                    <option v-for="c in categoryOptions" :key="c.id" :value="c.id">{{ c.label }}</option>
                  </select>
                  <UIcon name="i-lucide-chevron-down" class="absolute end-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
                </div>
                <p v-if="errors.expense_category_id" class="form-error">{{ errors.expense_category_id }}</p>
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
                  required
                />
                <p v-if="errors.date" class="form-error">{{ errors.date }}</p>
              </div>
            </div>
          </section>

          <!-- Amount -->
          <section class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
            <h3 class="form-section-title">
              <UIcon name="i-lucide-banknote" class="w-3.5 h-3.5 text-neutral-400" />
              {{ locale === 'ar' ? 'المبلغ' : 'Amount' }}
            </h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div class="col-span-2">
                <label class="form-label">
                  {{ locale === 'ar' ? 'المبلغ' : 'Amount' }}
                  <span class="text-danger-500">*</span>
                </label>
                <input
                  v-model.number="values.amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  class="form-input font-mono text-end"
                  :class="{ 'form-input--error': errors.amount }"
                  dir="ltr"
                  required
                />
                <p v-if="errors.amount" class="form-error">{{ errors.amount }}</p>
              </div>
              <div>
                <label class="form-label">{{ locale === 'ar' ? 'العملة' : 'Currency' }}</label>
                <div class="relative">
                  <select v-model="values.currency" class="form-input">
                    <option value="EGP">EGP</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="SAR">SAR</option>
                    <option value="AED">AED</option>
                  </select>
                  <UIcon name="i-lucide-chevron-down" class="absolute end-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label class="form-label">VAT %</label>
                <input
                  v-model.number="values.vat_rate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  class="form-input font-mono text-end"
                  dir="ltr"
                  :placeholder="locale === 'ar' ? 'اختياري' : 'Optional'"
                />
                <p class="text-[11px] text-neutral-400 mt-1">
                  {{ locale === 'ar' ? 'يُحسب تلقائياً من المبلغ.' : 'Computed from amount.' }}
                </p>
              </div>
            </div>

            <!-- Live VAT preview -->
            <div v-if="vatPreview > 0" class="mt-3 flex items-center justify-between text-xs px-3 py-2 rounded-md bg-info-500/10 border border-info-500/20 text-info-700 dark:text-info-400">
              <span>{{ locale === 'ar' ? 'مبلغ الضريبة المُحتسب' : 'Computed VAT' }}</span>
              <span class="font-mono tabular-nums" dir="ltr">{{ formatMoney(vatPreview) }} {{ values.currency }}</span>
            </div>
          </section>

          <!-- Vendor + payment -->
          <section class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
            <h3 class="form-section-title">
              <UIcon name="i-lucide-handshake" class="w-3.5 h-3.5 text-neutral-400" />
              {{ locale === 'ar' ? 'المورد والدفع' : 'Vendor & Payment' }}
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label class="form-label">{{ locale === 'ar' ? 'المورد المسجل' : 'Registered Vendor' }}</label>
                <div class="relative">
                  <select v-model.number="values.vendor_id" class="form-input">
                    <option :value="0">{{ locale === 'ar' ? '— غير مسجل / مباشر —' : '— None / Ad-hoc —' }}</option>
                    <option v-for="v in vendorOptions" :key="v.id" :value="v.id">{{ v.label }}</option>
                  </select>
                  <UIcon name="i-lucide-chevron-down" class="absolute end-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label class="form-label">{{ locale === 'ar' ? 'اسم المورد (إن لم يكن مسجلاً)' : 'Vendor Name (if ad-hoc)' }}</label>
                <input
                  v-model="values.vendor_name"
                  type="text"
                  class="form-input"
                  :placeholder="locale === 'ar' ? 'مثال: محطة وقود' : 'e.g. Gas station'"
                  :disabled="values.vendor_id > 0"
                />
              </div>
              <div>
                <label class="form-label">
                  {{ locale === 'ar' ? 'طريقة الدفع' : 'Payment Method' }}
                  <span class="text-danger-500">*</span>
                </label>
                <div class="relative">
                  <select
                    v-model="values.payment_method"
                    class="form-input"
                    :class="{ 'form-input--error': errors.payment_method }"
                    required
                  >
                    <option value="cash">{{ paymentMethodLabel('cash') }}</option>
                    <option value="bank_transfer">{{ paymentMethodLabel('bank_transfer') }}</option>
                    <option value="company_card">{{ paymentMethodLabel('company_card') }}</option>
                    <option value="personal">{{ paymentMethodLabel('personal') }}</option>
                  </select>
                  <UIcon name="i-lucide-chevron-down" class="absolute end-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
                </div>
                <p v-if="values.payment_method === 'personal'" class="text-[11px] text-warning-600 dark:text-warning-500 mt-1">
                  {{ locale === 'ar'
                    ? 'سيتم تسديد المصروف من الحساب الشخصي عند الاعتماد.'
                    : 'Will be reimbursed to the employee on approval.' }}
                </p>
              </div>
            </div>
          </section>

          <!-- Receipt -->
          <section class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
            <h3 class="form-section-title">
              <UIcon name="i-lucide-receipt" class="w-3.5 h-3.5 text-neutral-400" />
              {{ locale === 'ar' ? 'الإيصال' : 'Receipt' }}
              <span class="text-[10px] font-normal text-neutral-400 normal-case tracking-normal">
                {{ locale === 'ar' ? '(اختياري)' : '(optional)' }}
              </span>
            </h3>

            <label
              v-if="!receiptFile"
              class="flex flex-col items-center justify-center gap-2 px-4 py-6 border-2 border-dashed border-neutral-200 dark:border-neutral-700 rounded-md cursor-pointer hover:border-primary-500 hover:bg-primary-500/5 transition-colors"
            >
              <UIcon name="i-lucide-upload-cloud" class="w-6 h-6 text-neutral-400" />
              <p class="text-sm text-neutral-700 dark:text-neutral-200">
                {{ locale === 'ar' ? 'اضغط لاختيار صورة أو PDF' : 'Click to upload an image or PDF' }}
              </p>
              <p class="text-[11px] text-neutral-400">{{ locale === 'ar' ? 'حتى 10 ميجابايت' : 'Up to 10 MB' }}</p>
              <input
                type="file"
                accept="image/jpeg,image/png,application/pdf"
                class="hidden"
                @change="onReceiptChange"
              />
            </label>

            <div
              v-else
              class="flex items-center gap-3 px-3 py-2 rounded-md bg-neutral-50 dark:bg-neutral-950/40 border border-neutral-200 dark:border-neutral-800"
            >
              <UIcon
                :name="receiptFile.type === 'application/pdf' ? 'i-lucide-file-text' : 'i-lucide-image'"
                class="w-5 h-5 text-info-600 dark:text-info-400 flex-shrink-0"
              />
              <div class="min-w-0 flex-1">
                <p class="text-sm font-medium text-neutral-900 dark:text-neutral-0 truncate">{{ receiptFile.name }}</p>
                <p class="text-[11px] text-neutral-500 dark:text-neutral-400">
                  {{ formatFileSize(receiptFile.size) }}
                </p>
              </div>
              <button
                type="button"
                class="w-7 h-7 inline-flex items-center justify-center rounded-md text-neutral-400 hover:text-danger-600 hover:bg-danger-500/10 transition-colors"
                :title="locale === 'ar' ? 'إزالة' : 'Remove'"
                @click="receiptFile = null"
              >
                <UIcon name="i-lucide-x" class="w-3.5 h-3.5" />
              </button>
            </div>
          </section>

          <!-- Notes -->
          <section class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
            <label class="form-label flex items-center gap-1.5">
              <UIcon name="i-lucide-sticky-note" class="w-3.5 h-3.5 text-neutral-400" />
              {{ locale === 'ar' ? 'ملاحظات' : 'Notes' }}
            </label>
            <textarea
              v-model="values.notes"
              rows="3"
              class="form-input resize-none"
              :placeholder="locale === 'ar' ? 'تفاصيل إضافية للمعتمد.' : 'Extra detail for the approver.'"
            />
          </section>

          <div class="flex items-center gap-2 pt-4 border-t border-neutral-200 dark:border-neutral-800">
            <UiAppButton type="button" variant="outline" @click="navigateTo('/expenses')">
              {{ $t('common.cancel') }}
            </UiAppButton>
            <UiAppButton
              type="submit"
              variant="primary"
              icon="i-lucide-save"
              :loading="saving"
              class="ms-auto"
            >
              {{ locale === 'ar' ? 'حفظ كمسودة' : 'Save as draft' }}
            </UiAppButton>
          </div>
        </form>
      </Can>
    </div>
  </FeatureBoundary>
</template>

<script setup lang="ts">
import Can from '~/core/rbac/Can.vue'
import { PERMISSIONS } from '~/core/rbac/permissions'
import { ApiError } from '~/core/api/errors'
import type { ExpensePaymentMethod } from '~/features/expenses/services/expenseService'
import { vendorDisplayName } from '~/features/vendors/services/vendorService'

definePageMeta({ layout: 'dashboard' })

const { locale } = useI18n()
const toastStore = useToastStore()
const mutations = useExpenseMutations()

const errors = ref<Record<string, string>>({})

const values = reactive<{
  expense_category_id: number
  amount: number
  currency: string
  date: string
  vendor_id: number
  vendor_name: string
  description: string
  payment_method: ExpensePaymentMethod
  vat_rate: number | null
  notes: string
}>({
  expense_category_id: 0,
  amount: 0,
  currency: 'EGP',
  date: new Date().toISOString().slice(0, 10),
  vendor_id: 0,
  vendor_name: '',
  description: '',
  payment_method: 'cash',
  vat_rate: null,
  notes: '',
})

const receiptFile = ref<File | null>(null)

// Categories + vendors for the pickers
const { data: categoriesData } = useExpenseCategoriesList()
const categoryOptions = computed(() => {
  return (categoriesData.value ?? []).map(c => ({
    id: c.id,
    label: locale.value === 'ar' ? (c.name_ar || c.name_en || '') : (c.name_en || c.name_ar || ''),
  }))
})

const vendorParams = computed(() => ({ per_page: 200, is_active: true, sort_by: 'name_ar' as const, sort_dir: 'asc' as const }))
const { data: vendorListData } = useVendorsList(vendorParams)
const vendorOptions = computed(() => {
  return (vendorListData.value?.data ?? []).map(v => ({
    id: v.id,
    label: vendorDisplayName(v, locale.value) || (locale.value === 'ar' ? '(بدون اسم)' : '(unnamed)'),
  }))
})

/**
 * Live VAT preview — matches the calculation the backend does on save.
 * The form's `amount` is the gross (VAT-inclusive). At rate r, the VAT
 * portion is `amount * r / (100 + r)`. Shown only when the user enters
 * a non-zero VAT rate.
 */
const vatPreview = computed(() => {
  const a = Number(values.amount) || 0
  const r = Number(values.vat_rate) || 0
  if (a <= 0 || r <= 0) return 0
  return Math.round(((a * r) / (100 + r)) * 100) / 100
})

const PAYMENT_METHOD_AR: Record<string, string> = {
  cash: 'نقد', bank_transfer: 'تحويل بنكي', company_card: 'بطاقة الشركة', personal: 'شخصي',
}
const PAYMENT_METHOD_EN: Record<string, string> = {
  cash: 'Cash', bank_transfer: 'Bank transfer', company_card: 'Company card', personal: 'Personal',
}
function paymentMethodLabel(m: string) {
  const map = locale.value === 'ar' ? PAYMENT_METHOD_AR : PAYMENT_METHOD_EN
  return map[m] ?? m
}

function onReceiptChange(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0]
  if (!f) return
  // Backend caps at 10 MB; pre-flight to avoid the round-trip.
  if (f.size > 10 * 1024 * 1024) {
    toastStore.error(locale.value === 'ar' ? 'حجم الملف يتجاوز 10 ميجابايت' : 'File exceeds 10 MB')
    return
  }
  receiptFile.value = f
}

function formatMoney(n: number | string | null | undefined) {
  return Number(n ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatFileSize(b: number) {
  if (b < 1024) return `${b} B`
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`
  return `${(b / 1024 / 1024).toFixed(1)} MB`
}

const saving = computed(() => mutations.create.loading.value || mutations.createWithReceipt.loading.value)

async function onSubmit() {
  errors.value = {}

  // Frontend pre-flight — backend repeats these checks.
  if (!values.description.trim()) {
    errors.value.description = locale.value === 'ar' ? 'الوصف مطلوب' : 'Description is required'
    return
  }
  if (!values.expense_category_id) {
    errors.value.expense_category_id = locale.value === 'ar' ? 'الفئة مطلوبة' : 'Category is required'
    return
  }
  if (!Number.isFinite(values.amount) || values.amount <= 0) {
    errors.value.amount = locale.value === 'ar' ? 'المبلغ يجب أن يكون أكبر من صفر' : 'Amount must be greater than zero'
    return
  }
  if (!values.date) {
    errors.value.date = locale.value === 'ar' ? 'التاريخ مطلوب' : 'Date is required'
    return
  }

  // The wire payload mirrors StoreExpenseRequest's accepted keys. vat_rate
  // is omitted (rather than sent as null) when the user left it blank so
  // the backend default (0) applies cleanly.
  const payload: Record<string, unknown> = {
    expense_category_id: values.expense_category_id,
    amount: values.amount,
    currency: values.currency,
    date: values.date,
    description: values.description.trim(),
    payment_method: values.payment_method,
    notes: values.notes.trim() || undefined,
  }
  if (values.vendor_id > 0) payload.vendor_id = values.vendor_id
  else if (values.vendor_name.trim()) payload.vendor_name = values.vendor_name.trim()
  if (values.vat_rate != null && values.vat_rate > 0) payload.vat_rate = Number(values.vat_rate)

  try {
    let created: any
    if (receiptFile.value) {
      created = await mutations.createWithReceipt.mutate({ form: payload as any, receipt: receiptFile.value })
    } else {
      created = await mutations.create.mutate(payload as any)
    }
    toastStore.success(locale.value === 'ar' ? 'تم حفظ المصروف' : 'Expense saved')
    const id = (created as any)?.data?.id ?? (created as any)?.id
    if (id) navigateTo(`/expenses/${id}`)
    else navigateTo('/expenses')
  } catch (e) {
    const err = e as ApiError
    if (err?.code === 'validation' && err.fieldErrors) {
      for (const [field, msgs] of Object.entries(err.fieldErrors)) {
        errors.value[field] = Array.isArray(msgs) ? msgs[0] : String(msgs)
      }
    }
    toastStore.error(err?.message || (locale.value === 'ar' ? 'تعذر الحفظ' : 'Save failed'))
  }
}
</script>

<style scoped>
@reference "~/assets/css/tokens.css";

.form-section-title {
  @apply text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-3 flex items-center gap-1.5;
}
.form-label { @apply block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5; }
.form-error { @apply mt-1 text-xs text-danger-600 dark:text-danger-500; }

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
.form-input:disabled { opacity: 0.55; cursor: not-allowed; }
textarea.form-input { height: auto; padding-block: 0.5rem; }
.form-input--error { border-color: color-mix(in oklab, var(--color-danger-500) 60%, transparent); }

:global(html.dark) .form-input {
  background-color: var(--color-neutral-900);
  border-color: var(--color-neutral-800);
  color: var(--color-neutral-0);
}
</style>
