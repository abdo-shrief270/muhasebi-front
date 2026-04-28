<template>
  <FeatureBoundary id="bills">
    <div class="px-4 lg:px-6 py-5 max-w-[1400px] mx-auto">
      <!-- Header -->
      <div class="mb-5">
        <NuxtLink
          to="/bills"
          class="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-0 transition-colors mb-3"
        >
          <UIcon name="i-lucide-arrow-left" class="w-3.5 h-3.5 rtl:rotate-180" />
          {{ locale === 'ar' ? 'الفواتير' : 'Bills' }}
        </NuxtLink>
        <h1 class="text-xl font-bold text-neutral-900 dark:text-neutral-0 tracking-tight">
          {{ locale === 'ar' ? 'فاتورة مورد جديدة' : 'New Vendor Bill' }}
        </h1>
        <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          {{ locale === 'ar' ? 'يتم حفظ الفاتورة كمسودة. يمكنك اعتمادها لاحقاً لترحيلها للأستاذ.' : 'Bills are saved as drafts. Approve later to post to the ledger.' }}
        </p>
      </div>

      <Can :perm="PERMISSIONS.MANAGE_BILLS">
        <form @submit.prevent="onSubmit" class="space-y-5">
          <!-- Header section: vendor, dates, currency -->
          <section class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
            <h3 class="text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <UIcon name="i-lucide-building-2" class="w-3.5 h-3.5 text-neutral-400" />
              {{ locale === 'ar' ? 'بيانات الفاتورة' : 'Bill Details' }}
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <div class="md:col-span-2 lg:col-span-2">
                <label class="form-label">
                  {{ locale === 'ar' ? 'المورد' : 'Vendor' }}
                  <span class="text-danger-500">*</span>
                </label>
                <div class="relative">
                  <select
                    v-model.number="values.vendor_id"
                    class="form-input"
                    :class="{ 'form-input--error': errors.vendor_id }"
                    @change="clearError('vendor_id')"
                  >
                    <option :value="0" disabled>{{ locale === 'ar' ? 'اختر مورداً...' : 'Select vendor...' }}</option>
                    <option v-for="v in vendorOptions" :key="v.id" :value="v.id">
                      {{ v.label }} <span v-if="v.code">[{{ v.code }}]</span>
                    </option>
                  </select>
                  <UIcon name="i-lucide-chevron-down" class="absolute end-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
                </div>
                <p v-if="errors.vendor_id" class="form-error">{{ locale === 'ar' ? 'الرجاء اختيار المورد.' : 'Please select a vendor.' }}</p>
              </div>

              <div>
                <label class="form-label">
                  {{ locale === 'ar' ? 'تاريخ الفاتورة' : 'Date' }}
                  <span class="text-danger-500">*</span>
                </label>
                <input v-model="values.date" type="date" class="form-input" :class="{ 'form-input--error': errors.date }" />
                <p v-if="errors.date" class="form-error">{{ errors.date }}</p>
              </div>

              <div>
                <label class="form-label">
                  {{ locale === 'ar' ? 'الاستحقاق' : 'Due Date' }}
                  <span class="text-danger-500">*</span>
                </label>
                <input v-model="values.due_date" type="date" class="form-input" :class="{ 'form-input--error': errors.due_date }" />
                <p v-if="errors.due_date" class="form-error">{{ errors.due_date }}</p>
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
            </div>
          </section>

          <!-- Line items -->
          <section class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
            <div class="px-4 py-2.5 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-950/40 flex items-center justify-between">
              <h3 class="text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                <UIcon name="i-lucide-list" class="w-3.5 h-3.5 text-neutral-400" />
                {{ locale === 'ar' ? 'البنود' : 'Line Items' }}
              </h3>
              <UiAppButton type="button" variant="outline" size="xs" icon="i-lucide-plus" @click="addLine">
                {{ locale === 'ar' ? 'إضافة بند' : 'Add line' }}
              </UiAppButton>
            </div>

            <div class="divide-y divide-neutral-100 dark:divide-neutral-800/60">
              <div
                v-for="(line, i) in values.lines"
                :key="i"
                class="px-4 py-3 grid grid-cols-12 gap-2 items-start"
              >
                <!-- Description + saved-item picker -->
                <div class="col-span-12 md:col-span-4">
                  <div class="flex items-center justify-between mb-1">
                    <label class="form-label-xs !mb-0">{{ locale === 'ar' ? 'الوصف' : 'Description' }}</label>
                    <button
                      v-if="vendorProducts.length > 0"
                      type="button"
                      class="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
                      @click="openProductPicker(i)"
                    >
                      <UIcon name="i-lucide-package" class="w-3 h-3" />
                      {{ locale === 'ar' ? 'اختر بنداً' : 'Pick item' }}
                    </button>
                  </div>
                  <input
                    v-model="line.description"
                    type="text"
                    class="form-input"
                    :placeholder="locale === 'ar' ? 'مثال: أتعاب خدمات' : 'e.g. Service fees'"
                  />
                </div>

                <!-- Account picker -->
                <div class="col-span-12 md:col-span-3">
                  <label class="form-label-xs">{{ locale === 'ar' ? 'الحساب' : 'Account' }} <span class="text-danger-500">*</span></label>
                  <div class="relative">
                    <select
                      v-model.number="line.account_id"
                      class="form-input"
                      :class="{ 'form-input--error': lineHasError(i, 'account_id') }"
                    >
                      <option :value="0" disabled>{{ locale === 'ar' ? 'اختر حساباً...' : 'Select account...' }}</option>
                      <option v-for="a in accountOptions" :key="a.id" :value="a.id">
                        {{ a.label }}
                      </option>
                    </select>
                    <UIcon name="i-lucide-chevron-down" class="absolute end-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
                  </div>
                </div>

                <!-- Qty -->
                <div class="col-span-3 md:col-span-1">
                  <label class="form-label-xs">{{ locale === 'ar' ? 'كمية' : 'Qty' }}</label>
                  <input v-model.number="line.quantity" type="number" min="0.0001" step="0.01" class="form-input text-end font-mono" dir="ltr" />
                </div>

                <!-- Unit price -->
                <div class="col-span-4 md:col-span-2">
                  <label class="form-label-xs">{{ locale === 'ar' ? 'سعر الوحدة' : 'Unit Price' }}</label>
                  <input v-model.number="line.unit_price" type="number" min="0" step="0.01" class="form-input text-end font-mono" dir="ltr" />
                </div>

                <!-- VAT -->
                <div class="col-span-2 md:col-span-1">
                  <label class="form-label-xs">VAT %</label>
                  <input v-model.number="line.vat_rate" type="number" min="0" max="100" step="0.01" class="form-input text-end font-mono" dir="ltr" />
                </div>

                <!-- Line total + remove -->
                <div class="col-span-3 md:col-span-1 flex items-end gap-1">
                  <div class="flex-1 min-w-0">
                    <label class="form-label-xs">{{ locale === 'ar' ? 'إجمالي' : 'Total' }}</label>
                    <p class="font-mono text-sm font-semibold text-neutral-900 dark:text-neutral-0 tabular-nums h-9 flex items-center justify-end" dir="ltr">
                      {{ formatMoney(lineTotal(line)) }}
                    </p>
                  </div>
                  <button
                    type="button"
                    class="w-9 h-9 inline-flex items-center justify-center rounded-md text-neutral-400 hover:text-danger-600 hover:bg-danger-500/10 transition-colors flex-shrink-0"
                    :disabled="values.lines.length <= 1"
                    :class="{ 'opacity-30 cursor-not-allowed': values.lines.length <= 1 }"
                    :title="locale === 'ar' ? 'حذف البند' : 'Remove line'"
                    @click="removeLine(i)"
                  >
                    <UIcon name="i-lucide-trash-2" class="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            <p v-if="errors.lines && typeof errors.lines === 'string'" class="px-4 py-3 text-xs text-danger-600">
              {{ errors.lines }}
            </p>
          </section>

          <!-- Notes + totals preview -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <section class="lg:col-span-2 bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
              <label class="form-label flex items-center gap-1.5">
                <UIcon name="i-lucide-sticky-note" class="w-3.5 h-3.5 text-neutral-400" />
                {{ locale === 'ar' ? 'ملاحظات' : 'Notes' }}
              </label>
              <textarea
                v-model="values.notes"
                rows="4"
                class="form-input resize-none"
                :placeholder="locale === 'ar' ? 'ملاحظات داخلية — لا تظهر على الفاتورة المطبوعة.' : 'Internal notes — not shown on the printed bill.'"
              />
            </section>

            <section class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 self-start">
              <h3 class="text-sm font-semibold text-neutral-900 dark:text-neutral-0 mb-3">
                {{ locale === 'ar' ? 'تفاصيل المبلغ' : 'Amount Breakdown' }}
              </h3>
              <dl class="space-y-2 text-sm">
                <div class="flex items-center justify-between">
                  <dt class="text-neutral-500 dark:text-neutral-400">{{ locale === 'ar' ? 'الإجمالي قبل الضرائب' : 'Subtotal' }}</dt>
                  <dd class="font-mono tabular-nums text-neutral-900 dark:text-neutral-0" dir="ltr">{{ formatMoney(totals.subtotal) }}</dd>
                </div>
                <div class="flex items-center justify-between">
                  <dt class="text-neutral-500 dark:text-neutral-400">{{ locale === 'ar' ? 'القيمة المضافة' : 'VAT' }}</dt>
                  <dd class="font-mono tabular-nums text-neutral-900 dark:text-neutral-0" dir="ltr">{{ formatMoney(totals.vat) }}</dd>
                </div>
                <div v-if="totals.wht > 0" class="flex items-center justify-between">
                  <dt class="text-neutral-500 dark:text-neutral-400">{{ locale === 'ar' ? 'خصم من المنبع' : 'WHT' }}</dt>
                  <dd class="font-mono tabular-nums text-warning-700 dark:text-warning-500" dir="ltr">−{{ formatMoney(totals.wht) }}</dd>
                </div>
                <div class="border-t border-neutral-200 dark:border-neutral-800 pt-2 flex items-center justify-between">
                  <dt class="font-semibold text-neutral-900 dark:text-neutral-0">{{ locale === 'ar' ? 'الإجمالي' : 'Total' }}</dt>
                  <dd class="font-mono font-bold tabular-nums text-neutral-900 dark:text-neutral-0" dir="ltr">
                    {{ formatMoney(totals.total) }} {{ values.currency }}
                  </dd>
                </div>
              </dl>
            </section>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-2 pt-4 border-t border-neutral-200 dark:border-neutral-800">
            <UiAppButton type="button" variant="outline" @click="navigateTo('/bills')">
              {{ $t('common.cancel') }}
            </UiAppButton>
            <UiAppButton
              type="submit"
              variant="primary"
              icon="i-lucide-save"
              :loading="mutations.create.loading.value || submitting"
              class="ms-auto"
            >
              {{ locale === 'ar' ? 'حفظ كمسودة' : 'Save as draft' }}
            </UiAppButton>
          </div>
        </form>
      </Can>
    </div>

    <!--
      Vendor-products picker. Opens when the user clicks "Pick item" on any
      line. The list comes from /vendors/{id}/products (active items only,
      sorted by recent-first when the backend gets the observer wired).
    -->
    <UiSlideOver
      v-model="productPickerOpen"
      :title="locale === 'ar' ? 'اختر بنداً محفوظاً' : 'Pick a saved item'"
    >
      <div v-if="vendorProducts.length === 0" class="px-2 py-8 text-center">
        <UIcon name="i-lucide-package-x" class="w-8 h-8 text-neutral-400 mx-auto mb-2" />
        <p class="text-sm text-neutral-500 dark:text-neutral-400">
          {{ locale === 'ar' ? 'لا توجد بنود محفوظة لهذا المورد.' : 'No saved items for this vendor yet.' }}
        </p>
        <NuxtLink
          v-if="values.vendor_id"
          :to="`/vendors/${values.vendor_id}`"
          class="inline-block mt-3 text-xs font-semibold text-primary-600 hover:text-primary-700"
        >
          {{ locale === 'ar' ? 'فتح صفحة المورد لإضافة بنود' : 'Open vendor page to add items' }} →
        </NuxtLink>
      </div>

      <ul v-else class="divide-y divide-neutral-100 dark:divide-neutral-800/60 -mx-2">
        <li
          v-for="p in vendorProducts"
          :key="p.id"
          class="px-3 py-2.5 hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40 transition-colors cursor-pointer"
          @click="applyProduct(p)"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0 flex-1">
              <p class="text-sm font-medium text-neutral-900 dark:text-neutral-0 truncate">{{ p.name }}</p>
              <p v-if="p.description" class="text-[11px] text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
                {{ p.description }}
              </p>
              <div class="flex items-center gap-2 text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 flex-wrap">
                <span v-if="p.default_vat_rate != null">VAT {{ Number(p.default_vat_rate).toFixed(0) }}%</span>
                <span v-if="p.default_account" class="font-mono">· {{ p.default_account.code }}</span>
              </div>
            </div>
            <span class="font-mono text-sm font-semibold tabular-nums text-neutral-900 dark:text-neutral-0 flex-shrink-0" dir="ltr">
              {{ formatMoney(p.unit_price) }}
            </span>
          </div>
        </li>
      </ul>
    </UiSlideOver>
  </FeatureBoundary>
