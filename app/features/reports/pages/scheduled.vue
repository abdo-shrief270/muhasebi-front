<template>
  <FeatureBoundary id="reports-scheduled">
    <div class="px-4 lg:px-6 py-5 max-w-[1400px] mx-auto">
      <UiPageHeader
        icon="i-lucide-calendar-clock"
        :title="locale === 'ar' ? 'التقارير المجدولة' : 'Scheduled Reports'"
        :subtitle="locale === 'ar' ? 'تقارير تُولَّد وتُرسَل تلقائياً بجدول زمني' : 'Reports generated and emailed on a schedule'"
      />

      <Can :perm="PERMISSIONS.VIEW_REPORTS">
        <template #fallback>
          <div class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-12 text-center">
            <div class="w-12 h-12 mx-auto mb-4 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
              <UIcon name="i-lucide-lock" class="w-5 h-5 text-neutral-400" />
            </div>
            <p class="text-sm font-semibold text-neutral-900 dark:text-neutral-0 mb-1">
              {{ locale === 'ar' ? 'لا تملك صلاحية الوصول' : "You don't have access" }}
            </p>
          </div>
        </template>

        <UiDataTable
          :columns="columns"
          :rows="rows"
          :loading="loading"
          empty-icon="i-lucide-calendar-clock"
          :empty-title="locale === 'ar' ? 'لا توجد تقارير مجدولة' : 'No scheduled reports yet'"
          :empty-description="locale === 'ar'
            ? 'يمكنك جدولة التقارير من إعدادات كل تقرير ليُرسل تلقائياً عبر البريد.'
            : 'Schedule any report from its settings to receive it on a recurring email.'"
        >
          <template #cell-name="{ row }">
            <div class="flex items-center gap-2.5 min-w-0">
              <UIcon name="i-lucide-calendar-clock" class="w-4 h-4 text-info-500 flex-shrink-0" />
              <p class="text-sm font-medium text-neutral-900 dark:text-neutral-0 truncate">{{ row.name }}</p>
            </div>
          </template>

          <template #cell-report_type="{ value }">
            <span class="text-xs text-neutral-600 dark:text-neutral-400">{{ formatReportType(value) }}</span>
          </template>

          <template #cell-frequency="{ value }">
            <UiBadge color="blue">{{ formatFrequency(value) }}</UiBadge>
          </template>

          <template #cell-next_run_at="{ value }">
            <span class="text-xs text-neutral-700 dark:text-neutral-200 tabular-nums" dir="ltr">
              {{ formatDateTime(value) }}
            </span>
          </template>

          <template #cell-status="{ row }">
            <UiBadge :color="row.is_active ? 'green' : 'gray'" dot>
              {{ row.is_active
                ? (locale === 'ar' ? 'نشط' : 'Active')
                : (locale === 'ar' ? 'متوقف' : 'Paused') }}
            </UiBadge>
          </template>
        </UiDataTable>
      </Can>
    </div>
  </FeatureBoundary>
</template>

<script setup lang="ts">
import Can from '~/core/rbac/Can.vue'
import { PERMISSIONS } from '~/core/rbac/permissions'

definePageMeta({ layout: 'dashboard' })

const { locale } = useI18n()
const api = useApi()
const toastStore = useToastStore()
const rows = ref<any[]>([])
const loading = ref(true)

const columns = computed(() => [
  { key: 'name',        label: locale.value === 'ar' ? 'الاسم' : 'Name' },
  { key: 'report_type', label: locale.value === 'ar' ? 'النوع' : 'Report Type' },
  { key: 'frequency',   label: locale.value === 'ar' ? 'التكرار' : 'Frequency' },
  { key: 'next_run_at', label: locale.value === 'ar' ? 'التشغيل القادم' : 'Next run' },
  { key: 'status',      label: locale.value === 'ar' ? 'الحالة' : 'Status' },
])

const REPORT_TYPE_AR: Record<string, string> = {
  'trial-balance': 'ميزان المراجعة',
  'income-statement': 'قائمة الدخل',
  'balance-sheet': 'الميزانية العمومية',
  'cash-flow': 'التدفقات النقدية',
  'aging': 'أعمار الديون',
}
function formatReportType(t: string | null | undefined) {
  if (!t) return '—'
  if (locale.value === 'ar') return REPORT_TYPE_AR[t] ?? t
  return t.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

const FREQUENCY_AR: Record<string, string> = {
  daily: 'يومي', weekly: 'أسبوعي', monthly: 'شهري', quarterly: 'ربع سنوي', yearly: 'سنوي',
}
function formatFrequency(f: string | null | undefined) {
  if (!f) return '—'
  if (locale.value === 'ar') return FREQUENCY_AR[f] ?? f
  return f.charAt(0).toUpperCase() + f.slice(1)
}

function formatDateTime(d: string | null | undefined) {
  if (!d) return '—'
  try {
    return new Date(d).toLocaleString(locale.value === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    })
  } catch {
    return d
  }
}

async function load() {
  loading.value = true
  try {
    const r: any = await api.get('/reports/scheduled').catch(() => ({ data: [] }))
    rows.value = Array.isArray(r) ? r : (r.data ?? [])
  } catch (e: any) {
    rows.value = []
    toastStore.error(e?.message || (locale.value === 'ar' ? 'تعذر تحميل التقارير المجدولة' : 'Failed to load scheduled reports'))
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>
