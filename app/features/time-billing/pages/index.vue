<template>
  <div class="px-4 lg:px-6 py-5 max-w-[1400px] mx-auto">
    <UiPageHeader
      icon="i-lucide-file-clock"
      :title="locale === 'ar' ? 'فوترة الوقت' : 'Time Billing'"
      :subtitle="locale === 'ar' ? 'تحويل ساعات العمل المعتمدة إلى فاتورة' : 'Convert approved billable hours into an invoice'"
    />

    <!-- Preview form -->
    <div class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 mb-3">
      <h3 class="text-sm font-semibold text-neutral-900 dark:text-neutral-0 mb-3 flex items-center gap-1.5">
        <UIcon name="i-lucide-search" class="w-3.5 h-3.5 text-neutral-400" />
        {{ locale === 'ar' ? 'معاينة الساعات غير المفوترة' : 'Preview unbilled hours' }}
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
        <div>
          <label class="tb-label">
            {{ locale === 'ar' ? 'العميل' : 'Client' }}
            <span class="text-danger-500">*</span>
          </label>
          <div class="relative">
            <select v-model.number="clientId" class="tb-input" @change="preview = null">
              <option :value="null">{{ locale === 'ar' ? 'اختر عميلاً...' : 'Select client...' }}</option>
              <option v-for="c in clients" :key="c.id" :value="c.id">{{ c.name }}</option>
            </select>
            <UIcon name="i-lucide-chevron-down" class="absolute end-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
          </div>
        </div>
        <div>
          <label class="tb-label">
            {{ locale === 'ar' ? 'من' : 'From' }}
            <span class="text-danger-500">*</span>
          </label>
          <input v-model="dateFrom" type="date" class="tb-input" />
        </div>
        <div>
          <label class="tb-label">
            {{ locale === 'ar' ? 'إلى' : 'To' }}
            <span class="text-danger-500">*</span>
          </label>
          <input v-model="dateTo" type="date" class="tb-input" />
        </div>
        <UiAppButton
          variant="outline"
          icon="i-lucide-eye"
          :loading="previewing"
          :disabled="!clientId"
          @click="handlePreview"
        >
          {{ locale === 'ar' ? 'معاينة' : 'Preview' }}
        </UiAppButton>
      </div>
    </div>

    <!-- Preview results -->
    <div v-if="preview" class="space-y-3">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div class="relative bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
          <span class="absolute top-0 start-3 right-3 h-0.5 rounded-b-full bg-primary-500" aria-hidden="true" />
          <p class="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">
            {{ locale === 'ar' ? 'القيود' : 'Entries' }}
          </p>
          <p class="font-mono text-2xl font-bold tabular-nums text-neutral-900 dark:text-neutral-0">{{ preview.entry_count }}</p>
        </div>
        <div class="relative bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
          <span class="absolute top-0 start-3 right-3 h-0.5 rounded-b-full bg-info-500" aria-hidden="true" />
          <p class="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">
            {{ locale === 'ar' ? 'إجمالي الساعات' : 'Total Hours' }}
          </p>
          <p class="font-mono text-2xl font-bold tabular-nums text-info-700 dark:text-info-400" dir="ltr">{{ preview.total_hours }}h</p>
        </div>
        <div class="relative bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
          <span class="absolute top-0 start-3 right-3 h-0.5 rounded-b-full bg-success-500" aria-hidden="true" />
          <p class="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">
            {{ locale === 'ar' ? 'المبلغ المقدر' : 'Estimated Amount' }}
          </p>
          <p class="font-mono text-2xl font-bold tabular-nums text-success-700 dark:text-success-400" dir="ltr">
            {{ Number(preview.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
          </p>
        </div>
      </div>

      <div
        v-if="preview.entries?.length"
        class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden"
      >
        <table class="w-full text-sm">
          <thead class="bg-neutral-50/60 dark:bg-neutral-950/40 text-[11px] uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            <tr>
              <th class="text-start px-4 py-2 font-semibold w-[110px]">{{ locale === 'ar' ? 'التاريخ' : 'Date' }}</th>
              <th class="text-start px-4 py-2 font-semibold">{{ locale === 'ar' ? 'المهمة' : 'Task' }}</th>
              <th class="text-end px-4 py-2 font-semibold w-[80px]">{{ locale === 'ar' ? 'ساعات' : 'Hours' }}</th>
              <th class="text-end px-4 py-2 font-semibold w-[100px]">{{ locale === 'ar' ? 'السعر' : 'Rate' }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-neutral-100 dark:divide-neutral-800/60">
            <tr v-for="entry in preview.entries" :key="entry.id" class="hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40 transition-colors">
              <td class="px-4 py-2.5 text-xs text-neutral-700 dark:text-neutral-200 tabular-nums" dir="ltr">{{ entry.date }}</td>
              <td class="px-4 py-2.5 text-sm text-neutral-900 dark:text-neutral-0">{{ entry.task_description }}</td>
              <td class="px-4 py-2.5 text-end font-mono text-sm tabular-nums text-neutral-900 dark:text-neutral-0" dir="ltr">{{ entry.hours }}</td>
              <td class="px-4 py-2.5 text-end font-mono text-sm tabular-nums text-neutral-700 dark:text-neutral-200" dir="ltr">{{ entry.hourly_rate || '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="flex justify-end pt-1">
        <UiAppButton variant="primary" icon="i-lucide-file-plus" :loading="generating" @click="handleGenerate">
          {{ locale === 'ar' ? 'إنشاء فاتورة' : 'Generate Invoice' }}
        </UiAppButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })

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
  } catch (e: any) {
    toastStore.error(e?.data?.message || 'Error')
  } finally {
    previewing.value = false
  }
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
  } catch (e: any) {
    toastStore.error(e?.data?.message || 'Error')
  } finally {
    generating.value = false
  }
}

onMounted(() => fetchClients({ per_page: 100 }))
</script>

<style scoped>
@reference "~/assets/css/tokens.css";

.tb-label { @apply block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5; }

.tb-input {
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
.tb-input:focus {
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 2px color-mix(in oklab, var(--color-primary-500) 20%, transparent);
}
:global(html.dark) .tb-input {
  background-color: var(--color-neutral-900);
  border-color: var(--color-neutral-800);
  color: var(--color-neutral-0);
}
</style>
