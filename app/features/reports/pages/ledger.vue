<template>
  <div>
    <NuxtLayout name="dashboard">
      <FeatureBoundary id="reports">
      <UiPageHeader :title="locale === 'ar' ? 'دفتر الأستاذ' : 'Account Ledger'" :subtitle="accountName">
        <template #actions>
          <UiDateRangePicker v-model:from="dateFrom" v-model:to="dateTo" />
          <UiAppButton variant="outline" size="sm" @click="load">
            {{ locale === 'ar' ? 'تحديث' : 'Refresh' }}
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
          <UiLoadingSkeleton :lines="8" :height="20" />
        </div>

        <table v-else-if="entries.length > 0" class="w-full text-sm">
          <thead>
            <tr class="bg-gray-50/80 border-b border-gray-100">
              <th class="px-5 py-3 text-start text-xs font-semibold text-gray-400 uppercase">{{ $t('common.date') }}</th>
              <th class="px-5 py-3 text-start text-xs font-semibold text-gray-400 uppercase">{{ locale === 'ar' ? 'رقم القيد' : 'Entry #' }}</th>
              <th class="px-5 py-3 text-start text-xs font-semibold text-gray-400 uppercase">{{ locale === 'ar' ? 'البيان' : 'Description' }}</th>
              <th class="px-5 py-3 text-start text-xs font-semibold text-gray-400 uppercase w-[130px]">{{ locale === 'ar' ? 'مدين' : 'Debit' }}</th>
              <th class="px-5 py-3 text-start text-xs font-semibold text-gray-400 uppercase w-[130px]">{{ locale === 'ar' ? 'دائن' : 'Credit' }}</th>
              <th class="px-5 py-3 text-start text-xs font-semibold text-gray-400 uppercase w-[130px]">{{ locale === 'ar' ? 'الرصيد' : 'Balance' }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(entry, index) in entries" :key="index" class="border-b border-gray-50 hover:bg-gray-50/30 transition-colors">
              <td class="px-5 py-3 text-gray-500 text-xs">{{ entry.date }}</td>
              <td class="px-5 py-3">
                <span class="font-mono text-xs text-primary-400">{{ entry.entry_number }}</span>
              </td>
              <td class="px-5 py-3 text-gray-700">{{ entry.description }}</td>
              <td class="px-5 py-3 font-mono" dir="ltr">
                <span v-if="entry.debit > 0" class="text-emerald-600">{{ entry.debit.toLocaleString() }}</span>
                <span v-else class="text-gray-200">-</span>
              </td>
              <td class="px-5 py-3 font-mono" dir="ltr">
                <span v-if="entry.credit > 0" class="text-blue-600">{{ entry.credit.toLocaleString() }}</span>
                <span v-else class="text-gray-200">-</span>
              </td>
              <td class="px-5 py-3 font-mono font-medium" dir="ltr" :class="entry.balance >= 0 ? 'text-gray-700' : 'text-red-500'">
                {{ entry.balance.toLocaleString() }}
              </td>
            </tr>
          </tbody>
        </table>

        <div v-else class="p-8">
          <UiEmptyState icon="&#9679;" :title="locale === 'ar' ? 'لا توجد حركات' : 'No transactions'" />
        </div>
      </div>
      </FeatureBoundary>
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
import type { LedgerEntry } from '~/shared/types/accounting'

definePageMeta({ layout: false })

const { locale } = useI18n()
const route = useRoute()
const api = useApi()

const accountId = computed(() => route.query.account_id)
const accountName = ref('')
const now = new Date()
const dateFrom = ref(`${now.getFullYear()}-01-01`)
const dateTo = ref(now.toISOString().split('T')[0])
const entries = ref<LedgerEntry[]>([])
const loading = ref(true)

async function load() {
  if (!accountId.value) return
  loading.value = true
  try {
    const data = await api.get<{ data: { entries: LedgerEntry[]; account_name_ar: string; account_name_en: string } }>(
      `/reports/accounts/${accountId.value}/ledger?from=${dateFrom.value}&to=${dateTo.value}`
    )
    entries.value = data.data.entries || data.data as any
    accountName.value = locale.value === 'ar' ? (data.data.account_name_ar || '') : (data.data.account_name_en || '')
  } catch {
    entries.value = []
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>
