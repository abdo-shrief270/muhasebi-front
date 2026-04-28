<template>
  <FeatureBoundary id="eta">
    <div class="px-4 lg:px-6 py-5 max-w-[1400px] mx-auto">
      <UiPageHeader
        icon="i-lucide-refresh-cw"
        :title="locale === 'ar' ? 'مطابقة المستندات' : 'ETA Reconciliation'"
        :subtitle="locale === 'ar' ? 'مقارنة المستندات المحلية مع سجلات مصلحة الضرائب' : 'Compare local documents against ETA records'"
      >
        <template #actions>
          <UiAppButton
            variant="primary"
            size="sm"
            icon="i-lucide-play"
            :loading="running"
            @click="runReconcile"
          >
            {{ locale === 'ar' ? 'تشغيل المطابقة' : 'Run Reconciliation' }}
          </UiAppButton>
        </template>
      </UiPageHeader>

      <!-- Idle state -->
      <div
        v-if="!result && !running"
        class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-12 text-center"
      >
        <div class="w-12 h-12 mx-auto mb-3 rounded-full bg-warning-50 dark:bg-warning-500/10 flex items-center justify-center">
          <UIcon name="i-lucide-refresh-cw" class="w-5 h-5 text-warning-600 dark:text-warning-400" />
        </div>
        <p class="text-sm font-semibold text-neutral-900 dark:text-neutral-0 mb-1">
          {{ locale === 'ar' ? 'مطابقة المستندات مع مصلحة الضرائب' : 'Reconcile with ETA' }}
        </p>
        <p class="text-xs text-neutral-500 dark:text-neutral-400 max-w-md mx-auto">
          {{ locale === 'ar' ? 'اضغط الزر أعلاه لمقارنة المستندات المحلية مع سجلات مصلحة الضرائب وكشف أي اختلافات.' : 'Click the button above to compare local documents with ETA records and surface any discrepancies.' }}
        </p>
      </div>

      <!-- Running state -->
      <div
        v-if="running"
        class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-12 text-center"
      >
        <div class="w-10 h-10 mx-auto mb-3 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        <p class="text-sm font-medium text-neutral-700 dark:text-neutral-200">
          {{ locale === 'ar' ? 'جارٍ المطابقة...' : 'Running reconciliation...' }}
        </p>
      </div>

      <!-- Results -->
      <div v-if="result" class="space-y-3">
        <!-- Summary cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div class="relative bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
            <span class="absolute top-0 start-3 right-3 h-0.5 rounded-b-full bg-success-500" aria-hidden="true" />
            <p class="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">
              {{ locale === 'ar' ? 'متطابق' : 'Matched' }}
            </p>
            <p class="font-mono text-2xl font-bold tabular-nums text-success-700 dark:text-success-400">{{ result.matched }}</p>
          </div>
          <div class="relative bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
            <span class="absolute top-0 start-3 right-3 h-0.5 rounded-b-full bg-warning-500" aria-hidden="true" />
            <p class="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">
              {{ locale === 'ar' ? 'غير متطابق' : 'Mismatched' }}
            </p>
            <p class="font-mono text-2xl font-bold tabular-nums text-warning-700 dark:text-warning-500">{{ result.mismatched }}</p>
          </div>
          <div class="relative bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
            <span class="absolute top-0 start-3 right-3 h-0.5 rounded-b-full bg-neutral-400 dark:bg-neutral-600" aria-hidden="true" />
            <p class="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">
              {{ locale === 'ar' ? 'إجمالي' : 'Total' }}
            </p>
            <p class="font-mono text-2xl font-bold tabular-nums text-neutral-900 dark:text-neutral-0">{{ result.matched + result.mismatched }}</p>
          </div>
        </div>

        <!-- Details -->
        <div
          v-if="result.details?.length > 0"
          class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden"
        >
          <div class="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800">
            <h3 class="text-sm font-semibold text-neutral-900 dark:text-neutral-0 flex items-center gap-1.5">
              <UIcon name="i-lucide-list" class="w-3.5 h-3.5 text-neutral-400" />
              {{ locale === 'ar' ? 'التفاصيل' : 'Details' }}
            </h3>
          </div>
          <table class="w-full text-sm">
            <thead class="bg-neutral-50/60 dark:bg-neutral-950/40 text-[11px] uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              <tr>
                <th class="text-start px-4 py-2 font-semibold">UUID</th>
                <th class="text-start px-4 py-2 font-semibold">{{ locale === 'ar' ? 'المشكلة' : 'Issue' }}</th>
                <th class="text-start px-4 py-2 font-semibold">{{ locale === 'ar' ? 'المحلي' : 'Local' }}</th>
                <th class="text-start px-4 py-2 font-semibold">ETA</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-neutral-100 dark:divide-neutral-800/60">
              <tr v-for="d in result.details" :key="d.eta_uuid" class="hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40 transition-colors">
                <td class="px-4 py-2.5 font-mono text-[10px] text-neutral-500 dark:text-neutral-400" dir="ltr">{{ d.eta_uuid?.substring(0, 20) }}…</td>
                <td class="px-4 py-2.5">
                  <UiBadge :color="d.issue === 'status_mismatch' ? 'orange' : 'red'">{{ d.issue }}</UiBadge>
                </td>
                <td class="px-4 py-2.5 text-sm text-neutral-700 dark:text-neutral-200">{{ d.local_status || '—' }}</td>
                <td class="px-4 py-2.5 text-sm text-neutral-700 dark:text-neutral-200">{{ d.eta_status || '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </FeatureBoundary>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })
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
