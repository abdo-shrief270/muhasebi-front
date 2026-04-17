<template>
  <div>
    <NuxtLayout name="dashboard">
      <UiPageHeader :title="locale === 'ar' ? 'تقرير أعمار الديون' : 'Aging Report'" />

      <div v-if="loading"><UiLoadingSkeleton :lines="8" :height="24" /></div>

      <div v-else-if="data" v-motion :initial="{ opacity: 0, y: 15 }" :enter="{ opacity: 1, y: 0 }" class="bg-white rounded-2xl border border-gray-100/80 overflow-hidden">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gray-50/80 border-b border-gray-100">
              <th class="px-5 py-3 text-start text-xs font-semibold text-gray-400 uppercase">{{ locale === 'ar' ? 'العميل' : 'Client' }}</th>
              <th class="px-4 py-3 text-xs font-semibold text-gray-400 uppercase">{{ locale === 'ar' ? 'جاري' : 'Current' }}</th>
              <th class="px-4 py-3 text-xs font-semibold text-gray-400 uppercase">1-30</th>
              <th class="px-4 py-3 text-xs font-semibold text-gray-400 uppercase">31-60</th>
              <th class="px-4 py-3 text-xs font-semibold text-gray-400 uppercase">61-90</th>
              <th class="px-4 py-3 text-xs font-semibold text-gray-400 uppercase">90+</th>
              <th class="px-4 py-3 text-xs font-semibold text-gray-400 uppercase">{{ locale === 'ar' ? 'الإجمالي' : 'Total' }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in data.clients" :key="row.client_id" class="border-b border-gray-50 hover:bg-gray-50/30">
              <td class="px-5 py-3 font-medium text-gray-700">{{ row.client_name }}</td>
              <td class="px-4 py-3 font-mono" dir="ltr">{{ Number(row.current || 0).toLocaleString() }}</td>
              <td class="px-4 py-3 font-mono" dir="ltr">{{ Number(row.days_1_30 || 0).toLocaleString() }}</td>
              <td class="px-4 py-3 font-mono" dir="ltr">{{ Number(row.days_31_60 || 0).toLocaleString() }}</td>
              <td class="px-4 py-3 font-mono" dir="ltr">{{ Number(row.days_61_90 || 0).toLocaleString() }}</td>
              <td class="px-4 py-3 font-mono text-red-500" dir="ltr">{{ Number(row.days_over_90 || 0).toLocaleString() }}</td>
              <td class="px-4 py-3 font-mono font-bold text-gray-800" dir="ltr">{{ Number(row.total || 0).toLocaleString() }}</td>
            </tr>
          </tbody>
          <tfoot v-if="data.totals">
            <tr class="border-t-2 border-gray-200 bg-gray-50/80 font-bold">
              <td class="px-5 py-3">{{ $t('common.total') }}</td>
              <td class="px-4 py-3 font-mono" dir="ltr">{{ Number(data.totals.current || 0).toLocaleString() }}</td>
              <td class="px-4 py-3 font-mono" dir="ltr">{{ Number(data.totals.days_1_30 || 0).toLocaleString() }}</td>
              <td class="px-4 py-3 font-mono" dir="ltr">{{ Number(data.totals.days_31_60 || 0).toLocaleString() }}</td>
              <td class="px-4 py-3 font-mono" dir="ltr">{{ Number(data.totals.days_61_90 || 0).toLocaleString() }}</td>
              <td class="px-4 py-3 font-mono text-red-500" dir="ltr">{{ Number(data.totals.days_over_90 || 0).toLocaleString() }}</td>
              <td class="px-4 py-3 font-mono text-gray-800" dir="ltr">{{ Number(data.totals.total || 0).toLocaleString() }}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div v-else class="bg-white rounded-2xl border border-gray-100/80 p-8">
        <UiEmptyState icon="📊" :title="locale === 'ar' ? 'لا توجد بيانات' : 'No data'" />
      </div>
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })
const { locale } = useI18n()
const api = useApi()

const data = ref<any>(null)
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await api.get<{ data: any }>('/reports/aging')
    data.value = res.data
  } catch { data.value = null }
  finally { loading.value = false }
})
</script>
