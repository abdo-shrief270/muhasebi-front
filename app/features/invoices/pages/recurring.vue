<template>
    <FeatureBoundary id="invoices">
      <div class="px-4 lg:px-6 py-5 max-w-[1400px] mx-auto">
        <UiPageHeader
          icon="i-lucide-rotate-ccw"
          :title="locale === 'ar' ? 'الفواتير المتكررة' : 'Recurring Invoices'"
          :subtitle="locale === 'ar' ? 'جداول تُولِّد فواتير تلقائياً.' : 'Schedules that auto-generate invoices.'"
          :breadcrumb="[
            { label: $t('nav.invoices'), to: '/invoices' },
            { label: locale === 'ar' ? 'متكررة' : 'Recurring' },
          ]"
        >
          <template #actions>
            <UiAppButton variant="primary" icon="i-lucide-plus" @click="openForm()">
              {{ locale === 'ar' ? 'جدولة جديدة' : 'New Schedule' }}
            </UiAppButton>
          </template>
        </UiPageHeader>

        <UiDataTable
          :columns="columns"
          :rows="items"
          :loading="loading"
          :clickable="false"
          empty-icon="i-lucide-rotate-ccw"
          :empty-title="locale === 'ar' ? 'لا توجد جداول متكررة' : 'No recurring schedules'"
          :empty-description="locale === 'ar' ? 'أنشئ جدولاً لتوليد الفواتير تلقائياً.' : 'Create a schedule to generate invoices automatically.'"
        >
          <template #cell-client="{ row }">
            <div class="flex items-center gap-2 min-w-0">
              <div
                class="w-6 h-6 rounded-md bg-primary-500/10 text-primary-700 dark:text-primary-300 inline-flex items-center justify-center text-[10px] font-semibold flex-shrink-0"
              >
                {{ (row.client?.name || '?').charAt(0).toUpperCase() }}
              </div>
              <span class="text-neutral-900 dark:text-neutral-0 truncate font-medium">{{ row.client?.name || '—' }}</span>
            </div>
          </template>

          <template #cell-frequency="{ row }">
            <div class="flex items-center gap-1.5">
              <UIcon name="i-lucide-calendar-clock" class="w-3.5 h-3.5 text-neutral-400" />
              <span class="text-neutral-700 dark:text-neutral-200">{{ freqLabel(row.frequency) }}</span>
              <UiBadge v-if="row.auto_send" color="blue" size="xs" icon="i-lucide-send">
                {{ locale === 'ar' ? 'تلقائي' : 'Auto-send' }}
              </UiBadge>
            </div>
          </template>

          <template #cell-next_run="{ row }">
            <span class="text-neutral-600 dark:text-neutral-400 tabular-nums">
              {{ formatDate(row.next_run_date) }}
            </span>
          </template>

          <template #cell-progress="{ row }">
            <span class="font-mono text-xs tabular-nums text-neutral-600 dark:text-neutral-400" dir="ltr">
              {{ row.invoices_generated ?? 0 }}<span v-if="row.max_occurrences" class="text-neutral-300 dark:text-neutral-700">/{{ row.max_occurrences }}</span>
            </span>
          </template>

          <template #cell-status="{ row }">
            <UiBadge :color="row.is_active ? 'green' : 'gray'" dot>
              {{ row.is_active ? (locale === 'ar' ? 'نشط' : 'Active') : (locale === 'ar' ? 'متوقف' : 'Stopped') }}
            </UiBadge>
          </template>

          <template #cell-actions="{ row }">
            <div class="flex items-center justify-end gap-0.5" @click.stop>
              <button
                type="button"
                @click="openForm(row)"
                class="w-7 h-7 inline-flex items-center justify-center rounded-md text-neutral-400 hover:text-primary-600 hover:bg-primary-500/10 dark:hover:text-primary-400 transition-colors"
                :title="$t('common.edit')"
              >
                <UIcon name="i-lucide-pencil" class="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                @click="askDelete(row)"
                class="w-7 h-7 inline-flex items-center justify-center rounded-md text-neutral-400 hover:text-danger-600 hover:bg-danger-500/10 dark:hover:text-danger-400 transition-colors"
                :title="$t('common.delete')"
              >
                <UIcon name="i-lucide-trash-2" class="w-3.5 h-3.5" />
              </button>
            </div>
          </template>
        </UiDataTable>
      </div>

      <!-- Form slideover -->
      <UiSlideOver
        v-model="showForm"
        :title="editing
          ? (locale === 'ar' ? 'تعديل الجدولة' : 'Edit Schedule')
          : (locale === 'ar' ? 'جدولة جديدة' : 'New Schedule')"
      >
        <form @submit.prevent="handleSave" class="space-y-4">
          <!-- Client -->
          <div>
            <label class="form-label">
              {{ locale === 'ar' ? 'العميل' : 'Client' }}
              <span class="text-danger-500">*</span>
            </label>
            <div class="relative">
              <UIcon
                name="i-lucide-user"
                class="absolute start-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none"
              />
              <select
                v-model.number="form.client_id"
                required
                class="form-input form-input--leading-icon"
                :class="{ 'form-input--error': fieldErrors.client_id }"
              >
                <option :value="null" disabled>{{ locale === 'ar' ? 'اختر عميلاً' : 'Select a client' }}</option>
                <option v-for="c in clients" :key="c.id" :value="c.id">{{ c.name }}</option>
              </select>
              <UIcon
                name="i-lucide-chevron-down"
                class="absolute end-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none"
              />
            </div>
            <p v-if="fieldErrors.client_id" class="form-error">{{ fieldErrors.client_id }}</p>
          </div>

          <!-- Frequency + Start date -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="form-label">
                {{ locale === 'ar' ? 'التكرار' : 'Frequency' }}
                <span class="text-danger-500">*</span>
              </label>
              <div class="relative">
                <UIcon
                  name="i-lucide-calendar-clock"
                  class="absolute start-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none"
                />
                <select v-model="form.frequency" class="form-input form-input--leading-icon">
                  <option value="weekly">{{ locale === 'ar' ? 'أسبوعي' : 'Weekly' }}</option>
                  <option value="monthly">{{ locale === 'ar' ? 'شهري' : 'Monthly' }}</option>
                  <option value="quarterly">{{ locale === 'ar' ? 'ربع سنوي' : 'Quarterly' }}</option>
                  <option value="yearly">{{ locale === 'ar' ? 'سنوي' : 'Yearly' }}</option>
                </select>
                <UIcon
                  name="i-lucide-chevron-down"
                  class="absolute end-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none"
                />
              </div>
            </div>
            <div>
              <label class="form-label">
                {{ locale === 'ar' ? 'تاريخ البدء' : 'Start date' }}
                <span class="text-danger-500">*</span>
              </label>
              <input v-model="form.start_date" type="date" required class="form-input" />
            </div>
          </div>

          <!-- Due days + Max occurrences -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="form-label">{{ locale === 'ar' ? 'أيام الاستحقاق' : 'Due in (days)' }}</label>
              <input v-model.number="form.due_days" type="number" min="0" class="form-input font-mono" dir="ltr" />
              <p class="text-[11px] text-neutral-400 mt-1">
                {{ locale === 'ar' ? 'تاريخ استحقاق الفاتورة بعد إصدارها.' : 'Payment due after each issue date.' }}
              </p>
            </div>
            <div>
              <label class="form-label">{{ locale === 'ar' ? 'أقصى عدد' : 'Max occurrences' }}</label>
              <input
                v-model.number="form.max_occurrences"
                type="number"
                min="1"
                class="form-input font-mono"
                dir="ltr"
                :placeholder="locale === 'ar' ? 'غير محدود' : 'Unlimited'"
              />
              <p class="text-[11px] text-neutral-400 mt-1">
                {{ locale === 'ar' ? 'اتركه فارغاً للاستمرار دون نهاية.' : 'Leave empty to run indefinitely.' }}
              </p>
            </div>
          </div>

          <!-- Toggles -->
          <div class="space-y-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
            <label class="flex items-center gap-3 py-1.5 cursor-pointer select-none">
              <input
                v-model="form.is_active"
                type="checkbox"
                class="w-4 h-4 rounded-sm border-neutral-300 dark:border-neutral-700 text-primary-600 focus:ring-2 focus:ring-primary-500/25"
              />
              <span class="flex-1">
                <span class="text-sm font-medium text-neutral-900 dark:text-neutral-0">
                  {{ locale === 'ar' ? 'نشط' : 'Active' }}
                </span>
                <span class="block text-[11px] text-neutral-500 dark:text-neutral-400">
                  {{ locale === 'ar' ? 'الجدول يعمل ويولِّد فواتير في موعدها.' : 'Schedule is running and will generate invoices.' }}
                </span>
              </span>
            </label>
            <label class="flex items-center gap-3 py-1.5 cursor-pointer select-none">
              <input
                v-model="form.auto_send"
                type="checkbox"
                class="w-4 h-4 rounded-sm border-neutral-300 dark:border-neutral-700 text-primary-600 focus:ring-2 focus:ring-primary-500/25"
              />
              <span class="flex-1">
                <span class="text-sm font-medium text-neutral-900 dark:text-neutral-0">
                  {{ locale === 'ar' ? 'إرسال تلقائي' : 'Auto-send' }}
                </span>
                <span class="block text-[11px] text-neutral-500 dark:text-neutral-400">
                  {{ locale === 'ar' ? 'إرسال الفاتورة بالبريد للعميل فور إنشائها.' : 'Email the invoice to the client as soon as it is created.' }}
                </span>
              </span>
            </label>
          </div>

          <!-- Line items -->
          <div class="pt-1">
            <p class="text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-2 flex items-center gap-1.5">
              <UIcon name="i-lucide-list" class="w-3.5 h-3.5 text-neutral-400" />
              {{ locale === 'ar' ? 'بنود الفاتورة' : 'Line items' }}
              <span class="text-[10px] font-normal text-neutral-400 ms-auto">
                {{ locale === 'ar' ? 'تُولَّد كل دورة' : 'Generated each cycle' }}
              </span>
            </p>
            <LineItemsEditor
              v-model="form.line_items"
              :error="fieldErrors.line_items"
              :client-id="form.client_id"
              hide-header
            />
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
            <UiAppButton type="button" variant="outline" class="flex-1" @click="showForm = false">
              {{ $t('common.cancel') }}
            </UiAppButton>
            <UiAppButton
              type="submit"
              variant="primary"
              :loading="saving"
              :icon="editing ? 'i-lucide-save' : 'i-lucide-plus'"
              class="flex-1"
            >
              {{ editing ? $t('common.save') : $t('common.create') }}
            </UiAppButton>
          </div>
        </form>
      </UiSlideOver>

      <!-- Delete confirm -->
      <UiConfirmModal
        v-model="confirmDeleteOpen"
        :title="locale === 'ar' ? 'حذف الجدولة' : 'Delete Schedule'"
        :description="locale === 'ar' ? 'سيتم إيقاف توليد الفواتير من هذه الجدولة. لا يؤثر على الفواتير المُنشأة بالفعل.' : 'Future invoices will stop being generated. Already-created invoices are not affected.'"
        icon="i-lucide-alert-triangle"
        variant="danger"
        :confirm-label="$t('common.delete')"
        :loading="deleting"
        @confirm="confirmDelete"
      />
    </FeatureBoundary>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })

