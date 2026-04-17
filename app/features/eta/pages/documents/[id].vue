<template>
  <div>
    <NuxtLayout name="dashboard">
      <FeatureBoundary id="eta">
      <template v-if="loading"><UiLoadingSkeleton :lines="8" :height="24" /></template>

      <template v-else-if="doc">
        <div v-motion :initial="{ opacity: 0, y: -10 }" :enter="{ opacity: 1, y: 0 }" class="flex items-start justify-between mb-8">
          <div class="flex items-center gap-4">
            <button @click="navigateTo('/eta/documents')" class="text-gray-300 hover:text-gray-500 transition">&#8592;</button>
            <div>
              <h1 class="text-2xl font-bold text-gray-800 font-mono">{{ doc.internal_id }}</h1>
              <div class="flex items-center gap-2 mt-1">
                <UiBadge :color="doc.status_color" dot>{{ locale === 'ar' ? doc.status_label_ar : doc.status_label }}</UiBadge>
                <span class="text-xs text-gray-400">{{ doc.document_type === 'I' ? (locale === 'ar' ? 'فاتورة' : 'Invoice') : doc.document_type }}</span>
              </div>
            </div>
          </div>
          <div class="flex gap-2">
            <UiAppButton v-if="doc.status === 'prepared'" variant="primary" size="sm" :loading="actionLoading" @click="handleSubmit">{{ locale === 'ar' ? 'إرسال للضرائب' : 'Submit to ETA' }}</UiAppButton>
            <UiAppButton v-if="doc.status === 'submitted'" variant="outline" size="sm" :loading="actionLoading" @click="handleCheckStatus">{{ locale === 'ar' ? 'تحقق من الحالة' : 'Check Status' }}</UiAppButton>
            <UiAppButton v-if="doc.status === 'valid'" variant="danger" size="sm" :loading="actionLoading" @click="cancelOpen = true">{{ locale === 'ar' ? 'إلغاء' : 'Cancel' }}</UiAppButton>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div class="lg:col-span-2 space-y-5">
            <!-- Info -->
            <div class="bg-white rounded-2xl border border-gray-100/80 p-5">
              <h3 class="font-semibold text-gray-700 mb-3">{{ locale === 'ar' ? 'تفاصيل المستند' : 'Document Details' }}</h3>
              <div class="grid grid-cols-2 gap-3 text-sm">
                <div><span class="text-gray-400">UUID:</span> <span class="font-mono text-xs text-gray-600" dir="ltr">{{ doc.eta_uuid || '-' }}</span></div>
                <div><span class="text-gray-400">{{ locale === 'ar' ? 'تم الإرسال' : 'Submitted' }}:</span> <span class="text-gray-600">{{ doc.submitted_at ? new Date(doc.submitted_at).toLocaleString() : '-' }}</span></div>
                <div><span class="text-gray-400">{{ locale === 'ar' ? 'أُنشئ' : 'Created' }}:</span> <span class="text-gray-600">{{ new Date(doc.created_at).toLocaleString() }}</span></div>
                <div><span class="text-gray-400">{{ locale === 'ar' ? 'الفاتورة' : 'Invoice' }}:</span>
                  <NuxtLink :to="`/invoices/${doc.invoice_id}`" class="text-secondary-400 hover:underline">{{ doc.internal_id }}</NuxtLink>
                </div>
              </div>
            </div>

            <!-- QR Code -->
            <div v-if="doc.qr_code_data" class="bg-white rounded-2xl border border-gray-100/80 p-5">
              <h3 class="font-semibold text-gray-700 mb-3">{{ locale === 'ar' ? 'رمز QR' : 'QR Code' }}</h3>
              <div class="bg-gray-50 rounded-xl p-4 text-center">
                <p class="font-mono text-xs text-gray-500 break-all" dir="ltr">{{ doc.qr_code_data }}</p>
                <a :href="doc.qr_code_data" target="_blank" class="text-sm text-secondary-400 hover:underline mt-2 inline-block">{{ locale === 'ar' ? 'فتح الرابط' : 'Open Link' }}</a>
              </div>
            </div>

            <!-- Errors -->
            <div v-if="doc.errors" class="bg-white rounded-2xl border border-red-100 p-5">
              <h3 class="font-semibold text-red-600 mb-3">{{ locale === 'ar' ? 'الأخطاء' : 'Errors' }}</h3>
              <pre class="text-xs text-red-500 bg-red-50 rounded-xl p-4 overflow-auto max-h-60" dir="ltr">{{ JSON.stringify(doc.errors, null, 2) }}</pre>
            </div>

            <!-- JSON Preview -->
            <div class="bg-white rounded-2xl border border-gray-100/80 p-5">
              <div class="flex items-center justify-between mb-3">
                <h3 class="font-semibold text-gray-700">{{ locale === 'ar' ? 'بيانات المستند' : 'Document JSON' }}</h3>
                <button @click="jsonExpanded = !jsonExpanded" class="text-xs text-secondary-400">{{ jsonExpanded ? (locale === 'ar' ? 'طي' : 'Collapse') : (locale === 'ar' ? 'عرض' : 'Expand') }}</button>
              </div>
              <pre v-if="jsonExpanded" class="text-xs text-gray-600 bg-gray-50 rounded-xl p-4 overflow-auto max-h-96" dir="ltr">{{ JSON.stringify(doc.eta_response || doc.document_data, null, 2) }}</pre>
            </div>
          </div>

          <!-- Timeline -->
          <div>
            <div class="bg-white rounded-2xl border border-gray-100/80 p-5">
              <h3 class="font-semibold text-gray-700 mb-4">{{ locale === 'ar' ? 'المراحل' : 'Timeline' }}</h3>
              <div class="space-y-4">
                <div v-for="step in timeline" :key="step.label" class="flex items-center gap-3">
                  <div class="w-3 h-3 rounded-full flex-shrink-0" :class="step.active ? 'bg-emerald-500' : 'bg-gray-200'"></div>
                  <div>
                    <p class="text-sm" :class="step.active ? 'text-gray-800 font-medium' : 'text-gray-400'">{{ step.label }}</p>
                    <p v-if="step.date" class="text-[10px] text-gray-400">{{ step.date }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Cancel modal -->
        <UiConfirmModal
          v-model="cancelOpen"
          :title="locale === 'ar' ? 'إلغاء المستند' : 'Cancel Document'"
          :description="locale === 'ar' ? 'سيتم إلغاء المستند في مصلحة الضرائب' : 'This will cancel the document at ETA'"
          icon="⚠️"
          variant="danger"
          :confirm-label="locale === 'ar' ? 'إلغاء المستند' : 'Cancel Document'"
          :loading="actionLoading"
          @confirm="handleCancel"
        />
      </template>
      </FeatureBoundary>
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })
const { locale } = useI18n()
const route = useRoute()
const api = useApi()
const toastStore = useToastStore()
const { submitDocument, checkStatus, cancelDocument } = useEta()

