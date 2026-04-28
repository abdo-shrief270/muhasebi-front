<template>
  <FeatureBoundary id="eta">
    <div class="px-4 lg:px-6 py-5 max-w-[1400px] mx-auto">
      <template v-if="loading">
        <UiLoadingSkeleton :lines="8" :height="24" />
      </template>

      <template v-else-if="doc">
        <!-- Header -->
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-center gap-3 min-w-0">
            <button
              type="button"
              class="eta-back"
              :aria-label="locale === 'ar' ? 'رجوع' : 'Back'"
              @click="navigateTo('/eta/documents')"
            >
              <UIcon name="i-lucide-arrow-left" class="w-4 h-4" />
            </button>
            <div class="min-w-0">
              <h1 class="font-mono text-xl font-bold text-neutral-900 dark:text-neutral-0 truncate">{{ doc.internal_id }}</h1>
              <div class="flex items-center gap-2 mt-1">
                <UiBadge :color="doc.status_color" dot>{{ locale === 'ar' ? doc.status_label_ar : doc.status_label }}</UiBadge>
                <span class="text-xs text-neutral-500 dark:text-neutral-400">
                  {{ doc.document_type === 'I' ? (locale === 'ar' ? 'فاتورة' : 'Invoice') : doc.document_type }}
                </span>
              </div>
            </div>
          </div>
          <div class="flex gap-2 flex-shrink-0">
            <UiAppButton
              v-if="doc.status === 'prepared'"
              variant="primary"
              size="sm"
              icon="i-lucide-send"
              :loading="actionLoading"
              @click="handleSubmit"
            >
              {{ locale === 'ar' ? 'إرسال للضرائب' : 'Submit to ETA' }}
            </UiAppButton>
            <UiAppButton
              v-if="doc.status === 'submitted'"
              variant="outline"
              size="sm"
              icon="i-lucide-refresh-cw"
              :loading="actionLoading"
              @click="handleCheckStatus"
            >
              {{ locale === 'ar' ? 'تحقق من الحالة' : 'Check Status' }}
            </UiAppButton>
            <UiAppButton
              v-if="doc.status === 'valid'"
              variant="danger"
              size="sm"
              icon="i-lucide-x-circle"
              :loading="actionLoading"
              @click="cancelOpen = true"
            >
              {{ locale === 'ar' ? 'إلغاء' : 'Cancel' }}
            </UiAppButton>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <div class="lg:col-span-2 space-y-3">
            <!-- Info -->
            <div class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
              <h3 class="text-sm font-semibold text-neutral-900 dark:text-neutral-0 mb-3 flex items-center gap-1.5">
                <UIcon name="i-lucide-info" class="w-3.5 h-3.5 text-neutral-400" />
                {{ locale === 'ar' ? 'تفاصيل المستند' : 'Document Details' }}
              </h3>
              <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div class="flex items-baseline gap-2 min-w-0">
                  <dt class="text-xs text-neutral-500 dark:text-neutral-400 flex-shrink-0">UUID:</dt>
                  <dd class="font-mono text-xs text-neutral-700 dark:text-neutral-200 truncate" dir="ltr">{{ doc.eta_uuid || '—' }}</dd>
                </div>
                <div class="flex items-baseline gap-2">
                  <dt class="text-xs text-neutral-500 dark:text-neutral-400 flex-shrink-0">{{ locale === 'ar' ? 'تم الإرسال:' : 'Submitted:' }}</dt>
                  <dd class="text-sm text-neutral-700 dark:text-neutral-200 tabular-nums" dir="ltr">{{ doc.submitted_at ? new Date(doc.submitted_at).toLocaleString() : '—' }}</dd>
                </div>
                <div class="flex items-baseline gap-2">
                  <dt class="text-xs text-neutral-500 dark:text-neutral-400 flex-shrink-0">{{ locale === 'ar' ? 'أُنشئ:' : 'Created:' }}</dt>
                  <dd class="text-sm text-neutral-700 dark:text-neutral-200 tabular-nums" dir="ltr">{{ new Date(doc.created_at).toLocaleString() }}</dd>
                </div>
                <div class="flex items-baseline gap-2">
                  <dt class="text-xs text-neutral-500 dark:text-neutral-400 flex-shrink-0">{{ locale === 'ar' ? 'الفاتورة:' : 'Invoice:' }}</dt>
                  <dd>
                    <NuxtLink :to="`/invoices/${doc.invoice_id}`" class="text-sm font-mono text-primary-600 dark:text-primary-400 hover:underline">
                      {{ doc.internal_id }}
                    </NuxtLink>
                  </dd>
                </div>
              </dl>
            </div>

            <!-- QR Code -->
            <div v-if="doc.qr_code_data" class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
              <h3 class="text-sm font-semibold text-neutral-900 dark:text-neutral-0 mb-3 flex items-center gap-1.5">
                <UIcon name="i-lucide-qr-code" class="w-3.5 h-3.5 text-neutral-400" />
                {{ locale === 'ar' ? 'رمز QR' : 'QR Code' }}
              </h3>
              <div class="bg-neutral-50/60 dark:bg-neutral-950/40 rounded-lg p-3 border border-neutral-100 dark:border-neutral-800/60">
                <p class="font-mono text-xs text-neutral-600 dark:text-neutral-300 break-all" dir="ltr">{{ doc.qr_code_data }}</p>
                <a
                  :href="doc.qr_code_data"
                  target="_blank"
                  rel="noopener"
                  class="inline-flex items-center gap-1 mt-2 text-xs font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                >
                  {{ locale === 'ar' ? 'فتح الرابط' : 'Open link' }}
                  <UIcon name="i-lucide-external-link" class="w-3 h-3" />
                </a>
              </div>
            </div>

            <!-- Errors -->
            <div
              v-if="doc.errors"
              class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-danger-200 dark:border-danger-700/40 p-4"
            >
              <h3 class="text-sm font-semibold text-danger-700 dark:text-danger-400 mb-2 flex items-center gap-1.5">
                <UIcon name="i-lucide-alert-triangle" class="w-3.5 h-3.5" />
                {{ locale === 'ar' ? 'الأخطاء' : 'Errors' }}
              </h3>
              <pre class="text-xs text-danger-700 dark:text-danger-300 bg-danger-50/60 dark:bg-danger-500/10 rounded-lg p-3 overflow-auto max-h-60 leading-relaxed" dir="ltr">{{ JSON.stringify(doc.errors, null, 2) }}</pre>
            </div>

            <!-- JSON Preview -->
            <div class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
              <div class="flex items-center justify-between mb-3">
                <h3 class="text-sm font-semibold text-neutral-900 dark:text-neutral-0 flex items-center gap-1.5">
                  <UIcon name="i-lucide-braces" class="w-3.5 h-3.5 text-neutral-400" />
                  {{ locale === 'ar' ? 'بيانات المستند' : 'Document JSON' }}
                </h3>
                <button
                  type="button"
                  class="inline-flex items-center gap-1 text-xs font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                  @click="jsonExpanded = !jsonExpanded"
                >
                  <UIcon :name="jsonExpanded ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'" class="w-3.5 h-3.5" />
                  {{ jsonExpanded ? (locale === 'ar' ? 'طي' : 'Collapse') : (locale === 'ar' ? 'عرض' : 'Expand') }}
                </button>
              </div>
              <pre
                v-if="jsonExpanded"
                class="text-xs text-neutral-700 dark:text-neutral-200 bg-neutral-50/60 dark:bg-neutral-950/40 rounded-lg p-3 overflow-auto max-h-96 leading-relaxed"
                dir="ltr"
              >{{ JSON.stringify(doc.eta_response || doc.document_data, null, 2) }}</pre>
            </div>
          </div>

          <!-- Timeline -->
          <div>
            <div class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
              <h3 class="text-sm font-semibold text-neutral-900 dark:text-neutral-0 mb-4 flex items-center gap-1.5">
                <UIcon name="i-lucide-list-checks" class="w-3.5 h-3.5 text-neutral-400" />
                {{ locale === 'ar' ? 'المراحل' : 'Timeline' }}
              </h3>
              <ol class="space-y-3">
                <li v-for="step in timeline" :key="step.label" class="flex items-start gap-3">
                  <div
                    class="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1.5"
                    :class="step.active
                      ? 'bg-success-500 dark:bg-success-400'
                      : 'bg-neutral-200 dark:bg-neutral-700'"
                  ></div>
                  <div class="min-w-0">
                    <p
                      class="text-sm"
                      :class="step.active
                        ? 'font-medium text-neutral-900 dark:text-neutral-0'
                        : 'text-neutral-500 dark:text-neutral-400'"
                    >
                      {{ step.label }}
                    </p>
                    <p v-if="step.date" class="text-[10px] text-neutral-500 dark:text-neutral-400 tabular-nums" dir="ltr">{{ step.date }}</p>
                  </div>
                </li>
              </ol>
            </div>
          </div>
        </div>

        <!-- Cancel modal -->
        <UiConfirmModal
          v-model="cancelOpen"
          :title="locale === 'ar' ? 'إلغاء المستند' : 'Cancel Document'"
          :description="locale === 'ar' ? 'سيتم إلغاء المستند في مصلحة الضرائب ولا يمكن التراجع.' : 'This will cancel the document at ETA and cannot be undone.'"
          icon="i-lucide-alert-triangle"
          variant="danger"
          :confirm-label="locale === 'ar' ? 'إلغاء المستند' : 'Cancel Document'"
          :loading="actionLoading"
          @confirm="handleCancel"
        />
      </template>
    </div>
  </FeatureBoundary>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })
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
    }, 30000)
  }
})

onMounted(loadDoc)
onUnmounted(() => { if (pollInterval) clearInterval(pollInterval) })
</script>

<style scoped>
@reference "~/assets/css/tokens.css";

.eta-back {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-neutral-200);
  background-color: var(--color-neutral-0, #fff);
  color: var(--color-neutral-500);
  transition: color 150ms var(--ease-standard), border-color 150ms var(--ease-standard);
}
.eta-back:hover {
  color: var(--color-neutral-900);
  border-color: var(--color-neutral-300);
}
:global(html.dark) .eta-back {
  background-color: var(--color-neutral-900);
  border-color: var(--color-neutral-800);
  color: var(--color-neutral-400);
}
:global(html.dark) .eta-back:hover {
  color: var(--color-neutral-0);
  border-color: var(--color-neutral-700);
}
</style>
