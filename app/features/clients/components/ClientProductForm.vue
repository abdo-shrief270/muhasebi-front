<template>
  <form @submit.prevent="onSubmit" class="space-y-4">
    <!-- Name -->
    <div>
      <label class="form-label">
        {{ locale === 'ar' ? 'اسم المنتج' : 'Product name' }}
        <span class="text-danger-500">*</span>
      </label>
      <input
        v-model="values.name"
        type="text"
        class="form-input"
        :class="{ 'form-input--error': fieldErrors.name }"
        :placeholder="locale === 'ar' ? 'مثال: محاسبة شهرية' : 'e.g. Monthly bookkeeping'"
        @input="fieldErrors.name = ''"
      />
      <p v-if="fieldErrors.name" class="form-error">{{ fieldErrors.name }}</p>
    </div>

    <!-- Description -->
    <div>
      <label class="form-label">{{ locale === 'ar' ? 'الوصف' : 'Description' }}</label>
      <textarea
        v-model="values.description"
        rows="2"
        class="form-input resize-none"
        :placeholder="locale === 'ar' ? 'تفاصيل اختيارية تظهر داخلياً.' : 'Optional details — internal only.'"
      />
    </div>

    <!-- Price + VAT -->
    <div class="grid grid-cols-2 gap-3">
      <div>
        <label class="form-label">
          {{ locale === 'ar' ? 'السعر' : 'Unit price' }}
          <span class="text-danger-500">*</span>
        </label>
        <input
          v-model.number="values.unit_price"
          type="number"
          step="0.01"
          min="0"
          class="form-input font-mono"
          :class="{ 'form-input--error': fieldErrors.unit_price }"
          dir="ltr"
          @input="fieldErrors.unit_price = ''"
        />
        <p v-if="fieldErrors.unit_price" class="form-error">{{ fieldErrors.unit_price }}</p>
      </div>
      <div>
        <label class="form-label">{{ locale === 'ar' ? 'ضريبة % (اختياري)' : 'VAT % (optional)' }}</label>
        <input
          v-model.number="values.default_vat_rate"
          type="number"
          step="0.01"
          min="0"
          max="100"
          class="form-input font-mono"
          dir="ltr"
          :placeholder="locale === 'ar' ? 'افتراضي المنشأة' : 'Tenant default'"
        />
        <p class="text-[11px] text-neutral-400 mt-1">
          {{ locale === 'ar'
            ? 'اتركه فارغاً لاستخدام نسبة المنشأة الافتراضية.'
            : 'Leave empty to inherit the tenant default at invoice time.' }}
        </p>
      </div>
    </div>

    <!-- Default revenue account -->
    <div>
      <label class="form-label">{{ locale === 'ar' ? 'الحساب الافتراضي' : 'Default Account' }}</label>
      <div class="relative">
        <select v-model.number="values.default_account_id" class="form-input">
          <option :value="null">
            {{ locale === 'ar' ? '— يحدد عند إنشاء الفاتورة —' : '— Pick at invoice time —' }}
          </option>
          <option v-for="a in accountOptions" :key="a.id" :value="a.id">
            {{ a.label }}
          </option>
        </select>
        <UIcon name="i-lucide-chevron-down" class="absolute end-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
      </div>
      <p class="text-[11px] text-neutral-400 mt-1">
        {{ locale === 'ar'
          ? 'إذا تم اختياره، يتم تعبئته تلقائياً عند اختيار البند في فاتورة.'
          : 'When set, the invoice line picker auto-fills this account.' }}
      </p>
    </div>

    <!-- Active toggle -->
    <label class="flex items-center gap-3 py-1.5 cursor-pointer select-none">
      <input
        v-model="values.is_active"
        type="checkbox"
        class="w-4 h-4 rounded-sm border-neutral-300 dark:border-neutral-700 text-primary-600 focus:ring-2 focus:ring-primary-500/25"
      />
      <span class="flex-1">
        <span class="text-sm font-medium text-neutral-900 dark:text-neutral-0">
          {{ locale === 'ar' ? 'نشط' : 'Active' }}
        </span>
        <span class="block text-[11px] text-neutral-500 dark:text-neutral-400">
          {{ locale === 'ar'
            ? 'المنتجات غير النشطة لا تظهر في قائمة منتقي بنود الفاتورة.'
            : "Inactive products don't appear in the invoice line picker." }}
        </span>
      </span>
    </label>

    <!-- Top-level error -->
    <Transition name="fade">
      <p
        v-if="topError"
        class="flex items-start gap-2 px-3 py-2 rounded-md bg-danger-50 dark:bg-danger-500/10 border border-danger-500/20 text-xs text-danger-700 dark:text-danger-400"
      >
        <UIcon name="i-lucide-alert-triangle" class="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
        <span>{{ topError }}</span>
      </p>
    </Transition>

    <!-- Actions -->
    <div class="flex items-center gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
      <UiAppButton type="button" variant="outline" class="flex-1" @click="$emit('cancel')">
        {{ $t('common.cancel') }}
      </UiAppButton>
      <UiAppButton
        type="submit"
        variant="primary"
        :icon="product ? 'i-lucide-save' : 'i-lucide-plus'"
        :loading="submitting"
        class="flex-1"
      >
        {{ product ? $t('common.save') : $t('common.create') }}
      </UiAppButton>
    </div>
  </form>
