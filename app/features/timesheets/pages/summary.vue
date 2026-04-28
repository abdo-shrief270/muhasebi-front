<template>
  <FeatureBoundary id="timesheets">
    <div class="px-4 lg:px-6 py-5 max-w-[1400px] mx-auto">
      <UiPageHeader
        icon="i-lucide-bar-chart-2"
        :title="locale === 'ar' ? 'ملخص الساعات' : 'Timesheet Summary'"
        :subtitle="locale === 'ar' ? 'تحليل الساعات حسب العميل والموظف والتاريخ' : 'Hours by client, user, and date'"
      >
        <template #actions>
          <UiDateRangePicker v-model:from="dateFrom" v-model:to="dateTo" />
          <UiAppButton variant="outline" size="sm" icon="i-lucide-refresh-cw" :loading="loading" @click="load">
            {{ locale === 'ar' ? 'تحديث' : 'Refresh' }}
          </UiAppButton>
          <UiAppButton variant="primary" size="sm" icon="i-lucide-list" @click="navigateTo('/timesheets')">
            {{ locale === 'ar' ? 'القيود' : 'Entries' }}
          </UiAppButton>
        </template>
      </UiPageHeader>

      <div v-if="loading" class="space-y-3">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div v-for="i in 3" :key="i" class="h-24 rounded-xl bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
        </div>
        <div class="h-40 rounded-xl bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
      </div>

      <div v-else-if="data" class="space-y-3">
        <!-- KPIs -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div
            v-for="card in kpiCards"
            :key="card.key"
            class="relative bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4"
          >
            <span class="absolute top-0 start-3 right-3 h-0.5 rounded-b-full" :class="card.tint" aria-hidden="true" />
            <div class="flex items-start justify-between mb-1">
              <p class="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">{{ card.label }}</p>
              <UIcon :name="card.icon" class="w-4 h-4" :class="card.iconColor" />
            </div>
            <p class="font-mono text-2xl font-bold tabular-nums text-neutral-900 dark:text-neutral-0" dir="ltr">
              {{ Number(card.value || 0).toFixed(1) }}<span class="text-sm font-normal text-neutral-500 dark:text-neutral-400 ms-1">h</span>
            </p>
          </div>
        </div>

        <!-- By Client -->
        <div
          v-if="data.by_client?.length"
          class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4"
        >
          <h3 class="text-sm font-semibold text-neutral-900 dark:text-neutral-0 mb-3 flex items-center gap-1.5">
            <UIcon name="i-lucide-users" class="w-3.5 h-3.5 text-neutral-400" />
            {{ locale === 'ar' ? 'حسب العميل' : 'By Client' }}
          </h3>
          <div class="space-y-2">
            <div v-for="item in data.by_client" :key="item.client_id" class="flex items-center justify-between gap-3">
              <span class="text-sm text-neutral-700 dark:text-neutral-200 truncate">
                {{ item.client_name || (locale === 'ar' ? 'بدون عميل' : 'No client') }}
              </span>
              <div class="flex items-center gap-2 flex-shrink-0">
                <div class="w-32 bg-neutral-100 dark:bg-neutral-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    class="bg-primary-500 rounded-full h-1.5 transition-all duration-500"
                    :style="{ width: `${Math.min((item.hours / data.total_hours) * 100, 100)}%` }"
                  />
                </div>
                <span class="font-mono text-xs font-semibold text-neutral-900 dark:text-neutral-0 w-14 text-end tabular-nums" dir="ltr">{{ item.hours }}h</span>
              </div>
            </div>
          </div>
        </div>

        <!-- By User -->
        <div
          v-if="data.by_user?.length"
          class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4"
        >
          <h3 class="text-sm font-semibold text-neutral-900 dark:text-neutral-0 mb-3 flex items-center gap-1.5">
            <UIcon name="i-lucide-user" class="w-3.5 h-3.5 text-neutral-400" />
            {{ locale === 'ar' ? 'حسب الموظف' : 'By User' }}
          </h3>
          <div class="space-y-2">
            <div v-for="item in data.by_user" :key="item.user_id" class="flex items-center justify-between gap-3">
              <span class="text-sm text-neutral-700 dark:text-neutral-200 truncate">{{ item.user_name }}</span>
              <div class="flex items-center gap-2 flex-shrink-0">
                <div class="w-32 bg-neutral-100 dark:bg-neutral-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    class="bg-info-500 rounded-full h-1.5 transition-all duration-500"
                    :style="{ width: `${Math.min((item.hours / data.total_hours) * 100, 100)}%` }"
                  />
                </div>
                <span class="font-mono text-xs font-semibold text-neutral-900 dark:text-neutral-0 w-14 text-end tabular-nums" dir="ltr">{{ item.hours }}h</span>
              </div>
            </div>
          </div>
        </div>

        <!-- By Date — bar chart -->
        <div
          v-if="data.by_date?.length"
          class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4"
        >
          <h3 class="text-sm font-semibold text-neutral-900 dark:text-neutral-0 mb-3 flex items-center gap-1.5">
            <UIcon name="i-lucide-calendar" class="w-3.5 h-3.5 text-neutral-400" />
            {{ locale === 'ar' ? 'حسب التاريخ' : 'By Date' }}
          </h3>
          <div class="flex items-end gap-1 h-28">
            <div
              v-for="item in data.by_date"
              :key="item.date"
              class="flex-1 bg-primary-500/30 hover:bg-primary-500/60 rounded-t-sm transition-all relative group min-h-[4px]"
              :style="{ height: `${Math.max((item.hours / maxDailyHours) * 100, 5)}%` }"
            >
              <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-neutral-900 dark:bg-neutral-700 text-white text-[10px] px-2 py-1 rounded-md whitespace-nowrap z-10">
                <span dir="ltr">{{ item.date }}: {{ item.hours }}h</span>
              </div>
            </div>
          </div>
          <div class="flex justify-between mt-2 text-[10px] text-neutral-400 tabular-nums" dir="ltr">
            <span>{{ data.by_date[0]?.date }}</span>
            <span>{{ data.by_date[data.by_date.length - 1]?.date }}</span>
          </div>
        </div>
      </div>

      <div v-else class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 py-12 text-center">
        <div class="w-12 h-12 mx-auto mb-3 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
          <UIcon name="i-lucide-bar-chart-2" class="w-5 h-5 text-neutral-400" />
        </div>
        <p class="text-sm font-semibold text-neutral-900 dark:text-neutral-0 mb-1">
          {{ locale === 'ar' ? 'لا توجد بيانات' : 'No data for this period' }}
        </p>
        <p class="text-xs text-neutral-500 dark:text-neutral-400">
          {{ locale === 'ar' ? 'جرّب نطاقاً تاريخياً مختلفاً.' : 'Try a different date range.' }}
        </p>
      </div>
    </div>
  </FeatureBoundary>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })

