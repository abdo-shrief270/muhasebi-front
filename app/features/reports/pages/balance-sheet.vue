<template>
  <div>
    <NuxtLayout name="dashboard">
      <FeatureBoundary id="reports">
      <UiPageHeader :title="locale === 'ar' ? 'الميزانية العمومية' : 'Balance Sheet'">
        <template #actions>
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-400">{{ locale === 'ar' ? 'كما في' : 'As of' }}</span>
            <input v-model="asOfDate" type="date" class="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all" />
          </div>
          <UiAppButton variant="outline" size="sm" @click="load">{{ locale === 'ar' ? 'تحديث' : 'Refresh' }}</UiAppButton>
          <UiAppButton variant="ghost" size="sm" @click="downloadPdf">PDF</UiAppButton>
        </template>
      </UiPageHeader>

      <div v-motion :initial="{ opacity: 0, y: 15 }" :enter="{ opacity: 1, y: 0 }" class="bg-white rounded-2xl border border-gray-100/80 overflow-hidden">
        <div v-if="loading" class="p-6"><UiLoadingSkeleton :lines="12" :height="20" /></div>

        <div v-else-if="data" class="divide-y divide-gray-50">
          <!-- Assets -->
          <div class="p-5">
            <h3 class="font-bold text-blue-600 mb-3">{{ locale === 'ar' ? 'الأصول' : 'Assets' }}</h3>
            <div v-for="item in data.assets?.accounts || []" :key="item.code" class="flex justify-between py-1.5 text-sm">
              <span class="text-gray-600"><span class="font-mono text-xs text-gray-400 me-2">{{ item.code }}</span>{{ locale === 'ar' ? item.name_ar : item.name_en }}</span>
              <span class="font-mono" dir="ltr">{{ Number(item.balance).toLocaleString() }}</span>
            </div>
            <div class="flex justify-between pt-2 mt-2 border-t border-gray-100 font-bold text-sm">
              <span>{{ locale === 'ar' ? 'إجمالي الأصول' : 'Total Assets' }}</span>
              <span class="font-mono text-blue-600" dir="ltr">{{ Number(data.assets?.total || 0).toLocaleString() }}</span>
            </div>
          </div>

          <!-- Liabilities -->
          <div class="p-5">
            <h3 class="font-bold text-amber-600 mb-3">{{ locale === 'ar' ? 'الخصوم' : 'Liabilities' }}</h3>
            <div v-for="item in data.liabilities?.accounts || []" :key="item.code" class="flex justify-between py-1.5 text-sm">
              <span class="text-gray-600"><span class="font-mono text-xs text-gray-400 me-2">{{ item.code }}</span>{{ locale === 'ar' ? item.name_ar : item.name_en }}</span>
              <span class="font-mono" dir="ltr">{{ Number(item.balance).toLocaleString() }}</span>
            </div>
            <div class="flex justify-between pt-2 mt-2 border-t border-gray-100 font-bold text-sm">
              <span>{{ locale === 'ar' ? 'إجمالي الخصوم' : 'Total Liabilities' }}</span>
              <span class="font-mono text-amber-600" dir="ltr">{{ Number(data.liabilities?.total || 0).toLocaleString() }}</span>
            </div>
          </div>

          <!-- Equity -->
          <div class="p-5">
            <h3 class="font-bold text-purple-600 mb-3">{{ locale === 'ar' ? 'حقوق الملكية' : 'Equity' }}</h3>
            <div v-for="item in data.equity?.accounts || []" :key="item.code" class="flex justify-between py-1.5 text-sm">
              <span class="text-gray-600"><span class="font-mono text-xs text-gray-400 me-2">{{ item.code }}</span>{{ locale === 'ar' ? item.name_ar : item.name_en }}</span>
              <span class="font-mono" dir="ltr">{{ Number(item.balance).toLocaleString() }}</span>
            </div>
            <div class="flex justify-between pt-2 mt-2 border-t border-gray-100 font-bold text-sm">
              <span>{{ locale === 'ar' ? 'إجمالي حقوق الملكية' : 'Total Equity' }}</span>
              <span class="font-mono text-purple-600" dir="ltr">{{ Number(data.equity?.total || 0).toLocaleString() }}</span>
            </div>
          </div>

          <!-- Balance check -->
          <div class="p-5 bg-gray-50/50">
            <div class="flex justify-between font-bold">
              <span>{{ locale === 'ar' ? 'الخصوم + حقوق الملكية' : 'Liabilities + Equity' }}</span>
              <span class="font-mono" dir="ltr">{{ liabilitiesAndEquity.toLocaleString() }}</span>
            </div>
            <div class="mt-2 flex justify-center">
              <UiBadge :color="isBalanced ? 'green' : 'red'" dot>
                {{ isBalanced ? (locale === 'ar' ? 'متوازن' : 'Balanced') : (locale === 'ar' ? 'غير متوازن' : 'Not Balanced') }}
              </UiBadge>
            </div>
          </div>
        </div>

        <div v-else class="p-8"><UiEmptyState icon="&#9881;" :title="locale === 'ar' ? 'لا توجد بيانات' : 'No data'" /></div>
      </div>
      </FeatureBoundary>
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })
const { locale } = useI18n()
const api = useApi()
const config = useRuntimeConfig()

const asOfDate = ref(new Date().toISOString().split('T')[0])
const data = ref<any>(null)
const loading = ref(true)

const liabilitiesAndEquity = computed(() => (data.value?.liabilities?.total || 0) + (data.value?.equity?.total || 0))
const isBalanced = computed(() => Math.abs((data.value?.assets?.total || 0) - liabilitiesAndEquity.value) < 0.01)

async function load() {
  loading.value = true
  try {
    const res = await api.get<{ data: any }>(`/reports/balance-sheet?date=${asOfDate.value}`)
    data.value = res.data
  } catch { data.value = null }
  finally { loading.value = false }
}

function downloadPdf() {
  window.open(`${config.public.apiBase}/reports/balance-sheet/pdf?date=${asOfDate.value}`, '_blank')
}

onMounted(load)
</script>