</template>

<script setup lang="ts">
import Can from '~/core/rbac/Can.vue'
import { PERMISSIONS } from '~/core/rbac/permissions'
import { ApiError } from '~/core/api/errors'
import {
  billFormSchema,
  billFormDefaults,
  type BillFormInput,
  type BillFormOutput,
} from '~/features/bills/schemas'
import { vendorDisplayName } from '~/features/vendors/services/vendorService'

definePageMeta({ layout: 'dashboard' })

const { locale } = useI18n()
const route = useRoute()
const toastStore = useToastStore()
const mutations = useBillMutations()

const { values, errors, submitting, clearError, handleSubmit } = useZodForm<BillFormInput>({
  schema: billFormSchema,
  initial: { ...billFormDefaults },
})

// Pre-select vendor when arriving with `?vendor_id=N` (from vendor detail page).
onMounted(() => {
  const v = Number(route.query.vendor_id)
  if (v > 0) values.vendor_id = v
})

// --- Vendors and accounts ---
const vendorParams = computed(() => ({ per_page: 200, is_active: true, sort_by: 'name_ar' as const, sort_dir: 'asc' as const }))
const { data: vendorListData } = useVendorsList(vendorParams)
const vendorOptions = computed(() => {
  return (vendorListData.value?.data ?? []).map(v => ({
    id: v.id,
    code: v.code,
    label: vendorDisplayName(v, locale.value) || (locale.value === 'ar' ? '(بدون اسم)' : '(unnamed)'),
  }))
})

