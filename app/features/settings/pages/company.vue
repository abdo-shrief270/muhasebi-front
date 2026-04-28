<template>
  <FeatureBoundary id="settings-company">
    <div class="px-4 lg:px-6 py-5 max-w-3xl mx-auto">
      <UiPageHeader
        icon="i-lucide-building-2"
        :title="locale === 'ar' ? 'بيانات الشركة' : 'Company Settings'"
        :subtitle="locale === 'ar' ? 'المعلومات التجارية والضريبية للشركة' : 'Business and tax information for your tenant'"
      />

      <Can :perm="PERMISSIONS.MANAGE_SETTINGS">
        <template #fallback>
          <div class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-12 text-center">
            <div class="w-12 h-12 mx-auto mb-4 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
              <UIcon name="i-lucide-lock" class="w-5 h-5 text-neutral-400" />
            </div>
            <p class="text-sm font-semibold text-neutral-900 dark:text-neutral-0 mb-1">
              {{ locale === 'ar' ? 'لا تملك صلاحية الوصول' : "You don't have access" }}
            </p>
          </div>
        </template>

        <div v-if="loading" class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5 space-y-2">
          <div v-for="i in 6" :key="i" class="h-9 rounded-md bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
        </div>

        <form
          v-else
          @submit.prevent="save"
          class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5 space-y-4"
        >
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div class="md:col-span-2">
              <label class="co-label">{{ locale === 'ar' ? 'اسم الشركة' : 'Company Name' }}</label>
              <input v-model="form.name" type="text" class="co-input" />
            </div>
            <div>
              <label class="co-label">{{ locale === 'ar' ? 'الرقم الضريبي' : 'Tax ID' }}</label>
              <input v-model="form.tax_id" type="text" class="co-input font-mono" dir="ltr" />
            </div>
            <div>
              <label class="co-label">{{ locale === 'ar' ? 'الهاتف' : 'Phone' }}</label>
              <input v-model="form.phone" type="tel" class="co-input" dir="ltr" />
            </div>
            <div class="md:col-span-2">
              <label class="co-label">{{ locale === 'ar' ? 'البريد الإلكتروني' : 'Email' }}</label>
              <input v-model="form.email" type="email" class="co-input" dir="ltr" />
            </div>
            <div class="md:col-span-2">
              <label class="co-label">{{ locale === 'ar' ? 'العنوان' : 'Address' }}</label>
              <textarea v-model="form.address" rows="2" class="co-input resize-none" />
            </div>
            <div>
              <label class="co-label">{{ locale === 'ar' ? 'المدينة' : 'City' }}</label>
              <input v-model="form.city" type="text" class="co-input" />
            </div>
            <div>
              <label class="co-label">{{ locale === 'ar' ? 'الدولة' : 'Country' }}</label>
              <input v-model="form.country" type="text" class="co-input" />
            </div>
          </div>

          <div class="flex items-center justify-end pt-3 border-t border-neutral-200 dark:border-neutral-800">
            <UiAppButton type="submit" variant="primary" icon="i-lucide-save" :loading="saving">
              {{ $t('common.save') }}
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

definePageMeta({ layout: 'dashboard' })

const { locale } = useI18n()
const api = useApi()
const toastStore = useToastStore()
const authStore = useAuthStore()

const loading = ref(true)
const saving = ref(false)

const form = reactive<Record<string, string>>({
  name: '', tax_id: '', email: '', phone: '', address: '', city: '', country: 'Egypt',
})

async function load() {
  loading.value = true
  try {
    const r: any = await api.get('/settings/company').catch(() => null)
    const t = r?.data ?? authStore.tenant ?? {}
    Object.assign(form, {
      name: t.name ?? '',
      tax_id: t.tax_id ?? '',
      email: t.email ?? '',
      phone: t.phone ?? '',
      address: t.address ?? '',
      city: t.city ?? '',
      country: t.country ?? 'Egypt',
    })
  } finally {
    loading.value = false
  }
}

async function save() {
  saving.value = true
  try {
    await api.put('/settings/company', form)
    toastStore.success(locale.value === 'ar' ? 'تم الحفظ' : 'Saved')
  } catch (e: any) {
    toastStore.error(e?.data?.message || e?.message || 'Error')
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>

<style scoped>
@reference "~/assets/css/tokens.css";

.co-label { @apply block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5; }

.co-input {
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
.co-input:focus {
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 2px color-mix(in oklab, var(--color-primary-500) 20%, transparent);
}
textarea.co-input { height: auto; padding-block: 0.5rem; }

:global(html.dark) .co-input {
  background-color: var(--color-neutral-900);
  border-color: var(--color-neutral-800);
  color: var(--color-neutral-0);
}
</style>
