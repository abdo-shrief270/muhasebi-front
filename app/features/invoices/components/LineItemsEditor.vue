<template>
  <section
    ref="editorRoot"
    class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border"
    :class="error ? 'border-danger-500/40' : 'border-neutral-200 dark:border-neutral-800'"
  >
    <header v-if="!hideHeader" class="px-4 py-2.5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-3">
      <h3 class="text-sm font-semibold text-neutral-900 dark:text-neutral-0 flex items-center gap-2">
        <UIcon name="i-lucide-list" class="w-4 h-4 text-neutral-400" />
        {{ title || (locale === 'ar' ? 'بنود الفاتورة' : 'Line items') }}
        <span class="text-[11px] font-normal text-neutral-500 dark:text-neutral-400 tabular-nums">
          ({{ modelValue.length }})
        </span>
      </h3>
      <UiAppButton type="button" variant="outline" size="sm" icon="i-lucide-plus" @click="add">
        {{ locale === 'ar' ? 'إضافة بند' : 'Add line' }}
      </UiAppButton>
    </header>

    <!-- Banner: no client picked yet -->
    <div
      v-if="!clientId"
      class="px-4 py-2.5 text-[11px] text-neutral-600 dark:text-neutral-300 bg-info-500/5 border-b border-info-500/20 flex items-center gap-1.5"
    >
      <UIcon name="i-lucide-info" class="w-3.5 h-3.5 text-info-500" />
      {{ locale === 'ar'
        ? 'اختر عميلاً أولاً، ثم اختر منتجات من قائمته.'
        : 'Pick a client first, then choose items from their saved products.' }}
    </div>

    <!-- Banner: client picked but no products yet -->
    <div
      v-else-if="clientId && !productsLoading && allProducts.length === 0"
      class="px-4 py-2.5 text-[11px] text-warning-700 dark:text-warning-500 bg-warning-500/10 border-b border-warning-500/30 flex items-start gap-1.5"
    >
      <UIcon name="i-lucide-alert-circle" class="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
      <span class="flex-1">
        {{ locale === 'ar'
          ? 'لا يوجد منتجات لهذا العميل بعد. أضف أول منتج لتبدأ.'
          : 'No products saved for this client yet. Add your first one to get started.' }}
      </span>
      <button
        type="button"
        class="text-warning-700 dark:text-warning-400 font-semibold underline-offset-2 hover:underline"
        @click="openInlineCreate(0)"
      >
        + {{ locale === 'ar' ? 'منتج جديد' : 'New product' }}
      </button>
    </div>

    <div>
      <table class="w-full text-sm border-collapse min-w-[640px]">
        <thead class="bg-neutral-50 dark:bg-neutral-950/40">
          <tr class="border-b border-neutral-200 dark:border-neutral-800">
            <th class="th-cell text-start">{{ locale === 'ar' ? 'المنتج' : 'Product' }}</th>
            <th class="th-cell text-end w-[80px]">{{ locale === 'ar' ? 'الكمية' : 'Qty' }}</th>
            <th class="th-cell text-end w-[110px]">{{ locale === 'ar' ? 'السعر' : 'Price' }}</th>
            <th class="th-cell text-end w-[82px]">{{ locale === 'ar' ? 'خصم %' : 'Disc %' }}</th>
            <th class="th-cell text-end w-[82px]">{{ locale === 'ar' ? 'ضريبة %' : 'VAT %' }}</th>
            <th class="th-cell text-end w-[110px]">{{ locale === 'ar' ? 'الإجمالي' : 'Total' }}</th>
            <th class="w-9"></th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(line, i) in modelValue"
            :key="i"
            class="border-b border-neutral-100 dark:border-neutral-800/60 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/20 transition-colors"
            :class="{ 'bg-warning-500/5': isOrphan(line) }"
          >
            <td class="px-2 py-1.5 relative align-top">
              <div class="relative space-y-1">
                <!-- Picker trigger button -->
                <button
                  type="button"
                  class="picker-btn"
                  :class="[
                    line.client_product_id ? 'picker-btn--linked' : isOrphan(line) ? 'picker-btn--orphan' : 'picker-btn--empty',
                    { 'picker-btn--disabled': !clientId },
                  ]"
                  :disabled="!clientId"
                  @click="togglePicker(i)"
                  @keydown="onTriggerKeydown(i, $event)"
                >
                  <UIcon
                    v-if="line.client_product_id"
                    name="i-lucide-package-check"
                    class="w-3.5 h-3.5 text-primary-600 dark:text-primary-400 flex-shrink-0"
                  />
                  <UIcon
                    v-else-if="isOrphan(line)"
                    name="i-lucide-alert-triangle"
                    class="w-3.5 h-3.5 text-warning-600 dark:text-warning-500 flex-shrink-0"
                  />
                  <UIcon
                    v-else
                    name="i-lucide-package"
                    class="w-3.5 h-3.5 text-neutral-400 flex-shrink-0"
                  />
                  <span class="truncate flex-1 text-start">
                    <template v-if="line.client_product_id || line.description">
                      {{ line.description || (locale === 'ar' ? 'منتج بدون اسم' : 'Unnamed product') }}
                    </template>
                    <template v-else>
                      {{ clientId
                        ? (locale === 'ar' ? 'اختر منتجاً…' : 'Pick a product…')
                        : (locale === 'ar' ? 'اختر عميلاً أولاً' : 'Pick a client first') }}
                    </template>
                  </span>
                  <UIcon name="i-lucide-chevron-down" class="w-3 h-3 text-neutral-400 flex-shrink-0" />
                </button>

                <!-- Picker dropdown -->
                <div
                  v-if="openIndex === i && clientId"
                  class="absolute z-30 start-0 end-0 mt-1 rounded-md border border-neutral-200 dark:border-neutral-800 bg-neutral-0 dark:bg-neutral-900 shadow-overlay overflow-hidden"
                  @click.stop
                >
                  <!--
                    Two modes for the dropdown content:
                    1. Picker (default): search + list + "+ Add new" footer.
                    2. Inline create: full-height form, list hidden so the form is
                       never cramped regardless of how many products exist.
                  -->

                  <!-- ─── PICKER MODE ─── -->
                  <template v-if="!inlineCreateOpen">
                    <!-- Search box -->
                    <div class="p-1.5 border-b border-neutral-200 dark:border-neutral-800 sticky top-0 bg-neutral-0 dark:bg-neutral-900 z-10">
                      <div class="relative">
                        <UIcon name="i-lucide-search" class="absolute start-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
                        <input
                          ref="searchInput"
                          v-model="searchTerm"
                          type="text"
                          class="w-full ps-7 pe-2 h-7 text-xs rounded-sm border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 outline-none focus:border-primary-500"
                          :placeholder="locale === 'ar' ? 'بحث…' : 'Search products…'"
                          autocomplete="off"
                          @keydown="onSearchKeydown(i, $event)"
                        />
                      </div>
                    </div>

                    <!-- Scrollable list area -->
                    <div class="max-h-64 overflow-y-auto">
                      <!-- Loading -->
                      <div
                        v-if="productsLoading"
                        class="px-3 py-3 text-[11px] text-neutral-400 inline-flex items-center gap-1.5"
                      >
                        <UIcon name="i-lucide-loader-2" class="w-3 h-3 animate-spin" />
                        {{ locale === 'ar' ? 'جارٍ التحميل...' : 'Loading…' }}
                      </div>

                      <!-- Products list -->
                      <ul v-else-if="filteredProducts.length > 0">
                        <li
                          v-for="(p, idx) in filteredProducts"
                          :key="p.id"
                          class="flex items-center justify-between gap-2 px-3 py-2 cursor-pointer text-sm transition-colors"
                          :class="idx === highlightedIdx
                            ? 'bg-primary-500/10 text-primary-700 dark:text-primary-300'
                            : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200'"
                          @mousedown.prevent="pickProduct(i, p)"
                          @mousemove="highlightedIdx = idx"
                        >
                          <div class="flex items-center gap-2 min-w-0">
                            <UIcon name="i-lucide-package" class="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
                            <span class="truncate">{{ p.name }}</span>
                          </div>
                          <span class="font-mono text-xs tabular-nums text-neutral-500 dark:text-neutral-400 flex-shrink-0" dir="ltr">
                            {{ Number(p.unit_price).toLocaleString() }}
                          </span>
                        </li>
                      </ul>

                      <!-- No matches -->
                      <div
                        v-else-if="!productsLoading"
                        class="px-3 py-2.5 text-[11px] text-neutral-500 dark:text-neutral-400"
                      >
                        {{ searchTerm
                          ? (locale === 'ar' ? 'لا توجد منتجات مطابقة.' : 'No matching products.')
                          : (locale === 'ar' ? 'لا توجد منتجات بعد.' : 'No products yet.') }}
                      </div>
                    </div>

                    <!-- "Add new product" trigger (only in picker mode) -->
                    <button
                      type="button"
                      class="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-primary-700 dark:text-primary-400 hover:bg-primary-500/10 transition-colors border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-950/40"
                      @mousedown.prevent="openInlineCreate(i)"
                    >
                      <UIcon name="i-lucide-plus-circle" class="w-3.5 h-3.5" />
                      {{ locale === 'ar' ? 'إضافة منتج جديد لهذا العميل' : 'Add a new product for this client' }}
                    </button>
                  </template>

                  <!-- ─── INLINE CREATE MODE ─── -->
                  <div v-else class="p-3 space-y-2.5" @click.stop>
                    <!-- Header with back link -->
                    <div class="flex items-center justify-between gap-2 -mx-1 -mt-1 mb-1">
                      <button
                        type="button"
                        class="inline-flex items-center gap-1 text-[11px] font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-0 transition-colors"
                        @click="cancelInlineCreate"
                      >
                        <UIcon name="i-lucide-arrow-left" class="w-3 h-3 rtl:rotate-180" />
                        {{ locale === 'ar' ? 'القائمة' : 'Back' }}
                      </button>
                      <p class="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                        {{ locale === 'ar' ? 'منتج جديد' : 'New product' }}
                      </p>
                    </div>

                    <!-- Name (full width) -->
                    <div>
                      <label class="block text-[10px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1">
                        {{ locale === 'ar' ? 'الاسم' : 'Name' }}
                      </label>
                      <input
                        v-model="newProductForm.name"
                        type="text"
                        class="w-full h-8 px-2 text-xs rounded-sm border border-neutral-200 dark:border-neutral-800 bg-neutral-0 dark:bg-neutral-900 outline-none focus:border-primary-500"
                        :placeholder="locale === 'ar' ? 'اسم المنتج' : 'Product name'"
                        @keydown="onCreateKeydown(i, $event)"
                      />
                    </div>

                    <!-- Price + VAT side by side -->
                    <div class="grid grid-cols-2 gap-2">
                      <div>
                        <label class="block text-[10px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1">
                          {{ locale === 'ar' ? 'السعر' : 'Price' }}
                        </label>
                        <input
                          v-model.number="newProductForm.unit_price"
                          type="number"
                          step="0.01"
                          min="0"
                          class="w-full h-8 px-2 text-xs font-mono rounded-sm border border-neutral-200 dark:border-neutral-800 bg-neutral-0 dark:bg-neutral-900 outline-none focus:border-primary-500"
                          dir="ltr"
                          @keydown="onCreateKeydown(i, $event)"
                        />
                      </div>
                      <div>
                        <label class="block text-[10px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1">
                          {{ locale === 'ar' ? 'ضريبة %' : 'VAT %' }}
                        </label>
                        <input
                          v-model.number="newProductForm.default_vat_rate"
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          class="w-full h-8 px-2 text-xs font-mono rounded-sm border border-neutral-200 dark:border-neutral-800 bg-neutral-0 dark:bg-neutral-900 outline-none focus:border-primary-500"
                          dir="ltr"
                          @keydown="onCreateKeydown(i, $event)"
                        />
                      </div>
                    </div>

                    <p v-if="createError" class="text-[10px] text-danger-600 dark:text-danger-500 flex items-center gap-1">
                      <UIcon name="i-lucide-alert-circle" class="w-3 h-3" />
                      {{ createError }}
                    </p>

                    <div class="flex items-center gap-1.5 pt-1">
                      <UiAppButton
                        type="button"
                        variant="outline"
                        size="sm"
                        class="flex-1"
                        @click="cancelInlineCreate"
                      >
                        {{ $t('common.cancel') }}
                      </UiAppButton>
                      <UiAppButton
                        type="button"
                        variant="primary"
                        size="sm"
                        class="flex-1"
                        :loading="creating"
                        icon="i-lucide-check"
                        @click="submitInlineCreate(i)"
                      >
                        {{ locale === 'ar' ? 'إنشاء وإضافة' : 'Create & add' }}
                      </UiAppButton>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Orphan warning -->
              <p
                v-if="isOrphan(line)"
                class="mt-1 text-[10px] text-warning-700 dark:text-warning-500 flex items-center gap-1"
              >
                <UIcon name="i-lucide-alert-triangle" class="w-3 h-3" />
                {{ locale === 'ar'
                  ? 'بند بدون منتج — اربطه أو احذفه قبل الحفظ.'
                  : 'Freeform line — link a product or remove before saving.' }}
              </p>

              <!--
                Per-line GL revenue account override. Auto-filled from
                product.default_account_id when the user picks a saved
                product; surfacing it here lets them see the choice and
                override per-line (e.g. when one item should post to a
                different revenue account on the same invoice).
                Empty value = inherit the tenant default at GL post time.
              -->
              <div class="relative">
                <UIcon name="i-lucide-coins" class="absolute start-2 top-1/2 -translate-y-1/2 w-3 h-3 text-neutral-400 pointer-events-none" />
                <select
                  v-model.number="line.account_id"
                  class="w-full ps-7 pe-6 h-7 text-[11px] font-mono rounded-sm border border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-950/40 text-neutral-700 dark:text-neutral-300 outline-none focus:border-primary-500 transition-colors appearance-none"
                  dir="ltr"
                  :title="accountTitleForLine(line)"
                  @change="onLineAccountChange(i, $event)"
                >
                  <option :value="null">
                    {{ locale === 'ar' ? '— حساب افتراضي —' : '— Default account —' }}
                  </option>
                  <option v-for="a in accountOptions" :key="a.id" :value="a.id">
                    {{ a.label }}
                  </option>
                </select>
                <UIcon name="i-lucide-chevron-down" class="absolute end-2 top-1/2 -translate-y-1/2 w-3 h-3 text-neutral-400 pointer-events-none" />
              </div>
            </td>
            <td class="px-2 py-1.5 align-top">
              <input v-model.number="line.quantity" type="number" step="0.01" min="0.01" class="cell-input cell-input--num" dir="ltr" />
            </td>
            <td class="px-2 py-1.5 align-top">
              <input v-model.number="line.unit_price" type="number" step="0.01" min="0" class="cell-input cell-input--num" dir="ltr" />
            </td>
            <td class="px-2 py-1.5 align-top">
              <input v-model.number="line.discount_percent" type="number" step="0.01" min="0" max="100" class="cell-input cell-input--num" dir="ltr" />
            </td>
            <td class="px-2 py-1.5 align-top">
              <input v-model.number="line.vat_rate" type="number" step="0.01" min="0" class="cell-input cell-input--num" dir="ltr" />
            </td>
            <td class="px-3 py-2 text-end font-mono text-sm tabular-nums text-neutral-700 dark:text-neutral-200 align-top" dir="ltr">
              {{ lineTotal(line).toLocaleString() }}
            </td>
            <td class="px-1 py-2 text-center align-top">
              <button
                v-if="modelValue.length > 1"
                type="button"
                @click="remove(i)"
                class="w-6 h-6 inline-flex items-center justify-center rounded-sm text-neutral-300 hover:text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-500/10 transition-colors"
                :title="locale === 'ar' ? 'حذف البند' : 'Remove line'"
              >
                <UIcon name="i-lucide-x" class="w-3.5 h-3.5" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <p
      v-if="error"
      class="px-4 py-2 text-xs text-danger-600 dark:text-danger-500 flex items-center gap-1 border-t border-danger-500/20 bg-danger-50 dark:bg-danger-500/5"
    >
      <UIcon name="i-lucide-alert-circle" class="w-3.5 h-3.5" />
      {{ error }}
    </p>
  </section>
