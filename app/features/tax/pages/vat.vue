<template>
  <FeatureBoundary id="tax-vat">
    <div class="px-4 lg:px-6 py-5 max-w-[1400px] mx-auto">
      <UiPageHeader
        icon="i-lucide-percent"
        :title="locale === 'ar' ? 'إقرارات ضريبة القيمة المضافة' : 'VAT Returns'"
        :subtitle="locale === 'ar' ? 'إعداد وتقديم إقرارات شهرية لضريبة القيمة المضافة' : 'Prepare and file monthly VAT returns'"
      />

      <Can :perm="PERMISSIONS.MANAGE_TAX">
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
          empty-icon="i-lucide-percent"
          :empty-title="locale === 'ar' ? 'لا توجد إقرارات' : 'No VAT returns yet'"
          :empty-description="locale === 'ar' ? 'يتم توليد الإقرار الشهري تلقائياً من الفواتير الصادرة والواردة.' : 'Monthly returns are generated from outgoing invoices and incoming bills.'"
        >
          <template #cell-period="{ value }">
            <span class="text-sm font-medium text-neutral-900 dark:text-neutral-0">{{ value }}</span>
          </template>

          <template #cell-submission_deadline="{ value }">
            <span class="text-xs text-neutral-700 dark:text-neutral-200 tabular-nums" dir="ltr">{{ formatDate(value) }}</span>
          </template>

          <template #cell-output_vat="{ value }">
            <span class="font-mono text-sm text-success-700 dark:text-success-400 tabular-nums" dir="ltr">{{ formatMoney(value) }}</span>
          </template>

          <template #cell-input_vat="{ value }">
            <span class="font-mono text-sm text-info-700 dark:text-info-400 tabular-nums" dir="ltr">{{ formatMoney(value) }}</span>
          </template>

          <template #cell-net_tax="{ value }">
            <span
              class="font-mono text-sm font-semibold tabular-nums"
              :class="Number(value) >= 0
                ? 'text-warning-700 dark:text-warning-500'
                : 'text-success-700 dark:text-success-400'"
              dir="ltr"
            >
              {{ formatMoney(value) }}
            </span>
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
  return ({ draft: 'gray', submitted: 'blue', accepted: 'green', rejected: 'red', paid: 'emerald' } as Record<string, BadgeColor>)[s] || 'gray'
}

const STATUS_AR: Record<string, string> = {
  draft: 'مسودة', submitted: 'مُقدَّم', accepted: 'مقبول', rejected: 'مرفوض', paid: 'مدفوع',
}
function statusLabel(s: string) {
  if (locale.value !== 'ar') return s
  return STATUS_AR[s] ?? s
}

const columns = computed(() => [
  { key: 'period',              label: locale.value === 'ar' ? 'الفترة' : 'Period' },
  { key: 'submission_deadline', label: locale.value === 'ar' ? 'موعد التقديم' : 'Deadline' },
  { key: 'output_vat',          label: locale.value === 'ar' ? 'مخرجات' : 'Output', class: 'text-end' },
  { key: 'input_vat',           label: locale.value === 'ar' ? 'مدخلات' : 'Input', class: 'text-end' },
  { key: 'net_tax',             label: locale.value === 'ar' ? 'الصافي' : 'Net', class: 'text-end' },
  { key: 'status',              label: locale.value === 'ar' ? 'الحالة' : 'Status' },
])

function formatMoney(n: number | string | null | undefined) {
  return Number(n ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
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
    const r: any = await api.get('/tax/vat-returns').catch(() => ({ data: [] }))
    rows.value = Array.isArray(r) ? r : (r.data ?? [])
  } catch {
    rows.value = []
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>
