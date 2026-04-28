<template>
  <FeatureBoundary id="fiscal-calendar">
    <div class="px-4 lg:px-6 py-5 max-w-[1400px] mx-auto">
      <UiPageHeader
        icon="i-lucide-calendar-days"
        :title="locale === 'ar' ? 'التقويم المحاسبي' : 'Fiscal Calendar'"
        :subtitle="locale === 'ar' ? 'السنوات والفترات المحاسبية' : 'Fiscal years and periods'"
      />

      <Can :perm="PERMISSIONS.MANAGE_ACCOUNTS">
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
          empty-icon="i-lucide-calendar-days"
          :empty-title="locale === 'ar' ? 'لا توجد فترات محاسبية' : 'No fiscal periods yet'"
          :empty-description="locale === 'ar' ? 'أنشئ سنة مالية لإدارة الفترات والإقفال.' : 'Create a fiscal year to manage periods and closings.'"
        >
          <template #cell-start_date="{ value }">
            <span class="text-xs text-neutral-700 dark:text-neutral-200 tabular-nums" dir="ltr">{{ formatDate(value) }}</span>
          </template>
          <template #cell-end_date="{ value }">
            <span class="text-xs text-neutral-700 dark:text-neutral-200 tabular-nums" dir="ltr">{{ formatDate(value) }}</span>
          </template>

          <template #cell-status="{ row }">
            <UiBadge :color="row.is_closed ? 'gray' : row.is_locked ? 'orange' : 'green'" dot>
              {{ row.is_closed
                ? (locale === 'ar' ? 'مغلقة' : 'Closed')
                : row.is_locked
                  ? (locale === 'ar' ? 'مقفلة' : 'Locked')
                  : (locale === 'ar' ? 'مفتوحة' : 'Open') }}
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
  { key: 'year',       label: locale.value === 'ar' ? 'السنة' : 'Year' },
  { key: 'name',       label: locale.value === 'ar' ? 'الفترة' : 'Period' },
  { key: 'start_date', label: locale.value === 'ar' ? 'البداية' : 'Start' },
  { key: 'end_date',   label: locale.value === 'ar' ? 'النهاية' : 'End' },
  { key: 'status',     label: locale.value === 'ar' ? 'الحالة' : 'Status' },
])

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
    const r: any = await api.get('/fiscal-periods').catch(() => ({ data: [] }))
    rows.value = Array.isArray(r) ? r : (r.data ?? [])
  } catch {
    rows.value = []
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>
