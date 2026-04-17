<template>
  <div>
    <NuxtLayout name="dashboard">
      <FeatureBoundary id="accounts">
      <UiPageHeader :title="locale === 'ar' ? 'السنوات المالية' : 'Fiscal Years'">
        <template #actions>
          <UiAppButton variant="primary" @click="createOpen = true">{{ locale === 'ar' ? '+ سنة مالية' : '+ New Year' }}</UiAppButton>
        </template>
      </UiPageHeader>

      <div v-if="loading"><UiLoadingSkeleton :lines="4" :height="60" /></div>

      <div v-else class="space-y-4">
        <div
          v-for="(year, i) in years"
          :key="year.id"
          v-motion
          :initial="{ opacity: 0, y: 15 }"
          :enter="{ opacity: 1, y: 0, transition: { delay: i * 80 } }"
          class="bg-white rounded-2xl border border-gray-100/80 p-5"
        >
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="font-bold text-gray-800">{{ year.name }}</h3>
              <p class="text-sm text-gray-400">{{ year.start_date }} → {{ year.end_date }}</p>
            </div>
            <UiBadge :color="year.is_closed ? 'gray' : 'green'" dot>
              {{ year.is_closed ? (locale === 'ar' ? 'مغلقة' : 'Closed') : (locale === 'ar' ? 'مفتوحة' : 'Open') }}
            </UiBadge>
          </div>

          <!-- Periods -->
          <div v-if="year.periods?.length" class="grid grid-cols-3 md:grid-cols-6 gap-2">
            <div
              v-for="period in year.periods"
              :key="period.id"
              class="text-center p-2 rounded-lg text-xs border transition-colors cursor-pointer"
              :class="period.is_closed ? 'bg-gray-50 border-gray-100 text-gray-400' : 'bg-emerald-50 border-emerald-100 text-emerald-700'"
              @click="togglePeriod(period)"
            >
              <p class="font-bold">{{ period.period_number }}</p>
              <p class="text-[10px]">{{ period.is_closed ? (locale === 'ar' ? 'مغلقة' : 'Closed') : (locale === 'ar' ? 'مفتوحة' : 'Open') }}</p>
            </div>
          </div>
        </div>

        <UiEmptyState v-if="years.length === 0" icon="📅" :title="locale === 'ar' ? 'لا توجد سنوات مالية' : 'No fiscal years'" />
      </div>

      <!-- Create -->
      <UiSlideOver v-model="createOpen" :title="locale === 'ar' ? 'سنة مالية جديدة' : 'New Fiscal Year'">
        <form @submit.prevent="handleCreate" class="space-y-4">
          <div>
            <label class="form-label">{{ locale === 'ar' ? 'الاسم' : 'Name' }} *</label>
            <input v-model="form.name" type="text" required class="input-field" :placeholder="locale === 'ar' ? 'السنة المالية 2026' : 'Fiscal Year 2026'" />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="form-label">{{ locale === 'ar' ? 'بداية' : 'Start Date' }} *</label>
              <input v-model="form.start_date" type="date" required class="input-field" />
            </div>
            <div>
              <label class="form-label">{{ locale === 'ar' ? 'نهاية' : 'End Date' }} *</label>
              <input v-model="form.end_date" type="date" required class="input-field" />
            </div>
          </div>
          <div class="flex gap-3 pt-4 border-t border-gray-100">
            <UiAppButton type="submit" variant="primary" :loading="creating">{{ $t('common.create') }}</UiAppButton>
            <UiAppButton variant="outline" @click="createOpen = false">{{ $t('common.cancel') }}</UiAppButton>
          </div>
        </form>
      </UiSlideOver>
      </FeatureBoundary>
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })
const { locale } = useI18n()
const api = useApi()
const toastStore = useToastStore()

const years = ref<any[]>([])
const loading = ref(true)
const createOpen = ref(false)
const creating = ref(false)
const now = new Date()
const form = reactive({ name: `السنة المالية ${now.getFullYear()}`, start_date: `${now.getFullYear()}-01-01`, end_date: `${now.getFullYear()}-12-31` })

async function load() {
  loading.value = true
  try {
    const res = await api.get<{ data: any[] }>('/fiscal-years')
    years.value = res.data
  } catch { years.value = [] }
  finally { loading.value = false }
}

async function handleCreate() {
  creating.value = true
  try {
    await api.post('/fiscal-years', form)
    toastStore.success(locale.value === 'ar' ? 'تم الإنشاء' : 'Created')
    createOpen.value = false
    load()
  } catch (e: any) { toastStore.error(e.data?.message || 'Error') }
  finally { creating.value = false }
}

async function togglePeriod(period: any) {
  try {
    const action = period.is_closed ? 'reopen' : 'close'
    await api.post(`/fiscal-periods/${period.id}/${action}`)
    toastStore.success(locale.value === 'ar' ? 'تم التحديث' : 'Updated')
    load()
  } catch (e: any) { toastStore.error(e.data?.message || 'Error') }
}

onMounted(load)
</script>

<style scoped>
.input-field { @apply w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-sm bg-gray-50/50; }
.form-label { @apply block text-sm font-medium text-gray-600 mb-1; }
</style>
