<template>
  <div>
    <NuxtLayout name="dashboard">
      <FeatureBoundary id="documents">
      <UiPageHeader :title="$t('nav.documents')" :subtitle="locale === 'ar' ? `${total} مستند` : `${total} documents`">
        <template #actions>
          <UiAppButton variant="primary" @click="uploadOpen = true">
            {{ locale === 'ar' ? '+ رفع مستند' : '+ Upload' }}
          </UiAppButton>
        </template>
      </UiPageHeader>

      <UiDataTable
        :columns="columns"
        :rows="rows"
        :loading="loading"
        :current-page="currentPage"
        :total-pages="lastPage"
        :empty-title="locale === 'ar' ? 'لا توجد مستندات' : 'No documents'"
        @page-change="(p: number) => { page = p }"
      >
        <template #header>
          <UiSearchInput v-model="searchInput" class="flex-1 min-w-[200px]" />
          <UiFilterDropdown v-model="categoryFilter" :options="categoryOptions" :all-label="locale === 'ar' ? 'كل الأنواع' : 'All Categories'" />
        </template>

        <template #cell-name="{ row }">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold" :class="mimeColor(row.mime_type)">
              {{ mimeIcon(row.mime_type) }}
            </div>
            <div>
              <p class="font-medium text-gray-700 text-sm">{{ row.name }}</p>
              <p class="text-xs text-gray-400">{{ formatSize(row.size_bytes) }}</p>
            </div>
          </div>
        </template>

        <template #cell-category="{ value }">
          <UiBadge v-if="value" color="blue">{{ value }}</UiBadge>
          <span v-else class="text-gray-300">-</span>
        </template>

        <template #cell-client="{ row }">
          <span class="text-gray-500 text-sm">{{ row.client?.name || '-' }}</span>
        </template>

        <template #cell-created_at="{ value }">
          <span class="text-xs text-gray-400">{{ new Date(value).toLocaleDateString() }}</span>
        </template>

        <template #cell-actions="{ row }">
          <div class="flex items-center gap-1" @click.stop>
            <a
              :href="downloadUrl(row.id)"
              target="_blank"
              class="p-1.5 rounded-lg text-gray-400 hover:text-secondary-400 hover:bg-secondary-50 transition"
              :title="locale === 'ar' ? 'تحميل' : 'Download'"
            >
              &#8595;
            </a>
            <button
              @click="handleArchive(row)"
              class="p-1.5 rounded-lg text-gray-400 hover:text-amber-500 hover:bg-amber-50 transition"
              :title="row.is_archived ? (locale === 'ar' ? 'استعادة' : 'Unarchive') : (locale === 'ar' ? 'أرشفة' : 'Archive')"
            >
              {{ row.is_archived ? '&#8634;' : '&#9744;' }}
            </button>
            <button
              @click="confirmDelete(row)"
              class="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
            >
              &#10005;
            </button>
          </div>
        </template>
      </UiDataTable>

      <!-- Upload SlideOver -->
      <UiSlideOver v-model="uploadOpen" :title="locale === 'ar' ? 'رفع مستند' : 'Upload Document'">
        <div class="space-y-5">
          <UiFileUpload :uploading="uploading" multiple @files="handleUpload" />

          <!-- Uploaded files list -->
          <TransitionGroup name="fade-slide">
            <div
              v-for="(file, i) in uploadedFiles"
              :key="i"
              class="flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3"
            >
              <span class="text-emerald-500">&#10003;</span>
              <span class="text-sm text-gray-700 flex-1">{{ file }}</span>
            </div>
          </TransitionGroup>

          <div v-if="uploadedFiles.length > 0" class="pt-4">
            <UiAppButton variant="primary" @click="uploadOpen = false; refresh()">
              {{ $t('common.close') }}
            </UiAppButton>
          </div>
        </div>
      </UiSlideOver>

      <!-- Delete confirm -->
      <UiConfirmModal
        v-model="deleteConfirmOpen"
        :title="locale === 'ar' ? 'حذف المستند' : 'Delete Document'"
        :description="locale === 'ar' ? 'هل أنت متأكد من حذف هذا المستند؟' : 'Are you sure you want to delete this document?'"
        icon="&#9888;"
        variant="danger"
        :confirm-label="$t('common.delete')"
        @confirm="handleDelete"
      />
      </FeatureBoundary>
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
import type { Document } from '~/shared/types/document'
import { documentService, type DocumentListParams } from '~/features/documents/services/documentService'
import type { ApiError } from '~/core/api/errors'

definePageMeta({ layout: false })

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
const total = computed(() => data.value?.meta.total ?? 0)
const currentPage = computed(() => data.value?.meta.current_page ?? 1)
const lastPage = computed(() => data.value?.meta.last_page ?? 1)

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

function formatSize(bytes: number) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1048576).toFixed(1) + ' MB'
}

function mimeIcon(mime: string) {
  if (mime?.includes('pdf')) return 'PDF'
  if (mime?.includes('image')) return 'IMG'
  if (mime?.includes('spreadsheet') || mime?.includes('excel')) return 'XLS'
  if (mime?.includes('word') || mime?.includes('document')) return 'DOC'
  return 'FILE'
}

function mimeColor(mime: string) {
  if (mime?.includes('pdf')) return 'bg-red-50 text-red-500'
  if (mime?.includes('image')) return 'bg-purple-50 text-purple-500'
  if (mime?.includes('spreadsheet') || mime?.includes('excel')) return 'bg-emerald-50 text-emerald-500'
  if (mime?.includes('word') || mime?.includes('document')) return 'bg-blue-50 text-blue-500'
  return 'bg-gray-50 text-gray-400'
}

</script>
