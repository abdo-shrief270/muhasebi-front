<template>
  <div>
    <NuxtLayout name="dashboard">
      <FeatureBoundary id="reports">
      <UiPageHeader :title="locale === 'ar' ? 'ميزان المراجعة' : 'Trial Balance'">
        <template #actions>
          <UiDateRangePicker v-model:from="dateFrom" v-model:to="dateTo" />
          <UiAppButton variant="outline" size="sm" @click="load">
            {{ locale === 'ar' ? 'تحديث' : 'Refresh' }}
          </UiAppButton>
          <UiAppButton variant="ghost" size="sm" @click="downloadPdf">
            PDF
          </UiAppButton>
        </template>
      </UiPageHeader>

      <div
        v-motion
        :initial="{ opacity: 0, y: 15 }"
        :enter="{ opacity: 1, y: 0 }"
        class="bg-white rounded-2xl border border-gray-100/80 overflow-hidden"
      >
        <div v-if="loading" class="p-6">
          <UiLoadingSkeleton :lines="10" :height="20" />
        </div>

        <table v-else-if="rows.length > 0" class="w-full text-sm">
          <thead>
            <tr class="bg-gray-50/80 border-b border-gray-100">
              <th class="px-5 py-3 text-start text-xs font-semibold text-gray-400 uppercase">{{ locale === 'ar' ? 'كود' : 'Code' }}</th>
              <th class="px-5 py-3 text-start text-xs font-semibold text-gray-400 uppercase">{{ locale === 'ar' ? 'اسم الحساب' : 'Account Name' }}</th>
              <th class="px-5 py-3 text-start text-xs font-semibold text-gray-400 uppercase w-[150px]">{{ locale === 'ar' ? 'مدين' : 'Debit' }}</th>
              <th class="px-5 py-3 text-start text-xs font-semibold text-gray-400 uppercase w-[150px]">{{ locale === 'ar' ? 'دائن' : 'Credit' }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(row, index) in rows"
              :key="index"
              class="border-b border-gray-50 hover:bg-gray-50/30 transition-colors cursor-pointer"
              @click="navigateTo(`/reports/ledger?account_id=${row.account_id}`)"
            >
              <td class="px-5 py-3 font-mono text-xs text-gray-400">{{ row.code }}</td>
              <td class="px-5 py-3 text-gray-700">{{ locale === 'ar' ? row.name_ar : row.name_en }}</td>
              <td class="px-5 py-3 font-mono" dir="ltr">
                <span v-if="row.debit > 0" class="text-emerald-600">{{ row.debit.toLocaleString() }}</span>
                <span v-else class="text-gray-200">-</span>
              </td>
              <td class="px-5 py-3 font-mono" dir="ltr">
                <span v-if="row.credit > 0" class="text-blue-600">{{ row.credit.toLocaleString() }}</span>
                <span v-else class="text-gray-200">-</span>
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="border-t-2 border-gray-200 bg-gray-50/80">
              <td colspan="2" class="px-5 py-3 font-bold text-gray-700">{{ $t('common.total') }}</td>
              <td class="px-5 py-3 font-mono font-bold" dir="ltr" :class="isBalanced ? 'text-emerald-600' : 'text-red-500'">
                {{ totalDebit.toLocaleString() }}
              </td>
              <td class="px-5 py-3 font-mono font-bold" dir="ltr" :class="isBalanced ? 'text-blue-600' : 'text-red-500'">
                {{ totalCredit.toLocaleString() }}
              </td>
            </tr>
          </tfoot>
        </table>

        <div v-else class="p-8">
          <UiEmptyState icon="&#9776;" :title="locale === 'ar' ? 'لا توجد بيانات' : 'No data'" />
        </div>
      </div>

      <!-- Balance indicator -->
      <div v-if="rows.length > 0" class="mt-4 flex justify-center">
        <UiBadge :color="isBalanced ? 'green' : 'red'" dot>
          {{ isBalanced ? (locale === 'ar' ? 'ميزان متوازن' : 'Balanced') : (locale === 'ar' ? 'غير متوازن' : 'Not balanced') }}
        </UiBadge>
      </div>
      </FeatureBoundary>
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
import type { TrialBalanceRow } from '~/shared/types/accounting'

definePageMeta({ layout: false })

const { locale } = useI18n()
const api = useApi()

const now = new Date()
const dateFrom = ref(`${now.getFullYear()}-01-01`)
const dateTo = ref(now.toISOString().split('T')[0])
const rows = ref<TrialBalanceRow[]>([])
const loading = ref(true)

const totalDebit = computed(() => rows.value.reduce((s, r) => s + r.debit, 0))
const totalCredit = computed(() => rows.value.reduce((s, r) => s + r.credit, 0))
const isBalanced = computed(() => Math.abs(totalDebit.value - totalCredit.value) < 0.01)

async function load() {
  loading.value = true
  try {
    const data = await api.get<{ data: TrialBalanceRow[] }>(`/reports/trial-balance?from=${dateFrom.value}&to=${dateTo.value}`)
    rows.value = data.data
  } catch {
    rows.value = []
  } finally {
    loading.value = false
  }
}

function downloadPdf() {
  window.open(`${useRuntimeConfig().public.apiBase}/reports/trial-balance/pdf?from=${dateFrom.value}&to=${dateTo.value}`, '_blank')
}

onMounted(load)
</script>
