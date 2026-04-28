<template>
  <FeatureBoundary id="payroll">
    <div class="px-4 lg:px-6 py-5 max-w-[1400px] mx-auto">
      <UiPageHeader
        icon="i-lucide-wallet"
        :title="$t('nav.payroll')"
        :subtitle="locale === 'ar' ? 'مسيرات الرواتب الشهرية والاعتماد والدفع' : 'Monthly payroll runs, approval, and payment'"
      >
        <template #actions>
          <UiAppButton variant="outline" size="sm" icon="i-lucide-users" @click="navigateTo('/payroll/employees')">
            {{ locale === 'ar' ? 'الموظفين' : 'Employees' }}
          </UiAppButton>
          <UiAppButton variant="primary" size="sm" icon="i-lucide-plus" @click="createOpen = true">
            {{ locale === 'ar' ? 'مسير رواتب' : 'New Payroll' }}
          </UiAppButton>
        </template>
      </UiPageHeader>

      <UiDataTable
        :columns="columns"
        :rows="runs"
        :loading="loading"
        empty-icon="i-lucide-wallet"
        :empty-title="locale === 'ar' ? 'لا توجد مسيرات' : 'No payroll runs'"
        :empty-description="locale === 'ar'
          ? 'أنشئ مسيراً جديداً لكل شهر، احسب رواتب الموظفين، اعتمدها، ثم سجّل الدفع.'
          : 'Create a run per month, calculate employee salaries, approve, then mark as paid.'"
        @row-click="(row: any) => navigateTo(`/payroll/${row.id}`)"
      >
        <template #cell-period="{ row }">
          <span class="font-medium text-neutral-900 dark:text-neutral-0 tabular-nums" dir="ltr">{{ String(row.month).padStart(2, '0') }}/{{ row.year }}</span>
        </template>

        <template #cell-total_net="{ value }">
          <span class="font-mono text-sm font-semibold tabular-nums text-success-700 dark:text-success-400" dir="ltr">{{ formatMoney(value) }}</span>
        </template>

        <template #cell-status="{ row }">
          <UiBadge :color="statusColor(row.status)" dot>
            {{ locale === 'ar' ? row.status_label_ar : row.status_label }}
          </UiBadge>
        </template>

        <template #cell-actions="{ row }">
          <div class="flex items-center gap-1" @click.stop>
            <UiAppButton v-if="row.status === 'draft'" variant="secondary" size="sm" icon="i-lucide-calculator" @click="handleCalculate(row.id)">
              {{ locale === 'ar' ? 'حساب' : 'Calculate' }}
            </UiAppButton>
            <UiAppButton v-if="row.status === 'calculated'" variant="primary" size="sm" icon="i-lucide-check" @click="handleApprove(row.id)">
              {{ locale === 'ar' ? 'اعتماد' : 'Approve' }}
            </UiAppButton>
            <UiAppButton v-if="row.status === 'approved'" variant="outline" size="sm" icon="i-lucide-banknote" @click="handleMarkPaid(row.id)">
              {{ locale === 'ar' ? 'دفع' : 'Mark Paid' }}
            </UiAppButton>
          </div>
        </template>
      </UiDataTable>

      <!-- Create slideover -->
      <UiSlideOver v-model="createOpen" :title="locale === 'ar' ? 'مسير رواتب جديد' : 'New Payroll Run'">
        <form @submit.prevent="handleCreate" class="space-y-3">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="pr-label">{{ locale === 'ar' ? 'الشهر' : 'Month' }} <span class="text-danger-500">*</span></label>
              <div class="relative">
                <select v-model="createForm.month" required class="pr-input">
                  <option v-for="m in 12" :key="m" :value="m">{{ m }}</option>
                </select>
                <UIcon name="i-lucide-chevron-down" class="absolute end-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label class="pr-label">{{ locale === 'ar' ? 'السنة' : 'Year' }} <span class="text-danger-500">*</span></label>
              <input v-model="createForm.year" type="number" min="2020" required class="pr-input font-mono" dir="ltr" />
            </div>
          </div>
          <div class="flex gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
            <UiAppButton type="submit" variant="primary" icon="i-lucide-save" :loading="createLoading">{{ $t('common.create') }}</UiAppButton>
            <UiAppButton variant="outline" @click="createOpen = false">{{ $t('common.cancel') }}</UiAppButton>
          </div>
        </form>
      </UiSlideOver>
    </div>
  </FeatureBoundary>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })
const { locale } = useI18n()
const api = useApi()
const toastStore = useToastStore()

const runs = ref<any[]>([])
const loading = ref(true)
const createOpen = ref(false)
const createLoading = ref(false)
const now = new Date()
const createForm = reactive({ month: now.getMonth() + 1, year: now.getFullYear() })

const columns = computed(() => [
  { key: 'period', label: locale.value === 'ar' ? 'الفترة' : 'Period' },
  { key: 'total_net', label: locale.value === 'ar' ? 'صافي الرواتب' : 'Net Salary', class: 'text-end' },
  { key: 'status', label: locale.value === 'ar' ? 'الحالة' : 'Status' },
  { key: 'actions', label: '', class: 'w-32' },
])

function formatMoney(n: number | string | null | undefined) {
  return Number(n ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function statusColor(s: string) {
  return ({ draft: 'gray', calculated: 'blue', approved: 'green', paid: 'emerald' } as Record<string, string>)[s] || 'gray'
}

async function load() {
  loading.value = true
  try {
    const data = await api.get<any>('/payroll')
    runs.value = data.data
  } catch { runs.value = [] }
  finally { loading.value = false }
}

async function handleCreate() {
  createLoading.value = true
  try {
    await api.post('/payroll', createForm)
    toastStore.success(locale.value === 'ar' ? 'تم الإنشاء' : 'Created')
    createOpen.value = false
    load()
  } catch (e: any) { toastStore.error(e.data?.message || 'Error') }
  finally { createLoading.value = false }
}

async function handleCalculate(id: number) {
  try { await api.post(`/payroll/${id}/calculate`); toastStore.success(locale.value === 'ar' ? 'تم الحساب' : 'Calculated'); load() }
  catch (e: any) { toastStore.error(e.data?.message || 'Error') }
}

async function handleApprove(id: number) {
  try { await api.post(`/payroll/${id}/approve`); toastStore.success(locale.value === 'ar' ? 'تم الاعتماد' : 'Approved'); load() }
  catch (e: any) { toastStore.error(e.data?.message || 'Error') }
}

async function handleMarkPaid(id: number) {
  try { await api.post(`/payroll/${id}/mark-paid`); toastStore.success(locale.value === 'ar' ? 'تم الدفع' : 'Marked Paid'); load() }
  catch (e: any) { toastStore.error(e.data?.message || 'Error') }
}

onMounted(load)
</script>

<style scoped>
@reference "~/assets/css/tokens.css";

.pr-label { @apply block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5; }

.pr-input {
  width: 100%;
  padding-inline: 0.75rem;
  height: 2.25rem;
  font-size: 0.875rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-neutral-200);
  background-color: var(--color-neutral-0, #fff);
  color: var(--color-neutral-900);
  outline: none;
  transition: border-color 150ms var(--ease-standard);
  appearance: none;
}
.pr-input:focus {
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 2px color-mix(in oklab, var(--color-primary-500) 20%, transparent);
}
:global(html.dark) .pr-input {
  background-color: var(--color-neutral-900);
  border-color: var(--color-neutral-800);
  color: var(--color-neutral-0);
}
</style>
