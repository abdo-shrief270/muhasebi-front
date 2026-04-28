<template>
  <FeatureBoundary id="eta">
    <div class="px-4 lg:px-6 py-5 max-w-[1400px] mx-auto">
      <UiPageHeader
        icon="i-lucide-settings-2"
        :title="locale === 'ar' ? 'إعدادات الفوترة الإلكترونية' : 'E-Invoice Settings'"
        :subtitle="locale === 'ar' ? 'بيانات الاعتماد والفرع للربط مع مصلحة الضرائب' : 'API credentials and branch info for ETA integration'"
      />

      <div v-if="loading" class="max-w-3xl">
        <UiLoadingSkeleton :lines="8" :height="24" />
      </div>

      <form v-else @submit.prevent="handleSave" class="max-w-3xl space-y-3">
        <!-- Enable toggle -->
        <div class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
          <div class="flex items-center justify-between gap-4">
            <div class="min-w-0">
              <h3 class="text-sm font-semibold text-neutral-900 dark:text-neutral-0">
                {{ locale === 'ar' ? 'تفعيل الفوترة الإلكترونية' : 'Enable E-Invoicing' }}
              </h3>
              <p class="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                {{ locale === 'ar' ? 'تفعيل الربط مع مصلحة الضرائب المصرية' : 'Enable ETA API integration' }}
              </p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer flex-shrink-0">
              <input v-model="form.is_enabled" type="checkbox" class="sr-only peer" />
              <div class="w-10 h-5 bg-neutral-200 dark:bg-neutral-700 peer-focus:ring-2 peer-focus:ring-primary-500/30 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-500"></div>
            </label>
          </div>
        </div>

        <!-- Credentials -->
        <div class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm font-semibold text-neutral-900 dark:text-neutral-0 flex items-center gap-1.5">
              <UIcon name="i-lucide-key-round" class="w-3.5 h-3.5 text-neutral-400" />
              {{ locale === 'ar' ? 'بيانات الاعتماد' : 'API Credentials' }}
            </h3>
            <UiBadge :color="settings?.token_valid ? 'green' : 'gray'" dot>
              {{ settings?.token_valid ? (locale === 'ar' ? 'متصل' : 'Connected') : (locale === 'ar' ? 'غير متصل' : 'Not connected') }}
            </UiBadge>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label class="eta-label">{{ locale === 'ar' ? 'البيئة' : 'Environment' }}</label>
              <div class="relative">
                <select v-model="form.environment" class="eta-input">
                  <option value="preprod">Preprod (Testing)</option>
                  <option value="production">Production</option>
                </select>
                <UIcon name="i-lucide-chevron-down" class="absolute end-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label class="eta-label">{{ locale === 'ar' ? 'كود النشاط' : 'Activity Code' }}</label>
              <input v-model="form.activity_code" type="text" class="eta-input font-mono" dir="ltr" />
            </div>
            <div>
              <label class="eta-label">Client ID</label>
              <input v-model="form.client_id" type="text" class="eta-input font-mono" dir="ltr" />
            </div>
            <div>
              <label class="eta-label">Client Secret</label>
              <input
                v-model="form.client_secret"
                type="password"
                class="eta-input font-mono"
                dir="ltr"
                :placeholder="settings?.has_client_secret ? '••••••••' : ''"
              />
            </div>
          </div>
        </div>

        <!-- Branch info -->
        <div class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
          <h3 class="text-sm font-semibold text-neutral-900 dark:text-neutral-0 mb-3 flex items-center gap-1.5">
            <UIcon name="i-lucide-building-2" class="w-3.5 h-3.5 text-neutral-400" />
            {{ locale === 'ar' ? 'بيانات الفرع' : 'Branch Information' }}
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label class="eta-label">{{ locale === 'ar' ? 'رقم الفرع' : 'Branch ID' }}</label>
              <input v-model="form.branch_id" type="text" class="eta-input font-mono" dir="ltr" />
            </div>
            <div>
              <label class="eta-label">{{ locale === 'ar' ? 'الاسم التجاري' : 'Trade Name' }}</label>
              <input v-model="form.company_trade_name" type="text" class="eta-input" />
            </div>
            <div>
              <label class="eta-label">{{ locale === 'ar' ? 'المحافظة' : 'Governate' }}</label>
              <input v-model="form.branch_address_governate" type="text" class="eta-input" />
            </div>
            <div>
              <label class="eta-label">{{ locale === 'ar' ? 'المدينة' : 'City' }}</label>
              <input v-model="form.branch_address_region_city" type="text" class="eta-input" />
            </div>
            <div>
              <label class="eta-label">{{ locale === 'ar' ? 'الشارع' : 'Street' }}</label>
              <input v-model="form.branch_address_street" type="text" class="eta-input" />
            </div>
            <div>
              <label class="eta-label">{{ locale === 'ar' ? 'رقم المبنى' : 'Building Number' }}</label>
              <input v-model="form.branch_address_building_number" type="text" class="eta-input font-mono" dir="ltr" />
            </div>
          </div>
        </div>

        <UiAppButton type="submit" variant="primary" icon="i-lucide-save" :loading="saving">
          {{ $t('common.save') }}
        </UiAppButton>
      </form>
    </div>
  </FeatureBoundary>
</template>

<script setup lang="ts">
import type { EtaSettings } from '~/features/eta/composables/useEta'

definePageMeta({ layout: 'dashboard' })
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
      client_id: '',
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
@reference "~/assets/css/tokens.css";

.eta-label { @apply block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5; }

.eta-input {
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
.eta-input:focus {
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 2px color-mix(in oklab, var(--color-primary-500) 20%, transparent);
}
:global(html.dark) .eta-input {
  background-color: var(--color-neutral-900);
  border-color: var(--color-neutral-800);
  color: var(--color-neutral-0);
}
</style>