const doc = ref<any>(null)
const loading = ref(true)
const actionLoading = ref(false)
const cancelOpen = ref(false)
const jsonExpanded = ref(false)

const timeline = computed(() => {
  if (!doc.value) return []
  const s = doc.value.status
  return [
    { label: locale.value === 'ar' ? 'تم التجهيز' : 'Prepared', active: true, date: doc.value.created_at ? new Date(doc.value.created_at).toLocaleDateString() : '' },
    { label: locale.value === 'ar' ? 'تم الإرسال' : 'Submitted', active: ['submitted', 'valid', 'invalid', 'rejected', 'cancelled'].includes(s), date: doc.value.submitted_at ? new Date(doc.value.submitted_at).toLocaleDateString() : '' },
    { label: locale.value === 'ar' ? 'صالح' : 'Valid', active: ['valid', 'cancelled'].includes(s) },
    { label: locale.value === 'ar' ? 'ملغى' : 'Cancelled', active: s === 'cancelled', date: doc.value.cancelled_at ? new Date(doc.value.cancelled_at).toLocaleDateString() : '' },
  ]
})

async function loadDoc() {
  loading.value = true
  try {
    const res = await api.get<{ data: any }>(`/eta/documents/${route.params.id}`)
    doc.value = res.data
  } catch {
    toastStore.error('Not found')
    navigateTo('/eta/documents')
  } finally { loading.value = false }
}

async function handleSubmit() {
  actionLoading.value = true
  try {
    doc.value = await submitDocument(doc.value.invoice_id)
    toastStore.success(locale.value === 'ar' ? 'تم الإرسال' : 'Submitted')
  } catch (e: any) { toastStore.error(e.data?.message || 'Error') }
  finally { actionLoading.value = false }
}

async function handleCheckStatus() {
  actionLoading.value = true
  try {
    doc.value = await checkStatus(doc.value.invoice_id)
    toastStore.info(`${locale.value === 'ar' ? 'الحالة:' : 'Status:'} ${locale.value === 'ar' ? doc.value.status_label_ar : doc.value.status_label}`)
  } catch (e: any) { toastStore.error(e.data?.message || 'Error') }
  finally { actionLoading.value = false }
}

async function handleCancel() {
  actionLoading.value = true
  try {
    doc.value = await cancelDocument(doc.value.invoice_id, 'Cancelled by admin')
    toastStore.success(locale.value === 'ar' ? 'تم الإلغاء' : 'Cancelled')
    cancelOpen.value = false
  } catch (e: any) { toastStore.error(e.data?.message || 'Error') }
  finally { actionLoading.value = false }
}

// Auto-poll for submitted documents
let pollInterval: ReturnType<typeof setInterval> | null = null
watch(() => doc.value?.status, (status) => {
  if (pollInterval) clearInterval(pollInterval)
  if (status === 'submitted') {
    pollInterval = setInterval(async () => {
      try {
        doc.value = await checkStatus(doc.value.invoice_id)
        if (doc.value.status !== 'submitted' && pollInterval) {
          clearInterval(pollInterval)
          toastStore.info(`Status: ${doc.value.status}`)
        }
      } catch { /* ignore */ }
    }, 30000) // 30 seconds
  }
})

onMounted(loadDoc)
onUnmounted(() => { if (pollInterval) clearInterval(pollInterval) })
</script>