const { locale } = useI18n()
const api = useApi()
const toastStore = useToastStore()
const { clients, fetchClients } = useClients()

const items = ref<any[]>([])
const loading = ref(true)
const saving = ref(false)
const deleting = ref(false)

const showForm = ref(false)
const editing = ref<any>(null)
const fieldErrors = ref<Record<string, string>>({})

const confirmDeleteOpen = ref(false)
const pendingDelete = ref<any>(null)

interface LineItem {
  description: string
  quantity: number
  unit_price: number
  discount_percent: number
  vat_rate: number
}

function defaultLine(): LineItem {
  return { description: '', quantity: 1, unit_price: 0, discount_percent: 0, vat_rate: 14 }
}

const form = reactive({
  client_id: null as number | null,
  frequency: 'monthly' as 'weekly' | 'monthly' | 'quarterly' | 'yearly',
  start_date: '',
  due_days: 30,
  max_occurrences: null as number | null,
  is_active: true,
  auto_send: false,
  line_items: [defaultLine()] as LineItem[],
})

const columns = computed(() => [
  { key: 'client',     label: locale.value === 'ar' ? 'العميل' : 'Client' },
  { key: 'frequency',  label: locale.value === 'ar' ? 'التكرار' : 'Frequency' },
  { key: 'next_run',   label: locale.value === 'ar' ? 'التشغيل التالي' : 'Next Run', sortable: true },
  { key: 'progress',   label: locale.value === 'ar' ? 'تم إنشاؤها' : 'Generated', class: 'text-end' },
  { key: 'status',     label: $t('common.status') },
  { key: 'actions',    label: '', class: 'w-20' },
])

