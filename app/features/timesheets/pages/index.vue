<template>
  <div>
    <NuxtLayout name="dashboard">
      <FeatureBoundary id="timesheets">
      <UiPageHeader :title="$t('nav.timesheets')">
        <template #actions>
          <UiAppButton variant="outline" size="sm" @click="navigateTo('/timesheets/summary')">
            {{ locale === 'ar' ? 'ملخص' : 'Summary' }}
          </UiAppButton>
          <UiAppButton variant="primary" @click="createOpen = true">
            {{ locale === 'ar' ? '+ قيد جديد' : '+ New Entry' }}
          </UiAppButton>
        </template>
      </UiPageHeader>

      <UiDataTable
        :columns="columns"
        :rows="entries"
        :loading="loading"
        :current-page="meta.current_page"
        :total-pages="meta.last_page"
        :empty-title="locale === 'ar' ? 'لا توجد قيود' : 'No timesheet entries'"
        @page-change="(p) => { page = p; load() }"
      >
        <template #header>
          <UiSearchInput v-model="search" class="flex-1 min-w-[200px]" @update:model-value="debouncedLoad" />
          <UiFilterDropdown v-model="statusFilter" :options="statusOptions" :all-label="$t('common.all')" @update:model-value="load" />
        </template>

        <template #cell-date="{ value }">
          <span class="text-sm text-gray-600">{{ value }}</span>
        </template>

        <template #cell-task_description="{ row }">
          <div>
            <p class="text-gray-700">{{ row.task_description }}</p>
            <p v-if="row.client" class="text-xs text-gray-400">{{ row.client.name }}</p>
          </div>
        </template>

        <template #cell-hours="{ value }">
          <span class="font-mono font-medium" dir="ltr">{{ value }}h</span>
        </template>

        <template #cell-is_billable="{ row }">
          <UiBadge :color="row.is_billable ? 'green' : 'gray'">
            {{ row.is_billable ? (locale === 'ar' ? 'قابل للفوترة' : 'Billable') : (locale === 'ar' ? 'غير قابل' : 'Non-billable') }}
          </UiBadge>
        </template>

        <template #cell-status="{ row }">
          <UiBadge :color="statusColor(row.status)" dot>
            {{ locale === 'ar' ? row.status_label_ar : row.status_label }}
          </UiBadge>
        </template>

        <template #cell-actions="{ row }">
          <div class="flex items-center gap-1" @click.stop>
            <UiAppButton v-if="row.status === 'draft'" variant="ghost" size="sm" @click="handleSubmit(row.id)">
              {{ locale === 'ar' ? 'تقديم' : 'Submit' }}
            </UiAppButton>
            <UiAppButton v-if="row.status === 'submitted'" variant="ghost" size="sm" @click="handleApprove(row.id)">
              {{ locale === 'ar' ? 'اعتماد' : 'Approve' }}
            </UiAppButton>
            <UiAppButton v-if="row.status === 'submitted'" variant="ghost" size="sm" class="text-red-500" @click="openReject(row.id)">
              {{ locale === 'ar' ? 'رفض' : 'Reject' }}
            </UiAppButton>
          </div>
        </template>
      </UiDataTable>

      <!-- Reject modal -->
      <UiConfirmModal
        v-model="rejectOpen"
        :title="locale === 'ar' ? 'رفض القيد' : 'Reject Entry'"
        :description="locale === 'ar' ? 'أدخل سبب الرفض' : 'Enter rejection reason'"
        icon="⚠️"
        variant="danger"
        :confirm-label="locale === 'ar' ? 'رفض' : 'Reject'"
        @confirm="handleReject"
      />

      <!-- Create SlideOver -->
      <UiSlideOver v-model="createOpen" :title="locale === 'ar' ? 'قيد زمني جديد' : 'New Timesheet Entry'">
        <form @submit.prevent="handleCreate" class="space-y-4">
          <div>
            <label class="form-label">{{ locale === 'ar' ? 'التاريخ' : 'Date' }} *</label>
            <input v-model="form.date" type="date" required class="input-field" />
          </div>
          <div>
            <label class="form-label">{{ locale === 'ar' ? 'وصف المهمة' : 'Task Description' }} *</label>
            <input v-model="form.task_description" type="text" required class="input-field" />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="form-label">{{ locale === 'ar' ? 'الساعات' : 'Hours' }} *</label>
              <input v-model="form.hours" type="number" step="0.25" min="0.25" max="24" required class="input-field font-mono" dir="ltr" />
            </div>
            <div>
              <label class="form-label">{{ locale === 'ar' ? 'السعر/ساعة' : 'Hourly Rate' }}</label>
              <input v-model="form.hourly_rate" type="number" step="0.01" min="0" class="input-field font-mono" dir="ltr" />
            </div>
          </div>
          <label class="flex items-center gap-2 cursor-pointer">
            <input v-model="form.is_billable" type="checkbox" class="rounded border-gray-300 text-primary-500 focus:ring-primary-500" />
            <span class="text-sm text-gray-600">{{ locale === 'ar' ? 'قابل للفوترة' : 'Billable' }}</span>
          </label>
          <div class="flex gap-3 pt-4 border-t border-gray-100">
            <UiAppButton type="submit" variant="primary" :loading="createLoading">{{ $t('common.create') }}</UiAppButton>
            <UiAppButton variant="outline" @click="createOpen = false">{{ $t('common.cancel') }}</UiAppButton>
          </div>
        </form>
      </UiSlideOver>
      </FeatureBoundary>
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })
const { locale } = useI18n()
const api = useApi()
const toastStore = useToastStore()

