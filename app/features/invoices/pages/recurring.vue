<template>
  <div>
    <UiPageHeader :title="locale === 'ar' ? 'الفواتير المتكررة' : 'Recurring Invoices'" />

    <div class="space-y-6">
      <div class="flex items-center justify-end">
        <UiAppButton variant="primary" @click="openForm()">{{ locale === 'ar' ? '+ جدولة جديدة' : '+ New Schedule' }}</UiAppButton>
      </div>

      <div v-if="loading"><UiLoadingSkeleton :lines="5" :height="20" /></div>

      <div v-else class="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 border-b border-gray-100">
            <tr>
              <th class="px-5 py-3 text-start text-xs font-semibold text-gray-500 uppercase">{{ locale === 'ar' ? 'العميل' : 'Client' }}</th>
              <th class="px-5 py-3 text-start text-xs font-semibold text-gray-500 uppercase">{{ locale === 'ar' ? 'التكرار' : 'Frequency' }}</th>
              <th class="px-5 py-3 text-start text-xs font-semibold text-gray-500 uppercase">{{ locale === 'ar' ? 'التالي' : 'Next Run' }}</th>
              <th class="px-5 py-3 text-start text-xs font-semibold text-gray-500 uppercase">{{ locale === 'ar' ? 'تم إنشاؤها' : 'Generated' }}</th>
              <th class="px-5 py-3 text-start text-xs font-semibold text-gray-500 uppercase">{{ $t('common.status') }}</th>
              <th class="px-5 py-3 text-end text-xs font-semibold text-gray-500 uppercase">{{ $t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="r in items" :key="r.id" class="hover:bg-gray-50/50 transition-colors">
              <td class="px-5 py-3.5 font-medium text-gray-800">{{ r.client?.name || '-' }}</td>
              <td class="px-5 py-3.5 text-gray-600">
                {{ freqLabel(r.frequency) }}
                <span v-if="r.auto_send" class="text-xs text-secondary-500 ms-1">({{ locale === 'ar' ? 'إرسال تلقائي' : 'auto-send' }})</span>
              </td>
              <td class="px-5 py-3.5 text-gray-500 text-xs">{{ r.next_run_date || '-' }}</td>
              <td class="px-5 py-3.5 text-gray-500">
                {{ r.invoices_generated }}<span v-if="r.max_occurrences" class="text-gray-300">/{{ r.max_occurrences }}</span>
              </td>
              <td class="px-5 py-3.5">
                <UiBadge :variant="r.is_active ? 'success' : 'warning'" size="sm">{{ r.is_active ? (locale === 'ar' ? 'نشط' : 'Active') : (locale === 'ar' ? 'متوقف' : 'Stopped') }}</UiBadge>
              </td>
              <td class="px-5 py-3.5 text-end">
                <button @click="openForm(r)" class="text-xs text-primary-500 font-medium me-2">{{ $t('common.edit') }}</button>
                <button @click="del(r)" class="text-xs text-red-400 font-medium">{{ $t('common.delete') }}</button>
              </td>
            </tr>
            <tr v-if="!items.length"><td colspan="6" class="py-8 text-center"><UiEmptyState :message="locale === 'ar' ? 'لا توجد فواتير متكررة' : 'No recurring invoices'" /></td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <UiSlideOver v-model="showForm" :title="editing ? (locale === 'ar' ? 'تعديل' : 'Edit') : (locale === 'ar' ? 'جدولة جديدة' : 'New Schedule')">
      <div class="space-y-4">
        <div>
          <label class="block text-xs font-medium text-gray-500 mb-1">{{ locale === 'ar' ? 'العميل' : 'Client' }}</label>
          <select v-model="form.client_id" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
            <option :value="null">{{ locale === 'ar' ? 'اختر عميل' : 'Select client' }}</option>
          </select>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">{{ locale === 'ar' ? 'التكرار' : 'Frequency' }}</label>
            <select v-model="form.frequency" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
              <option value="weekly">{{ locale === 'ar' ? 'أسبوعي' : 'Weekly' }}</option>
              <option value="monthly">{{ locale === 'ar' ? 'شهري' : 'Monthly' }}</option>
              <option value="quarterly">{{ locale === 'ar' ? 'ربع سنوي' : 'Quarterly' }}</option>
              <option value="yearly">{{ locale === 'ar' ? 'سنوي' : 'Yearly' }}</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">{{ locale === 'ar' ? 'تاريخ البدء' : 'Start Date' }}</label>
            <input v-model="form.start_date" type="date" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">{{ locale === 'ar' ? 'أيام الاستحقاق' : 'Due Days' }}</label>
            <input v-model.number="form.due_days" type="number" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">{{ locale === 'ar' ? 'أقصى عدد' : 'Max Occurrences' }}</label>
            <input v-model.number="form.max_occurrences" type="number" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" :placeholder="locale === 'ar' ? 'غير محدود' : 'Unlimited'" />
          </div>
        </div>
        <div class="flex items-center gap-4">
          <label class="flex items-center gap-2 text-sm"><input v-model="form.is_active" type="checkbox" class="rounded" /> {{ locale === 'ar' ? 'نشط' : 'Active' }}</label>
          <label class="flex items-center gap-2 text-sm"><input v-model="form.auto_send" type="checkbox" class="rounded" /> {{ locale === 'ar' ? 'إرسال تلقائي' : 'Auto-send' }}</label>
        </div>
        <UiAppButton variant="primary" :loading="saving" @click="handleSave" class="w-full">{{ editing ? $t('common.save') : $t('common.create') }}</UiAppButton>
      </div>
    </UiSlideOver>
  </div>
</template>

<script setup lang="ts">
definePageMeta({  })
const { locale } = useI18n()
const api = useApi()
const toastStore = useToastStore()

const items = ref<any[]>([])
const loading = ref(true)
const saving = ref(false)
const showForm = ref(false)
const editing = ref<any>(null)
const form = reactive({ client_id: null as number | null, frequency: 'monthly', start_date: '', due_days: 30, max_occurrences: null as number | null, is_active: true, auto_send: false, line_items: [{ description: '', quantity: 1, unit_price: 0, vat_rate: 14 }] })

function freqLabel(f: string) {
  const isAr = locale.value === 'ar'
  return { weekly: isAr ? 'أسبوعي' : 'Weekly', monthly: isAr ? 'شهري' : 'Monthly', quarterly: isAr ? 'ربع سنوي' : 'Quarterly', yearly: isAr ? 'سنوي' : 'Yearly' }[f] || f
}

async function load() {
  loading.value = true
  try { const res = await api.get<any>('/recurring-invoices'); items.value = res.data } catch {}
  finally { loading.value = false }
}

function openForm(r?: any) {
  editing.value = r || null
  if (r) Object.assign(form, { client_id: r.client?.id, frequency: r.frequency, start_date: r.start_date, due_days: r.due_days, max_occurrences: r.max_occurrences, is_active: r.is_active, auto_send: r.auto_send, line_items: r.line_items || [] })
  else Object.assign(form, { client_id: null, frequency: 'monthly', start_date: new Date().toISOString().split('T')[0], due_days: 30, max_occurrences: null, is_active: true, auto_send: false, line_items: [{ description: '', quantity: 1, unit_price: 0, vat_rate: 14 }] })
  showForm.value = true
}

async function handleSave() {
  saving.value = true
  try {
    if (editing.value) { await api.put(`/recurring-invoices/${editing.value.id}`, form) }
    else { await api.post('/recurring-invoices', form) }
    toastStore.success('Saved'); showForm.value = false; load()
  } catch (e: any) { toastStore.error(e.data?.message || 'Error') }
  finally { saving.value = false }
}

async function del(r: any) {
  if (!confirm(locale.value === 'ar' ? 'حذف؟' : 'Delete?')) return
  try { await api.delete(`/recurring-invoices/${r.id}`); load() } catch {}
}

onMounted(load)
</script>
