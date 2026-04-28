<template>
  <FeatureBoundary id="budgets">
    <div class="px-4 lg:px-6 py-5 max-w-[1400px] mx-auto">
      <UiPageHeader
        icon="i-lucide-pie-chart"
        :title="locale === 'ar' ? 'الموازنات' : 'Budgets'"
        :subtitle="locale === 'ar' ? 'موازنات الفترات المحاسبية' : 'Period budgets'"
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
          :current-page="page"
          :total-pages="totalPages"
          empty-icon="i-lucide-pie-chart"
          :empty-title="locale === 'ar' ? 'لا توجد موازنات' : 'No budgets yet'"
          :empty-description="locale === 'ar'
            ? 'أنشئ موازنة لمتابعة الإنفاق مقابل المخطط شهرياً.'
            : 'Create a budget to track spend against plan month over month.'"
          @page-change="onPage"
        >
          <template #cell-total="{ value }">
            <span class="font-mono text-sm tabular-nums text-neutral-900 dark:text-neutral-0" dir="ltr">
              {{ Number(value ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
            </span>
          </template>

          <template #cell-status="{ row }">
            <UiBadge :color="row.is_active ? 'green' : 'gray'" dot>
              {{ row.is_active
                ? (locale === 'ar' ? 'نشطة' : 'Active')
                : (locale === 'ar' ? 'مؤرشفة' : 'Archived') }}
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
import { budgetService } from '~/features/budgets/services/budgetService'

definePageMeta({ layout: 'dashboard' })

const { locale } = useI18n()

const rows = ref<any[]>([])
const loading = ref(true)
const page = ref(1)
const totalPages = ref(1)

const columns = computed(() => [
  { key: 'name',   label: locale.value === 'ar' ? 'الاسم' : 'Name' },
  { key: 'period', label: locale.value === 'ar' ? 'الفترة' : 'Period' },
  { key: 'total',  label: locale.value === 'ar' ? 'الإجمالي' : 'Total', class: 'text-end' },
  { key: 'status', label: locale.value === 'ar' ? 'الحالة' : 'Status' },
])

async function load() {
  loading.value = true
  try {
    const r = await budgetService().list({ page: page.value, per_page: 25 })
    rows.value = r.data ?? []
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