const { locale } = useI18n()
const api = useApi()
const toastStore = useToastStore()

const now = new Date()
// Default to month-to-date — most useful for "how is this month going so far".
const dateFrom = ref(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`)
const dateTo = ref(now.toISOString().split('T')[0])
const data = ref<any>(null)
const loading = ref(true)

const maxDailyHours = computed(() => Math.max(...(data.value?.by_date?.map((d: any) => d.hours) || [1])))

const kpiCards = computed(() => [
  {
    key: 'total',
    label: locale.value === 'ar' ? 'إجمالي الساعات' : 'Total Hours',
    value: data.value?.total_hours,
    icon: 'i-lucide-clock',
    iconColor: 'text-primary-600 dark:text-primary-400',
    tint: 'bg-primary-500',
  },
  {
    key: 'billable',
    label: locale.value === 'ar' ? 'ساعات قابلة للفوترة' : 'Billable Hours',
    value: data.value?.billable_hours,
    icon: 'i-lucide-banknote',
    iconColor: 'text-success-600 dark:text-success-400',
    tint: 'bg-success-500',
  },
  {
    key: 'non_billable',
    label: locale.value === 'ar' ? 'ساعات غير قابلة' : 'Non-Billable',
    value: data.value?.non_billable_hours,
    icon: 'i-lucide-file-text',
    iconColor: 'text-neutral-500',
    tint: 'bg-neutral-300 dark:bg-neutral-700',
  },
])

watch([dateFrom, dateTo], () => { load() })

async function load() {
  loading.value = true
  try {
    const res = await api.get<{ data: any }>(`/timesheets/summary?from=${dateFrom.value}&to=${dateTo.value}`)
    data.value = res.data
  } catch (e: any) {
    data.value = null
    toastStore.error(e?.message || (locale.value === 'ar' ? 'تعذر تحميل الملخص' : 'Failed to load summary'))
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>
