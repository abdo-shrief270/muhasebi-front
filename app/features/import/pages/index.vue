<template>
  <div>
    <UiPageHeader :title="locale === 'ar' ? 'استيراد البيانات' : 'Data Import'" />

    <div class="max-w-3xl space-y-6">
      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <h3 class="font-semibold text-gray-800 mb-4">{{ locale === 'ar' ? 'استيراد ملف CSV' : 'Import CSV File' }}</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">{{ locale === 'ar' ? 'نوع الاستيراد' : 'Import Type' }}</label>
            <select v-model="importType" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
              <option value="clients">{{ locale === 'ar' ? 'العملاء' : 'Clients' }}</option>
              <option value="accounts">{{ locale === 'ar' ? 'دليل الحسابات' : 'Chart of Accounts' }}</option>
              <option value="opening_balances">{{ locale === 'ar' ? 'أرصدة افتتاحية' : 'Opening Balances' }}</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">{{ locale === 'ar' ? 'ملف CSV' : 'CSV File' }}</label>
            <input ref="fileInput" type="file" accept=".csv,.txt" @change="onFileSelect" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
          <div class="flex items-center gap-4">
            <UiAppButton variant="primary" :loading="uploading" :disabled="!selectedFile" @click="startImport">{{ locale === 'ar' ? 'بدء الاستيراد' : 'Start Import' }}</UiAppButton>
            <button @click="downloadTemplate" class="text-xs text-primary-500 hover:text-primary-600 font-medium">{{ locale === 'ar' ? 'تحميل نموذج' : 'Download Template' }}</button>
          </div>
        </div>
      </div>

      <div v-if="jobs.length" class="space-y-3">
        <h3 class="font-semibold text-gray-800">{{ locale === 'ar' ? 'سجل الاستيراد' : 'Import History' }}</h3>
        <div v-for="job in jobs" :key="job.id" class="bg-white rounded-xl border border-gray-200 p-5">
          <div class="flex items-start justify-between mb-3">
            <div>
              <span class="text-sm font-medium text-gray-800">{{ job.original_filename }}</span>
              <span class="text-xs text-gray-400 ms-2">({{ job.type }})</span>
            </div>
            <UiBadge :variant="job.status === 'completed' ? 'success' : job.status === 'failed' ? 'danger' : 'info'" size="sm">{{ job.status }}</UiBadge>
          </div>
          <div v-if="job.total_rows > 0" class="mb-2">
            <div class="flex justify-between text-xs text-gray-400 mb-1">
              <span>{{ job.processed_rows }}/{{ job.total_rows }}</span>
              <span class="text-emerald-500">{{ job.success_count }} OK</span>
            </div>
            <div class="w-full h-1.5 bg-gray-100 rounded-full"><div class="h-full bg-emerald-400 rounded-full" :style="{ width: (job.processed_rows / job.total_rows * 100) + '%' }"></div></div>
          </div>
          <div v-if="job.errors?.length" class="bg-red-50 rounded-lg p-3 max-h-32 overflow-y-auto mt-2">
            <div v-for="(err, i) in job.errors.slice(0, 5)" :key="i" class="text-xs text-red-600">Row {{ err.row }}: {{ err.message }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({  })
const { locale } = useI18n()
const api = useApi()
const toastStore = useToastStore()

const importType = ref('clients')
const selectedFile = ref<File | null>(null)
const uploading = ref(false)
const jobs = ref<any[]>([])
const fileInput = ref<HTMLInputElement>()

function onFileSelect(e: Event) { selectedFile.value = (e.target as HTMLInputElement).files?.[0] || null }

async function startImport() {
  if (!selectedFile.value) return
  uploading.value = true
  try {
    const fd = new FormData()
    fd.append('file', selectedFile.value)
    fd.append('type', importType.value)
    await api.post('/import', fd)
    toastStore.success(locale.value === 'ar' ? 'بدأ الاستيراد' : 'Import started')
    selectedFile.value = null
    loadJobs()
  } catch (e: any) { toastStore.error(e.data?.message || 'Error') }
  finally { uploading.value = false }
}

async function downloadTemplate() {
  try {
    const res = await api.get<any>(`/import/template/${importType.value}`)
    const csv = '\uFEFF' + res.data.headers.join(',') + '\n' + (res.data.sample?.[0] || '')
    const blob = new Blob([csv], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob); a.download = `${importType.value}_template.csv`; a.click()
  } catch {}
}

async function loadJobs() { try { jobs.value = (await api.get<any>('/import')).data } catch {} }
onMounted(loadJobs)
</script>
