<template>
  <FeatureBoundary id="payroll-leave">
    <div class="px-4 lg:px-6 py-5 max-w-[1400px] mx-auto">
      <UiPageHeader
        icon="i-lucide-palmtree"
        :title="locale === 'ar' ? 'الإجازات' : 'Leave'"
        :subtitle="locale === 'ar' ? 'طلبات الإجازات السنوية والمرضية' : 'Annual and sick-leave requests'"
      />

      <Can :perm="PERMISSIONS.MANAGE_PAYROLL">
        <template #fallback>
          <div class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-12 text-center">
            <div class="w-12 h-12 mx-auto mb-4 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
              <UIcon name="i-lucide-lock" class="w-5 h-5 text-neutral-400" />
            </div>
            <p class="text-sm font-semibold text-neutral-900 dark:text-neutral-0">
              {{ locale === 'ar' ? 'لا تملك صلاحية الوصول' : "You don't have access" }}
            </p>
          </div>
        </template>

        <UiDataTable
          :columns="columns"
          :rows="rows"
          :loading="loading"
          empty-icon="i-lucide-palmtree"
          :empty-title="locale === 'ar' ? 'لا توجد طلبات إجازة' : 'No leave requests'"
          :empty-description="locale === 'ar'
            ? 'طلبات الإجازات تظهر هنا للموافقة أو الرفض.'
            : 'Leave requests appear here for approval or rejection.'"
        >
          <template #cell-employee_name="{ value }">
            <span class="text-sm font-medium text-neutral-900 dark:text-neutral-0">{{ value }}</span>
          </template>
          <template #cell-leave_type="{ value }">
            <span class="text-sm text-neutral-700 dark:text-neutral-200 capitalize">{{ value || '—' }}</span>
          </template>
          <template #cell-start_date="{ value }">
            <span class="text-sm text-neutral-700 dark:text-neutral-200 tabular-nums" dir="ltr">{{ formatDate(value) }}</span>
          </template>
          <template #cell-end_date="{ value }">
            <span class="text-sm text-neutral-700 dark:text-neutral-200 tabular-nums" dir="ltr">{{ formatDate(value) }}</span>
          </template>
          <template #cell-days="{ value }">
            <span class="font-mono text-sm tabular-nums text-neutral-900 dark:text-neutral-0" dir="ltr">{{ value ?? '—' }}</span>
          </template>
          <template #cell-status="{ row }">
            <UiBadge :color="statusColor(row.status)" dot>{{ statusLabel(row.status) }}</UiBadge>
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

type BadgeColor = 'gray' | 'red' | 'orange' | 'green' | 'emerald' | 'blue' | 'purple'
function statusColor(s: string): BadgeColor {
  return (({ pending: 'orange', approved: 'green', rejected: 'red', cancelled: 'gray' } as Record<string, BadgeColor>)[s]) || 'gray'
}

function statusLabel(s: string): string {
  if (locale.value === 'ar') {
    return ({ pending: 'قيد المراجعة', approved: 'مقبول', rejected: 'مرفوض', cancelled: 'ملغي' } as Record<string, string>)[s] || s
  }
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function formatDate(d: string | null | undefined) {
  if (!d) return '—'
  try {
    return new Date(d).toLocaleDateString(locale.value === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    })
  } catch { return d }
}

const columns = computed(() => [
  { key: 'employee_name', label: locale.value === 'ar' ? 'الموظف' : 'Employee' },
  { key: 'leave_type', label: locale.value === 'ar' ? 'النوع' : 'Type' },
  { key: 'start_date', label: locale.value === 'ar' ? 'من' : 'From' },
  { key: 'end_date', label: locale.value === 'ar' ? 'إلى' : 'To' },
  { key: 'days', label: locale.value === 'ar' ? 'الأيام' : 'Days', class: 'text-end' },
  { key: 'status', label: locale.value === 'ar' ? 'الحالة' : 'Status' },
])

async function load() {
  loading.value = true
  try {
    const r: any = await api.get('/payroll/leave-requests').catch(() => ({ data: [] }))
    rows.value = (Array.isArray(r) ? r : (r.data ?? [])).map((l: any) => ({ ...l, employee_name: l.employee?.name ?? '—' }))
  } catch { rows.value = [] } finally { loading.value = false }
}
onMounted(load)
</script>
