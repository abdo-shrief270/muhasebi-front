<template>
  <FeatureBoundary id="documents">
    <div class="px-4 lg:px-6 py-5 max-w-[1400px] mx-auto">
      <UiPageHeader
        icon="i-lucide-folder"
        :title="$t('nav.documents')"
        :subtitle="totalLabel"
      >
        <template #actions>
          <UiAppButton variant="primary" icon="i-lucide-upload" @click="uploadOpen = true">
            {{ locale === 'ar' ? 'رفع مستند' : 'Upload' }}
          </UiAppButton>
        </template>
      </UiPageHeader>

      <UiDataTable
        :columns="columns"
        :rows="rows"
        :loading="loading"
        :exportable="true"
        :current-page="currentPage"
        :total-pages="lastPage"
        :total="total"
        empty-icon="i-lucide-folder"
        :empty-title="locale === 'ar' ? 'لا توجد مستندات' : 'No documents yet'"
        :empty-description="locale === 'ar'
          ? 'ارفع أول ملف لتبدأ في تنظيم مستندات الشركة.'
          : 'Upload your first file to start organizing your documents.'"
        @page-change="(p: number) => { page = p }"
      >
        <template #header>
          <div class="flex items-center gap-2 flex-1 flex-wrap min-w-0">
            <UiSearchInput
              v-model="searchInput"
              class="flex-1 min-w-[200px] max-w-xs"
              :placeholder="locale === 'ar' ? 'بحث في المستندات...' : 'Search documents...'"
            />
            <UiFilterDropdown
              v-model="categoryFilter"
              :options="categoryOptions"
              :all-label="locale === 'ar' ? 'كل الأنواع' : 'All categories'"
            />
          </div>
        </template>

        <template #cell-name="{ row }">
          <div class="flex items-center gap-2.5 min-w-0">
            <div
              class="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0"
              :class="mimeColor(row.mime_type)"
            >
              <UIcon :name="mimeIcon(row.mime_type)" class="w-3.5 h-3.5" />
            </div>
            <div class="min-w-0">
              <p class="text-sm font-medium text-neutral-900 dark:text-neutral-0 truncate">{{ row.name }}</p>
              <p class="text-[11px] text-neutral-500 dark:text-neutral-400">{{ formatSize(row.size_bytes) }}</p>
            </div>
          </div>
        </template>

        <template #cell-category="{ value }">
          <UiBadge v-if="value" color="blue">{{ categoryLabel(value) }}</UiBadge>
          <span v-else class="text-xs text-neutral-400">—</span>
        </template>

        <template #cell-client="{ row }">
          <NuxtLink
            v-if="row.client?.id"
            :to="`/clients/${row.client.id}`"
            class="text-sm text-neutral-700 dark:text-neutral-200 hover:text-primary-600 dark:hover:text-primary-400 transition-colors truncate"
            @click.stop
          >
            {{ row.client.name }}
          </NuxtLink>
          <span v-else class="text-xs text-neutral-400">—</span>
        </template>

        <template #cell-created_at="{ value }">
          <span class="text-xs text-neutral-500 dark:text-neutral-400 tabular-nums" dir="ltr">{{ formatDate(value) }}</span>
        </template>

        <template #cell-actions="{ row }">
          <div class="flex items-center justify-end gap-0.5" @click.stop>
            <a
              :href="downloadUrl(row.id)"
              target="_blank"
              rel="noopener noreferrer"
              class="w-7 h-7 inline-flex items-center justify-center rounded-md text-neutral-400 hover:text-info-600 hover:bg-info-500/10 transition-colors"
              :title="locale === 'ar' ? 'تحميل' : 'Download'"
            >
              <UIcon name="i-lucide-download" class="w-3.5 h-3.5" />
            </a>
            <button
              type="button"
              class="w-7 h-7 inline-flex items-center justify-center rounded-md text-neutral-400 hover:text-warning-600 hover:bg-warning-500/10 transition-colors"
              :title="row.is_archived
                ? (locale === 'ar' ? 'استعادة' : 'Unarchive')
                : (locale === 'ar' ? 'أرشفة' : 'Archive')"
              @click="handleArchive(row)"
            >
              <UIcon :name="row.is_archived ? 'i-lucide-archive-restore' : 'i-lucide-archive'" class="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              class="w-7 h-7 inline-flex items-center justify-center rounded-md text-neutral-400 hover:text-danger-600 hover:bg-danger-500/10 transition-colors"
              :title="$t('common.delete')"
              @click="confirmDelete(row)"
            >
              <UIcon name="i-lucide-trash-2" class="w-3.5 h-3.5" />
            </button>
          </div>
        </template>
      </UiDataTable>

      <!-- Upload slideover -->
      <UiSlideOver v-model="uploadOpen" :title="locale === 'ar' ? 'رفع مستند' : 'Upload Document'">
        <div class="space-y-4">
          <UiFileUpload :uploading="uploading" multiple @files="handleUpload" />

          <TransitionGroup name="fade-slide" tag="div" class="space-y-2">
            <div
              v-for="(file, i) in uploadedFiles"
              :key="i"
              class="flex items-center gap-2 bg-success-500/10 border border-success-500/20 rounded-md px-3 py-2"
            >
              <UIcon name="i-lucide-check-circle-2" class="w-4 h-4 text-success-600 dark:text-success-400 flex-shrink-0" />
              <span class="text-sm text-neutral-700 dark:text-neutral-200 truncate flex-1">{{ file }}</span>
            </div>
          </TransitionGroup>

          <div v-if="uploadedFiles.length > 0" class="pt-3 border-t border-neutral-200 dark:border-neutral-800">
            <UiAppButton variant="primary" class="w-full" @click="uploadOpen = false; refresh()">
              {{ $t('common.close') }}
            </UiAppButton>
          </div>
        </div>
      </UiSlideOver>

      <UiConfirmModal
        v-model="deleteConfirmOpen"
        :title="locale === 'ar' ? 'حذف المستند' : 'Delete Document'"
        :description="locale === 'ar' ? 'لن يمكن استرجاع المستند بعد الحذف.' : 'This document cannot be recovered once deleted.'"
        icon="i-lucide-alert-triangle"
        variant="danger"
        :confirm-label="$t('common.delete')"
        @confirm="handleDelete"
      />
    </div>
  </FeatureBoundary>
