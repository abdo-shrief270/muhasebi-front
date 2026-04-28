<template>
  <FeatureBoundary id="payroll">
    <div class="px-4 lg:px-6 py-5 max-w-[1400px] mx-auto">
      <UiPageHeader
        icon="i-lucide-users"
        :title="locale === 'ar' ? 'الموظفين' : 'Employees'"
        :subtitle="locale === 'ar' ? 'بيانات الموظفين والرواتب الأساسية' : 'Employee records and base salaries'"
      >
        <template #actions>
          <UiAppButton variant="outline" size="sm" icon="i-lucide-wallet" @click="navigateTo('/payroll')">
            {{ locale === 'ar' ? 'مسيرات الرواتب' : 'Payroll Runs' }}
          </UiAppButton>
          <UiAppButton variant="primary" size="sm" icon="i-lucide-plus" @click="openCreate">
            {{ locale === 'ar' ? 'موظف جديد' : 'Add Employee' }}
          </UiAppButton>
        </template>
      </UiPageHeader>

      <UiDataTable
        :columns="columns"
        :rows="employees"
        :loading="loading"
        empty-icon="i-lucide-users"
        :empty-title="locale === 'ar' ? 'لا يوجد موظفين' : 'No employees yet'"
        :empty-description="locale === 'ar'
          ? 'أضف موظفاً لربطه بمستخدم النظام وتحديد راتبه الأساسي وبيانات التأمين.'
          : 'Add an employee to link them to a system user and set base salary and insurance info.'"
      >
        <template #cell-user="{ row }">
          <div class="min-w-0">
            <p class="text-sm font-medium text-neutral-900 dark:text-neutral-0 truncate">{{ row.user?.name || '—' }}</p>
            <p class="text-xs text-neutral-500 dark:text-neutral-400 truncate" dir="ltr">{{ row.user?.email }}</p>
          </div>
        </template>
        <template #cell-job_title="{ value }">
          <span class="text-sm text-neutral-700 dark:text-neutral-200">{{ value || '—' }}</span>
        </template>
        <template #cell-base_salary="{ value }">
          <span class="font-mono text-sm font-medium tabular-nums text-neutral-900 dark:text-neutral-0" dir="ltr">{{ formatMoney(value) }}</span>
        </template>
        <template #cell-is_insured="{ row }">
          <UiBadge :color="row.is_insured ? 'green' : 'gray'" dot>
            {{ row.is_insured ? (locale === 'ar' ? 'مؤمن' : 'Insured') : (locale === 'ar' ? 'غير مؤمن' : 'Not Insured') }}
          </UiBadge>
        </template>
        <template #cell-actions="{ row }">
          <div class="flex items-center gap-1" @click.stop>
            <button
              type="button"
              class="emp-action emp-action-edit"
              :aria-label="locale === 'ar' ? 'تعديل' : 'Edit'"
              @click="openEdit(row)"
            >
              <UIcon name="i-lucide-pencil" class="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              class="emp-action emp-action-delete"
              :aria-label="locale === 'ar' ? 'حذف' : 'Delete'"
              @click="handleDelete(row.id)"
            >
              <UIcon name="i-lucide-trash-2" class="w-3.5 h-3.5" />
            </button>
          </div>
        </template>
      </UiDataTable>

      <UiSlideOver
        v-model="createOpen"
        :title="editing ? (locale === 'ar' ? 'تعديل الموظف' : 'Edit Employee') : (locale === 'ar' ? 'إضافة موظف' : 'Add Employee')"
      >
        <form @submit.prevent="handleSubmit" class="space-y-3">
          <div v-if="!editing">
            <label class="emp-label">{{ locale === 'ar' ? 'المستخدم' : 'User' }} <span class="text-danger-500">*</span></label>
            <div class="relative">
              <select v-model="form.user_id" required class="emp-input">
                <option :value="null" disabled>{{ locale === 'ar' ? 'اختر مستخدم' : 'Select user' }}</option>
                <option v-for="u in teamUsers" :key="u.id" :value="u.id">{{ u.name }} ({{ u.email }})</option>
              </select>
              <UIcon name="i-lucide-chevron-down" class="absolute end-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="emp-label">{{ locale === 'ar' ? 'تاريخ التعيين' : 'Hire Date' }} <span class="text-danger-500">*</span></label>
              <input v-model="form.hire_date" type="date" required class="emp-input" />
            </div>
            <div>
              <label class="emp-label">{{ locale === 'ar' ? 'الراتب الأساسي' : 'Base Salary' }} <span class="text-danger-500">*</span></label>
              <input v-model="form.base_salary" type="number" step="0.01" min="0" required class="emp-input font-mono" dir="ltr" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="emp-label">{{ locale === 'ar' ? 'المسمى الوظيفي' : 'Job Title' }}</label>
              <input v-model="form.job_title" type="text" class="emp-input" />
            </div>
            <div>
              <label class="emp-label">{{ locale === 'ar' ? 'القسم' : 'Department' }}</label>
              <input v-model="form.department" type="text" class="emp-input" />
            </div>
          </div>
          <div>
            <label class="emp-label">{{ locale === 'ar' ? 'رقم التأمينات' : 'Social Insurance #' }}</label>
            <input v-model="form.social_insurance_number" type="text" class="emp-input font-mono" dir="ltr" />
          </div>
          <label class="flex items-center gap-2 cursor-pointer">
            <input v-model="form.is_insured" type="checkbox" class="emp-checkbox" />
            <span class="text-sm text-neutral-700 dark:text-neutral-200">{{ locale === 'ar' ? 'مؤمن عليه' : 'Has Social Insurance' }}</span>
          </label>
          <div class="flex gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
            <UiAppButton type="submit" variant="primary" icon="i-lucide-save" :loading="submitting">
              {{ editing ? $t('common.save') : $t('common.create') }}
            </UiAppButton>
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