</template>

<script setup lang="ts">
import { lineTotal } from '~/features/invoices/utils/lineMath'
import type { InvoiceLine } from '~/features/invoices/utils/lineMath'
import type { ClientProduct } from '~/features/clients/services/clientProductService'
import type { ApiError } from '~/core/api/errors'

const props = defineProps<{
  modelValue: InvoiceLine[]
  /** Inline error message rendered under the table — typically `errors.lines`. */
  error?: string
  /** Override the section header title. Defaults to "Line items". */
  title?: string
  /** Hide the section header (use when the editor is embedded in a slideover that already has its own heading). */
  hideHeader?: boolean
  /** Default values applied when the user clicks "Add line". */
  defaultLine?: Partial<InvoiceLine>
  /**
   * Active client id. Required for the picker to function. When unset, lines
   * can only be removed — adding new lines is gated behind picking a client.
   */
  clientId?: number | null
}>()

const emit = defineEmits<{
  'update:modelValue': [lines: InvoiceLine[]]
}>()

const { locale } = useI18n()
const toastStore = useToastStore()

// --- Product fetch ---
const clientIdRef = computed(() => props.clientId ?? null)
// Sort by `last_used_at desc NULLS LAST` so frequently-billed items
// for this client show first; never-used items stay alphabetical.
const productsParams = computed(() => ({ sort_by: 'last_used_at', sort_dir: 'desc' as const }))
const productsQuery = useClientProducts(clientIdRef, productsParams)

