<template>
  <div>
    <NuxtLayout name="dashboard">
      <UiPageHeader :title="locale === 'ar' ? 'فوترة الوقت' : 'Time Billing'" :subtitle="locale === 'ar' ? 'تحويل ساعات العمل المعتمدة إلى فواتير' : 'Convert approved hours to invoices'" />

      <!-- Preview form -->
      <div v-motion :initial="{ opacity: 0, y: 15 }" :enter="{ opacity: 1, y: 0 }" class="bg-white rounded-2xl border border-gray-100/80 p-6 mb-6">
        <h3 class="font-semibold text-gray-700 mb-4">{{ locale === 'ar' ? 'معاينة الساعات غير المفوترة' : 'Preview Unbilled Hours' }}</h3>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="form-label">{{ locale === 'ar' ? 'العميل' : 'Client' }} *</label>
            <select v-model="clientId" class="input-field" @change="preview = null">
              <option :value="null">{{ locale === 'ar' ? 'اختر عميل' : 'Select client' }}</option>
              <option v-for="c in clients" :key="c.id" :value="c.id">{{ c.name }}</option>
            </select>
          </div>
          <div>
            <label class="form-label">{{ locale === 'ar' ? 'من' : 'From' }} *</label>
            <input v-model="dateFrom" type="date" class="input-field" />
          </div>
          <div>
            <label class="form-label">{{ locale === 'ar' ? 'إلى' : 'To' }} *</label>
            <input v-model="dateTo" type="date" class="input-field" />
          </div>
          <div class="flex items-end">
            <UiAppButton variant="outline" class="w-full" :loading="previewing" @click="handlePreview">
              {{ locale === 'ar' ? 'معاينة' : 'Preview' }}
            </UiAppButton>
          </div>
        </div>
      </div>

      <!-- Preview results -->
      <div v-if="preview" v-motion :initial="{ opacity: 0, y: 15 }" :enter="{ opacity: 1, y: 0 }" class="space-y-5">
        <!-- Summary -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-white rounded-xl border border-gray-100/80 p-4 text-center">
            <p class="text-2xl font-bold text-primary-500">{{ preview.entry_count }}</p>
            <p class="text-xs text-gray-400 mt-1">{{ locale === 'ar' ? 'قيود' : 'Entries' }}</p>
          </div>
          <div class="bg-white rounded-xl border border-gray-100/80 p-4 text-center">
            <p class="text-2xl font-bold text-secondary-400" dir="ltr">{{ preview.total_hours }}h</p>
            <p class="text-xs text-gray-400 mt-1">{{ locale === 'ar' ? 'إجمالي الساعات' : 'Total Hours' }}</p>
          </div>
          <div class="bg-white rounded-xl border border-gray-100/80 p-4 text-center">
            <p class="text-2xl font-bold text-emerald-600" dir="ltr">{{ Number(preview.total_amount).toLocaleString() }}</p>
            <p class="text-xs text-gray-400 mt-1">{{ locale === 'ar' ? 'المبلغ المقدر' : 'Estimated Amount' }}</p>
          </div>
        </div>

        <!-- Entries -->
        <div v-if="preview.entries?.length" class="bg-white rounded-2xl border border-gray-100/80 overflow-hidden">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-gray-50/80 border-b border-gray-100">
                <th class="px-5 py-3 text-start text-xs text-gray-400 uppercase">{{ locale === 'ar' ? 'التاريخ' : 'Date' }}</th>
                <th class="px-5 py-3 text-start text-xs text-gray-400 uppercase">{{ locale === 'ar' ? 'المهمة' : 'Task' }}</th>
                <th class="px-5 py-3 text-xs text-gray-400 uppercase">{{ locale === 'ar' ? 'ساعات' : 'Hours' }}</th>
                <th class="px-5 py-3 text-xs text-gray-400 uppercase">{{ locale === 'ar' ? 'السعر' : 'Rate' }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="entry in preview.entries" :key="entry.id" class="border-b border-gray-50">
                <td class="px-5 py-3 text-gray-500">{{ entry.date }}</td>
                <td class="px-5 py-3 text-gray-700">{{ entry.task_description }}</td>
                <td class="px-5 py-3 font-mono text-center" dir="ltr">{{ entry.hours }}</td>
                <td class="px-5 py-3 font-mono text-center" dir="ltr">{{ entry.hourly_rate || '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Generate -->
        <div class="flex gap-3">
          <UiAppButton variant="primary" :loading="generating" @click="handleGenerate">
            {{ locale === 'ar' ? 'إنشاء فاتورة' : 'Generate Invoice' }}
          </UiAppButton>
        </div>
      </div>
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })
const { locale } = useI18n()
const api = useApi()
const { clients, fetchClients } = useClients()
const toastStore = useToastStore()

const now = new Date()
const clientId = ref<number | null>(null)
const dateFrom = ref(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`)
const dateTo = ref(now.toISOString().split('T')[0])
const preview = ref<any>(null)
const previewing = ref(false)
const generating = ref(false)

async function handlePreview() {
  if (!clientId.value) return
  previewing.value = true
  try {
    const res = await api.get<{ data: any }>(`/time-billing/preview?client_id=${clientId.value}&date_from=${dateFrom.value}&date_to=${dateTo.value}`)
    preview.value = res.data
  } catch (e: any) { toastStore.error(e.data?.message || 'Error') }
  finally { previewing.value = false }
}

async function handleGenerate() {
  if (!clientId.value) return
  generating.value = true
  try {
    const res = await api.post<{ data: any }>('/time-billing/generate', {
      client_id: clientId.value,
      date_from: dateFrom.value,
      date_to: dateTo.value,
      vat_rate: 14,
    })
    toastStore.success(locale.value === 'ar' ? 'تم إنشاء الفاتورة' : 'Invoice generated')
    navigateTo(`/invoices/${res.data.id}`)
  } catch (e: any) { toastStore.error(e.data?.message || 'Error') }
  finally { generating.value = false }
}

onMounted(() => fetchClients({ per_page: 100 }))
</script>

<style scoped>
@reference "~/assets/css/tokens.css";
.input-field { @apply w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-sm bg-gray-50/50; }
.form-label { @apply block text-sm font-medium text-gray-600 mb-1; }
</style>