// Accounts: only non-group (leaf) accounts can be posted to.
const accountParams = computed(() => ({ per_page: 500, is_group: false, is_active: true } as any))
const { data: accountListData } = useAccountsList(accountParams as any)
const accountOptions = computed(() => {
  return (accountListData.value?.data ?? []).map(a => ({
    id: a.id,
    label: `${a.code} — ${locale.value === 'ar' ? (a.name_ar || a.name_en) : (a.name_en || a.name_ar)}`,
  }))
})

// --- Vendor products (line picker source) ---
//
// Loads when a vendor is selected. The query is gated on a non-zero vendor_id
// so we don't fire while the picker still shows the placeholder option. The
// list refreshes naturally when the user changes vendor mid-form.
const selectedVendorId = computed<number | null>(() => values.vendor_id > 0 ? values.vendor_id : null)
// Recent-first ordering: backend pushes NULLs last so frequent items
// surface at the top of the picker; never-used items stay alphabetical.
const vendorProductsParams = computed(() => ({ per_page: 100, is_active: true, sort_by: 'last_used_at' as const, sort_dir: 'desc' as const }))
const { data: vendorProductsData } = useVendorProductsList(selectedVendorId, vendorProductsParams)
const vendorProducts = computed(() => vendorProductsData.value?.data ?? [])