// --- Accounts (per-line GL override) ---
//
// Loaded once per editor mount. Only post-able leaves: the GL service
// rejects journal entries against group accounts at post time, so they're
// never valid here. Cached 60s by useAccountsList.
const accountParams = computed(() => ({ per_page: 500, is_group: false, is_active: true } as any))
const { data: accountsData } = useAccountsList(accountParams as any)
const accountOptions = computed(() => {
  return (accountsData.value?.data ?? []).map(a => ({
    id: a.id,
    label: `${a.code} — ${locale.value === 'ar' ? (a.name_ar || a.name_en) : (a.name_en || a.name_ar)}`,
  }))
})

/** Tooltip on the per-line account select: full account label so the
 *  truncated short form is still inspectable. */
function accountTitleForLine(line: InvoiceLine): string {
  if (line.account_id == null) return ''
  const a = accountOptions.value.find(o => o.id === line.account_id)
  return a?.label ?? ''
}

/**
 * Mirror the user's selection back through the v-model array so consumers
 * see the change. Native <select v-model.number> on an iterated object
 * already mutates in place, but emitting an explicit update keeps the
 * shape consistent with how pickProduct() updates the line.
 */
function onLineAccountChange(_i: number, _e: Event) {
  emit('update:modelValue', [...props.modelValue])
}
const productsLoading = computed(() => productsQuery.loading.value)
const allProducts = computed<ClientProduct[]>(() => productsQuery.data.value?.data ?? [])

