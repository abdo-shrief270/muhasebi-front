<template>
  <div>
    <NuxtLayout name="dashboard">
      <UiPageHeader :title="locale === 'ar' ? 'التدفقات النقدية' : 'Cash Flow Statement'">
        <template #actions>
          <UiDateRangePicker v-model:from="dateFrom" v-model:to="dateTo" />
          <UiAppButton variant="outline" size="sm" @click="load">{{ locale === 'ar' ? 'تحديث' : 'Refresh' }}</UiAppButton>
          <UiAppButton variant="ghost" size="sm" @click="downloadPdf">PDF</UiAppButton>
        </template>
      </UiPageHeader>

      <div v-motion :initial="{ opacity: 0, y: 15 }" :enter="{ opacity: 1, y: 0 }" class="bg-white rounded-2xl border border-gray-100/80 overflow-hidden">
        <div v-if="loading" class="p-6"><UiLoadingSkeleton :lines="10" :height="20" /></div>

        <div v-else-if="data" class="divide-y divide-gray-50">
          <div v-for="(section, key) in sections" :key="key" class="p-5">
            <h3 class="font-bold mb-3" :class="section.color">{{ section.title }}</h3>
            <div v-for="item in (data[key]?.items || [])" :key="item.name" class="flex justify-between py-1.5 text-sm">
              <span class="text-gray-600">{{ item.name }}</span>
              <span class="font-mono" dir="ltr" :class="Number(item.amount) >= 0 ? 'text-emerald-600' : 'text-red-500'">
                {{ Number(item.amount).toLocaleString() }}
              </span>
            </div>
            <div class="flex justify-between pt-2 mt-2 border-t border-gray-100 font-bold text-sm">
              <span>{{ section.totalLabel }}</span>
              <span class="font-mono" dir="ltr">{{ Number(data[key]?.total || 0).toLocaleString() }}</span>
            </div>
          </div>

          <div class="p-5 bg-gray-50/50">
            <div class="flex justify-between font-bold text-lg">
              <span>{{ locale === 'ar' ? 'صافي التغير في النقد' : 'Net Change in Cash' }}</span>
              <span class="font-mono" dir="ltr" :class="Number(data.net_change || 0) >= 0 ? 'text-emerald-600' : 'text-red-500'">
                {{ Number(data.net_change || 0).toLocaleString() }} {{ locale === 'ar' ? 'ج.م.' : 'EGP' }}
              </span>
            </div>
          </div>
        </div>

        <div v-else class="p-8"><UiEmptyState icon="&#8644;" :title="locale === 'ar' ? 'لا توجد بيانات' : 'No data'" /></div>
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

const sections = computed(() => ({
  operating: {
    title: locale.value === 'ar' ? 'الأنشطة التشغيلية' : 'Operating Activities',
    color: 'text-blue-600',
    totalLabel: locale.value === 'ar' ? 'صافي التشغيلية' : 'Net Operating',
  },
  investing: {
    title: locale.value === 'ar' ? 'الأنشطة الاستثمارية' : 'Investing Activities',
    color: 'text-amber-600',
    totalLabel: locale.value === 'ar' ? 'صافي الاستثمارية' : 'Net Investing',
  },
  financing: {
    title: locale.value === 'ar' ? 'الأنشطة التمويلية' : 'Financing Activities',
    color: 'text-purple-600',
    totalLabel: locale.value === 'ar' ? 'صافي التمويلية' : 'Net Financing',
  },
}))

async function load() {
  loading.value = true
  try {
    const res = await api.get<{ data: any }>(`/reports/cash-flow?from=${dateFrom.value}&to=${dateTo.value}`)
    data.value = res.data
  } catch { data.value = null }
  finally { loading.value = false }
}

function downloadPdf() {
  window.open(`${config.public.apiBase}/reports/cash-flow/pdf?from=${dateFrom.value}&to=${dateTo.value}`, '_blank')
}

onMounted(load)
</script>
