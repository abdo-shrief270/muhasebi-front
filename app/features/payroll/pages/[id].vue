<template>
  <div>
    <NuxtLayout name="dashboard">
      <FeatureBoundary id="payroll">
      <template v-if="loading"><UiLoadingSkeleton :lines="8" :height="24" /></template>

      <template v-else-if="run">
        <div v-motion :initial="{ opacity: 0, y: -10 }" :enter="{ opacity: 1, y: 0 }" class="flex items-start justify-between mb-8">
          <div class="flex items-center gap-4">
            <button @click="navigateTo('/payroll')" class="text-gray-300 hover:text-gray-500 transition">&#8592;</button>
            <div>
              <h1 class="text-2xl font-bold text-gray-800">{{ locale === 'ar' ? 'مسير رواتب' : 'Payroll Run' }} {{ run.month }}/{{ run.year }}</h1>
              <UiBadge :color="({ draft: 'gray', calculated: 'blue', approved: 'green', paid: 'emerald' } as any)[run.status]" dot class="mt-1">
                {{ locale === 'ar' ? run.status_label_ar : run.status_label }}
              </UiBadge>
            </div>
          </div>
          <div class="flex gap-2">
            <UiAppButton v-if="run.status === 'draft'" variant="secondary" size="sm" :loading="actionLoading" @click="handleAction('calculate')">{{ locale === 'ar' ? 'حساب' : 'Calculate' }}</UiAppButton>
            <UiAppButton v-if="run.status === 'calculated'" variant="primary" size="sm" :loading="actionLoading" @click="handleAction('approve')">{{ locale === 'ar' ? 'اعتماد' : 'Approve' }}</UiAppButton>
            <UiAppButton v-if="run.status === 'approved'" variant="outline" size="sm" :loading="actionLoading" @click="handleAction('mark-paid')">{{ locale === 'ar' ? 'دفع' : 'Mark Paid' }}</UiAppButton>
          </div>
        </div>

        <!-- Summary cards -->
        <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div class="bg-white rounded-xl border border-gray-100/80 p-4 text-center">
            <p class="text-xs text-gray-400 mb-1">{{ locale === 'ar' ? 'إجمالي الرواتب' : 'Gross' }}</p>
            <p class="font-mono font-bold text-gray-800" dir="ltr">{{ Number(run.total_gross).toLocaleString() }}</p>
          </div>
          <div class="bg-white rounded-xl border border-gray-100/80 p-4 text-center">
            <p class="text-xs text-gray-400 mb-1">{{ locale === 'ar' ? 'التأمينات' : 'SI' }}</p>
            <p class="font-mono font-bold text-amber-500" dir="ltr">{{ Number(run.total_social_insurance).toLocaleString() }}</p>
          </div>
          <div class="bg-white rounded-xl border border-gray-100/80 p-4 text-center">
            <p class="text-xs text-gray-400 mb-1">{{ locale === 'ar' ? 'الضرائب' : 'Tax' }}</p>
            <p class="font-mono font-bold text-red-500" dir="ltr">{{ Number(run.total_tax).toLocaleString() }}</p>
          </div>
          <div class="bg-white rounded-xl border border-gray-100/80 p-4 text-center">
            <p class="text-xs text-gray-400 mb-1">{{ locale === 'ar' ? 'الاستقطاعات' : 'Deductions' }}</p>
            <p class="font-mono font-bold text-orange-500" dir="ltr">{{ Number(run.total_deductions).toLocaleString() }}</p>
          </div>
          <div class="bg-white rounded-xl border border-gray-100/80 p-4 text-center">
            <p class="text-xs text-gray-400 mb-1">{{ locale === 'ar' ? 'صافي الرواتب' : 'Net' }}</p>
            <p class="font-mono font-bold text-emerald-600 text-lg" dir="ltr">{{ Number(run.total_net).toLocaleString() }}</p>
          </div>
        </div>

        <!-- Items table -->
        <div v-if="items.length > 0" class="bg-white rounded-2xl border border-gray-100/80 overflow-hidden">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-gray-50/80 border-b border-gray-100">
                <th class="px-5 py-3 text-start text-xs font-semibold text-gray-400 uppercase">{{ locale === 'ar' ? 'الموظف' : 'Employee' }}</th>
                <th class="px-4 py-3 text-xs font-semibold text-gray-400 uppercase">{{ locale === 'ar' ? 'الراتب' : 'Base' }}</th>
                <th class="px-4 py-3 text-xs font-semibold text-gray-400 uppercase">{{ locale === 'ar' ? 'إجمالي' : 'Gross' }}</th>
                <th class="px-4 py-3 text-xs font-semibold text-gray-400 uppercase">{{ locale === 'ar' ? 'تأمينات' : 'SI' }}</th>
                <th class="px-4 py-3 text-xs font-semibold text-gray-400 uppercase">{{ locale === 'ar' ? 'ضريبة' : 'Tax' }}</th>
                <th class="px-4 py-3 text-xs font-semibold text-gray-400 uppercase">{{ locale === 'ar' ? 'صافي' : 'Net' }}</th>
                <th class="w-16"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in items" :key="item.id" class="border-b border-gray-50 hover:bg-gray-50/30 transition-colors">
                <td class="px-5 py-3">
                  <p class="font-medium text-gray-700">{{ item.employee?.user?.name || '-' }}</p>
                  <p class="text-xs text-gray-400">{{ item.employee?.job_title || '' }}</p>
                </td>
                <td class="px-4 py-3 font-mono text-gray-500" dir="ltr">{{ Number(item.base_salary).toLocaleString() }}</td>
                <td class="px-4 py-3 font-mono text-gray-700 font-medium" dir="ltr">{{ Number(item.gross_salary).toLocaleString() }}</td>
                <td class="px-4 py-3 font-mono text-amber-500" dir="ltr">{{ Number(item.social_insurance_employee).toLocaleString() }}</td>
                <td class="px-4 py-3 font-mono text-red-500" dir="ltr">{{ Number(item.income_tax).toLocaleString() }}</td>
                <td class="px-4 py-3 font-mono text-emerald-600 font-bold" dir="ltr">{{ Number(item.net_salary).toLocaleString() }}</td>
                <td class="px-2">
                  <a
                    :href="`${config.public.apiBase}/payroll/${run.id}/items/${item.id}/payslip?tenant=${useTenantId()}`"
                    target="_blank"
                    class="text-xs text-secondary-400 hover:text-secondary-500"
                  >PDF</a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else class="bg-white rounded-2xl border border-gray-100/80 p-8">
          <UiEmptyState icon="💰" :title="locale === 'ar' ? 'لم يتم الحساب بعد' : 'Not calculated yet'" :description="locale === 'ar' ? 'اضغط حساب لإنشاء بنود الرواتب' : 'Click Calculate to generate payroll items'" />
        </div>
      </template>
      </FeatureBoundary>
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })
const { locale } = useI18n()
const route = useRoute()
const api = useApi()
const config = useRuntimeConfig()
const toastStore = useToastStore()

const run = ref<any>(null)
const items = ref<any[]>([])
const loading = ref(true)
const actionLoading = ref(false)

async function loadRun() {
  loading.value = true
  try {
    const res = await api.get<{ data: any }>(`/payroll/${route.params.id}`)
    run.value = res.data
    // Fetch items
    const itemsRes = await api.get<{ data: any[] }>(`/payroll/${route.params.id}/items`)
    items.value = itemsRes.data || []
  } catch {
    toastStore.error('Not found')
    navigateTo('/payroll')
  } finally {
    loading.value = false
  }
}

async function handleAction(action: string) {
  actionLoading.value = true
  try {
    await api.post(`/payroll/${route.params.id}/${action}`)
    toastStore.success(locale.value === 'ar' ? 'تم بنجاح' : 'Success')
    loadRun()
  } catch (e: any) { toastStore.error(e.data?.message || 'Error') }
  finally { actionLoading.value = false }
}

onMounted(loadRun)
</script>