</template>

<script setup lang="ts">
import type { ClientProduct, ClientProductForm } from '~/features/clients/services/clientProductService'

const props = defineProps<{
  /** When set, the form is in edit mode and pre-fills from the product. */
  product?: ClientProduct | null
  /** Reflects parent's mutation loading state for the submit button. */
  submitting?: boolean
}>()

const emit = defineEmits<{
  submit: [form: ClientProductForm]
  cancel: []
}>()

const { locale } = useI18n()

const values = reactive<ClientProductForm>({
  name: '',
  description: '',
  unit_price: 0,
  default_vat_rate: null,
  default_account_id: null,
  is_active: true,
})

// Account picker options — only post-able leaf accounts; the user typically
// wants a revenue account here for client invoicing, but we don't filter by
// type so legacy / "other income" accounts stay available.
const accountParams = computed(() => ({ per_page: 500, is_group: false, is_active: true } as any))
const { data: accountListData } = useAccountsList(accountParams as any)
const accountOptions = computed(() => {
  return (accountListData.value?.data ?? []).map(a => ({
    id: a.id,
    label: `${a.code} — ${locale.value === 'ar' ? (a.name_ar || a.name_en) : (a.name_en || a.name_ar)}`,
  }))
})

const fieldErrors = reactive<Record<string, string>>({})
const topError = ref('')

watch(() => props.product, (p) => {
  if (p) {
    values.name = p.name ?? ''
    values.description = p.description ?? ''
    values.unit_price = Number(p.unit_price) || 0
    values.default_vat_rate = p.default_vat_rate
    values.default_account_id = p.default_account_id ?? null
    values.is_active = !!p.is_active
  } else {
    values.name = ''
    values.description = ''
    values.unit_price = 0
    values.default_vat_rate = 14
    values.default_account_id = null
    values.is_active = true
  }
  for (const k of Object.keys(fieldErrors)) fieldErrors[k] = ''
  topError.value = ''
}, { immediate: true })

function validate(): boolean {
  const required = locale.value === 'ar' ? 'هذا الحقل مطلوب.' : 'This field is required.'
  let ok = true
  if (!values.name.trim()) {
    fieldErrors.name = required
    ok = false
  }
  if (!Number.isFinite(Number(values.unit_price)) || Number(values.unit_price) < 0) {
    fieldErrors.unit_price = locale.value === 'ar' ? 'السعر يجب أن يكون رقماً صالحاً.' : 'Price must be a valid number.'
    ok = false
  }
  return ok
}

function onSubmit() {
  if (!validate()) return
  topError.value = ''
  emit('submit', {
    name: values.name.trim(),
    description: values.description?.trim() || null,
    unit_price: Number(values.unit_price) || 0,
    default_vat_rate: values.default_vat_rate != null && values.default_vat_rate !== ('' as any)
      ? Number(values.default_vat_rate)
      : null,
    default_account_id: values.default_account_id ?? null,
    is_active: !!values.is_active,
  })
}

/** Parent calls this after a failed mutation to map server-side validation. */
defineExpose({
  applyApiErrors(err: { fieldErrors?: Record<string, string[]>; message?: string }) {
    if (err.fieldErrors) {
      for (const [k, msgs] of Object.entries(err.fieldErrors)) {
        if (msgs?.[0]) fieldErrors[k] = msgs[0]
      }
    }
    topError.value = err.message || ''
  },
})
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

.fade-enter-active, .fade-leave-active { transition: opacity 150ms var(--ease-standard); }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
