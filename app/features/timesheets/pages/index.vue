<template>
  <FeatureBoundary id="timesheets">
    <div class="px-4 lg:px-6 py-5 max-w-[1400px] mx-auto">
      <UiPageHeader
        icon="i-lucide-clock"
        :title="$t('nav.timesheets')"
        :subtitle="locale === 'ar' ? 'سجل الساعات والاعتمادات' : 'Time entries and approvals'"
      >
        <template #actions>
          <UiAppButton variant="outline" size="sm" icon="i-lucide-bar-chart-2" @click="navigateTo('/timesheets/summary')">
            {{ locale === 'ar' ? 'ملخص' : 'Summary' }}
          </UiAppButton>
          <UiAppButton variant="primary" size="sm" icon="i-lucide-plus" @click="createOpen = true">
            {{ locale === 'ar' ? 'قيد جديد' : 'New Entry' }}
          </UiAppButton>
        </template>
      </UiPageHeader>

      <UiDataTable
        :columns="columns"
        :rows="entries"
        :loading="loading"
        :current-page="meta.current_page"
        :total-pages="meta.last_page"
        empty-icon="i-lucide-clock"
        :empty-title="locale === 'ar' ? 'لا توجد قيود وقت' : 'No timesheet entries yet'"
        :empty-description="locale === 'ar' ? 'سجّل قيداً يدوياً أو ابدأ المؤقت من /timesheets/timer.' : 'Create an entry manually, or start the live timer from /timesheets/timer.'"
        @page-change="(p) => { page = p; load() }"
      >
        <template #header>
          <div class="flex items-center gap-2 flex-1 flex-wrap min-w-0">
            <UiSearchInput
              v-model="search"
              class="flex-1 min-w-[200px] max-w-xs"
              :placeholder="locale === 'ar' ? 'بحث في الأوصاف...' : 'Search descriptions...'"
              @update:model-value="debouncedLoad"
            />
            <UiFilterDropdown
              v-model="statusFilter"
              :options="statusOptions"
              :all-label="locale === 'ar' ? 'كل الحالات' : 'All statuses'"
              @update:model-value="load"
            />
          </div>
        </template>

        <template #cell-date="{ value }">
          <span class="text-sm text-neutral-700 dark:text-neutral-200 tabular-nums" dir="ltr">{{ formatDate(value) }}</span>
        </template>

        <template #cell-task_description="{ row }">
          <div class="min-w-0">
            <p class="text-sm text-neutral-900 dark:text-neutral-0 truncate">{{ row.task_description || '—' }}</p>
            <p v-if="row.client" class="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">{{ row.client.name }}</p>
          </div>
        </template>

        <template #cell-hours="{ value }">
          <span class="font-mono text-sm font-semibold tabular-nums text-neutral-900 dark:text-neutral-0" dir="ltr">{{ value }}h</span>
        </template>

        <template #cell-is_billable="{ row }">
          <UiBadge :color="row.is_billable ? 'green' : 'gray'">
            {{ row.is_billable
              ? (locale === 'ar' ? 'قابل للفوترة' : 'Billable')
              : (locale === 'ar' ? 'غير قابل' : 'Non-billable') }}
          </UiBadge>
        </template>

        <template #cell-status="{ row }">
          <UiBadge :color="statusColor(row.status)" dot>
            {{ locale === 'ar' ? row.status_label_ar : row.status_label }}
          </UiBadge>
        </template>

        <template #cell-actions="{ row }">
          <div class="flex items-center justify-end gap-0.5" @click.stop>
            <button
              v-if="row.status === 'draft'"
              type="button"
              class="w-7 h-7 inline-flex items-center justify-center rounded-md text-neutral-400 hover:text-primary-600 hover:bg-primary-500/10 transition-colors"
              :title="locale === 'ar' ? 'تقديم' : 'Submit'"
              @click="handleSubmit(row.id)"
            >
              <UIcon name="i-lucide-send" class="w-3.5 h-3.5" />
            </button>
            <button
              v-if="row.status === 'submitted'"
              type="button"
              class="w-7 h-7 inline-flex items-center justify-center rounded-md text-neutral-400 hover:text-success-600 hover:bg-success-500/10 transition-colors"
              :title="locale === 'ar' ? 'اعتماد' : 'Approve'"
              @click="handleApprove(row.id)"
            >
              <UIcon name="i-lucide-check" class="w-3.5 h-3.5" />
            </button>
            <button
              v-if="row.status === 'submitted'"
              type="button"
              class="w-7 h-7 inline-flex items-center justify-center rounded-md text-neutral-400 hover:text-danger-600 hover:bg-danger-500/10 transition-colors"
              :title="locale === 'ar' ? 'رفض' : 'Reject'"
              @click="openReject(row.id)"
            >
              <UIcon name="i-lucide-x" class="w-3.5 h-3.5" />
            </button>
          </div>
        </template>
      </UiDataTable>

      <!-- Reject confirm -->
      <UiConfirmModal
        v-model="rejectOpen"
        :title="locale === 'ar' ? 'رفض القيد' : 'Reject Entry'"
        :description="locale === 'ar' ? 'لن يُحتسب هذا القيد ضمن ساعات العمل.' : 'This entry will not count toward billable hours.'"
        icon="i-lucide-x-circle"
        variant="danger"
        :confirm-label="locale === 'ar' ? 'رفض' : 'Reject'"
        @confirm="handleReject"
      />

      <!-- Create slideover -->
      <UiSlideOver v-model="createOpen" :title="locale === 'ar' ? 'قيد زمني جديد' : 'New Timesheet Entry'">
        <form @submit.prevent="handleCreate" class="space-y-3">
          <div>
            <label class="ts-label">
              {{ locale === 'ar' ? 'التاريخ' : 'Date' }}
              <span class="text-danger-500">*</span>
            </label>
            <input v-model="form.date" type="date" required class="ts-input" />
          </div>
          <div>
            <label class="ts-label">
              {{ locale === 'ar' ? 'وصف المهمة' : 'Task Description' }}
              <span class="text-danger-500">*</span>
            </label>
            <input
              v-model="form.task_description"
              type="text"
              required
              class="ts-input"
              :placeholder="locale === 'ar' ? 'ما الذي عملت عليه؟' : 'What did you work on?'"
            />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="ts-label">
                {{ locale === 'ar' ? 'الساعات' : 'Hours' }}
                <span class="text-danger-500">*</span>
              </label>
              <input
                v-model.number="form.hours"
                type="number"
                step="0.25"
                min="0.25"
                max="24"
                required
                class="ts-input font-mono text-end"
                dir="ltr"
              />
            </div>
            <div>
              <label class="ts-label">{{ locale === 'ar' ? 'السعر/ساعة' : 'Hourly Rate' }}</label>
              <input
                v-model.number="form.hourly_rate"
                type="number"
                step="0.01"
                min="0"
                class="ts-input font-mono text-end"
                dir="ltr"
              />
            </div>
          </div>
          <label class="flex items-center gap-2 py-1 cursor-pointer">
            <input v-model="form.is_billable" type="checkbox" class="rounded text-primary-500 focus:ring-primary-500" />
            <span class="text-sm text-neutral-700 dark:text-neutral-200">{{ locale === 'ar' ? 'قابل للفوترة' : 'Billable' }}</span>
          </label>
          <div class="flex items-center gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
            <UiAppButton type="button" variant="outline" class="flex-1" @click="createOpen = false">
              {{ $t('common.cancel') }}
            </UiAppButton>
            <UiAppButton type="submit" variant="primary" icon="i-lucide-plus" :loading="createLoading" class="flex-1">
              {{ $t('common.create') }}
            </UiAppButton>
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

.ts-label { @apply block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5; }

.ts-input {
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
.ts-input:focus {
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 2px color-mix(in oklab, var(--color-primary-500) 20%, transparent);
}
:global(html.dark) .ts-input {
  background-color: var(--color-neutral-900);
  border-color: var(--color-neutral-800);
  color: var(--color-neutral-0);
}
</style>
