<template>
  <div class="px-4 lg:px-6 py-5 max-w-[1400px] mx-auto">
    <UiPageHeader
      icon="i-lucide-upload"
      :title="locale === 'ar' ? 'استيراد البيانات' : 'Data Import'"
      :subtitle="locale === 'ar' ? 'استورد العملاء ودليل الحسابات والأرصدة الافتتاحية من ملف CSV' : 'Bulk import clients, chart of accounts, or opening balances from a CSV file'"
    />

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-3">
      <!-- Import form -->
      <div class="lg:col-span-2 bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
        <h3 class="text-sm font-semibold text-neutral-900 dark:text-neutral-0 mb-3 flex items-center gap-1.5">
          <UIcon name="i-lucide-file-up" class="w-3.5 h-3.5 text-neutral-400" />
          {{ locale === 'ar' ? 'استيراد ملف CSV' : 'Import CSV File' }}
        </h3>

        <div class="space-y-3">
          <div>
            <label class="im-label">{{ locale === 'ar' ? 'نوع الاستيراد' : 'Import Type' }}</label>
            <div class="relative">
              <select v-model="importType" class="im-input">
                <option value="clients">{{ locale === 'ar' ? 'العملاء' : 'Clients' }}</option>
                <option value="accounts">{{ locale === 'ar' ? 'دليل الحسابات' : 'Chart of Accounts' }}</option>
                <option value="opening_balances">{{ locale === 'ar' ? 'أرصدة افتتاحية' : 'Opening Balances' }}</option>
              </select>
              <UIcon name="i-lucide-chevron-down" class="absolute end-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
            </div>
          </div>

          <div>
            <label class="im-label">{{ locale === 'ar' ? 'ملف CSV' : 'CSV File' }}</label>
            <input
              ref="fileInput"
              type="file"
              accept=".csv,.txt"
              class="im-file"
              @change="onFileSelect"
            />
          </div>

          <div class="flex items-center gap-3 pt-1">
            <UiAppButton
              variant="primary"
              icon="i-lucide-upload"
              :loading="uploading"
              :disabled="!selectedFile"
              @click="startImport"
            >
              {{ locale === 'ar' ? 'بدء الاستيراد' : 'Start Import' }}
            </UiAppButton>
            <button
              type="button"
              class="inline-flex items-center gap-1 text-xs font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
              @click="downloadTemplate"
            >
              <UIcon name="i-lucide-download" class="w-3.5 h-3.5" />
              {{ locale === 'ar' ? 'تحميل نموذج' : 'Download Template' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Tip card -->
      <div class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
        <div class="flex items-start gap-2">
          <div class="w-8 h-8 rounded-full bg-info-50 dark:bg-info-500/10 flex items-center justify-center flex-shrink-0">
            <UIcon name="i-lucide-info" class="w-4 h-4 text-info-600 dark:text-info-400" />
          </div>
          <div>
            <p class="text-sm font-semibold text-neutral-900 dark:text-neutral-0 mb-1">
              {{ locale === 'ar' ? 'نصائح للاستيراد' : 'Import tips' }}
            </p>
            <ul class="text-xs text-neutral-500 dark:text-neutral-400 space-y-1 list-disc ms-4">
              <li>{{ locale === 'ar' ? 'حمّل النموذج أولاً للحصول على رؤوس الأعمدة الصحيحة.' : 'Download the template first to get the right column headers.' }}</li>
              <li>{{ locale === 'ar' ? 'احفظ الملف بترميز UTF-8 لدعم العربية.' : 'Save with UTF-8 encoding for Arabic text support.' }}</li>
              <li>{{ locale === 'ar' ? 'الأرصدة الافتتاحية تتطلب وجود الحسابات مسبقاً.' : 'Opening balances require accounts to exist first.' }}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Import history -->
    <div v-if="jobs.length" class="mt-4">
      <h3 class="text-sm font-semibold text-neutral-900 dark:text-neutral-0 mb-2 flex items-center gap-1.5">
        <UIcon name="i-lucide-history" class="w-3.5 h-3.5 text-neutral-400" />
        {{ locale === 'ar' ? 'سجل الاستيراد' : 'Import History' }}
      </h3>
      <div class="space-y-2">
        <div
          v-for="job in jobs"
          :key="job.id"
          class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4"
        >
          <div class="flex items-start justify-between mb-2 gap-3">
            <div class="min-w-0">
              <span class="text-sm font-medium text-neutral-900 dark:text-neutral-0 truncate">{{ job.original_filename }}</span>
              <span class="text-xs text-neutral-500 dark:text-neutral-400 ms-2">({{ job.type }})</span>
            </div>
            <UiBadge :color="jobBadgeColor(job.status)" dot>{{ job.status }}</UiBadge>
          </div>
          <div v-if="job.total_rows > 0" class="mb-1">
            <div class="flex justify-between text-xs text-neutral-500 dark:text-neutral-400 mb-1 tabular-nums" dir="ltr">
              <span>{{ job.processed_rows }}/{{ job.total_rows }}</span>
              <span class="text-success-700 dark:text-success-400">{{ job.success_count }} OK</span>
            </div>
            <div class="w-full h-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
              <div
                class="h-full bg-success-500 dark:bg-success-400 rounded-full transition-all"
                :style="{ width: (job.processed_rows / job.total_rows * 100) + '%' }"
              ></div>
            </div>
          </div>
          <div
            v-if="job.errors?.length"
            class="bg-danger-50/60 dark:bg-danger-500/10 border border-danger-100 dark:border-danger-500/20 rounded-lg p-2.5 max-h-32 overflow-y-auto mt-2"
          >
            <div
              v-for="(err, i) in job.errors.slice(0, 5)"
              :key="i"
              class="text-xs text-danger-700 dark:text-danger-400 tabular-nums"
              dir="ltr"
            >
              Row {{ err.row }}: {{ err.message }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })
const { locale } = useI18n()
const api = useApi()
const toastStore = useToastStore()

const importType = ref('clients')
const selectedFile = ref<File | null>(null)
const uploading = ref(false)
const jobs = ref<any[]>([])
const fileInput = ref<HTMLInputElement>()

function onFileSelect(e: Event) { selectedFile.value = (e.target as HTMLInputElement).files?.[0] || null }

function jobBadgeColor(status: string): string {
  return ({ completed: 'green', failed: 'red', processing: 'blue', pending: 'gray' } as Record<string, string>)[status] || 'gray'
}

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
    if (fileInput.value) fileInput.value.value = ''
    loadJobs()
  } catch (e: any) { toastStore.error(e.data?.message || 'Error') }
  finally { uploading.value = false }
}

async function downloadTemplate() {
  try {
    const res = await api.get<any>(`/import/template/${importType.value}`)
    const csv = '﻿' + res.data.headers.join(',') + '\n' + (res.data.sample?.[0] || '')
    const blob = new Blob([csv], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob); a.download = `${importType.value}_template.csv`; a.click()
  } catch {}
}

async function loadJobs() { try { jobs.value = (await api.get<any>('/import')).data } catch {} }
onMounted(loadJobs)
</script>

<style scoped>
@reference "~/assets/css/tokens.css";

.im-label { @apply block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5; }

.im-input,
.im-file {
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
}
.im-input { appearance: none; }
.im-file {
  padding-block: 0.375rem;
  font-size: 0.8125rem;
}
.im-input:focus,
.im-file:focus {
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 2px color-mix(in oklab, var(--color-primary-500) 20%, transparent);
}
:global(html.dark) .im-input,
:global(html.dark) .im-file {
  background-color: var(--color-neutral-900);
  border-color: var(--color-neutral-800);
  color: var(--color-neutral-0);
}
</style>
