<template>
  <form @submit.prevent="handleSubmit" class="space-y-5">
    <!-- Basic Info -->
    <div>
      <h4 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
        {{ locale === 'ar' ? 'البيانات الأساسية' : 'Basic Information' }}
      </h4>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="md:col-span-2">
          <label class="form-label">{{ locale === 'ar' ? 'اسم العميل' : 'Client Name' }} *</label>
          <input v-model="form.name" type="text" required class="input-field" />
        </div>
        <div>
          <label class="form-label">{{ locale === 'ar' ? 'الاسم التجاري' : 'Trade Name' }}</label>
          <input v-model="form.trade_name" type="text" class="input-field" />
        </div>
        <div>
          <label class="form-label">{{ locale === 'ar' ? 'نوع النشاط' : 'Activity Type' }}</label>
          <input v-model="form.activity_type" type="text" class="input-field" />
        </div>
      </div>
    </div>

    <!-- Legal Info -->
    <div>
      <h4 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
        {{ locale === 'ar' ? 'البيانات القانونية' : 'Legal Information' }}
      </h4>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="form-label">{{ locale === 'ar' ? 'الرقم الضريبي' : 'Tax ID' }}</label>
          <input v-model="form.tax_id" type="text" class="input-field" dir="ltr" />
        </div>
        <div>
          <label class="form-label">{{ locale === 'ar' ? 'السجل التجاري' : 'Commercial Register' }}</label>
          <input v-model="form.commercial_register" type="text" class="input-field" dir="ltr" />
        </div>
      </div>
    </div>

    <!-- Contact -->
    <div>
      <h4 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
        {{ locale === 'ar' ? 'بيانات التواصل' : 'Contact Information' }}
      </h4>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="form-label">{{ locale === 'ar' ? 'البريد الإلكتروني' : 'Email' }}</label>
          <input v-model="form.email" type="email" class="input-field" dir="ltr" />
        </div>
        <div>
          <label class="form-label">{{ locale === 'ar' ? 'الهاتف' : 'Phone' }}</label>
          <input v-model="form.phone" type="tel" class="input-field" dir="ltr" />
        </div>
        <div>
          <label class="form-label">{{ locale === 'ar' ? 'جهة الاتصال' : 'Contact Person' }}</label>
          <input v-model="form.contact_person" type="text" class="input-field" />
        </div>
        <div>
          <label class="form-label">{{ locale === 'ar' ? 'هاتف جهة الاتصال' : 'Contact Phone' }}</label>
          <input v-model="form.contact_phone" type="tel" class="input-field" dir="ltr" />
        </div>
      </div>
    </div>

    <!-- Address -->
    <div>
      <h4 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
        {{ locale === 'ar' ? 'العنوان' : 'Address' }}
      </h4>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="md:col-span-2">
          <label class="form-label">{{ locale === 'ar' ? 'العنوان' : 'Address' }}</label>
          <input v-model="form.address" type="text" class="input-field" />
        </div>
        <div>
          <label class="form-label">{{ locale === 'ar' ? 'المدينة' : 'City' }}</label>
          <input v-model="form.city" type="text" class="input-field" />
        </div>
      </div>
    </div>

    <!-- Notes -->
    <div>
      <label class="form-label">{{ locale === 'ar' ? 'ملاحظات' : 'Notes' }}</label>
      <textarea v-model="form.notes" rows="3" class="input-field resize-none"></textarea>
    </div>

    <!-- Actions -->
    <div class="flex items-center gap-3 pt-4 border-t border-gray-100">
      <UiAppButton type="submit" variant="primary" :loading="loading">
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

const { locale } = useI18n()

const props = defineProps<{
  client?: Client | null
  loading?: boolean
}>()

const emit = defineEmits<{
  submit: [form: any]
  cancel: []
}>()

const form = reactive({
  name: '',
  trade_name: '',
  tax_id: '',
  commercial_register: '',
  activity_type: '',
  address: '',
  city: '',
  phone: '',
  email: '',
  contact_person: '',
  contact_phone: '',
  notes: '',
})

// Populate form when editing
watch(() => props.client, (c) => {
  if (c) {
    Object.assign(form, {
      name: c.name || '',
      trade_name: c.trade_name || '',
      tax_id: c.tax_id || '',
      commercial_register: c.commercial_register || '',
      activity_type: c.activity_type || '',
      address: c.address || '',
      city: c.city || '',
      phone: c.phone || '',
      email: c.email || '',
      contact_person: c.contact_person || '',
      contact_phone: c.contact_phone || '',
      notes: c.notes || '',
    })
  } else {
    Object.keys(form).forEach(k => (form as any)[k] = '')
  }
}, { immediate: true })

function handleSubmit() {
  emit('submit', { ...form })
}
</script>

<style scoped>
.input-field {
  @apply w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-sm bg-gray-50/50;
}
.form-label {
  @apply block text-sm font-medium text-gray-600 mb-1;
}
</style>
