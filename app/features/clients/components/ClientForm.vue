<template>
  <form @submit.prevent="onSubmit" class="space-y-5">
    <!-- Basic info -->
    <section>
      <h4 class="form-section-title">
        <UIcon name="i-lucide-user" class="w-3.5 h-3.5 text-neutral-400" />
        {{ locale === 'ar' ? 'البيانات الأساسية' : 'Basic Information' }}
      </h4>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div class="md:col-span-2">
          <label class="form-label">
            {{ locale === 'ar' ? 'اسم العميل' : 'Client Name' }}
            <span class="text-danger-500">*</span>
          </label>
          <input
            v-model="values.name"
            type="text"
            class="form-input"
            :class="{ 'form-input--error': errors.name }"
            @input="clearError('name')"
          />
          <p v-if="errors.name" class="form-error">{{ errors.name }}</p>
        </div>
        <div>
          <label class="form-label">{{ locale === 'ar' ? 'الاسم التجاري' : 'Trade Name' }}</label>
          <input v-model="values.trade_name" type="text" class="form-input" />
        </div>
        <div>
          <label class="form-label">{{ locale === 'ar' ? 'نوع النشاط' : 'Activity Type' }}</label>
          <input v-model="values.activity_type" type="text" class="form-input" />
        </div>
      </div>
    </section>

    <!-- Legal -->
    <section>
      <h4 class="form-section-title">
        <UIcon name="i-lucide-scale" class="w-3.5 h-3.5 text-neutral-400" />
        {{ locale === 'ar' ? 'البيانات القانونية' : 'Legal Information' }}
      </h4>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label class="form-label">{{ locale === 'ar' ? 'الرقم الضريبي' : 'Tax ID' }}</label>
          <input
            v-model="values.tax_id"
            type="text"
            class="form-input font-mono"
            :class="{ 'form-input--error': errors.tax_id }"
            dir="ltr"
            @input="clearError('tax_id')"
          />
          <p v-if="errors.tax_id" class="form-error">{{ errors.tax_id }}</p>
        </div>
        <div>
          <label class="form-label">{{ locale === 'ar' ? 'السجل التجاري' : 'Commercial Register' }}</label>
          <input v-model="values.commercial_register" type="text" class="form-input font-mono" dir="ltr" />
        </div>
      </div>
    </section>

    <!-- Contact -->
    <section>
      <h4 class="form-section-title">
        <UIcon name="i-lucide-contact" class="w-3.5 h-3.5 text-neutral-400" />
        {{ locale === 'ar' ? 'بيانات التواصل' : 'Contact Information' }}
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
            @input="clearError('email')"
          />
          <p v-if="errors.email" class="form-error">{{ errors.email }}</p>
        </div>
        <div>
          <label class="form-label">{{ locale === 'ar' ? 'الهاتف' : 'Phone' }}</label>
          <input v-model="values.phone" type="tel" class="form-input" dir="ltr" />
        </div>
        <div>
          <label class="form-label">{{ locale === 'ar' ? 'جهة الاتصال' : 'Contact Person' }}</label>
          <input v-model="values.contact_person" type="text" class="form-input" />
        </div>
        <div>
          <label class="form-label">{{ locale === 'ar' ? 'هاتف جهة الاتصال' : 'Contact Phone' }}</label>
          <input v-model="values.contact_phone" type="tel" class="form-input" dir="ltr" />
        </div>
      </div>
    </section>

    <!-- Address -->
    <section>
      <h4 class="form-section-title">
        <UIcon name="i-lucide-map-pin" class="w-3.5 h-3.5 text-neutral-400" />
        {{ locale === 'ar' ? 'العنوان' : 'Address' }}
      </h4>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div class="md:col-span-2">
          <label class="form-label">{{ locale === 'ar' ? 'العنوان' : 'Address' }}</label>
          <input v-model="values.address" type="text" class="form-input" />
        </div>
        <div>
          <label class="form-label">{{ locale === 'ar' ? 'المدينة' : 'City' }}</label>
          <input v-model="values.city" type="text" class="form-input" />
        </div>
      </div>
    </section>

    <!-- Notes -->
    <div>
      <label class="form-label">{{ locale === 'ar' ? 'ملاحظات' : 'Notes' }}</label>
      <textarea v-model="values.notes" rows="3" class="form-input resize-none"></textarea>
    </div>

    <div class="flex items-center gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
      <UiAppButton
        type="submit"
        variant="primary"
        :icon="client ? 'i-lucide-save' : 'i-lucide-plus'"
        :loading="loading || submitting"
      >
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
    await new Promise<void>((resolve) => {
      emit('submit', data)
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
}
.form-input:focus {
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 2px color-mix(in oklab, var(--color-primary-500) 20%, transparent);
}
textarea.form-input { height: auto; padding-block: 0.5rem; }
.form-input--error { border-color: color-mix(in oklab, var(--color-danger-500) 60%, transparent); }
.form-input--error:focus {
  border-color: var(--color-danger-500);
  box-shadow: 0 0 0 2px color-mix(in oklab, var(--color-danger-500) 25%, transparent);
}

:global(html.dark) .form-input {
  background-color: var(--color-neutral-900);
  border-color: var(--color-neutral-800);
  color: var(--color-neutral-0);
}
</style>
