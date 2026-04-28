<template>
  <FeatureBoundary id="eta">
    <div class="px-4 lg:px-6 py-5 max-w-[1400px] mx-auto">
      <UiPageHeader
        icon="i-lucide-file-badge"
        :title="$t('nav.eta')"
        :subtitle="locale === 'ar' ? 'الفوترة الإلكترونية - مصلحة الضرائب المصرية' : 'Egyptian Tax Authority E-Invoicing'"
      />

      <!-- Nav cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <NuxtLink
          v-for="card in navCards"
          :key="card.to"
          :to="card.to"
          class="group bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 hover:border-primary-300 dark:hover:border-primary-700 transition-colors"
        >
          <div
            class="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
            :class="card.iconBg"
          >
            <UIcon :name="card.icon" class="w-5 h-5" :class="card.iconColor" />
          </div>
          <h3 class="text-sm font-semibold text-neutral-900 dark:text-neutral-0 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            {{ card.title }}
          </h3>
          <p class="text-xs text-neutral-500 dark:text-neutral-400 mt-1">{{ card.description }}</p>
        </NuxtLink>
      </div>

      <!-- Recent documents -->
      <div class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        <div class="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <h3 class="text-sm font-semibold text-neutral-900 dark:text-neutral-0 flex items-center gap-1.5">
            <UIcon name="i-lucide-clock" class="w-3.5 h-3.5 text-neutral-400" />
            {{ locale === 'ar' ? 'آخر المستندات' : 'Recent Documents' }}
          </h3>
          <NuxtLink
            to="/eta/documents"
            class="inline-flex items-center gap-1 text-xs font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
          >
            {{ locale === 'ar' ? 'عرض الكل' : 'View all' }}
            <UIcon name="i-lucide-arrow-right" class="w-3 h-3 rtl:rotate-180" />
          </NuxtLink>
        </div>

        <div v-if="docsLoading" class="p-4">
          <UiLoadingSkeleton :lines="4" :height="20" />
        </div>

        <table v-else-if="recentDocs.length > 0" class="w-full text-sm">
          <tbody class="divide-y divide-neutral-100 dark:divide-neutral-800/60">
            <tr
              v-for="doc in recentDocs"
              :key="doc.id"
              class="hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40 transition-colors cursor-pointer"
              @click="navigateTo(`/eta/documents/${doc.invoice_id}`)"
            >
              <td class="px-4 py-2.5 font-mono text-xs font-semibold text-primary-700 dark:text-primary-400">{{ doc.internal_id }}</td>
              <td class="px-4 py-2.5 text-sm text-neutral-700 dark:text-neutral-200">
                {{ doc.document_type === 'I' ? (locale === 'ar' ? 'فاتورة' : 'Invoice') : doc.document_type }}
              </td>
              <td class="px-4 py-2.5">
                <UiBadge :color="doc.status_color" dot>{{ locale === 'ar' ? doc.status_label_ar : doc.status_label }}</UiBadge>
              </td>
              <td class="px-4 py-2.5 text-xs text-neutral-500 dark:text-neutral-400 tabular-nums" dir="ltr">
                {{ doc.created_at ? new Date(doc.created_at).toLocaleDateString() : '' }}
              </td>
            </tr>
          </tbody>
        </table>

        <div v-else class="p-12 text-center">
          <div class="w-12 h-12 mx-auto mb-3 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
            <UIcon name="i-lucide-file-badge" class="w-5 h-5 text-neutral-400" />
          </div>
          <p class="text-sm font-semibold text-neutral-900 dark:text-neutral-0 mb-1">
            {{ locale === 'ar' ? 'لا توجد مستندات' : 'No documents yet' }}
          </p>
          <p class="text-xs text-neutral-500 dark:text-neutral-400 max-w-md mx-auto">
            {{ locale === 'ar' ? 'الفواتير المُعدّة للإرسال لمصلحة الضرائب ستظهر هنا.' : 'Invoices prepared for ETA submission will appear here.' }}
          </p>
        </div>
      </div>
    </div>
  </FeatureBoundary>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })
const { locale } = useI18n()
const { getDocuments } = useEta()

const recentDocs = ref<any[]>([])
const docsLoading = ref(true)

const navCards = computed(() => [
  {
    to: '/eta/settings',
    icon: 'i-lucide-settings-2',
    iconBg: 'bg-primary-50 dark:bg-primary-500/10',
    iconColor: 'text-primary-600 dark:text-primary-400',
    title: locale.value === 'ar' ? 'الإعدادات' : 'Settings',
    description: locale.value === 'ar' ? 'بيانات الاعتماد والفرع' : 'Credentials & branch info',
  },
  {
    to: '/eta/documents',
    icon: 'i-lucide-files',
    iconBg: 'bg-info-50 dark:bg-info-500/10',
    iconColor: 'text-info-600 dark:text-info-400',
    title: locale.value === 'ar' ? 'المستندات' : 'Documents',
    description: locale.value === 'ar' ? 'إدارة المستندات الإلكترونية' : 'Manage e-documents',
  },
  {
    to: '/eta/item-codes',
    icon: 'i-lucide-barcode',
    iconBg: 'bg-success-50 dark:bg-success-500/10',
    iconColor: 'text-success-600 dark:text-success-400',
    title: locale.value === 'ar' ? 'أكواد الأصناف' : 'Item Codes',
    description: locale.value === 'ar' ? 'أكواد GS1/EGS' : 'GS1/EGS codes',
  },
  {
    to: '/eta/reconcile',
    icon: 'i-lucide-refresh-cw',
    iconBg: 'bg-warning-50 dark:bg-warning-500/10',
    iconColor: 'text-warning-600 dark:text-warning-400',
    title: locale.value === 'ar' ? 'المطابقة' : 'Reconciliation',
    description: locale.value === 'ar' ? 'مقارنة مع مصلحة الضرائب' : 'Compare with ETA records',
  },
])

onMounted(async () => {
  try {
    const data = await getDocuments({ per_page: 5 })
    recentDocs.value = data.data
  } catch { /* ignore */ }
  finally { docsLoading.value = false }
})
</script>