const productPickerOpen = ref(false)
const productPickerLineIndex = ref<number | null>(null)

function openProductPicker(lineIdx: number) {
  productPickerLineIndex.value = lineIdx
  productPickerOpen.value = true
}

/**
 * Apply a saved vendor product to the active line. Fills description,
 * unit_price, vat_rate, and (when the product carries one) account_id.
 * Quantity is left as-is — it's the field the user is most likely to
 * customize per bill.
 */
function applyProduct(p: typeof vendorProducts.value[number]) {
  const idx = productPickerLineIndex.value
  if (idx == null) return
  const line = values.lines[idx]
  if (!line) return

  line.description = p.name
  line.unit_price = Number(p.unit_price) || 0
  if (p.default_vat_rate != null) line.vat_rate = Number(p.default_vat_rate)
  if (p.default_account_id != null) line.account_id = p.default_account_id
  // Track the FK so the BillLine observer can bump last_used_at on save.
  // Snapshot fields above remain authoritative for print/post — renaming
  // or repricing the product later won't rewrite this bill.
  line.vendor_product_id = p.id

  productPickerOpen.value = false
  productPickerLineIndex.value = null
}

// --- Line items helpers ---
function addLine() {
  values.lines.push({
    description: '',
    account_id: 0,
    vendor_product_id: null,
    quantity: 1,
    unit_price: 0,
    discount_percent: 0,
    vat_rate: 14,
    wht_rate: 0,
  })
}

