<template>
  <FeatureBoundary id="activity-log">
    <div class="px-4 lg:px-6 py-5 max-w-[1400px] mx-auto">
      <UiPageHeader
        icon="i-lucide-activity"
        :title="locale === 'ar' ? 'سجل النشاط' : 'Activity Log'"
        :subtitle="locale === 'ar' ? 'آخر الإجراءات التي حدثت في حسابك' : 'Recent activity across your workspace'"
      />

      <UiDataTable
        :columns="columns"
        :rows="rows"
        :loading="loading"
        :current-page="page"
        :total-pages="totalPages"
        empty-icon="i-lucide-activity"
        :empty-title="locale === 'ar' ? 'لا توجد أنشطة' : 'No activity yet'"
        :empty-description="locale === 'ar' ? 'تظهر أحدث إجراءات الفريق هنا.' : 'Recent team actions show up here.'"
        @page-change="onPage"
      >
        <template #cell-created_at="{ value }">
          <span class="text-xs text-neutral-500 dark:text-neutral-400 tabular-nums" dir="ltr">{{ formatDateTime(value) }}</span>
        </template>

        <template #cell-actor="{ value }">
          <span class="text-sm text-neutral-700 dark:text-neutral-200">{{ value || '—' }}</span>
        </template>

        <template #cell-description="{ value }">
          <span class="text-sm text-neutral-900 dark:text-neutral-0">{{ value || '—' }}</span>
        </template>

        <template #cell-subject_type="{ value }">
          <span class="text-xs font-mono text-neutral-600 dark:text-neutral-400" dir="ltr">{{ shortenSubject(value) }}</span>
        </template>
      </UiDataTable>
    </div>
  </FeatureBoundary>
</template>

<script setup lang="ts">
import { activityLogService } from '~/features/activity-log/services/activityLogService'

definePageMeta({ layout: 'dashboard' })

const { locale } = useI18n()

const rows = ref<any[]>([])
const loading = ref(true)
const page = ref(1)
const totalPages = ref(1)

const columns = computed(() => [
  { key: 'created_at',   label: locale.value === 'ar' ? 'الوقت' : 'Time' },
  { key: 'actor',        label: locale.value === 'ar' ? 'المستخدم' : 'User' },
  { key: 'description',  label: locale.value === 'ar' ? 'الإجراء' : 'Action' },
  { key: 'subject_type', label: locale.value === 'ar' ? 'الكيان' : 'Subject' },
])

/**
 * Spatie ActivityLog stores subject_type as a fully-qualified PHP class name
 * like `App\Domain\Billing\Models\Invoice`. Strip everything but the trailing
 * class name so the column reads "Invoice" instead of the full path.
 */
function shortenSubject(s: string | null | undefined) {
  if (!s) return '—'
  const parts = s.split('\\')
  return parts[parts.length - 1] || s
}

function formatDateTime(d: string | null | undefined) {
  if (!d) return '—'
  try {
    return new Date(d).toLocaleString(locale.value === 'ar' ? 'ar-EG' : 'en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    })
  } catch {
    return d
  }
}

async function load() {
  loading.value = true
  try {
    const svc: any = activityLogService()
    const fn = svc.list ?? svc.get ?? svc.recent
    const r = typeof fn === 'function' ? await fn({ page: page.value, per_page: 50 }) : { data: [], meta: { last_page: 1 } }
    rows.value = (r.data ?? []).map((a: any) => ({
      ...a,
      actor: a.causer?.name ?? a.user?.name ?? '—',
    }))
    totalPages.value = r.meta?.last_page ?? 1
  } catch {
    rows.value = []
  } finally {
    loading.value = false
  }
}

function onPage(p: number) {
  page.value = p
  load()
}

onMounted(load)
</script>
