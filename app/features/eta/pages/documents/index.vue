<template>
  <div>
    <NuxtLayout name="dashboard">
      <UiPageHeader :title="locale === 'ar' ? 'مستندات الفوترة الإلكترونية' : 'E-Invoice Documents'" />

      <UiDataTable
        :columns="columns"
        :rows="docs"
        :loading="loading"
        :current-page="meta.current_page"
        :total-pages="meta.last_page"
        :empty-title="locale === 'ar' ? 'لا توجد مستندات' : 'No documents'"
        @row-click="(row) => navigateTo(`/eta/documents/${row.invoice_id}`)"
        @page-change="(p) => { page = p; load() }"
      >
        <template #header>
          <UiSearchInput v-model="search" class="flex-1 min-w-[200px]" @update:model-value="debouncedLoad" />
          <UiFilterDropdown v-model="statusFilter" :options="statusOptions" :all-label="$t('common.all')" @update:model-value="load" />
        </template>

        <template #cell-internal_id="{ value }">
          <span class="font-mono text-xs text-primary-500 font-semibold">{{ value }}</span>
        </template>

        <template #cell-status="{ row }">
          <UiBadge :color="row.status_color" dot>
            {{ locale === 'ar' ? row.status_label_ar : row.status_label }}
          </UiBadge>
        </template>

        <template #cell-eta_uuid="{ value }">
          <span v-if="value" class="font-mono text-[10px] text-gray-400" dir="ltr">{{ value.substring(0, 16) }}...</span>
          <span v-else class="text-gray-300">-</span>
        </template>

        <template #cell-actions="{ row }">
          <div class="flex items-center gap-1" @click.stop>
            <UiAppButton v-if="row.status === 'prepared'" variant="secondary" size="sm" @click="handleSubmit(row.invoice_id)">
              {{ locale === 'ar' ? 'إرسال' : 'Submit' }}
            </UiAppButton>
            <UiAppButton v-if="row.status === 'submitted'" variant="outline" size="sm" @click="handleCheck(row.invoice_id)">
              {{ locale === 'ar' ? 'تحقق' : 'Check' }}
            </UiAppButton>
          </div>
        </template>
      </UiDataTable>
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })
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
  { key: 'actions', label: '', class: 'w-28' },
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
