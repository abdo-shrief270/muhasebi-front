<template>
  <form @submit.prevent="onSubmit" class="space-y-5">
    <div>
      <h4 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
        {{ locale === 'ar' ? 'البيانات الأساسية' : 'Basic Information' }}
      </h4>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="md:col-span-2">
          <label class="form-label">{{ locale === 'ar' ? 'اسم العميل' : 'Client Name' }} *</label>
          <input v-model="values.name" type="text" class="input-field" :class="{ 'input-error': errors.name }" @input="clearError('name')" />
          <p v-if="errors.name" class="form-error">{{ errors.name }}</p>
        </div>
        <div>
          <label class="form-label">{{ locale === 'ar' ? 'الاسم التجاري' : 'Trade Name' }}</label>
          <input v-model="values.trade_name" type="text" class="input-field" />
        </div>
        <div>
          <label class="form-label">{{ locale === 'ar' ? 'نوع النشاط' : 'Activity Type' }}</label>
          <input v-model="values.activity_type" type="text" class="input-field" />
        </div>
      </div>
    </div>

    <div>
      <h4 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
        {{ locale === 'ar' ? 'البيانات القانونية' : 'Legal Information' }}
      </h4>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="form-label">{{ locale === 'ar' ? 'الرقم الضريبي' : 'Tax ID' }}</label>
          <input v-model="values.tax_id" type="text" class="input-field" :class="{ 'input-error': errors.tax_id }" dir="ltr" @input="clearError('tax_id')" />
          <p v-if="errors.tax_id" class="form-error">{{ errors.tax_id }}</p>
        </div>
        <div>
          <label class="form-label">{{ locale === 'ar' ? 'السجل التجاري' : 'Commercial Register' }}</label>
          <input v-model="values.commercial_register" type="text" class="input-field" dir="ltr" />
        </div>
      </div>
    </div>

    <div>
      <h4 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
        {{ locale === 'ar' ? 'بيانات التواصل' : 'Contact Information' }}
      </h4>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="form-label">{{ locale === 'ar' ? 'البريد الإلكتروني' : 'Email' }}</label>
          <input v-model="values.email" type="email" class="input-field" :class="{ 'input-error': errors.email }" dir="ltr" @input="clearError('email')" />
          <p v-if="errors.email" class="form-error">{{ errors.email }}</p>
        </div>
        <div>
          <label class="form-label">{{ locale === 'ar' ? 'الهاتف' : 'Phone' }}</label>
          <input v-model="values.phone" type="tel" class="input-field" dir="ltr" />
        </div>
        <div>
          <label class="form-label">{{ locale === 'ar' ? 'جهة الاتصال' : 'Contact Person' }}</label>
          <input v-model="values.contact_person" type="text" class="input-field" />
        </div>
        <div>
          <label class="form-label">{{ locale === 'ar' ? 'هاتف جهة الاتصال' : 'Contact Phone' }}</label>
          <input v-model="values.contact_phone" type="tel" class="input-field" dir="ltr" />
        </div>
      </div>
    </div>

    <div>
      <h4 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
        {{ locale === 'ar' ? 'العنوان' : 'Address' }}
      </h4>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="md:col-span-2">
          <label class="form-label">{{ locale === 'ar' ? 'العنوان' : 'Address' }}</label>
          <input v-model="values.address" type="text" class="input-field" />
        </div>
        <div>
          <label class="form-label">{{ locale === 'ar' ? 'المدينة' : 'City' }}</label>
          <input v-model="values.city" type="text" class="input-field" />
        </div>
      </div>
    </div>

    <div>
      <label class="form-label">{{ locale === 'ar' ? 'ملاحظات' : 'Notes' }}</label>
      <textarea v-model="values.notes" rows="3" class="input-field resize-none"></textarea>
    </div>

    <div class="flex items-center gap-3 pt-4 border-t border-gray-100">
      <UiAppButton type="submit" variant="primary" :loading="loading || submitting">
        {{ client ? $t('common.save') : $t('common.create') }}
      </UiAppButton>
      <UiAppButton variant="outline" @click="$emit('cancel')">
        {{ $t('common.cancel') }}
      </UiAppButton>
    </div>
  </form>
</template>

<script setup lang="ts">
import type { Client } from '~/shared/types/client'
import { clientFormDefaults, clientFormSchema, type ClientFormInput, type ClientFormOutput } from '~/features/clients/schemas'
import { ApiError } from '~/core/api/errors'

const { locale } = useI18n()

const props = defineProps<{
  client?: Client | null
  loading?: boolean
}>()

const emit = defineEmits<{
  submit: [form: ClientFormOutput]
  cancel: []
  error: [err: ApiError]
}>()

const { values, errors, submitting, setValues, reset, clearError, handleSubmit } = useZodForm<ClientFormInput>({
  schema: clientFormSchema,
  initial: { ...clientFormDefaults },
})

watch(() => props.client, (c) => {
  if (c) {
    setValues({
      name: c.name ?? '',
      trade_name: c.trade_name ?? '',
      tax_id: c.tax_id ?? '',
      commercial_register: c.commercial_register ?? '',
      activity_type: c.activity_type ?? '',
      address: c.address ?? '',
      city: c.city ?? '',
      phone: c.phone ?? '',
      email: c.email ?? '',
      contact_person: c.contact_person ?? '',
      contact_phone: c.contact_phone ?? '',
      notes: c.notes ?? '',
    })
  } else {
    reset()
  }
}, { immediate: true })

async function onSubmit() {
  await handleSubmit(async (data) => {
    await new Promise<void>((resolve, reject) => {
      emit('submit', data)
      // Parent performs the mutation and catches errors. If it throws (unhandled)
      // we don't resolve — we rely on ApiError propagation via a try/catch chain
      // the parent establishes. For the common case (emit + parent awaits its own promise),
      // we resolve on next tick so submitting briefly flips.
      queueMicrotask(resolve)
    })
  })
}

/** Parent can call this when its API mutation fails to map field errors. */
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
.input-field {
  @apply w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-sm bg-gray-50/50;
}
.input-error {
  @apply border-red-300 focus:ring-red-500/20 focus:border-red-500;
}
.form-label {
  @apply block text-sm font-medium text-gray-600 mb-1;
}
.form-error {
  @apply mt-1 text-xs text-red-500;
}
</style>
