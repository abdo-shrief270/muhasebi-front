<template>
  <div>
    <NuxtLayout name="dashboard">
      <FeatureBoundary id="payroll">
      <UiPageHeader :title="locale === 'ar' ? 'الموظفين' : 'Employees'">
        <template #actions>
          <UiAppButton variant="outline" size="sm" @click="navigateTo('/payroll')">{{ locale === 'ar' ? 'مسيرات الرواتب' : 'Payroll Runs' }}</UiAppButton>
          <UiAppButton variant="primary" @click="createOpen = true">{{ locale === 'ar' ? '+ موظف جديد' : '+ Add Employee' }}</UiAppButton>
        </template>
      </UiPageHeader>

      <UiDataTable
        :columns="columns"
        :rows="employees"
        :loading="loading"
        :empty-title="locale === 'ar' ? 'لا يوجد موظفين' : 'No employees'"
      >
        <template #cell-user="{ row }">
          <div>
            <p class="font-medium text-gray-700">{{ row.user?.name || '-' }}</p>
            <p class="text-xs text-gray-400" dir="ltr">{{ row.user?.email }}</p>
          </div>
        </template>
        <template #cell-job_title="{ value }"><span class="text-gray-600">{{ value || '-' }}</span></template>
        <template #cell-base_salary="{ value }"><span class="font-mono font-medium" dir="ltr">{{ Number(value).toLocaleString() }}</span></template>
        <template #cell-is_insured="{ row }">
          <UiBadge :color="row.is_insured ? 'green' : 'gray'" dot>{{ row.is_insured ? (locale === 'ar' ? 'مؤمن' : 'Insured') : (locale === 'ar' ? 'غير مؤمن' : 'Not Insured') }}</UiBadge>
        </template>
        <template #cell-actions="{ row }">
          <div class="flex gap-1" @click.stop>
            <button @click="openEdit(row)" class="p-1.5 rounded-lg text-gray-400 hover:text-primary-500 hover:bg-primary-50 transition">✏️</button>
            <button @click="handleDelete(row.id)" class="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition">🗑️</button>
          </div>
        </template>
      </UiDataTable>

      <UiSlideOver v-model="createOpen" :title="editing ? (locale === 'ar' ? 'تعديل الموظف' : 'Edit Employee') : (locale === 'ar' ? 'إضافة موظف' : 'Add Employee')">
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div v-if="!editing">
            <label class="form-label">{{ locale === 'ar' ? 'المستخدم' : 'User' }} *</label>
            <select v-model="form.user_id" required class="input-field">
              <option :value="null" disabled>{{ locale === 'ar' ? 'اختر مستخدم' : 'Select user' }}</option>
              <option v-for="u in teamUsers" :key="u.id" :value="u.id">{{ u.name }} ({{ u.email }})</option>
            </select>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="form-label">{{ locale === 'ar' ? 'تاريخ التعيين' : 'Hire Date' }} *</label>
              <input v-model="form.hire_date" type="date" required class="input-field" />
            </div>
            <div>
              <label class="form-label">{{ locale === 'ar' ? 'الراتب الأساسي' : 'Base Salary' }} *</label>
              <input v-model="form.base_salary" type="number" step="0.01" min="0" required class="input-field font-mono" dir="ltr" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="form-label">{{ locale === 'ar' ? 'المسمى الوظيفي' : 'Job Title' }}</label>
              <input v-model="form.job_title" type="text" class="input-field" />
            </div>
            <div>
              <label class="form-label">{{ locale === 'ar' ? 'القسم' : 'Department' }}</label>
              <input v-model="form.department" type="text" class="input-field" />
            </div>
          </div>
          <div>
            <label class="form-label">{{ locale === 'ar' ? 'رقم التأمينات' : 'Social Insurance #' }}</label>
            <input v-model="form.social_insurance_number" type="text" class="input-field" dir="ltr" />
          </div>
          <label class="flex items-center gap-2 cursor-pointer">
            <input v-model="form.is_insured" type="checkbox" class="rounded border-gray-300 text-primary-500" />
            <span class="text-sm text-gray-600">{{ locale === 'ar' ? 'مؤمن عليه' : 'Has Social Insurance' }}</span>
          </label>
          <div class="flex gap-3 pt-4 border-t border-gray-100">
            <UiAppButton type="submit" variant="primary" :loading="submitting">{{ editing ? $t('common.save') : $t('common.create') }}</UiAppButton>
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

const employees = ref<any[]>([])
const teamUsers = ref<any[]>([])
const loading = ref(true)
const createOpen = ref(false)
const submitting = ref(false)
const editing = ref<any>(null)
const form = reactive({ user_id: null as number | null, hire_date: new Date().toISOString().split('T')[0], base_salary: 0, job_title: '', department: '', social_insurance_number: '', is_insured: false })

const columns = computed(() => [
  { key: 'user', label: locale.value === 'ar' ? 'الموظف' : 'Employee' },
  { key: 'job_title', label: locale.value === 'ar' ? 'المسمى' : 'Title' },
  { key: 'base_salary', label: locale.value === 'ar' ? 'الراتب' : 'Salary' },
  { key: 'is_insured', label: locale.value === 'ar' ? 'التأمين' : 'Insurance' },
  { key: 'actions', label: '', class: 'w-20' },
])

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

function openEdit(emp: any) {
  editing.value = emp
  Object.assign(form, { user_id: emp.user_id, hire_date: emp.hire_date, base_salary: emp.base_salary, job_title: emp.job_title || '', department: emp.department || '', social_insurance_number: emp.social_insurance_number || '', is_insured: emp.is_insured })
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
.input-field { @apply w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-sm bg-gray-50/50; }
.form-label { @apply block text-sm font-medium text-gray-600 mb-1; }
</style>
