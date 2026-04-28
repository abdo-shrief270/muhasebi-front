<template>
  <FeatureBoundary id="accounts">
    <div class="px-4 lg:px-6 py-5 max-w-3xl mx-auto">
      <UiPageHeader
        icon="i-lucide-calendar-range"
        :title="locale === 'ar' ? 'السنوات المالية' : 'Fiscal Years'"
        :subtitle="locale === 'ar' ? 'الفترات المالية والإقفال' : 'Periods and closings'"
      >
        <template #actions>
          <UiAppButton variant="primary" icon="i-lucide-plus" @click="createOpen = true">
            {{ locale === 'ar' ? 'سنة مالية' : 'New Year' }}
          </UiAppButton>
        </template>
      </UiPageHeader>

      <div v-if="loading" class="space-y-3">
        <div v-for="i in 3" :key="i" class="h-32 rounded-xl bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
      </div>

      <div
        v-else-if="years.length === 0"
        class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 py-12 text-center"
      >
        <div class="w-12 h-12 mx-auto mb-3 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
          <UIcon name="i-lucide-calendar-range" class="w-5 h-5 text-neutral-400" />
        </div>
        <p class="text-sm font-semibold text-neutral-900 dark:text-neutral-0 mb-1">
          {{ locale === 'ar' ? 'لا توجد سنوات مالية' : 'No fiscal years yet' }}
        </p>
        <p class="text-xs text-neutral-500 dark:text-neutral-400">
          {{ locale === 'ar' ? 'أنشئ سنة مالية لبدء التقويم المحاسبي.' : 'Create a fiscal year to start the accounting calendar.' }}
        </p>
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="(year, i) in years"
          :key="year.id"
          v-motion
          :initial="{ opacity: 0, y: 8 }"
          :enter="{ opacity: 1, y: 0, transition: { delay: i * 50 } }"
          class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4"
        >
          <div class="flex items-center justify-between mb-3 gap-2 flex-wrap">
            <div class="min-w-0">
              <h3 class="text-sm font-semibold text-neutral-900 dark:text-neutral-0">{{ year.name }}</h3>
              <p class="text-xs text-neutral-500 dark:text-neutral-400 tabular-nums" dir="ltr">
                {{ formatDate(year.start_date) }} → {{ formatDate(year.end_date) }}
              </p>
            </div>
            <UiBadge :color="year.is_closed ? 'gray' : 'green'" dot>
              {{ year.is_closed
                ? (locale === 'ar' ? 'مغلقة' : 'Closed')
                : (locale === 'ar' ? 'مفتوحة' : 'Open') }}
            </UiBadge>
          </div>

          <!-- Period grid — click to toggle close/reopen. -->
          <div v-if="year.periods?.length" class="grid grid-cols-4 md:grid-cols-6 gap-1.5">
            <button
              v-for="period in year.periods"
              :key="period.id"
              type="button"
              class="text-center p-2 rounded-md text-xs border transition-colors"
              :class="period.is_closed
                ? 'bg-neutral-50/60 dark:bg-neutral-950/40 border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 hover:border-neutral-300 dark:hover:border-neutral-700'
                : 'bg-success-500/10 border-success-500/20 text-success-700 dark:text-success-400 hover:border-success-500/40'"
              :title="period.is_closed
                ? (locale === 'ar' ? 'انقر لإعادة الفتح' : 'Click to reopen')
                : (locale === 'ar' ? 'انقر للإغلاق' : 'Click to close')"
              @click="togglePeriod(period)"
            >
              <p class="font-bold tabular-nums">{{ period.period_number }}</p>
              <p class="text-[10px] mt-0.5">
                {{ period.is_closed
                  ? (locale === 'ar' ? 'مغلقة' : 'Closed')
                  : (locale === 'ar' ? 'مفتوحة' : 'Open') }}
              </p>
            </button>
          </div>
        </div>
      </div>

      <!-- Create slideover -->
      <UiSlideOver v-model="createOpen" :title="locale === 'ar' ? 'سنة مالية جديدة' : 'New Fiscal Year'">
        <form @submit.prevent="handleCreate" class="space-y-3">
          <div>
            <label class="fy-label">
              {{ locale === 'ar' ? 'الاسم' : 'Name' }}
              <span class="text-danger-500">*</span>
            </label>
            <input
              v-model="form.name"
              type="text"
              required
              class="fy-input"
              :placeholder="locale === 'ar' ? 'السنة المالية 2026' : 'Fiscal Year 2026'"
            />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="fy-label">
                {{ locale === 'ar' ? 'بداية' : 'Start Date' }}
                <span class="text-danger-500">*</span>
              </label>
              <input v-model="form.start_date" type="date" required class="fy-input" />
            </div>
            <div>
              <label class="fy-label">
                {{ locale === 'ar' ? 'نهاية' : 'End Date' }}
                <span class="text-danger-500">*</span>
              </label>
              <input v-model="form.end_date" type="date" required class="fy-input" />
            </div>
          </div>
          <div class="flex items-center gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
            <UiAppButton type="button" variant="outline" class="flex-1" @click="createOpen = false">
              {{ $t('common.cancel') }}
            </UiAppButton>
            <UiAppButton type="submit" variant="primary" icon="i-lucide-plus" :loading="creating" class="flex-1">
              {{ $t('common.create') }}
            </UiAppButton>
          </div>
        </form>
      </UiSlideOver>
    </div>
  </FeatureBoundary>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })

const { locale } = useI18n()
const api = useApi()
const toastStore = useToastStore()

const years = ref<any[]>([])
const loading = ref(true)
const createOpen = ref(false)
const creating = ref(false)

const now = new Date()
const form = reactive({
  name: locale.value === 'ar' ? `السنة المالية ${now.getFullYear()}` : `Fiscal Year ${now.getFullYear()}`,
  start_date: `${now.getFullYear()}-01-01`,
  end_date: `${now.getFullYear()}-12-31`,
})

function formatDate(d: string | null | undefined) {
  if (!d) return '—'
  try {
    return new Date(d).toLocaleDateString(locale.value === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    })
  } catch {
    return d
  }
}

async function load() {
  loading.value = true
  try {
    const res = await api.get<{ data: any[] }>('/fiscal-years')
    years.value = res.data
  } catch {
    years.value = []
  } finally {
    loading.value = false
  }
}

async function handleCreate() {
  creating.value = true
  try {
    await api.post('/fiscal-years', form)
    toastStore.success(locale.value === 'ar' ? 'تم الإنشاء' : 'Created')
    createOpen.value = false
    load()
  } catch (e: any) {
    toastStore.error(e?.data?.message || e?.message || 'Error')
  } finally {
    creating.value = false
  }
}

async function togglePeriod(period: any) {
  try {
    const action = period.is_closed ? 'reopen' : 'close'
    await api.post(`/fiscal-periods/${period.id}/${action}`)
    toastStore.success(locale.value === 'ar' ? 'تم التحديث' : 'Updated')
    load()
  } catch (e: any) {
    toastStore.error(e?.data?.message || e?.message || 'Error')
  }
}

onMounted(load)
</script>

<style scoped>
@reference "~/assets/css/tokens.css";

.fy-label { @apply block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5; }

.fy-input {
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
.fy-input:focus {
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 2px color-mix(in oklab, var(--color-primary-500) 20%, transparent);
}
:global(html.dark) .fy-input {
  background-color: var(--color-neutral-900);
  border-color: var(--color-neutral-800);
  color: var(--color-neutral-0);
}
</style>
