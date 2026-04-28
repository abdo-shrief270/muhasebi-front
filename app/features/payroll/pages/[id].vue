<template>
  <FeatureBoundary id="payroll">
    <div class="px-4 lg:px-6 py-5 max-w-[1400px] mx-auto">
      <template v-if="loading">
        <UiLoadingSkeleton :lines="8" :height="24" />
      </template>

      <template v-else-if="run">
        <!-- Header -->
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-center gap-3 min-w-0">
            <button
              type="button"
              class="pr-back"
              :aria-label="locale === 'ar' ? 'رجوع' : 'Back'"
              @click="navigateTo('/payroll')"
            >
              <UIcon name="i-lucide-arrow-left" class="w-4 h-4" />
            </button>
            <div class="min-w-0">
              <h1 class="text-xl font-bold text-neutral-900 dark:text-neutral-0">
                {{ locale === 'ar' ? 'مسير رواتب' : 'Payroll Run' }}
                <span class="font-mono tabular-nums" dir="ltr">{{ String(run.month).padStart(2, '0') }}/{{ run.year }}</span>
              </h1>
              <UiBadge
                :color="({ draft: 'gray', calculated: 'blue', approved: 'green', paid: 'emerald' } as any)[run.status]"
                dot
                class="mt-1"
              >
                {{ locale === 'ar' ? run.status_label_ar : run.status_label }}
              </UiBadge>
            </div>
          </div>
          <div class="flex gap-2 flex-shrink-0">
            <UiAppButton v-if="run.status === 'draft'" variant="secondary" size="sm" icon="i-lucide-calculator" :loading="actionLoading" @click="handleAction('calculate')">
              {{ locale === 'ar' ? 'حساب' : 'Calculate' }}
            </UiAppButton>
            <UiAppButton v-if="run.status === 'calculated'" variant="primary" size="sm" icon="i-lucide-check" :loading="actionLoading" @click="handleAction('approve')">
              {{ locale === 'ar' ? 'اعتماد' : 'Approve' }}
            </UiAppButton>
            <UiAppButton v-if="run.status === 'approved'" variant="outline" size="sm" icon="i-lucide-banknote" :loading="actionLoading" @click="handleAction('mark-paid')">
              {{ locale === 'ar' ? 'دفع' : 'Mark Paid' }}
            </UiAppButton>
          </div>
        </div>

        <!-- Summary cards -->
        <div class="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
          <div class="relative bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-3">
            <span class="absolute top-0 start-3 right-3 h-0.5 rounded-b-full bg-neutral-400 dark:bg-neutral-600" aria-hidden="true" />
            <p class="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">
              {{ locale === 'ar' ? 'الإجمالي' : 'Gross' }}
            </p>
            <p class="font-mono text-lg font-bold tabular-nums text-neutral-900 dark:text-neutral-0" dir="ltr">{{ formatMoney(run.total_gross) }}</p>
          </div>
          <div class="relative bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-3">
            <span class="absolute top-0 start-3 right-3 h-0.5 rounded-b-full bg-warning-500" aria-hidden="true" />
            <p class="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">
              {{ locale === 'ar' ? 'التأمينات' : 'SI' }}
            </p>
            <p class="font-mono text-lg font-bold tabular-nums text-warning-700 dark:text-warning-500" dir="ltr">{{ formatMoney(run.total_social_insurance) }}</p>
          </div>
          <div class="relative bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-3">
            <span class="absolute top-0 start-3 right-3 h-0.5 rounded-b-full bg-danger-500" aria-hidden="true" />
            <p class="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">
              {{ locale === 'ar' ? 'الضرائب' : 'Tax' }}
            </p>
            <p class="font-mono text-lg font-bold tabular-nums text-danger-600 dark:text-danger-400" dir="ltr">{{ formatMoney(run.total_tax) }}</p>
          </div>
          <div class="relative bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-3">
            <span class="absolute top-0 start-3 right-3 h-0.5 rounded-b-full bg-warning-400" aria-hidden="true" />
            <p class="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">
              {{ locale === 'ar' ? 'الاستقطاعات' : 'Deductions' }}
            </p>
            <p class="font-mono text-lg font-bold tabular-nums text-warning-700 dark:text-warning-500" dir="ltr">{{ formatMoney(run.total_deductions) }}</p>
          </div>
          <div class="relative bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-3">
            <span class="absolute top-0 start-3 right-3 h-0.5 rounded-b-full bg-success-500" aria-hidden="true" />
            <p class="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">
              {{ locale === 'ar' ? 'الصافي' : 'Net' }}
            </p>
            <p class="font-mono text-xl font-bold tabular-nums text-success-700 dark:text-success-400" dir="ltr">{{ formatMoney(run.total_net) }}</p>
          </div>
        </div>

        <!-- Items table -->
        <div
          v-if="items.length > 0"
          class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden"
        >
          <table class="w-full text-sm">
            <thead class="bg-neutral-50/60 dark:bg-neutral-950/40 text-[11px] uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              <tr>
                <th class="text-start px-4 py-2 font-semibold">{{ locale === 'ar' ? 'الموظف' : 'Employee' }}</th>
                <th class="text-end px-3 py-2 font-semibold">{{ locale === 'ar' ? 'الراتب' : 'Base' }}</th>
                <th class="text-end px-3 py-2 font-semibold">{{ locale === 'ar' ? 'إجمالي' : 'Gross' }}</th>
                <th class="text-end px-3 py-2 font-semibold">{{ locale === 'ar' ? 'تأمينات' : 'SI' }}</th>
                <th class="text-end px-3 py-2 font-semibold">{{ locale === 'ar' ? 'ضريبة' : 'Tax' }}</th>
                <th class="text-end px-3 py-2 font-semibold">{{ locale === 'ar' ? 'صافي' : 'Net' }}</th>
                <th class="w-16"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-neutral-100 dark:divide-neutral-800/60">
              <tr v-for="item in items" :key="item.id" class="hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40 transition-colors">
                <td class="px-4 py-2.5">
                  <p class="text-sm font-medium text-neutral-900 dark:text-neutral-0">{{ item.employee?.user?.name || '—' }}</p>
                  <p class="text-xs text-neutral-500 dark:text-neutral-400">{{ item.employee?.job_title || '' }}</p>
                </td>
                <td class="px-3 py-2.5 text-end font-mono text-sm tabular-nums text-neutral-700 dark:text-neutral-200" dir="ltr">{{ formatMoney(item.base_salary) }}</td>
                <td class="px-3 py-2.5 text-end font-mono text-sm font-medium tabular-nums text-neutral-900 dark:text-neutral-0" dir="ltr">{{ formatMoney(item.gross_salary) }}</td>
                <td class="px-3 py-2.5 text-end font-mono text-sm tabular-nums text-warning-700 dark:text-warning-500" dir="ltr">{{ formatMoney(item.social_insurance_employee) }}</td>
                <td class="px-3 py-2.5 text-end font-mono text-sm tabular-nums text-danger-600 dark:text-danger-400" dir="ltr">{{ formatMoney(item.income_tax) }}</td>
                <td class="px-3 py-2.5 text-end font-mono text-sm font-bold tabular-nums text-success-700 dark:text-success-400" dir="ltr">{{ formatMoney(item.net_salary) }}</td>
                <td class="px-2 text-center">
                  <a
                    :href="`${config.public.apiBase}/payroll/${run.id}/items/${item.id}/payslip?tenant=${useTenantId()}`"
                    target="_blank"
                    rel="noopener"
                    class="inline-flex items-center gap-1 text-xs font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                  >
                    <UIcon name="i-lucide-file-text" class="w-3.5 h-3.5" />
                    PDF
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div
          v-else
          class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-12 text-center"
        >
          <div class="w-12 h-12 mx-auto mb-3 rounded-full bg-warning-50 dark:bg-warning-500/10 flex items-center justify-center">
            <UIcon name="i-lucide-calculator" class="w-5 h-5 text-warning-600 dark:text-warning-400" />
          </div>
          <p class="text-sm font-semibold text-neutral-900 dark:text-neutral-0 mb-1">
            {{ locale === 'ar' ? 'لم يتم الحساب بعد' : 'Not calculated yet' }}
          </p>
          <p class="text-xs text-neutral-500 dark:text-neutral-400 max-w-md mx-auto">
            {{ locale === 'ar' ? 'اضغط "حساب" في الأعلى لإنشاء بنود الرواتب لكل موظف.' : 'Click "Calculate" above to generate payroll items for each employee.' }}
          </p>
        </div>
      </template>
    </div>
  </FeatureBoundary>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })
const { locale } = useI18n()
const route = useRoute()
const api = useApi()
const config = useRuntimeConfig()
const toastStore = useToastStore()

const run = ref<any>(null)
const items = ref<any[]>([])
const loading = ref(true)
const actionLoading = ref(false)

function formatMoney(n: number | string | null | undefined) {
  return Number(n ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

async function loadRun() {
  loading.value = true
  try {
    const res = await api.get<{ data: any }>(`/payroll/${route.params.id}`)
    run.value = res.data
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

<style scoped>
@reference "~/assets/css/tokens.css";

.pr-back {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-neutral-200);
  background-color: var(--color-neutral-0, #fff);
  color: var(--color-neutral-500);
  transition: color 150ms var(--ease-standard), border-color 150ms var(--ease-standard);
}
.pr-back:hover {
  color: var(--color-neutral-900);
  border-color: var(--color-neutral-300);
}
:global(html.dark) .pr-back {
  background-color: var(--color-neutral-900);
  border-color: var(--color-neutral-800);
  color: var(--color-neutral-400);
}
:global(html.dark) .pr-back:hover {
  color: var(--color-neutral-0);
  border-color: var(--color-neutral-700);
}
</style>
