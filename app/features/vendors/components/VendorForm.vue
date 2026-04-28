<template>
  <form @submit.prevent="onSubmit" class="space-y-5">
    <!-- Identity -->
    <section>
      <h4 class="form-section-title">
        <UIcon name="i-lucide-building-2" class="w-3.5 h-3.5 text-neutral-400" />
        {{ locale === 'ar' ? 'بيانات المورد' : 'Vendor Identity' }}
      </h4>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label class="form-label">
            {{ locale === 'ar' ? 'الاسم بالعربية' : 'Name (Arabic)' }}
            <span class="text-danger-500">*</span>
          </label>
          <input
            v-model="values.name_ar"
            type="text"
            class="form-input"
            :class="{ 'form-input--error': errors.name_ar }"
            dir="rtl"
            :placeholder="locale === 'ar' ? 'مثال: شركة الأمل للتوريدات' : 'مثال: شركة الأمل للتوريدات'"
            @input="clearError('name_ar')"
          />
          <p v-if="errors.name_ar" class="form-error">
            {{ errors.name_ar === 'name_required'
              ? (locale === 'ar' ? 'الرجاء إدخال الاسم بالعربية أو الإنجليزية.' : 'Provide a name in Arabic or English.')
              : errors.name_ar }}
          </p>
        </div>
        <div>
          <label class="form-label">
            {{ locale === 'ar' ? 'الاسم بالإنجليزية' : 'Name (English)' }}
          </label>
          <input
            v-model="values.name_en"
            type="text"
            class="form-input"
            dir="ltr"
            placeholder="e.g. Acme Supplies Co."
            @input="clearError('name_ar')"
          />
        </div>
        <div>
          <label class="form-label">{{ locale === 'ar' ? 'الكود' : 'Code' }}</label>
          <input
            v-model="values.code"
            type="text"
            class="form-input font-mono"
            dir="ltr"
            placeholder="VEN-0001"
          />
          <p class="text-[11px] text-neutral-400 mt-1">
            {{ locale === 'ar' ? 'كود اختياري للتعرف الداخلي.' : 'Optional internal code.' }}
          </p>
        </div>
        <div>
          <label class="form-label">{{ locale === 'ar' ? 'العملة' : 'Currency' }}</label>
          <div class="relative">
            <select v-model="values.currency" class="form-input">
              <option value="EGP">EGP — {{ locale === 'ar' ? 'جنيه مصري' : 'Egyptian Pound' }}</option>
              <option value="USD">USD — {{ locale === 'ar' ? 'دولار أمريكي' : 'US Dollar' }}</option>
              <option value="EUR">EUR — {{ locale === 'ar' ? 'يورو' : 'Euro' }}</option>
              <option value="SAR">SAR — {{ locale === 'ar' ? 'ريال سعودي' : 'Saudi Riyal' }}</option>
              <option value="AED">AED — {{ locale === 'ar' ? 'درهم إماراتي' : 'UAE Dirham' }}</option>
            </select>
            <UIcon name="i-lucide-chevron-down" class="absolute end-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
          </div>
        </div>
      </div>
    </section>

    <!-- Legal -->
    <section>
      <h4 class="form-section-title">
        <UIcon name="i-lucide-scale" class="w-3.5 h-3.5 text-neutral-400" />
        {{ locale === 'ar' ? 'البيانات القانونية' : 'Legal Information' }}
      </h4>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label class="form-label">{{ locale === 'ar' ? 'الرقم الضريبي' : 'Tax ID (TIN)' }}</label>
          <input
            v-model="values.tax_id"
            type="text"
            class="form-input font-mono"
            :class="{ 'form-input--error': errors.tax_id }"
            dir="ltr"
            placeholder="123-456-789"
            @input="clearError('tax_id')"
          />
          <p v-if="errors.tax_id" class="form-error">{{ errors.tax_id }}</p>
          <p v-else class="text-[11px] text-neutral-400 mt-1">
            {{ locale === 'ar' ? '9 أرقام مصرية بدون شرطات.' : '9-digit Egyptian TIN, dashes optional.' }}
          </p>
        </div>
        <div>
          <label class="form-label">{{ locale === 'ar' ? 'السجل التجاري' : 'Commercial Reg.' }}</label>
          <input v-model="values.commercial_register" type="text" class="form-input font-mono" dir="ltr" />
        </div>
        <div>
          <label class="form-label">{{ locale === 'ar' ? 'تسجيل القيمة المضافة' : 'VAT Registration' }}</label>
          <input v-model="values.vat_registration" type="text" class="form-input font-mono" dir="ltr" />
        </div>
      </div>
    </section>

    <!-- Reachability -->
    <section>
      <h4 class="form-section-title">
        <UIcon name="i-lucide-mail" class="w-3.5 h-3.5 text-neutral-400" />
        {{ locale === 'ar' ? 'بيانات التواصل' : 'Reachability' }}
      </h4>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label class="form-label">{{ locale === 'ar' ? 'البريد الإلكتروني' : 'Email' }}</label>
          <input
            v-model="values.email"
            type="email"
            class="form-input"
            :class="{ 'form-input--error': errors.email }"
            dir="ltr"
            placeholder="vendor@example.com"
            @input="clearError('email')"
          />
          <p v-if="errors.email" class="form-error">{{ errors.email }}</p>
        </div>
        <div>
          <label class="form-label">{{ locale === 'ar' ? 'الهاتف' : 'Phone' }}</label>
          <input
            v-model="values.phone"
            type="tel"
            class="form-input"
            :class="{ 'form-input--error': errors.phone }"
            dir="ltr"
            @input="clearError('phone')"
          />
          <p v-if="errors.phone" class="form-error">{{ errors.phone }}</p>
        </div>
      </div>
    </section>

    <!-- Primary contact -->
    <section>
      <h4 class="form-section-title">
        <UIcon name="i-lucide-user" class="w-3.5 h-3.5 text-neutral-400" />
        {{ locale === 'ar' ? 'جهة الاتصال الرئيسية' : 'Primary Contact' }}
      </h4>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label class="form-label">{{ locale === 'ar' ? 'الاسم' : 'Name' }}</label>
          <input v-model="values.primary_contact.name" type="text" class="form-input" />
        </div>
        <div>
          <label class="form-label">{{ locale === 'ar' ? 'المنصب' : 'Role' }}</label>
          <input v-model="values.primary_contact.role" type="text" class="form-input" />
        </div>
        <div>
          <label class="form-label">{{ locale === 'ar' ? 'البريد' : 'Email' }}</label>
          <input v-model="values.primary_contact.email" type="email" class="form-input" dir="ltr" />
        </div>
        <div>
          <label class="form-label">{{ locale === 'ar' ? 'الهاتف' : 'Phone' }}</label>
          <input v-model="values.primary_contact.phone" type="tel" class="form-input" dir="ltr" />
        </div>
      </div>
    </section>

    <!-- Address (bilingual) -->
    <section>
      <h4 class="form-section-title">
        <UIcon name="i-lucide-map-pin" class="w-3.5 h-3.5 text-neutral-400" />
        {{ locale === 'ar' ? 'العنوان' : 'Address' }}
      </h4>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label class="form-label">{{ locale === 'ar' ? 'العنوان بالعربية' : 'Address (Arabic)' }}</label>
          <input v-model="values.address_ar" type="text" class="form-input" dir="rtl" />
        </div>
        <div>
          <label class="form-label">{{ locale === 'ar' ? 'العنوان بالإنجليزية' : 'Address (English)' }}</label>
          <input v-model="values.address_en" type="text" class="form-input" dir="ltr" />
        </div>
        <div>
          <label class="form-label">{{ locale === 'ar' ? 'المدينة' : 'City' }}</label>
          <input v-model="values.city" type="text" class="form-input" />
        </div>
        <div>
          <label class="form-label">{{ locale === 'ar' ? 'الدولة' : 'Country' }}</label>
          <input v-model="values.country" type="text" class="form-input font-mono uppercase" dir="ltr" maxlength="2" placeholder="EG" />
        </div>
      </div>
    </section>

    <!-- Banking (collapsible) -->
    <section>
      <button
        type="button"
        class="w-full flex items-center justify-between text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-3"
        @click="bankOpen = !bankOpen"
      >
        <span class="flex items-center gap-1.5">
          <UIcon name="i-lucide-landmark" class="w-3.5 h-3.5 text-neutral-400" />
          {{ locale === 'ar' ? 'بيانات بنكية' : 'Banking' }}
          <span class="text-[10px] text-neutral-400 font-normal normal-case tracking-normal">
            {{ locale === 'ar' ? '(اختياري)' : '(optional)' }}
          </span>
        </span>
        <UIcon
          :name="bankOpen ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
          class="w-3.5 h-3.5 text-neutral-400"
        />
      </button>
      <div v-if="bankOpen" class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div class="md:col-span-2">
          <label class="form-label">{{ locale === 'ar' ? 'اسم البنك' : 'Bank Name' }}</label>
          <input v-model="values.bank_name" type="text" class="form-input" />
        </div>
        <div>
          <label class="form-label">{{ locale === 'ar' ? 'رقم الحساب' : 'Account Number' }}</label>
          <input v-model="values.bank_account" type="text" class="form-input font-mono" dir="ltr" />
        </div>
        <div>
          <label class="form-label">IBAN</label>
          <input v-model="values.iban" type="text" class="form-input font-mono uppercase" dir="ltr" maxlength="34" />
        </div>
        <div>
          <label class="form-label">SWIFT / BIC</label>
          <input v-model="values.swift_code" type="text" class="form-input font-mono uppercase" dir="ltr" maxlength="11" />
        </div>
      </div>
    </section>

    <!-- Payment terms -->
    <section>
      <h4 class="form-section-title">
        <UIcon name="i-lucide-handshake" class="w-3.5 h-3.5 text-neutral-400" />
        {{ locale === 'ar' ? 'إعدادات الدفع' : 'Payment Settings' }}
      </h4>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label class="form-label">{{ locale === 'ar' ? 'شروط الدفع' : 'Payment Terms' }}</label>
          <div class="relative">
            <select v-model="values.payment_terms" class="form-input">
              <option value="net_15">{{ locale === 'ar' ? '15 يوماً' : 'Net 15' }}</option>
              <option value="net_30">{{ locale === 'ar' ? '30 يوماً' : 'Net 30' }}</option>
              <option value="net_45">{{ locale === 'ar' ? '45 يوماً' : 'Net 45' }}</option>
              <option value="net_60">{{ locale === 'ar' ? '60 يوماً' : 'Net 60' }}</option>
              <option value="net_90">{{ locale === 'ar' ? '90 يوماً' : 'Net 90' }}</option>
              <option value="cod">{{ locale === 'ar' ? 'دفع عند الاستلام' : 'Cash on delivery' }}</option>
              <option value="prepaid">{{ locale === 'ar' ? 'دفع مقدم' : 'Prepaid' }}</option>
            </select>
            <UIcon name="i-lucide-chevron-down" class="absolute end-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
          </div>
        </div>
        <div>
          <label class="form-label">{{ locale === 'ar' ? 'حد الائتمان' : 'Credit Limit' }}</label>
          <input
            v-model.number="values.credit_limit"
            type="number"
            min="0"
            step="0.01"
            class="form-input font-mono"
            dir="ltr"
            placeholder="0.00"
          />
        </div>
      </div>
    </section>

    <!-- Notes -->
    <section>
      <label class="form-label flex items-center gap-1.5">
        <UIcon name="i-lucide-sticky-note" class="w-3.5 h-3.5 text-neutral-400" />
        {{ locale === 'ar' ? 'ملاحظات' : 'Notes' }}
      </label>
      <textarea
        v-model="values.notes"
        rows="3"
        class="form-input resize-none"
        :placeholder="locale === 'ar' ? 'ملاحظات داخلية — لا تظهر للمورد.' : 'Internal notes — not visible to the vendor.'"
      />
    </section>

    <!-- Actions -->
    <div class="flex items-center gap-2 pt-4 border-t border-neutral-200 dark:border-neutral-800">
      <UiAppButton type="button" variant="outline" class="flex-1" @click="$emit('cancel')">
        {{ $t('common.cancel') }}
      </UiAppButton>
      <UiAppButton
        type="submit"
        variant="primary"
        :icon="vendor ? 'i-lucide-save' : 'i-lucide-plus'"
        :loading="loading || submitting"
        class="flex-1"
      >
        {{ vendor ? $t('common.save') : $t('common.create') }}
      </UiAppButton>
    </div>
  </form>
