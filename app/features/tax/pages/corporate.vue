<template>
  <FeatureBoundary id="tax-corporate">
    <div class="px-4 lg:px-6 py-5 max-w-[1400px] mx-auto">
      <UiPageHeader
        icon="i-lucide-building-2"
        :title="locale === 'ar' ? 'ضريبة الشركات' : 'Corporate Tax'"
        :subtitle="locale === 'ar' ? 'الالتزامات الضريبية السنوية على الأرباح' : 'Annual corporate-tax obligations'"
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
          empty-icon="i-lucide-building-2"
          :empty-title="locale === 'ar' ? 'لا توجد إقرارات سنوية' : 'No annual returns yet'"
          :empty-description="locale === 'ar' ? 'يتم حساب الضريبة السنوية بناءً على صافي الربح المعتمد.' : 'Annual tax is computed from approved net profit.'"
        >
          <template #cell-tax_year="{ value }">
            <span class="font-mono text-sm font-semibold text-primary-700 dark:text-primary-400" dir="ltr">{{ value }}</span>
          </template>

          <template #cell-taxable_income="{ value }">
            <span class="font-mono text-sm tabular-nums text-neutral-900 dark:text-neutral-0" dir="ltr">{{ formatMoney(value) }}</span>
          </template>

          <template #cell-rate="{ value }">
            <span class="text-xs font-mono text-neutral-600 dark:text-neutral-400 tabular-nums" dir="ltr">{{ Number(value ?? 0).toFixed(1) }}%</span>
          </template>

          <template #cell-tax_due="{ row }">
            <span class="font-mono text-sm font-semibold text-warning-700 dark:text-warning-500 tabular-nums" dir="ltr">{{ formatMoney(row.tax_due) }}</span>
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

type BadgeColor = 'gray' | 'red' | 'orange' | 'green' | 'emerald' | 'blue'
function statusColor(s: string): BadgeColor {
  return ({ draft: 'gray', submitted: 'blue', accepted: 'green', rejected: 'red', paid: 'emerald' } as Record<string, BadgeColor>)[s] || 'gray'
}

const STATUS_AR: Record<string, string> = {
  draft: 'مسودة', submitted: 'مُقدَّم', accepted: 'مقبول', rejected: 'مرفوض', paid: 'مدفوع',
}
function statusLabel(s: string) {
  return locale.value === 'ar' ? (STATUS_AR[s] ?? s) : s
}

const columns = computed(() => [
  { key: 'tax_year',       label: locale.value === 'ar' ? 'السنة' : 'Tax Year' },
  { key: 'taxable_income', label: locale.value === 'ar' ? 'الدخل الخاضع' : 'Taxable Income', class: 'text-end' },
  { key: 'rate',           label: locale.value === 'ar' ? 'النسبة' : 'Rate', class: 'text-end' },
  { key: 'tax_due',        label: locale.value === 'ar' ? 'الضريبة المستحقة' : 'Tax Due', class: 'text-end' },
  { key: 'status',         label: locale.value === 'ar' ? 'الحالة' : 'Status' },
])

function formatMoney(n: number | string | null | undefined) {
  return Number(n ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

async function load() {
  loading.value = true
  try {
    const r: any = await api.get('/tax/corporate-returns').catch(() => ({ data: [] }))
    rows.value = Array.isArray(r) ? r : (r.data ?? [])
  } catch {
    rows.value = []
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>
