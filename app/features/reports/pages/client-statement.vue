<template>
  <div>
    <NuxtLayout name="dashboard">
      <UiPageHeader :title="locale === 'ar' ? 'كشف حساب العميل' : 'Client Statement'">
        <template #actions>
          <select v-model="clientId" class="px-4 py-2 border border-gray-200 rounded-xl text-sm bg-white outline-none" @change="load">
            <option :value="null">{{ locale === 'ar' ? 'اختر عميل' : 'Select client' }}</option>
            <option v-for="c in clients" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
          <UiDateRangePicker v-model:from="dateFrom" v-model:to="dateTo" />
          <UiAppButton variant="outline" size="sm" @click="load">{{ locale === 'ar' ? 'عرض' : 'Show' }}</UiAppButton>
        </template>
      </UiPageHeader>

      <div v-if="loading"><UiLoadingSkeleton :lines="8" :height="20" /></div>

      <div v-else-if="statement" v-motion :initial="{ opacity: 0, y: 15 }" :enter="{ opacity: 1, y: 0 }" class="bg-white rounded-2xl border border-gray-100/80 overflow-hidden">
        <!-- Summary -->
        <div class="px-5 py-4 border-b border-gray-100 grid grid-cols-3 gap-4 text-center">
          <div>
            <p class="text-xs text-gray-400">{{ locale === 'ar' ? 'إجمالي الفواتير' : 'Total Invoiced' }}</p>
            <p class="font-mono font-bold text-gray-800" dir="ltr">{{ Number(statement.total_invoiced || 0).toLocaleString() }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-400">{{ locale === 'ar' ? 'إجمالي المدفوع' : 'Total Paid' }}</p>
            <p class="font-mono font-bold text-emerald-600" dir="ltr">{{ Number(statement.total_paid || 0).toLocaleString() }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-400">{{ locale === 'ar' ? 'الرصيد المستحق' : 'Balance Due' }}</p>
            <p class="font-mono font-bold text-amber-500" dir="ltr">{{ Number(statement.balance_due || 0).toLocaleString() }}</p>
          </div>
        </div>

        <!-- Transactions -->
        <table v-if="statement.transactions?.length" class="w-full text-sm">
          <thead>
            <tr class="bg-gray-50/80">
              <th class="px-5 py-2.5 text-start text-xs text-gray-400 uppercase">{{ locale === 'ar' ? 'التاريخ' : 'Date' }}</th>
              <th class="px-5 py-2.5 text-start text-xs text-gray-400 uppercase">{{ locale === 'ar' ? 'الوصف' : 'Description' }}</th>
              <th class="px-5 py-2.5 text-xs text-gray-400 uppercase">{{ locale === 'ar' ? 'مدين' : 'Debit' }}</th>
              <th class="px-5 py-2.5 text-xs text-gray-400 uppercase">{{ locale === 'ar' ? 'دائن' : 'Credit' }}</th>
              <th class="px-5 py-2.5 text-xs text-gray-400 uppercase">{{ locale === 'ar' ? 'الرصيد' : 'Balance' }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="tx in statement.transactions" :key="tx.id" class="border-t border-gray-50">
              <td class="px-5 py-2.5 text-gray-500">{{ tx.date }}</td>
              <td class="px-5 py-2.5 text-gray-700">{{ tx.description }}</td>
              <td class="px-5 py-2.5 font-mono text-center" dir="ltr">{{ tx.debit > 0 ? Number(tx.debit).toLocaleString() : '-' }}</td>
              <td class="px-5 py-2.5 font-mono text-center" dir="ltr">{{ tx.credit > 0 ? Number(tx.credit).toLocaleString() : '-' }}</td>
              <td class="px-5 py-2.5 font-mono text-center font-medium" dir="ltr">{{ Number(tx.balance).toLocaleString() }}</td>
            </tr>
          </tbody>
        </table>
        <div v-else class="p-8"><UiEmptyState icon="📄" :title="locale === 'ar' ? 'لا توجد حركات' : 'No transactions'" /></div>
      </div>

      <div v-else-if="!loading && clientId" class="bg-white rounded-2xl border border-gray-100/80 p-8">
        <UiEmptyState icon="📋" :title="locale === 'ar' ? 'لا توجد بيانات' : 'No data'" />
      </div>
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })
const { locale } = useI18n()
const route = useRoute()
const api = useApi()
const { clients, fetchClients } = useClients()

const now = new Date()
const clientId = ref<number | null>(route.query.client_id ? Number(route.query.client_id) : null)
const dateFrom = ref(`${now.getFullYear()}-01-01`)
const dateTo = ref(now.toISOString().split('T')[0])
const statement = ref<any>(null)
const loading = ref(false)

async function load() {
  if (!clientId.value) return
  loading.value = true
  try {
    const res = await api.get<{ data: any }>(`/reports/clients/${clientId.value}/statement?from=${dateFrom.value}&to=${dateTo.value}`)
    statement.value = res.data
  } catch { statement.value = null }
  finally { loading.value = false }
}

onMounted(async () => {
  await fetchClients({ per_page: 100 })
  if (clientId.value) load()
})
</script>