</template>

<script setup lang="ts">
import type { Vendor, VendorContact } from '~/features/vendors/services/vendorService'
import {
  vendorFormDefaults,
  vendorFormSchema,
  type VendorFormInput,
  type VendorFormOutput,
} from '~/features/vendors/schemas'
import { ApiError } from '~/core/api/errors'

const { locale } = useI18n()

const props = defineProps<{
  vendor?: Vendor | null
  loading?: boolean
}>()

const emit = defineEmits<{
  /**
   * The form's `primary_contact` shape is folded into the backend's `contacts: []`
   * array on submit (single primary contact). On the wire this becomes
   *   contacts: [{ name, role, email, phone, is_primary: true }]
   * which is what `VendorService::create/update` already accepts.
   */
  submit: [form: Record<string, unknown>]
  cancel: []
}>()

const bankOpen = ref(false)

const { values, errors, submitting, setValues, reset, clearError, handleSubmit } = useZodForm<VendorFormInput>({
  schema: vendorFormSchema,
  initial: { ...vendorFormDefaults },
})

watch(() => props.vendor, (v) => {
  if (v) {
    const primary: VendorContact = (v.contacts ?? []).find(c => c.is_primary)
      ?? (v.contacts ?? [])[0]
      ?? { name: '', role: '', email: '', phone: '' }
    setValues({
      name_ar: v.name_ar ?? '',
      name_en: v.name_en ?? '',
      code: v.code ?? '',
      tax_id: v.tax_id ?? '',
      commercial_register: v.commercial_register ?? '',
      vat_registration: v.vat_registration ?? '',
      email: v.email ?? '',
      phone: v.phone ?? '',
      address_ar: v.address_ar ?? '',
      address_en: v.address_en ?? '',
      city: v.city ?? '',
      country: v.country ?? 'EG',
      bank_name: v.bank_name ?? '',
      bank_account: v.bank_account ?? '',
      iban: v.iban ?? '',
      swift_code: v.swift_code ?? '',
      payment_terms: v.payment_terms ?? 'net_30',
      credit_limit: Number(v.credit_limit ?? 0),
      currency: v.currency ?? 'EGP',
      primary_contact: {
        name: primary.name ?? '',
        role: primary.role ?? '',
        email: primary.email ?? '',
        phone: primary.phone ?? '',
      },
      notes: v.notes ?? '',
    })
    bankOpen.value = !!(v.bank_name || v.bank_account || v.iban || v.swift_code)
  } else {
    reset()
    bankOpen.value = false
  }
}, { immediate: true })

