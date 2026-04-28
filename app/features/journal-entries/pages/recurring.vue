<template>
  <FeatureBoundary id="journal-entries-recurring">
    <div class="px-4 lg:px-6 py-5 max-w-[1400px] mx-auto">
      <UiPageHeader
        icon="i-lucide-repeat"
        :title="locale === 'ar' ? 'القيود المتكررة' : 'Recurring Journal Entries'"
        :subtitle="locale === 'ar' ? 'قيود محاسبية تُنشَأ تلقائياً بجدول زمني' : 'Entries generated automatically on a schedule'"
      />

      <Can :perm="PERMISSIONS.MANAGE_JOURNAL_ENTRIES">
        <template #fallback>
          <div class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-12 text-center">
            <div class="w-12 h-12 mx-auto mb-4 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
              <UIcon name="i-lucide-lock" class="w-5 h-5 text-neutral-400" />
            </div>
            <p class="text-sm font-semibold text-neutral-900 dark:text-neutral-0 mb-1">
              {{ locale === 'ar' ? 'لا تملك صلاحية الوصول' : "You don't have access" }}
            </p>
            <p class="text-xs text-neutral-500 dark:text-neutral-400">
              {{ locale === 'ar' ? 'إدارة القيود المتكررة تتطلب صلاحية إدارة القيود' : 'Managing recurring entries requires the journal-entries permission' }}
            </p>
          </div>
        </template>

        <UiDataTable
          :columns="columns"
          :rows="rows"
          :loading="loading"
          empty-icon="i-lucide-repeat"
          :empty-title="locale === 'ar' ? 'لا توجد قيود متكررة' : 'No recurring entries'"
          :empty-description="locale === 'ar'
            ? 'القيود التي يجب إنشاؤها بانتظام (إيجار شهري، استهلاك، إلخ.) تظهر هنا.'
            : 'Entries that need to be generated on a schedule (monthly rent, depreciation, etc.) appear here.'"
        >
          <template #cell-name="{ value }">
            <span class="text-sm font-medium text-neutral-900 dark:text-neutral-0">{{ value }}</span>
          </template>

          <template #cell-frequency="{ value }">
            <span class="text-sm text-neutral-700 dark:text-neutral-200 capitalize">{{ frequencyLabel(value) }}</span>
          </template>

          <template #cell-next_run_at="{ value }">
            <span class="text-sm text-neutral-700 dark:text-neutral-200 tabular-nums" dir="ltr">{{ formatDate(value) }}</span>
          </template>

          <template #cell-status="{ row }">
            <UiBadge :color="row.is_active ? 'green' : 'gray'" dot>
              {{ row.is_active ? (locale === 'ar' ? 'نشط' : 'Active') : (locale === 'ar' ? 'معطل' : 'Paused') }}
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

const rows = ref<any[]>([])
const loading = ref(true)

const columns = computed(() => [
  { key: 'name', label: locale.value === 'ar' ? 'الاسم' : 'Name' },
  { key: 'frequency', label: locale.value === 'ar' ? 'التكرار' : 'Frequency' },
  { key: 'next_run_at', label: locale.value === 'ar' ? 'التشغيل القادم' : 'Next run' },
  { key: 'status', label: locale.value === 'ar' ? 'الحالة' : 'Status' },
])

function frequencyLabel(value: string | null | undefined): string {
  if (!value) return '—'
  if (locale.value === 'ar') {
    const map: Record<string, string> = {
      daily: 'يومي',
      weekly: 'أسبوعي',
      monthly: 'شهري',
      quarterly: 'ربع سنوي',
      yearly: 'سنوي',
    }
    return map[value] || value
  }
  return value
}

function formatDate(d: string | null | undefined) {
  if (!d) return '—'
  try {
    return new Date(d).toLocaleDateString(locale.value === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    })
  } catch {
    return d
  }
}

async function load() {
  loading.value = true
  try {
    const r: any = await api.get('/journal-entries/recurring').catch(() => ({ data: [] }))
    rows.value = Array.isArray(r) ? r : (r.data ?? [])
  } catch { rows.value = [] }
  finally { loading.value = false }
}

onMounted(load)
</script>