const { create: createMutation } = useClientProductMutations()
const creating = computed(() => createMutation.loading.value)

// --- Picker UI state ---
/** Which row's picker is open. -1 = none. */
const openIndex = ref(-1)
const highlightedIdx = ref(0)
const searchTerm = ref('')
const searchInput = ref<HTMLInputElement | null>(null)
const anyOpen = computed(() => openIndex.value !== -1)

// Inline-create form
const inlineCreateOpen = ref(false)
const newProductForm = reactive({
  name: '',
  unit_price: 0,
  default_vat_rate: 14 as number | null,
})
const createError = ref('')

const filteredProducts = computed<ClientProduct[]>(() => {
  if (openIndex.value === -1) return []
  const term = searchTerm.value.trim().toLowerCase()
  if (!term) return allProducts.value.slice(0, 25)
  return allProducts.value
    .filter(p => p.name.toLowerCase().includes(term))
    .slice(0, 25)
})

// A line is "orphan" if it has a description but no FK — happens to legacy
// freeform lines persisted before product-only mode landed. We flag them so
// the user is prompted to pick a product or remove the row.
function isOrphan(line: InvoiceLine): boolean {
  return !line.client_product_id && !!line.description?.trim()
}

function togglePicker(i: number) {
  if (!props.clientId) return
  if (openIndex.value === i) {
    closePicker()
    return
  }
  openIndex.value = i
  searchTerm.value = ''
  highlightedIdx.value = 0
  inlineCreateOpen.value = false
  // Focus the search input on the next tick once the dropdown is rendered.
  nextTick(() => searchInput.value?.focus())
}