async function onSubmit() {
  await handleSubmit(async (data: VendorFormOutput) => {
    // Fold primary_contact → contacts[]; drop primary_contact from the wire payload.
    const { primary_contact, ...rest } = data
    const hasPrimary = primary_contact && (primary_contact.name || primary_contact.email || primary_contact.phone)
    const payload: Record<string, unknown> = {
      ...rest,
      contacts: hasPrimary
        ? [{
            name: primary_contact.name,
            role: primary_contact.role || null,
            email: primary_contact.email || null,
            phone: primary_contact.phone || null,
            is_primary: true,
          }]
        : null,
    }
    await new Promise<void>((resolve) => {
      emit('submit', payload)
      queueMicrotask(resolve)
    })
  })
}

defineExpose({
  applyApiErrors(err: ApiError) {
    if (err.code === 'validation' && err.fieldErrors) {
      for (const [field, msgs] of Object.entries(err.fieldErrors)) {
        ;(errors.value as any)[field] = Array.isArray(msgs) ? msgs[0] : String(msgs)
      }
    }
  },
  reset,
})
</script>

<style scoped>
@reference "~/assets/css/tokens.css";

.form-section-title {
  @apply text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-3 flex items-center gap-1.5;
}
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

:global(html.dark) .form-input {
  background-color: var(--color-neutral-900);
  border-color: var(--color-neutral-800);
  color: var(--color-neutral-0);
}
</style>
