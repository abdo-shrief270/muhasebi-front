<template>
  <FeatureBoundary id="tax-wht">
    <div class="px-4 lg:px-6 py-5 max-w-[1400px] mx-auto">
      <UiPageHeader
        icon="i-lucide-receipt-text"
        :title="locale === 'ar' ? 'الخصم عند المنبع' : 'Withholding Tax'"
        :subtitle="locale === 'ar' ? 'سجلات الخصم من المدفوعات للموردين' : 'Tax withheld from vendor payments'"
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
          empty-icon="i-lucide-receipt-text"
          :empty-title="locale === 'ar' ? 'لا توجد سجلات خصم' : 'No withholding records'"
          :empty-description="locale === 'ar' ? 'تظهر هنا الخصومات المسجلة على دفعات الموردين.' : 'Withholding records on vendor payments appear here.'"
        >
          <template #cell-date="{ value }">
            <span class="text-xs text-neutral-700 dark:text-neutral-200 tabular-nums" dir="ltr">{{ formatDate(value) }}</span>
          </template>

          <template #cell-payee_name="{ value }">
            <span class="text-sm text-neutral-900 dark:text-neutral-0">{{ value || '—' }}</span>
          </template>

          <template #cell-gross_amount="{ value }">
            <span class="font-mono text-sm tabular-nums text-neutral-700 dark:text-neutral-200" dir="ltr">{{ formatMoney(value) }}</span>
          </template>

          <template #cell-rate="{ value }">
            <span class="text-xs font-mono text-neutral-600 dark:text-neutral-400 tabular-nums" dir="ltr">{{ Number(value ?? 0).toFixed(1) }}%</span>
          </template>

          <template #cell-amount="{ row }">
            <span class="font-mono text-sm font-semibold text-warning-700 dark:text-warning-500 tabular-nums" dir="ltr">
              −{{ formatMoney(row.withheld_amount) }}
            </span>
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
  { key: 'date',         label: locale.value === 'ar' ? 'التاريخ' : 'Date' },
  { key: 'payee_name',   label: locale.value === 'ar' ? 'المستفيد' : 'Payee' },
  { key: 'gross_amount', label: locale.value === 'ar' ? 'الإجمالي' : 'Gross', class: 'text-end' },
  { key: 'rate',         label: locale.value === 'ar' ? 'النسبة' : 'Rate', class: 'text-end' },
  { key: 'amount',       label: locale.value === 'ar' ? 'المخصوم' : 'Withheld', class: 'text-end' },
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
    const r: any = await api.get('/tax/wht-records').catch(() => ({ data: [] }))
    rows.value = Array.isArray(r) ? r : (r.data ?? [])
  } catch {
    rows.value = []
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>