const employees = ref<any[]>([])
const teamUsers = ref<any[]>([])
const loading = ref(true)
const createOpen = ref(false)
const submitting = ref(false)
const editing = ref<any>(null)
const form = reactive({
  user_id: null as number | null,
  hire_date: new Date().toISOString().split('T')[0],
  base_salary: 0,
  job_title: '',
  department: '',
  social_insurance_number: '',
  is_insured: false,
})

const columns = computed(() => [
  { key: 'user', label: locale.value === 'ar' ? 'الموظف' : 'Employee' },
  { key: 'job_title', label: locale.value === 'ar' ? 'المسمى' : 'Title' },
  { key: 'base_salary', label: locale.value === 'ar' ? 'الراتب' : 'Salary', class: 'text-end' },
  { key: 'is_insured', label: locale.value === 'ar' ? 'التأمين' : 'Insurance' },
  { key: 'actions', label: '', class: 'w-20' },
])

function formatMoney(n: number | string | null | undefined) {
  return Number(n ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

async function load() {
  loading.value = true
  try {
    const [empRes, teamRes] = await Promise.all([
      api.get<{ data: any[] }>('/employees'),
      api.get<{ data: any[] }>('/team'),
    ])
    employees.value = empRes.data
    teamUsers.value = teamRes.data
  } catch { employees.value = [] }
  finally { loading.value = false }
}

function resetForm() {
  Object.assign(form, {
    user_id: null,
    hire_date: new Date().toISOString().split('T')[0],
    base_salary: 0,
    job_title: '',
    department: '',
    social_insurance_number: '',
    is_insured: false,
  })
}

function openCreate() {
  editing.value = null
  resetForm()
  createOpen.value = true
}

function openEdit(emp: any) {
  editing.value = emp
  Object.assign(form, {
    user_id: emp.user_id,
    hire_date: emp.hire_date,
    base_salary: emp.base_salary,
    job_title: emp.job_title || '',
    department: emp.department || '',
    social_insurance_number: emp.social_insurance_number || '',
    is_insured: emp.is_insured,
  })
  createOpen.value = true
}

async function handleSubmit() {
  submitting.value = true
  try {
    if (editing.value) {
      await api.put(`/employees/${editing.value.id}`, form)
    } else {
      await api.post('/employees', form)
    }
    toastStore.success(locale.value === 'ar' ? 'تم الحفظ' : 'Saved')
    createOpen.value = false
    editing.value = null
    load()
  } catch (e: any) { toastStore.error(e.data?.message || 'Error') }
  finally { submitting.value = false }
}

async function handleDelete(id: number) {
  try { await api.delete(`/employees/${id}`); toastStore.success('Deleted'); load() }
  catch (e: any) { toastStore.error(e.data?.message || 'Error') }
}

onMounted(load)
</script>

<style scoped>
@reference "~/assets/css/tokens.css";

.emp-label { @apply block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5; }

.emp-input {
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
.emp-input:focus {
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 2px color-mix(in oklab, var(--color-primary-500) 20%, transparent);
}
:global(html.dark) .emp-input {
  background-color: var(--color-neutral-900);
  border-color: var(--color-neutral-800);
  color: var(--color-neutral-0);
}

.emp-checkbox {
  width: 1rem;
  height: 1rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-neutral-300);
  accent-color: var(--color-primary-500);
}
:global(html.dark) .emp-checkbox {
  border-color: var(--color-neutral-700);
}

.emp-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: var(--radius-sm);
  color: var(--color-neutral-400);
  transition: color 150ms var(--ease-standard), background-color 150ms var(--ease-standard);
}
.emp-action-edit:hover {
  color: var(--color-primary-600);
  background-color: color-mix(in oklab, var(--color-primary-500) 12%, transparent);
}
.emp-action-delete:hover {
  color: var(--color-danger-600);
  background-color: color-mix(in oklab, var(--color-danger-500) 12%, transparent);
}
</style>