function removeLine(idx: number) {
  if (values.lines.length <= 1) return
  values.lines.splice(idx, 1)
}

function lineHasError(idx: number, field: string): boolean {
  // useZodForm flattens nested errors as `lines.0.account_id`. We probe both
  // the flat dotted form and a nested-array form to stay compatible.
  const flat = `lines.${idx}.${field}`
  const e = errors.value as any
  return !!(e[flat] || (Array.isArray(e.lines) && e.lines[idx]?.[field]))
}

/**
 * Recompute the same numbers BillLine::calculateTotals() produces on the
 * server, so the user sees a faithful preview before submit. Steps:
 *   1. base = qty × unit_price
 *   2. discount = base × discount_percent / 100
 *   3. line_total = base − discount
 *   4. vat_amount = line_total × vat_rate / 100
 *   5. wht_amount = line_total × wht_rate / 100
 *   6. total = line_total + vat_amount − wht_amount
 */
function lineTotal(line: BillFormInput['lines'][number]) {
  const base = (Number(line.quantity) || 0) * (Number(line.unit_price) || 0)
  const discount = base * ((Number(line.discount_percent) || 0) / 100)
  const lineTotal = base - discount
  const vat = lineTotal * ((Number(line.vat_rate) || 0) / 100)
  const wht = lineTotal * ((Number(line.wht_rate) || 0) / 100)
  return lineTotal + vat - wht
}

const totals = computed(() => {
  let subtotal = 0
  let vat = 0
  let wht = 0
  for (const l of values.lines) {
    const base = (Number(l.quantity) || 0) * (Number(l.unit_price) || 0)
    const discount = base * ((Number(l.discount_percent) || 0) / 100)
    const lineSub = base - discount
    subtotal += lineSub
    vat += lineSub * ((Number(l.vat_rate) || 0) / 100)
    wht += lineSub * ((Number(l.wht_rate) || 0) / 100)
  }
  return { subtotal, vat, wht, total: subtotal + vat - wht }
})

function formatMoney(n: number | string | null | undefined) {
  return Number(n ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

async function onSubmit() {
  await handleSubmit(async (data: BillFormOutput) => {
    try {
      const created = await mutations.create.mutate(data)
      toastStore.success(locale.value === 'ar' ? 'تم إنشاء الفاتورة' : 'Bill created')
      navigateTo(`/bills/${created.id}`)
    } catch (e) {
      const err = e as ApiError
      if (err.code === 'validation' && err.fieldErrors) {
        for (const [field, msgs] of Object.entries(err.fieldErrors)) {
          ;(errors.value as any)[field] = Array.isArray(msgs) ? msgs[0] : String(msgs)
        }
      }
      toastStore.error(err.message || (locale.value === 'ar' ? 'تعذر الإنشاء' : 'Create failed'))
    }
  })
}
</script>

<style scoped>
@reference "~/assets/css/tokens.css";

.form-label { @apply block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5; }
.form-label-xs { @apply block text-[10px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1; }
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
textarea.form-input { height: auto; padding-block: 0.5rem; }
.form-input--error { border-color: color-mix(in oklab, var(--color-danger-500) 60%, transparent); }
.form-input--error:focus { border-color: var(--color-danger-500); box-shadow: 0 0 0 2px color-mix(in oklab, var(--color-danger-500) 25%, transparent); }

:global(html.dark) .form-input {
  background-color: var(--color-neutral-900);
  border-color: var(--color-neutral-800);
  color: var(--color-neutral-0);
}
</style>
