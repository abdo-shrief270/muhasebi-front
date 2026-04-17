<template>
  <div>
    <NuxtLayout name="dashboard">
      <UiPageHeader :title="locale === 'ar' ? 'مطابقة المستندات' : 'ETA Reconciliation'">
        <template #actions>
          <UiAppButton variant="primary" :loading="running" @click="runReconcile">
            {{ locale === 'ar' ? 'تشغيل المطابقة' : 'Run Reconciliation' }}
          </UiAppButton>
        </template>
      </UiPageHeader>

      <div v-if="!result && !running" class="bg-white rounded-2xl border border-gray-100/80 p-12 text-center">
        <UiEmptyState
          icon="🔄"
          :title="locale === 'ar' ? 'مطابقة المستندات مع مصلحة الضرائب' : 'Reconcile with ETA'"
          :description="locale === 'ar' ? 'اضغط الزر أعلاه لمقارنة المستندات المحلية مع سجلات مصلحة الضرائب' : 'Click the button above to compare local documents with ETA records'"
        />
      </div>

      <div v-if="running" class="bg-white rounded-2xl border border-gray-100/80 p-12 text-center">
        <div class="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-gray-500">{{ locale === 'ar' ? 'جارٍ المطابقة...' : 'Running reconciliation...' }}</p>
      </div>

      <div v-if="result" v-motion :initial="{ opacity: 0, y: 15 }" :enter="{ opacity: 1, y: 0 }" class="space-y-5">
        <!-- Summary -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-white rounded-xl border border-gray-100/80 p-5 text-center">
            <p class="text-3xl font-bold text-emerald-600">{{ result.matched }}</p>
            <p class="text-sm text-gray-400 mt-1">{{ locale === 'ar' ? 'متطابق' : 'Matched' }}</p>
          </div>
          <div class="bg-white rounded-xl border border-gray-100/80 p-5 text-center">
            <p class="text-3xl font-bold text-amber-500">{{ result.mismatched }}</p>
            <p class="text-sm text-gray-400 mt-1">{{ locale === 'ar' ? 'غير متطابق' : 'Mismatched' }}</p>
          </div>
          <div class="bg-white rounded-xl border border-gray-100/80 p-5 text-center">
            <p class="text-3xl font-bold text-gray-800">{{ result.matched + result.mismatched }}</p>
            <p class="text-sm text-gray-400 mt-1">{{ locale === 'ar' ? 'إجمالي' : 'Total' }}</p>
          </div>
        </div>

        <!-- Details -->
        <div v-if="result.details?.length > 0" class="bg-white rounded-2xl border border-gray-100/80 overflow-hidden">
          <div class="px-5 py-3 border-b border-gray-50">
            <h3 class="font-semibold text-gray-700">{{ locale === 'ar' ? 'التفاصيل' : 'Details' }}</h3>
          </div>
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-gray-50/80">
                <th class="px-5 py-2.5 text-start text-xs text-gray-400 uppercase">UUID</th>
                <th class="px-5 py-2.5 text-start text-xs text-gray-400 uppercase">{{ locale === 'ar' ? 'المشكلة' : 'Issue' }}</th>
                <th class="px-5 py-2.5 text-start text-xs text-gray-400 uppercase">{{ locale === 'ar' ? 'المحلي' : 'Local' }}</th>
                <th class="px-5 py-2.5 text-start text-xs text-gray-400 uppercase">ETA</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="d in result.details" :key="d.eta_uuid" class="border-t border-gray-50">
                <td class="px-5 py-2.5 font-mono text-[10px] text-gray-400" dir="ltr">{{ d.eta_uuid?.substring(0, 20) }}...</td>
                <td class="px-5 py-2.5">
                  <UiBadge :color="d.issue === 'status_mismatch' ? 'orange' : 'red'">{{ d.issue }}</UiBadge>
                </td>
                <td class="px-5 py-2.5 text-gray-600">{{ d.local_status || '-' }}</td>
                <td class="px-5 py-2.5 text-gray-600">{{ d.eta_status || '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })
const { locale } = useI18n()
const api = useApi()
const toastStore = useToastStore()

const result = ref<any>(null)
const running = ref(false)

async function runReconcile() {
  running.value = true
  result.value = null
  try {
    const res = await api.post<{ data: any }>('/eta/reconcile')
    result.value = res.data
    toastStore.success(locale.value === 'ar' ? 'تمت المطابقة' : 'Reconciliation complete')
  } catch (e: any) { toastStore.error(e.data?.message || 'Error') }
  finally { running.value = false }
}
</script>