function onTriggerKeydown(i: number, e: KeyboardEvent) {
  if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
    e.preventDefault()
    if (openIndex.value !== i) togglePicker(i)
  }
}

function onSearchKeydown(i: number, e: KeyboardEvent) {
  if (e.key === 'Escape') {
    closePicker()
    return
  }
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    moveHighlight(1)
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    moveHighlight(-1)
  } else if (e.key === 'Enter') {
    e.preventDefault()
    const product = filteredProducts.value[highlightedIdx.value]
    if (product) pickProduct(i, product)
  }
}

function moveHighlight(delta: number) {
  const len = filteredProducts.value.length
  if (len === 0) return
  highlightedIdx.value = ((highlightedIdx.value + delta) % len + len) % len
}

function pickProduct(i: number, product: ClientProduct) {
  const next = [...props.modelValue]
  const current = next[i] ?? defaults()
  next[i] = {
    ...current,
    client_product_id: product.id,
    description: product.name,
    unit_price: Number(product.unit_price) || 0,
    vat_rate: product.default_vat_rate != null ? Number(product.default_vat_rate) : current.vat_rate,
    // Auto-fill the GL revenue account when the product carries one.
    // Falls back to the line's existing account_id so picking a product
    // without a default doesn't clobber an account the user already set.
    account_id: product.default_account_id ?? current.account_id ?? null,
  }
  emit('update:modelValue', next)
  closePicker()
}

