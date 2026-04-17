<template>
  <div>
    <NuxtLayout name="dashboard">
      <UiPageHeader :title="locale === 'ar' ? 'قائمة الدخل' : 'Income Statement'">
        <template #actions>
          <UiDateRangePicker v-model:from="dateFrom" v-model:to="dateTo" />
          <UiAppButton variant="outline" size="sm" @click="load">{{ locale === 'ar' ? 'تحديث' : 'Refresh' }}</UiAppButton>
          <UiAppButton variant="ghost" size="sm" @click="downloadPdf('income-statement')">PDF</UiAppButton>
        </template>
      </UiPageHeader>

      <div v-motion :initial="{ opacity: 0, y: 15 }" :enter="{ opacity: 1, y: 0 }" class="bg-white rounded-2xl border border-gray-100/80 overflow-hidden">
        <div v-if="loading" class="p-6"><UiLoadingSkeleton :lines="12" :height="20" /></div>

        <div v-else-if="data" class="divide-y divide-gray-50">
          <!-- Revenue -->
          <div class="p-5">
            <h3 class="font-bold text-emerald-600 mb-3">{{ locale === 'ar' ? 'الإيرادات' : 'Revenue' }}</h3>
            <div v-for="item in data.revenue?.accounts || []" :key="item.code" class="flex justify-between py-1.5 text-sm">
              <span class="text-gray-600">{{ locale === 'ar' ? item.name_ar : item.name_en }}</span>
              <span class="font-mono text-emerald-600" dir="ltr">{{ Number(item.balance).toLocaleString() }}</span>
            </div>
            <div class="flex justify-between pt-2 mt-2 border-t border-gray-100 font-bold text-sm">
              <span>{{ locale === 'ar' ? 'إجمالي الإيرادات' : 'Total Revenue' }}</span>
              <span class="font-mono text-emerald-600" dir="ltr">{{ Number(data.revenue?.total || 0).toLocaleString() }}</span>
            </div>
          </div>

          <!-- Expenses -->
          <div class="p-5">
            <h3 class="font-bold text-red-500 mb-3">{{ locale === 'ar' ? 'المصروفات' : 'Expenses' }}</h3>
            <div v-for="item in data.expenses?.accounts || []" :key="item.code" class="flex justify-between py-1.5 text-sm">
              <span class="text-gray-600">{{ locale === 'ar' ? item.name_ar : item.name_en }}</span>
              <span class="font-mono text-red-500" dir="ltr">{{ Number(item.balance).toLocaleString() }}</span>
            </div>
            <div class="flex justify-between pt-2 mt-2 border-t border-gray-100 font-bold text-sm">
              <span>{{ locale === 'ar' ? 'إجمالي المصروفات' : 'Total Expenses' }}</span>
              <span class="font-mono text-red-500" dir="ltr">{{ Number(data.expenses?.total || 0).toLocaleString() }}</span>
            </div>
          </div>

          <!-- Net Income -->
          <div class="p-5 bg-gray-50/50">
            <div class="flex justify-between font-bold text-lg">
              <span>{{ locale === 'ar' ? 'صافي الربح' : 'Net Income' }}</span>
              <span class="font-mono" dir="ltr" :class="netIncome >= 0 ? 'text-emerald-600' : 'text-red-500'">
                {{ netIncome.toLocaleString() }} {{ locale === 'ar' ? 'ج.م.' : 'EGP' }}
              </span>
            </div>
          </div>
        </div>

        <div v-else class="p-8"><UiEmptyState icon="&#9650;" :title="locale === 'ar' ? 'لا توجد بيانات' : 'No data'" /></div>
      </div>
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })
const { locale } = useI18n()
const api = useApi()
const config = useRuntimeConfig()

const now = new Date()
const dateFrom = ref(`${now.getFullYear()}-01-01`)
const dateTo = ref(now.toISOString().split('T')[0])
const data = ref<any>(null)
const loading = ref(true)

const netIncome = computed(() => (data.value?.revenue?.total || 0) - (data.value?.expenses?.total || 0))

async function load() {
  loading.value = true
  try {
    const res = await api.get<{ data: any }>(`/reports/income-statement?from=${dateFrom.value}&to=${dateTo.value}`)
    data.value = res.data
  } catch { data.value = null }
  finally { loading.value = false }
}

function downloadPdf(report: string) {
  window.open(`${config.public.apiBase}/reports/${report}/pdf?from=${dateFrom.value}&to=${dateTo.value}`, '_blank')
}

onMounted(load)
</script>
