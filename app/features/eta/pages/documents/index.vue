<template>
  <FeatureBoundary id="eta">
    <div class="px-4 lg:px-6 py-5 max-w-[1400px] mx-auto">
      <UiPageHeader
        icon="i-lucide-files"
        :title="locale === 'ar' ? 'مستندات الفوترة الإلكترونية' : 'E-Invoice Documents'"
        :subtitle="locale === 'ar' ? 'الفواتير المُقدَّمة لمصلحة الضرائب وحالتها' : 'Invoices submitted to ETA and their status'"
      />

      <UiDataTable
        :columns="columns"
        :rows="docs"
        :loading="loading"
        :current-page="meta.current_page"
        :total-pages="meta.last_page"
        empty-icon="i-lucide-file-badge"
        :empty-title="locale === 'ar' ? 'لا توجد مستندات' : 'No documents'"
        :empty-description="locale === 'ar'
          ? 'الفواتير المُجهَّزة للإرسال لمصلحة الضرائب تظهر هنا.'
          : 'Invoices prepared for ETA submission will appear here.'"
        @row-click="(row: any) => navigateTo(`/eta/documents/${row.invoice_id}`)"
        @page-change="(p: number) => { page = p; load() }"
      >
        <template #header>
          <UiSearchInput v-model="search" class="flex-1 min-w-[200px]" @update:model-value="debouncedLoad" />
          <UiFilterDropdown v-model="statusFilter" :options="statusOptions" :all-label="$t('common.all')" @update:model-value="load" />
        </template>

        <template #cell-internal_id="{ value }">
          <span class="font-mono text-xs font-semibold text-primary-700 dark:text-primary-400">{{ value }}</span>
        </template>

        <template #cell-document_type="{ value }">
          <span class="text-sm text-neutral-700 dark:text-neutral-200">
            {{ value === 'I' ? (locale === 'ar' ? 'فاتورة' : 'Invoice') : value }}
          </span>
        </template>

        <template #cell-status="{ row }">
          <UiBadge :color="row.status_color" dot>
            {{ locale === 'ar' ? row.status_label_ar : row.status_label }}
          </UiBadge>
        </template>

        <template #cell-eta_uuid="{ value }">
          <span v-if="value" class="font-mono text-[10px] text-neutral-500 dark:text-neutral-400" dir="ltr">{{ value.substring(0, 16) }}…</span>
          <span v-else class="text-neutral-300 dark:text-neutral-600">—</span>
        </template>

        <template #cell-actions="{ row }">
          <div class="flex items-center gap-1" @click.stop>
            <UiAppButton
              v-if="row.status === 'prepared'"
              variant="secondary"
              size="sm"
              icon="i-lucide-send"
              @click="handleSubmit(row.invoice_id)"
            >
              {{ locale === 'ar' ? 'إرسال' : 'Submit' }}
            </UiAppButton>
            <UiAppButton
              v-if="row.status === 'submitted'"
              variant="outline"
              size="sm"
              icon="i-lucide-refresh-cw"
              @click="handleCheck(row.invoice_id)"
            >
              {{ locale === 'ar' ? 'تحقق' : 'Check' }}
            </UiAppButton>
          </div>
        </template>
      </UiDataTable>
    </div>
  </FeatureBoundary>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })
const { locale } = useI18n()
const { getDocuments, submitDocument, checkStatus } = useEta()
const toastStore = useToastStore()

const docs = ref<any[]>([])
const loading = ref(true)
const meta = ref({ current_page: 1, last_page: 1 })
const search = ref('')
const statusFilter = ref('')
const page = ref(1)

const columns = computed(() => [
  { key: 'internal_id', label: locale.value === 'ar' ? 'رقم الفاتورة' : 'Invoice #' },
  { key: 'document_type', label: locale.value === 'ar' ? 'النوع' : 'Type' },
  { key: 'status', label: locale.value === 'ar' ? 'الحالة' : 'Status' },
  { key: 'eta_uuid', label: 'UUID' },
  { key: 'actions', label: '', class: 'w-32' },
])

const statusOptions = computed(() => [
  { value: 'prepared', label: locale.value === 'ar' ? 'جاهز' : 'Prepared' },
  { value: 'submitted', label: locale.value === 'ar' ? 'مرسل' : 'Submitted' },
  { value: 'valid', label: locale.value === 'ar' ? 'صالح' : 'Valid' },
  { value: 'invalid', label: locale.value === 'ar' ? 'غير صالح' : 'Invalid' },
  { value: 'rejected', label: locale.value === 'ar' ? 'مرفوض' : 'Rejected' },
])

async function load() {
  loading.value = true
  try {
    const data = await getDocuments({ search: search.value, status: statusFilter.value || undefined, page: page.value })
    docs.value = data.data
    meta.value = data.meta || { current_page: 1, last_page: 1 }
  } catch { docs.value = [] }
  finally { loading.value = false }
}

const debouncedLoad = useDebounceFn(() => { page.value = 1; load() }, 400)

async function handleSubmit(invoiceId: number) {
  try {
    await submitDocument(invoiceId)
    toastStore.success(locale.value === 'ar' ? 'تم الإرسال' : 'Submitted')
    load()
  } catch (e: any) { toastStore.error(e.data?.message || 'Error') }
}

async function handleCheck(invoiceId: number) {
  try {
    const doc = await checkStatus(invoiceId)
    toastStore.info(`${locale.value === 'ar' ? 'الحالة:' : 'Status:'} ${locale.value === 'ar' ? doc.status_label_ar : doc.status_label}`)
    load()
  } catch (e: any) { toastStore.error(e.data?.message || 'Error') }
}

onMounted(load)
</script>