</template>

<script setup lang="ts">
import { documentService, type Document, type DocumentListParams } from '~/features/documents/services/documentService'
import type { ApiError } from '~/core/api/errors'

definePageMeta({ layout: 'dashboard' })

const { locale } = useI18n()
const toastStore = useToastStore()

const searchInput = ref('')
const search = refDebounced(searchInput, 400)
const categoryFilter = ref('')
const page = ref(1)

watch([search, categoryFilter], () => { page.value = 1 })

const params = computed<DocumentListParams>(() => ({
  search: search.value || undefined,
  category: categoryFilter.value || undefined,
  page: page.value,
}))

const { data, loading, refresh } = useDocumentsList(params)
const { upload: uploadMutation, archive: archiveMutation, unarchive: unarchiveMutation, remove: removeMutation } = useDocumentMutations()

const rows = computed(() => data.value?.data ?? [])
const total = computed(() => data.value?.meta?.total ?? 0)
const currentPage = computed(() => data.value?.meta?.current_page ?? 1)
const lastPage = computed(() => data.value?.meta?.last_page ?? 1)

const svc = documentService()
const downloadUrl = (id: number) => svc.downloadUrl(id)

const uploadOpen = ref(false)
const uploading = computed(() => uploadMutation.loading.value)
const uploadedFiles = ref<string[]>([])
const deleteConfirmOpen = ref(false)
const deletingDoc = ref<Document | null>(null)

const columns = computed(() => [
  { key: 'name', label: locale.value === 'ar' ? 'الملف' : 'File' },
  { key: 'category', label: locale.value === 'ar' ? 'التصنيف' : 'Category' },
  { key: 'client', label: locale.value === 'ar' ? 'العميل' : 'Client' },
  { key: 'created_at', label: locale.value === 'ar' ? 'التاريخ' : 'Date', sortable: true },
  { key: 'actions', label: '', class: 'w-28' },
])

