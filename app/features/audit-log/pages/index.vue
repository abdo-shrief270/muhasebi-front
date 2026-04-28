<template>
  <FeatureBoundary id="audit-log">
    <div class="px-4 lg:px-6 py-5 max-w-[1400px] mx-auto">
      <UiPageHeader
        icon="i-lucide-shield-check"
        :title="locale === 'ar' ? 'سجل المراجعة' : 'Audit Log'"
        :subtitle="locale === 'ar' ? 'سجل تفصيلي للتغييرات على البيانات المحاسبية' : 'Detailed changes to accounting data'"
      />

      <Can :perm="PERMISSIONS.VIEW_AUDIT">
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
          :current-page="page"
          :total-pages="totalPages"
          empty-icon="i-lucide-shield-check"
          :empty-title="locale === 'ar' ? 'لا توجد سجلات' : 'No audit entries'"
          :empty-description="locale === 'ar' ? 'يُسجَّل هنا كل تغيير مهم على البيانات المحاسبية.' : 'Every significant change to accounting data is recorded here.'"
          @page-change="onPage"
        >
          <template #cell-created_at="{ value }">
            <span class="text-xs text-neutral-500 dark:text-neutral-400 tabular-nums" dir="ltr">{{ formatDateTime(value) }}</span>
          </template>

          <template #cell-user_name="{ value }">
            <span class="text-sm text-neutral-700 dark:text-neutral-200">{{ value || '—' }}</span>
          </template>

          <template #cell-action="{ value }">
            <UiBadge :color="actionColor(value)" size="sm">{{ value || '—' }}</UiBadge>
          </template>

          <template #cell-entity_type="{ value }">
            <span class="text-xs font-mono text-neutral-700 dark:text-neutral-200" dir="ltr">{{ value || '—' }}</span>
          </template>

          <template #cell-ip="{ value }">
            <span class="text-[11px] font-mono text-neutral-500 dark:text-neutral-400" dir="ltr">{{ value || '—' }}</span>
          </template>
        </UiDataTable>
      </Can>
    </div>
  </FeatureBoundary>
</template>

<script setup lang="ts">
import Can from '~/core/rbac/Can.vue'
import { PERMISSIONS } from '~/core/rbac/permissions'
import { auditComplianceService } from '~/features/audit-log/services/auditComplianceService'

definePageMeta({ layout: 'dashboard' })

const { locale } = useI18n()

const rows = ref<any[]>([])
const loading = ref(true)
const page = ref(1)
const totalPages = ref(1)

const columns = computed(() => [
  { key: 'created_at',  label: locale.value === 'ar' ? 'الوقت' : 'Time' },
  { key: 'user_name',   label: locale.value === 'ar' ? 'المستخدم' : 'User' },
  { key: 'action',      label: locale.value === 'ar' ? 'الإجراء' : 'Action' },
  { key: 'entity_type', label: locale.value === 'ar' ? 'الكيان' : 'Entity' },
  { key: 'ip',          label: 'IP' },
])

/**
 * Color mapping for the action badge — green for creates / approves, red
 * for deletes / reverses, blue for everything else. Helps the eye find
 * destructive actions on a long log.
 */
function actionColor(action: string): 'gray' | 'green' | 'red' | 'blue' | 'orange' {
  if (!action) return 'gray'
  const a = action.toLowerCase()
  if (a.includes('delete') || a.includes('cancel') || a.includes('revers')) return 'red'
  if (a.includes('create') || a.includes('approve') || a.includes('post')) return 'green'
  if (a.includes('reject') || a.includes('fail')) return 'orange'
  return 'blue'
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
    const svc: any = auditComplianceService()
    const fn = svc.list ?? svc.logs ?? svc.get
    const r = typeof fn === 'function' ? await fn({ page: page.value, per_page: 50 }) : { data: [], meta: { last_page: 1 } }
    rows.value = (r.data ?? []).map((a: any) => ({ ...a, user_name: a.user?.name ?? '—' }))
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
