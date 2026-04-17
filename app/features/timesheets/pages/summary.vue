<template>
  <div>
    <NuxtLayout name="dashboard">
      <FeatureBoundary id="timesheets">
      <UiPageHeader :title="locale === 'ar' ? 'ملخص الساعات' : 'Timesheet Summary'">
        <template #actions>
          <UiDateRangePicker v-model:from="dateFrom" v-model:to="dateTo" />
          <UiAppButton variant="outline" size="sm" @click="load">{{ locale === 'ar' ? 'تحديث' : 'Refresh' }}</UiAppButton>
          <UiAppButton variant="primary" size="sm" @click="navigateTo('/timesheets')">{{ locale === 'ar' ? 'القيود' : 'Entries' }}</UiAppButton>
        </template>
      </UiPageHeader>

      <div v-if="loading"><UiLoadingSkeleton :lines="6" :height="24" /></div>

      <div v-else-if="data" class="space-y-6">
        <!-- KPIs -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
          <UiKpiCard :label="locale === 'ar' ? 'إجمالي الساعات' : 'Total Hours'" :value="data.total_hours" icon="⏱" color="primary" format="none" :delay="100" />
          <UiKpiCard :label="locale === 'ar' ? 'ساعات قابلة للفوترة' : 'Billable Hours'" :value="data.billable_hours" icon="💰" color="green" format="none" :delay="200" />
          <UiKpiCard :label="locale === 'ar' ? 'ساعات غير قابلة' : 'Non-Billable'" :value="data.non_billable_hours" icon="📋" color="gray" format="none" :delay="300" />
        </div>

        <!-- By Client -->
        <div v-if="data.by_client?.length" v-motion :initial="{ opacity: 0, y: 15 }" :enter="{ opacity: 1, y: 0, transition: { delay: 400 } }" class="bg-white rounded-2xl border border-gray-100/80 p-6">
          <h3 class="font-semibold text-gray-700 mb-4">{{ locale === 'ar' ? 'حسب العميل' : 'By Client' }}</h3>
          <div class="space-y-3">
            <div v-for="item in data.by_client" :key="item.client_id" class="flex items-center justify-between">
              <span class="text-sm text-gray-600">{{ item.client_name || (locale === 'ar' ? 'بدون عميل' : 'No client') }}</span>
              <div class="flex items-center gap-3">
                <div class="w-32 bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div class="bg-primary-500 rounded-full h-2 transition-all duration-500" :style="{ width: `${Math.min((item.hours / data.total_hours) * 100, 100)}%` }"></div>
                </div>
                <span class="font-mono text-sm font-medium text-gray-800 w-16 text-end" dir="ltr">{{ item.hours }}h</span>
              </div>
            </div>
          </div>
        </div>

        <!-- By User -->
        <div v-if="data.by_user?.length" v-motion :initial="{ opacity: 0, y: 15 }" :enter="{ opacity: 1, y: 0, transition: { delay: 500 } }" class="bg-white rounded-2xl border border-gray-100/80 p-6">
          <h3 class="font-semibold text-gray-700 mb-4">{{ locale === 'ar' ? 'حسب الموظف' : 'By User' }}</h3>
          <div class="space-y-3">
            <div v-for="item in data.by_user" :key="item.user_id" class="flex items-center justify-between">
              <span class="text-sm text-gray-600">{{ item.user_name }}</span>
              <div class="flex items-center gap-3">
                <div class="w-32 bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div class="bg-secondary-400 rounded-full h-2 transition-all duration-500" :style="{ width: `${Math.min((item.hours / data.total_hours) * 100, 100)}%` }"></div>
                </div>
                <span class="font-mono text-sm font-medium text-gray-800 w-16 text-end" dir="ltr">{{ item.hours }}h</span>
              </div>
            </div>
          </div>
        </div>

        <!-- By Date -->
        <div v-if="data.by_date?.length" v-motion :initial="{ opacity: 0, y: 15 }" :enter="{ opacity: 1, y: 0, transition: { delay: 600 } }" class="bg-white rounded-2xl border border-gray-100/80 p-6">
          <h3 class="font-semibold text-gray-700 mb-4">{{ locale === 'ar' ? 'حسب التاريخ' : 'By Date' }}</h3>
          <div class="flex items-end gap-1 h-32">
            <div
              v-for="item in data.by_date"
              :key="item.date"
              class="flex-1 bg-primary-500/20 hover:bg-primary-500/40 rounded-t transition-all relative group"
              :style="{ height: `${Math.max((item.hours / maxDailyHours) * 100, 5)}%` }"
            >
              <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-gray-800 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap">
                {{ item.date }}: {{ item.hours }}h
              </div>
            </div>
          </div>
          <div class="flex justify-between mt-2 text-[10px] text-gray-400">
            <span>{{ data.by_date[0]?.date }}</span>
            <span>{{ data.by_date[data.by_date.length - 1]?.date }}</span>
          </div>
        </div>
      </div>
      </FeatureBoundary>
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })
const { locale } = useI18n()
const api = useApi()

const now = new Date()
const dateFrom = ref(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`)
const dateTo = ref(now.toISOString().split('T')[0])
const data = ref<any>(null)
const loading = ref(true)

const maxDailyHours = computed(() => Math.max(...(data.value?.by_date?.map((d: any) => d.hours) || [1])))

async function load() {
  loading.value = true
  try {
    const res = await api.get<{ data: any }>(`/timesheets/summary?from=${dateFrom.value}&to=${dateTo.value}`)
    data.value = res.data
  } catch { data.value = null }
  finally { loading.value = false }
}

onMounted(load)
</script>