function closePicker() {
  openIndex.value = -1
  highlightedIdx.value = 0
  searchTerm.value = ''
  inlineCreateOpen.value = false
  createError.value = ''
}

// --- Inline create ---
function openInlineCreate(i: number) {
  // If called from the empty-state banner the picker may not be open yet —
  // open it on row 0 so the user lands somewhere sensible. From inside an
  // already-open dropdown we just flip the flag.
  if (openIndex.value === -1) togglePicker(i)
  inlineCreateOpen.value = true
  newProductForm.name = searchTerm.value.trim() // pre-fill with whatever the user was searching for
  newProductForm.unit_price = 0
  newProductForm.default_vat_rate = 14
  createError.value = ''
  nextTick(() => {
    const inp = document.querySelector<HTMLInputElement>('input[placeholder*="Product name"], input[placeholder*="اسم المنتج"]')
    inp?.focus()
  })
}

function cancelInlineCreate() {
  inlineCreateOpen.value = false
  createError.value = ''
  // Refocus the search input when returning to picker mode so the user
  // can keep typing without an extra click.
  nextTick(() => searchInput.value?.focus())
}

function onCreateKeydown(i: number, e: KeyboardEvent) {
  if (e.key === 'Enter') {
    e.preventDefault()
    submitInlineCreate(i)
  } else if (e.key === 'Escape') {
    cancelInlineCreate()
  }
}

async function submitInlineCreate(i: number) {
  if (!props.clientId) return
  createError.value = ''
  const name = newProductForm.name.trim()
  if (!name) {
    createError.value = locale.value === 'ar' ? 'اسم المنتج مطلوب.' : 'Product name is required.'
    return
  }
  if (!Number.isFinite(Number(newProductForm.unit_price)) || Number(newProductForm.unit_price) < 0) {
    createError.value = locale.value === 'ar' ? 'السعر يجب أن يكون رقماً صالحاً.' : 'Price must be a valid number.'
    return
  }
  try {
    const product = await createMutation.mutate({
      clientId: props.clientId,
      form: {
        name,
        unit_price: Number(newProductForm.unit_price) || 0,
        default_vat_rate: newProductForm.default_vat_rate != null
          ? Number(newProductForm.default_vat_rate)
          : null,
      },
    })
    toastStore.success(locale.value === 'ar' ? 'تم إنشاء المنتج' : 'Product created')
    pickProduct(i, product)
  } catch (e) {
    const err = e as ApiError
    createError.value = err.fieldErrors?.name?.[0]
      || err.message
      || (locale.value === 'ar' ? 'فشل إنشاء المنتج' : 'Failed to create product')
  }
}