const entries = ref<any[]>([])
const loading = ref(true)
const meta = ref({ current_page: 1, last_page: 1 })
const search = ref('')
const statusFilter = ref('')
const page = ref(1)
const createOpen = ref(false)
const createLoading = ref(false)

const form = reactive({ date: new Date().toISOString().split('T')[0], task_description: '', hours: 1, hourly_rate: '', is_billable: true })

const columns = computed(() => [
  { key: 'date', label: locale.value === 'ar' ? 'التاريخ' : 'Date', sortable: true },
  { key: 'task_description', label: locale.value === 'ar' ? 'المهمة' : 'Task' },
  { key: 'hours', label: locale.value === 'ar' ? 'ساعات' : 'Hours' },
  { key: 'is_billable', label: locale.value === 'ar' ? 'فوترة' : 'Billable' },
  { key: 'status', label: locale.value === 'ar' ? 'الحالة' : 'Status' },
  { key: 'actions', label: '', class: 'w-24' },
])

const statusOptions = computed(() => [
  { value: 'draft', label: locale.value === 'ar' ? 'مسودة' : 'Draft' },
  { value: 'submitted', label: locale.value === 'ar' ? 'مقدمة' : 'Submitted' },
  { value: 'approved', label: locale.value === 'ar' ? 'معتمدة' : 'Approved' },
  { value: 'rejected', label: locale.value === 'ar' ? 'مرفوضة' : 'Rejected' },
])

async function load() {
  loading.value = true
  try {
    const data = await api.get<any>(`/timesheets?search=${search.value}&status=${statusFilter.value}&page=${page.value}`)
    entries.value = data.data
    meta.value = data.meta || { current_page: 1, last_page: 1 }
  } catch { entries.value = [] }
  finally { loading.value = false }
}

const debouncedLoad = useDebounceFn(() => { page.value = 1; load() }, 400)

async function handleCreate() {
  createLoading.value = true
  try {
    await api.post('/timesheets', { ...form, hourly_rate: form.hourly_rate || undefined })
    toastStore.success(locale.value === 'ar' ? 'تم الإنشاء' : 'Created')
    createOpen.value = false
    form.task_description = ''; form.hours = 1
    load()
  } catch (e: any) { toastStore.error(e.data?.message || 'Error') }
  finally { createLoading.value = false }
}

async function handleSubmit(id: number) {
  try { await api.post(`/timesheets/${id}/submit`); toastStore.success(locale.value === 'ar' ? 'تم التقديم' : 'Submitted'); load() }
  catch (e: any) { toastStore.error(e.data?.message || 'Error') }
}

async function handleApprove(id: number) {
  try { await api.post(`/timesheets/${id}/approve`); toastStore.success(locale.value === 'ar' ? 'تم الاعتماد' : 'Approved'); load() }
  catch (e: any) { toastStore.error(e.data?.message || 'Error') }
}

const rejectOpen = ref(false)
const rejectingId = ref<number | null>(null)

function openReject(id: number) {
  rejectingId.value = id
  rejectOpen.value = true
}

async function handleReject() {
  if (!rejectingId.value) return
  try {
    await api.post(`/timesheets/${rejectingId.value}/reject`, { reason: 'Rejected by admin' })
    toastStore.success(locale.value === 'ar' ? 'تم الرفض' : 'Rejected')
    rejectOpen.value = false
    load()
  } catch (e: any) { toastStore.error(e.data?.message || 'Error') }
}

function statusColor(s: string) {
  return ({ draft: 'gray', submitted: 'blue', approved: 'green', rejected: 'red' } as Record<string, string>)[s] || 'gray'
}

onMounted(load)
</script>

<style scoped>
@reference "~/assets/css/tokens.css";
.input-field { @apply w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-sm bg-gray-50/50; }
.form-label { @apply block text-sm font-medium text-gray-600 mb-1; }
</style>
