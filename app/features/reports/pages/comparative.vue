<template>
  <div>
    <NuxtLayout name="dashboard">
      <FeatureBoundary id="reports">
      <UiPageHeader :title="locale === 'ar' ? 'تقارير مقارنة' : 'Comparative Reports'">
        <template #actions>
          <select v-model="reportType" class="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white outline-none">
            <option value="income-statement">{{ locale === 'ar' ? 'قائمة الدخل' : 'Income Statement' }}</option>
            <option value="balance-sheet">{{ locale === 'ar' ? 'الميزانية' : 'Balance Sheet' }}</option>
          </select>
          <UiDateRangePicker v-model:from="period1From" v-model:to="period1To" />
          <span class="text-xs text-gray-400">vs</span>
          <UiDateRangePicker v-model:from="period2From" v-model:to="period2To" />
          <UiAppButton variant="outline" size="sm" @click="load">{{ locale === 'ar' ? 'مقارنة' : 'Compare' }}</UiAppButton>
        </template>
      </UiPageHeader>

      <div v-if="loading"><UiLoadingSkeleton :lines="10" :height="20" /></div>

      <div v-else-if="data" v-motion :initial="{ opacity: 0, y: 15 }" :enter="{ opacity: 1, y: 0 }" class="bg-white rounded-2xl border border-gray-100/80 overflow-hidden">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gray-50/80 border-b border-gray-100">
              <th class="px-5 py-3 text-start text-xs font-semibold text-gray-400 uppercase">{{ locale === 'ar' ? 'البند' : 'Item' }}</th>
              <th class="px-5 py-3 text-xs font-semibold text-gray-400 uppercase w-[150px]">{{ locale === 'ar' ? 'الفترة 1' : 'Period 1' }}</th>
              <th class="px-5 py-3 text-xs font-semibold text-gray-400 uppercase w-[150px]">{{ locale === 'ar' ? 'الفترة 2' : 'Period 2' }}</th>
              <th class="px-5 py-3 text-xs font-semibold text-gray-400 uppercase w-[120px]">{{ locale === 'ar' ? 'التغير' : 'Change' }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in data.rows" :key="row.name" class="border-b border-gray-50" :class="row.is_total ? 'bg-gray-50/80 font-bold' : ''">
              <td class="px-5 py-3 text-gray-700">{{ row.name }}</td>
              <td class="px-5 py-3 font-mono text-center" dir="ltr">{{ Number(row.period1).toLocaleString() }}</td>
              <td class="px-5 py-3 font-mono text-center" dir="ltr">{{ Number(row.period2).toLocaleString() }}</td>
              <td class="px-5 py-3 font-mono text-center" dir="ltr" :class="row.change > 0 ? 'text-emerald-600' : row.change < 0 ? 'text-red-500' : 'text-gray-400'">
                {{ row.change > 0 ? '+' : '' }}{{ Number(row.change).toLocaleString() }}
                <span v-if="row.change_percent" class="text-[10px] text-gray-400 ms-1">({{ row.change_percent }}%)</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else-if="!loading" class="bg-white rounded-2xl border border-gray-100/80 p-8">
        <UiEmptyState icon="📊" :title="locale === 'ar' ? 'اختر الفترات وانقر مقارنة' : 'Select periods and click Compare'" />
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
const reportType = ref('income-statement')
const period1From = ref(`${now.getFullYear()}-01-01`)
const period1To = ref(`${now.getFullYear()}-06-30`)
const period2From = ref(`${now.getFullYear() - 1}-01-01`)
const period2To = ref(`${now.getFullYear() - 1}-06-30`)
const data = ref<any>(null)
const loading = ref(false)

async function load() {
  loading.value = true
  try {
    const endpoint = reportType.value === 'income-statement' ? '/reports/comparative/income-statement' : '/reports/comparative/balance-sheet'
    const res = await api.get<{ data: any }>(`${endpoint}?from1=${period1From.value}&to1=${period1To.value}&from2=${period2From.value}&to2=${period2To.value}`)
    data.value = res.data
  } catch { data.value = null }
  finally { loading.value = false }
}
</script>
