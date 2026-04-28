<template>
  <FeatureBoundary id="engagements">
    <div class="px-4 lg:px-6 py-5 max-w-[1400px] mx-auto">
      <UiPageHeader
        icon="i-lucide-briefcase"
        :title="locale === 'ar' ? 'الارتباطات المهنية' : 'Engagements'"
        :subtitle="locale === 'ar' ? 'إدارة أعمال العملاء والخدمات المتفق عليها' : 'Client engagements and contracted services'"
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
          empty-icon="i-lucide-briefcase"
          :empty-title="locale === 'ar' ? 'لا توجد ارتباطات' : 'No engagements yet'"
          :empty-description="locale === 'ar' ? 'سجّل ارتباطاً مهنياً مع العميل لمتابعة المخرجات والمستحقات.' : 'Record an engagement to track deliverables and time billed against it.'"
          @page-change="onPage"
        >
          <template #cell-reference="{ value }">
            <span class="font-mono text-xs font-semibold text-primary-700 dark:text-primary-400">{{ value }}</span>
          </template>

          <template #cell-client_name="{ value }">
            <span class="text-sm text-neutral-900 dark:text-neutral-0">{{ value }}</span>
          </template>

          <template #cell-service_type="{ value }">
            <span class="text-xs text-neutral-600 dark:text-neutral-400">{{ value || '—' }}</span>
          </template>

          <template #cell-start_date="{ value }">
            <span class="text-xs text-neutral-700 dark:text-neutral-200 tabular-nums" dir="ltr">{{ formatDate(value) }}</span>
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
import { engagementService } from '~/features/engagements/services/engagementService'

definePageMeta({ layout: 'dashboard' })

const { locale } = useI18n()

const rows = ref<any[]>([])
const loading = ref(true)
const page = ref(1)
const totalPages = ref(1)

const columns = computed(() => [
  { key: 'reference',    label: locale.value === 'ar' ? 'المرجع' : 'Reference' },
  { key: 'client_name',  label: locale.value === 'ar' ? 'العميل' : 'Client' },
  { key: 'service_type', label: locale.value === 'ar' ? 'الخدمة' : 'Service' },
  { key: 'start_date',   label: locale.value === 'ar' ? 'تاريخ البدء' : 'Start' },
  { key: 'status',       label: locale.value === 'ar' ? 'الحالة' : 'Status' },
])

type BadgeColor = 'gray' | 'red' | 'orange' | 'green' | 'emerald' | 'blue' | 'purple'
function statusColor(s: string): BadgeColor {
  return ({ active: 'blue', completed: 'green', on_hold: 'orange', cancelled: 'gray' } as Record<string, BadgeColor>)[s] || 'gray'
}

const STATUS_AR: Record<string, string> = {
  active: 'نشط', completed: 'مكتمل', on_hold: 'معلق', cancelled: 'ملغي',
}
const STATUS_EN: Record<string, string> = {
  active: 'Active', completed: 'Completed', on_hold: 'On hold', cancelled: 'Cancelled',
}
function statusLabel(s: string) {
  const map = locale.value === 'ar' ? STATUS_AR : STATUS_EN
  return map[s] ?? s
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
    const svc: any = engagementService()
    const fn = svc.list ?? svc.get
    const r = typeof fn === 'function' ? await fn({ page: page.value, per_page: 25 }) : { data: [], meta: { last_page: 1 } }
    rows.value = (r.data ?? []).map((e: any) => ({ ...e, client_name: e.client?.name ?? '—' }))
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