// --- Click-outside ---
const editorRoot = ref<HTMLElement | null>(null)
function onDocClick(e: MouseEvent) {
  if (!editorRoot.value) return
  if (!editorRoot.value.contains(e.target as Node)) closePicker()
}

onMounted(() => document.addEventListener('mousedown', onDocClick))
onBeforeUnmount(() => document.removeEventListener('mousedown', onDocClick))

// --- Row CRUD ---
function defaults(): InvoiceLine {
  return {
    client_product_id: null,
    account_id: null,
    description: '',
    quantity: 1,
    unit_price: 0,
    discount_percent: 0,
    vat_rate: 14,
    ...props.defaultLine,
  }
}

function add() {
  emit('update:modelValue', [...props.modelValue, defaults()])
}

function remove(i: number) {
  const next = [...props.modelValue]
  next.splice(i, 1)
  emit('update:modelValue', next)
  if (openIndex.value === i) closePicker()
}

watch(() => props.modelValue.length, (len) => {
  if (openIndex.value >= len) closePicker()
})
</script>

<style scoped>
@reference "~/assets/css/tokens.css";

.th-cell {
  @apply px-3 py-2 text-[10px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider whitespace-nowrap;
}

.cell-input {
  width: 100%;
  padding: 0.375rem 0.5rem;
  font-size: 0.8125rem;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-neutral-900);
  outline: none;
  transition: border-color 150ms var(--ease-standard), background-color 150ms var(--ease-standard);
}
.cell-input:hover { background-color: var(--color-neutral-50); }
.cell-input:focus {
  border-color: var(--color-primary-500);
  background-color: var(--color-neutral-0, #fff);
  box-shadow: 0 0 0 2px color-mix(in oklab, var(--color-primary-500) 15%, transparent);
}
.cell-input--num { text-align: end; font-family: var(--font-mono); font-variant-numeric: tabular-nums; }

:global(html.dark) .cell-input { color: var(--color-neutral-0); }
:global(html.dark) .cell-input:hover { background-color: rgba(255,255,255,0.04); }
:global(html.dark) .cell-input:focus { background-color: var(--color-neutral-900); }

/* Picker trigger — looks like a button, sized to match the cell-input. */
.picker-btn {
  width: 100%;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.5rem;
  font-size: 0.8125rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-neutral-200);
  background-color: var(--color-neutral-0, #fff);
  color: var(--color-neutral-900);
  text-align: start;
  cursor: pointer;
  transition: border-color 150ms var(--ease-standard), background-color 150ms var(--ease-standard);
}
.picker-btn:hover:not(:disabled) {
  border-color: var(--color-primary-500);
  background-color: color-mix(in oklab, var(--color-primary-500) 4%, var(--color-neutral-0, #fff));
}
.picker-btn:focus-visible {
  outline: none;
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 2px color-mix(in oklab, var(--color-primary-500) 25%, transparent);
}
.picker-btn--linked { border-color: color-mix(in oklab, var(--color-primary-500) 40%, transparent); }
.picker-btn--orphan { border-color: color-mix(in oklab, var(--color-warning-500) 50%, transparent); background-color: color-mix(in oklab, var(--color-warning-500) 6%, var(--color-neutral-0, #fff)); }
.picker-btn--empty   { color: var(--color-neutral-400); }
.picker-btn--disabled { opacity: 0.6; cursor: not-allowed; }

:global(html.dark) .picker-btn {
  background-color: var(--color-neutral-900);
  border-color: var(--color-neutral-800);
  color: var(--color-neutral-0);
}
:global(html.dark) .picker-btn:hover:not(:disabled) {
  background-color: color-mix(in oklab, var(--color-primary-500) 8%, var(--color-neutral-900));
}
:global(html.dark) .picker-btn--orphan {
  background-color: color-mix(in oklab, var(--color-warning-500) 12%, var(--color-neutral-900));
}
</style>
