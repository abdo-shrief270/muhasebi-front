<template>
  <div>
      <UiPageHeader :title="locale === 'ar' ? 'المستندات' : 'Documents'">
        <template #actions>
          <UiAppButton variant="primary" size="sm" @click="uploadOpen = true">
            {{ locale === 'ar' ? 'رفع مستند' : 'Upload' }}
          </UiAppButton>
        </template>
      </UiPageHeader>

      <div v-if="loading"><UiLoadingSkeleton :lines="5" :height="40" /></div>

      <div v-else-if="docs.length" class="space-y-3">
        <div
          v-for="(doc, i) in docs"
          :key="doc.id"
          v-motion
          :initial="{ opacity: 0, y: 10 }"
          :enter="{ opacity: 1, y: 0, transition: { delay: i * 50 } }"
          class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-100/80 dark:border-neutral-800 p-4 flex items-center justify-between hover:border-neutral-200 dark:hover:border-neutral-700 transition"
        >
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-neutral-50 dark:bg-neutral-800 rounded-lg flex items-center justify-center text-xs font-bold text-neutral-400 dark:text-neutral-500">
              {{ doc.mime_type?.includes('pdf') ? 'PDF' : 'FILE' }}
            </div>
            <div>
              <p class="text-sm font-medium text-neutral-700 dark:text-neutral-200">{{ doc.name }}</p>
              <p class="text-xs text-neutral-400 dark:text-neutral-500">{{ new Date(doc.created_at).toLocaleDateString() }}</p>
            </div>
          </div>
          <a :href="downloadUrl(doc.id)" target="_blank" class="text-secondary-400 hover:text-secondary-500 text-sm font-medium">
            {{ locale === 'ar' ? 'تحميل' : 'Download' }}
          </a>
        </div>
      </div>

      <UiEmptyState v-else icon="&#9783;" :title="locale === 'ar' ? 'لا توجد مستندات' : 'No documents'" />

      <UiSlideOver v-model="uploadOpen" :title="locale === 'ar' ? 'رفع مستند' : 'Upload Document'">
        <UiFileUpload :uploading="uploading" @files="handleUpload" />
      </UiSlideOver>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'portal' })
const { locale } = useI18n()
const api = useApi()
const config = useRuntimeConfig()
const toastStore = useToastStore()

const docs = ref<any[]>([])
const loading = ref(true)
const uploadOpen = ref(false)
const uploading = ref(false)

function downloadUrl(id: number) {
  const tenantId = useTenantId()
  const token = import.meta.client ? localStorage.getItem('auth_token') : ''
  return `${config.public.apiBase}/portal/documents/${id}/download?token=${token}&tenant=${tenantId}`
}

async function load() {
  loading.value = true
  try {
    const data = await api.get<{ data: any[] }>('/portal/documents')
    docs.value = data.data
  } catch { docs.value = [] }
  finally { loading.value = false }
}

async function handleUpload(files: File[]) {
  uploading.value = true
  for (const file of files) {
    try {
      const formData = new FormData()
      formData.append('file', file)
      const headers = api.getHeaders()
      await $fetch(`${config.public.apiBase}/portal/documents`, { method: 'POST', body: formData, headers })
      toastStore.success(`${file.name} ${locale.value === 'ar' ? 'تم الرفع' : 'uploaded'}`)
    } catch (e: any) { toastStore.error(e.data?.message || 'Upload failed') }
  }
  uploading.value = false
  uploadOpen.value = false
  load()
}

onMounted(load)
</script>
