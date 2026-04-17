<template>
  <div>
    <NuxtLayout name="dashboard">
      <FeatureBoundary id="eta">
      <UiPageHeader :title="locale === 'ar' ? 'إعدادات الفوترة الإلكترونية' : 'E-Invoice Settings'" />

      <div v-if="loading" class="max-w-2xl"><UiLoadingSkeleton :lines="8" :height="24" /></div>

      <form v-else @submit.prevent="handleSave" class="max-w-2xl space-y-6">
        <!-- Enable toggle -->
        <div v-motion :initial="{ opacity: 0, y: 15 }" :enter="{ opacity: 1, y: 0 }" class="bg-white rounded-2xl border border-gray-100/80 p-6">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-semibold text-gray-700">{{ locale === 'ar' ? 'تفعيل الفوترة الإلكترونية' : 'Enable E-Invoicing' }}</h3>
              <p class="text-sm text-gray-400 mt-0.5">{{ locale === 'ar' ? 'تفعيل الربط مع مصلحة الضرائب' : 'Enable ETA API integration' }}</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input v-model="form.is_enabled" type="checkbox" class="sr-only peer" />
              <div class="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-primary-500/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
            </label>
          </div>
        </div>

        <!-- Credentials -->
        <div v-motion :initial="{ opacity: 0, y: 15 }" :enter="{ opacity: 1, y: 0, transition: { delay: 100 } }" class="bg-white rounded-2xl border border-gray-100/80 p-6">
          <h3 class="font-semibold text-gray-700 mb-4">{{ locale === 'ar' ? 'بيانات الاعتماد' : 'API Credentials' }}</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="form-label">{{ locale === 'ar' ? 'البيئة' : 'Environment' }}</label>
              <select v-model="form.environment" class="input-field">
                <option value="preprod">Preprod (Testing)</option>
                <option value="production">Production</option>
              </select>
            </div>
            <div>
              <label class="form-label">{{ locale === 'ar' ? 'كود النشاط' : 'Activity Code' }}</label>
              <input v-model="form.activity_code" type="text" class="input-field" dir="ltr" />
            </div>
            <div>
              <label class="form-label">Client ID</label>
              <input v-model="form.client_id" type="text" class="input-field" dir="ltr" />
            </div>
            <div>
              <label class="form-label">Client Secret</label>
              <input v-model="form.client_secret" type="password" class="input-field" dir="ltr" :placeholder="settings?.has_client_secret ? '••••••••' : ''" />
            </div>
          </div>
          <div class="mt-3 flex items-center gap-2">
            <UiBadge :color="settings?.token_valid ? 'green' : 'gray'" dot>
              {{ settings?.token_valid ? (locale === 'ar' ? 'متصل' : 'Connected') : (locale === 'ar' ? 'غير متصل' : 'Not connected') }}
            </UiBadge>
          </div>
        </div>

        <!-- Branch info -->
        <div v-motion :initial="{ opacity: 0, y: 15 }" :enter="{ opacity: 1, y: 0, transition: { delay: 200 } }" class="bg-white rounded-2xl border border-gray-100/80 p-6">
          <h3 class="font-semibold text-gray-700 mb-4">{{ locale === 'ar' ? 'بيانات الفرع' : 'Branch Information' }}</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="form-label">{{ locale === 'ar' ? 'رقم الفرع' : 'Branch ID' }}</label>
              <input v-model="form.branch_id" type="text" class="input-field" dir="ltr" />
            </div>
            <div>
              <label class="form-label">{{ locale === 'ar' ? 'الاسم التجاري' : 'Trade Name' }}</label>
              <input v-model="form.company_trade_name" type="text" class="input-field" />
            </div>
            <div>
              <label class="form-label">{{ locale === 'ar' ? 'المحافظة' : 'Governate' }}</label>
              <input v-model="form.branch_address_governate" type="text" class="input-field" />
            </div>
            <div>
              <label class="form-label">{{ locale === 'ar' ? 'المدينة' : 'City' }}</label>
              <input v-model="form.branch_address_region_city" type="text" class="input-field" />
            </div>
            <div>
              <label class="form-label">{{ locale === 'ar' ? 'الشارع' : 'Street' }}</label>
              <input v-model="form.branch_address_street" type="text" class="input-field" />
            </div>
            <div>
              <label class="form-label">{{ locale === 'ar' ? 'رقم المبنى' : 'Building Number' }}</label>
              <input v-model="form.branch_address_building_number" type="text" class="input-field" />
            </div>
          </div>
        </div>

        <UiAppButton type="submit" variant="primary" :loading="saving">{{ $t('common.save') }}</UiAppButton>
      </form>
      </FeatureBoundary>
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
import type { EtaSettings } from '~/features/eta/composables/useEta'

definePageMeta({ layout: false })
const { locale } = useI18n()
const { getSettings, updateSettings } = useEta()
const toastStore = useToastStore()

const settings = ref<EtaSettings | null>(null)
const loading = ref(true)
const saving = ref(false)

const form = reactive({
  is_enabled: false, environment: 'preprod', client_id: '', client_secret: '',
  activity_code: '', company_trade_name: '', branch_id: '0',
  branch_address_governate: '', branch_address_region_city: '',
  branch_address_street: '', branch_address_building_number: '',
})

async function loadSettings() {
  loading.value = true
  try {
    settings.value = await getSettings()
    Object.assign(form, {
      is_enabled: settings.value.is_enabled,
      environment: settings.value.environment,
      client_id: '', // Masked from server
      activity_code: settings.value.activity_code || '',
      company_trade_name: settings.value.company_trade_name || '',
      branch_id: settings.value.branch_id || '0',
      branch_address_governate: settings.value.branch_address_governate || '',
      branch_address_region_city: settings.value.branch_address_region_city || '',
      branch_address_street: settings.value.branch_address_street || '',
      branch_address_building_number: settings.value.branch_address_building_number || '',
    })
  } catch { /* ignore */ }
  finally { loading.value = false }
}

async function handleSave() {
  saving.value = true
  try {
    const payload: any = { ...form }
    if (!payload.client_id) delete payload.client_id
    if (!payload.client_secret) delete payload.client_secret
    settings.value = await updateSettings(payload)
    toastStore.success(locale.value === 'ar' ? 'تم حفظ الإعدادات' : 'Settings saved')
  } catch (e: any) { toastStore.error(e.data?.message || 'Error') }
  finally { saving.value = false }
}

onMounted(loadSettings)
</script>

<style scoped>
.input-field { @apply w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-sm bg-gray-50/50; }
.form-label { @apply block text-sm font-medium text-gray-600 mb-1; }
</style>
