<template>
  <FeatureBoundary id="engagement-deliverables">
    <div class="px-4 lg:px-6 py-5 max-w-[1400px] mx-auto">
      <UiPageHeader
        icon="i-lucide-package-check"
        :title="locale === 'ar' ? 'المخرجات' : 'Deliverables'"
        :subtitle="locale === 'ar' ? 'قائمة بمخرجات الارتباطات' : 'Engagement deliverables'"
      />

      <Can :perm="PERMISSIONS.MANAGE_ENGAGEMENTS">
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
          empty-icon="i-lucide-package-check"
          :empty-title="locale === 'ar' ? 'لا توجد مخرجات' : 'No deliverables yet'"
          :empty-description="locale === 'ar' ? 'تظهر هنا المخرجات المرتبطة بكل ارتباط مع تاريخ استحقاقها.' : 'Per-engagement deliverables and their due dates show up here.'"
          @page-change="onPage"
        >
          <template #cell-engagement_ref="{ value }">
            <span class="font-mono text-xs text-primary-700 dark:text-primary-400">{{ value }}</span>
          </template>

          <template #cell-name="{ value }">
            <span class="text-sm text-neutral-900 dark:text-neutral-0">{{ value || '—' }}</span>
          </template>

          <template #cell-due_date="{ row }">
            <span
              class="text-xs tabular-nums"
              :class="isOverdue(row) ? 'text-danger-600 dark:text-danger-400 font-medium' : 'text-neutral-700 dark:text-neutral-200'"
              dir="ltr"
            >
              {{ formatDate(row.due_date) }}
            </span>
          </template>

          <template #cell-assignee="{ value }">
            <span class="text-xs text-neutral-600 dark:text-neutral-400">{{ value }}</span>
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
const page = ref(1)
const totalPages = ref(1)

type BadgeColor = 'gray' | 'red' | 'orange' | 'green' | 'emerald' | 'blue' | 'purple'
function statusColor(s: string): BadgeColor {
  return ({ pending: 'gray', in_progress: 'blue', completed: 'green', overdue: 'red' } as Record<string, BadgeColor>)[s] || 'gray'
}

const STATUS_AR: Record<string, string> = {
  pending: 'معلّق', in_progress: 'قيد العمل', completed: 'مكتمل', overdue: 'متأخر',
}
const STATUS_EN: Record<string, string> = {
  pending: 'Pending', in_progress: 'In progress', completed: 'Completed', overdue: 'Overdue',
}
function statusLabel(s: string) {
  const map = locale.value === 'ar' ? STATUS_AR : STATUS_EN
  return map[s] ?? s
}

function isOverdue(row: any): boolean {
  if (!row.due_date || row.status === 'completed') return false
  return new Date(row.due_date) < new Date(new Date().toDateString())
}

const columns = computed(() => [
  { key: 'engagement_ref', label: locale.value === 'ar' ? 'الارتباط' : 'Engagement' },
  { key: 'name',           label: locale.value === 'ar' ? 'اسم المخرج' : 'Deliverable' },
  { key: 'due_date',       label: locale.value === 'ar' ? 'تاريخ الاستحقاق' : 'Due' },
  { key: 'assignee',       label: locale.value === 'ar' ? 'المسؤول' : 'Assignee' },
  { key: 'status',         label: locale.value === 'ar' ? 'الحالة' : 'Status' },
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
    const r: any = await api.get(`/engagements/deliverables?page=${page.value}&per_page=25`).catch(() => ({ data: [], meta: { last_page: 1 } }))
    rows.value = (r.data ?? []).map((d: any) => ({
      ...d,
      engagement_ref: d.engagement?.reference ?? '—',
      assignee: d.assignee?.name ?? '—',
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