function freqLabel(f: string) {
  const isAr = locale.value === 'ar'
  const map: Record<string, string> = {
    weekly:    isAr ? 'أسبوعي' : 'Weekly',
    monthly:   isAr ? 'شهري' : 'Monthly',
    quarterly: isAr ? 'ربع سنوي' : 'Quarterly',
    yearly:    isAr ? 'سنوي' : 'Yearly',
  }
  return map[f] ?? f
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
    const res = await api.get<{ data: any[] }>('/recurring-invoices')
    items.value = res.data ?? []
  } catch {
    items.value = []
  } finally {
    loading.value = false
  }
}

function openForm(r?: any) {
  fieldErrors.value = {}
  editing.value = r || null
  if (r) {
    form.client_id = r.client?.id ?? null
    form.frequency = r.frequency
    form.start_date = r.start_date || ''
    form.due_days = r.due_days ?? 30
    form.max_occurrences = r.max_occurrences ?? null
    form.is_active = !!r.is_active
    form.auto_send = !!r.auto_send
    const items = Array.isArray(r.line_items) ? r.line_items : []
    form.line_items = items.length
      ? items.map((l: any) => ({
          description: l.description ?? '',
          quantity: Number(l.quantity ?? 1),
          unit_price: Number(l.unit_price ?? 0),
          discount_percent: Number(l.discount_percent ?? 0),
          vat_rate: Number(l.vat_rate ?? 14),
        }))
      : [defaultLine()]
  } else {
    form.client_id = null
    form.frequency = 'monthly'
    form.start_date = new Date().toISOString().split('T')[0]
    form.due_days = 30
    form.max_occurrences = null
    form.is_active = true
    form.auto_send = false
    form.line_items = [defaultLine()]
  }
  showForm.value = true
}