const categoryOptions = computed(() => [
  { value: 'tax_document', label: locale.value === 'ar' ? 'مستند ضريبي' : 'Tax Document' },
  { value: 'invoice', label: locale.value === 'ar' ? 'فاتورة' : 'Invoice' },
  { value: 'receipt', label: locale.value === 'ar' ? 'إيصال' : 'Receipt' },
  { value: 'contract', label: locale.value === 'ar' ? 'عقد' : 'Contract' },
  { value: 'financial_statement', label: locale.value === 'ar' ? 'قائمة مالية' : 'Financial Statement' },
  { value: 'other', label: locale.value === 'ar' ? 'أخرى' : 'Other' },
])

async function handleUpload(files: File[]) {
  for (const file of files) {
    try {
      await uploadMutation.mutate({ file, data: { category: categoryFilter.value || undefined } })
      uploadedFiles.value.push(file.name)
      toastStore.success(`${file.name} ${locale.value === 'ar' ? 'تم الرفع' : 'uploaded'}`)
    } catch (e) {
      const err = e as ApiError
      toastStore.error(`${file.name}: ${err.message || 'Upload failed'}`)
    }
  }
}

async function handleArchive(doc: Document) {
  try {
    if (doc.is_archived) {
      await unarchiveMutation.mutate(doc.id)
      toastStore.success(locale.value === 'ar' ? 'تم الاستعادة' : 'Unarchived')
    } else {
      await archiveMutation.mutate(doc.id)
      toastStore.success(locale.value === 'ar' ? 'تم الأرشفة' : 'Archived')
    }
  } catch (e) {
    const err = e as ApiError
    toastStore.error(err.message || 'Error')
  }
}

function confirmDelete(doc: Document) {
  deletingDoc.value = doc
  deleteConfirmOpen.value = true
}

async function handleDelete() {
  if (!deletingDoc.value) return
  try {
    await removeMutation.mutate(deletingDoc.value.id)
    toastStore.success(locale.value === 'ar' ? 'تم الحذف' : 'Deleted')
  } catch (e) {
    const err = e as ApiError
    toastStore.error(err.message || 'Error')
  }
  deleteConfirmOpen.value = false
}

const totalLabel = computed(() => {
  const n = total.value.toLocaleString()
  if (locale.value === 'ar') return `${n} مستند`
  return `${n} ${total.value === 1 ? 'document' : 'documents'}`
})

const CATEGORY_AR: Record<string, string> = {
  tax_document: 'ضريبي', invoice: 'فاتورة', receipt: 'إيصال',
  contract: 'عقد', financial_statement: 'قائمة مالية', other: 'أخرى',
}
const CATEGORY_EN: Record<string, string> = {
  tax_document: 'Tax', invoice: 'Invoice', receipt: 'Receipt',
  contract: 'Contract', financial_statement: 'Statement', other: 'Other',
}
function categoryLabel(c: string) {
  const map = locale.value === 'ar' ? CATEGORY_AR : CATEGORY_EN
  return map[c] ?? c
}

function formatSize(bytes: number) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1048576).toFixed(1) + ' MB'
}

function formatDate(d: string | null | undefined) {
  if (!d) return '—'
  try {
    return new Date(d).toLocaleDateString(locale.value === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    })
  } catch {
    return d
  }
}

/** MIME-type → Lucide icon. Falls back to a generic file icon. */
function mimeIcon(mime: string): string {
  if (mime?.includes('pdf')) return 'i-lucide-file-text'
  if (mime?.includes('image')) return 'i-lucide-image'
  if (mime?.includes('spreadsheet') || mime?.includes('excel')) return 'i-lucide-file-spreadsheet'
  if (mime?.includes('word') || mime?.includes('document')) return 'i-lucide-file'
  return 'i-lucide-file'
}

/** MIME-type → tinted background + foreground for the icon chip. */
function mimeColor(mime: string): string {
  if (mime?.includes('pdf')) return 'bg-danger-500/10 text-danger-600 dark:text-danger-400'
  if (mime?.includes('image')) return 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
  if (mime?.includes('spreadsheet') || mime?.includes('excel')) return 'bg-success-500/10 text-success-600 dark:text-success-400'
  if (mime?.includes('word') || mime?.includes('document')) return 'bg-info-500/10 text-info-600 dark:text-info-400'
  return 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500'
}

</script>
