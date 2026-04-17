<template>
  <div>
    <NuxtLayout name="dashboard">
      <UiPageHeader :title="$t('nav.payroll')">
        <template #actions>
          <UiAppButton variant="outline" size="sm" @click="navigateTo('/payroll/employees')">
            {{ locale === 'ar' ? 'الموظفين' : 'Employees' }}
          </UiAppButton>
          <UiAppButton variant="primary" @click="createOpen = true">
            {{ locale === 'ar' ? '+ مسير رواتب' : '+ New Payroll' }}
          </UiAppButton>
        </template>
      </UiPageHeader>

      <UiDataTable
        :columns="columns"
        :rows="runs"
        :loading="loading"
        :empty-title="locale === 'ar' ? 'لا يوجد مسيرات' : 'No payroll runs'"
        @row-click="(row) => navigateTo(`/payroll/${row.id}`)"
      >
        <template #cell-period="{ row }">
          <span class="font-medium text-gray-700">{{ row.month }}/{{ row.year }}</span>
        </template>

        <template #cell-total_net="{ value }">
          <span class="font-mono font-medium" dir="ltr">{{ Number(value).toLocaleString() }}</span>
        </template>

        <template #cell-status="{ row }">
          <UiBadge :color="statusColor(row.status)" dot>
            {{ locale === 'ar' ? row.status_label_ar : row.status_label }}
          </UiBadge>
        </template>

        <template #cell-actions="{ row }">
          <div class="flex items-center gap-1" @click.stop>
            <UiAppButton v-if="row.status === 'draft'" variant="secondary" size="sm" @click="handleCalculate(row.id)">
              {{ locale === 'ar' ? 'حساب' : 'Calculate' }}
            </UiAppButton>
            <UiAppButton v-if="row.status === 'calculated'" variant="primary" size="sm" @click="handleApprove(row.id)">
              {{ locale === 'ar' ? 'اعتماد' : 'Approve' }}
            </UiAppButton>
            <UiAppButton v-if="row.status === 'approved'" variant="outline" size="sm" @click="handleMarkPaid(row.id)">
              {{ locale === 'ar' ? 'دفع' : 'Mark Paid' }}
            </UiAppButton>
          </div>
        </template>
      </UiDataTable>

      <!-- Create -->
      <UiSlideOver v-model="createOpen" :title="locale === 'ar' ? 'مسير رواتب جديد' : 'New Payroll Run'">
        <form @submit.prevent="handleCreate" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="form-label">{{ locale === 'ar' ? 'الشهر' : 'Month' }} *</label>
              <select v-model="createForm.month" required class="input-field">
                <option v-for="m in 12" :key="m" :value="m">{{ m }}</option>
              </select>
            </div>
            <div>
              <label class="form-label">{{ locale === 'ar' ? 'السنة' : 'Year' }} *</label>
              <input v-model="createForm.year" type="number" min="2020" required class="input-field" />
            </div>
          </div>
          <div class="flex gap-3 pt-4 border-t border-gray-100">
            <UiAppButton type="submit" variant="primary" :loading="createLoading">{{ $t('common.create') }}</UiAppButton>
            <UiAppButton variant="outline" @click="createOpen = false">{{ $t('common.cancel') }}</UiAppButton>
          </div>
        </form>
      </UiSlideOver>
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })
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
  { key: 'total_net', label: locale.value === 'ar' ? 'صافي الرواتب' : 'Net Salary' },
  { key: 'status', label: locale.value === 'ar' ? 'الحالة' : 'Status' },
  { key: 'actions', label: '', class: 'w-32' },
])

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

function statusColor(s: string) {
  return ({ draft: 'gray', calculated: 'blue', approved: 'green', paid: 'emerald' } as Record<string, string>)[s] || 'gray'
}

onMounted(load)
</script>

<style scoped>
.input-field { @apply w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-sm bg-gray-50/50; }
.form-label { @apply block text-sm font-medium text-gray-600 mb-1; }
</style>