function validate(): boolean {
  const next: Record<string, string> = {}
  const required = locale.value === 'ar' ? 'هذا الحقل مطلوب.' : 'This field is required.'
  if (!form.client_id) next.client_id = required

  // Reject schedules with no usable lines — server would 422 anyway. The
  // editor enforces ≥1 row, so this is the "all rows are blank" guard.
  const hasRealLine = form.line_items.some(l =>
    (l.description?.trim() || Number(l.unit_price) > 0)
  )
  if (!hasRealLine) {
    next.line_items = locale.value === 'ar'
      ? 'أضف بنداً واحداً على الأقل بسعر أو وصف.'
      : 'Add at least one line with a description or price.'
  }

  fieldErrors.value = next
  return Object.keys(next).length === 0
}

async function handleSave() {
  if (!validate()) return
  saving.value = true
  try {
    if (editing.value) {
      await api.put(`/recurring-invoices/${editing.value.id}`, form)
    } else {
      await api.post('/recurring-invoices', form)
    }
    toastStore.success(locale.value === 'ar' ? 'تم الحفظ' : 'Saved')
    showForm.value = false
    load()
  } catch (e: any) {
    if (e?.fieldErrors) {
      const flat: Record<string, string> = {}
      for (const [k, msgs] of Object.entries(e.fieldErrors as Record<string, string[]>)) {
        if (msgs?.[0]) flat[k] = msgs[0]
      }
      fieldErrors.value = flat
    }
    toastStore.error(e?.message || (locale.value === 'ar' ? 'حدث خطأ' : 'Error'))
  } finally {
    saving.value = false
  }
}

function askDelete(r: any) {
  pendingDelete.value = r
  confirmDeleteOpen.value = true
}

async function confirmDelete() {
  if (!pendingDelete.value) return
  deleting.value = true
  try {
    await api.delete(`/recurring-invoices/${pendingDelete.value.id}`)
    toastStore.success(locale.value === 'ar' ? 'تم الحذف' : 'Deleted')
    confirmDeleteOpen.value = false
    pendingDelete.value = null
    load()
  } catch (e: any) {
    toastStore.error(e?.message || (locale.value === 'ar' ? 'حدث خطأ' : 'Error'))
  } finally {
    deleting.value = false
  }
}

onMounted(() => {
  load()
  fetchClients({ per_page: 100 })
})
</script>

<style scoped>
@reference "~/assets/css/tokens.css";

.form-label { @apply block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5; }
.form-error { @apply mt-1 text-xs text-danger-600 dark:text-danger-500 flex items-center gap-1; }

.form-input {
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
.form-input:focus {
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 2px color-mix(in oklab, var(--color-primary-500) 20%, transparent);
}
.form-input--leading-icon { padding-inline-start: 2rem; padding-inline-end: 2rem; }
.form-input--error { border-color: color-mix(in oklab, var(--color-danger-500) 60%, transparent); }
.form-input--error:focus { border-color: var(--color-danger-500); box-shadow: 0 0 0 2px color-mix(in oklab, var(--color-danger-500) 25%, transparent); }

:global(html.dark) .form-input {
  background-color: var(--color-neutral-900);
  border-color: var(--color-neutral-800);
  color: var(--color-neutral-0);
}
</style>
