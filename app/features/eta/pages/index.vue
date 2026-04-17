<template>
  <div>
    <NuxtLayout name="dashboard">
      <FeatureBoundary id="eta">
      <UiPageHeader :title="$t('nav.eta')" :subtitle="locale === 'ar' ? 'إدارة الفوترة الإلكترونية - مصلحة الضرائب' : 'Egyptian Tax Authority E-Invoicing'" />

      <!-- Quick stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
        <NuxtLink
          v-for="(card, i) in navCards"
          :key="card.to"
          :to="card.to"
          v-motion
          :initial="{ opacity: 0, y: 20 }"
          :enter="{ opacity: 1, y: 0, transition: { delay: i * 80 } }"
          class="bg-white rounded-2xl border border-gray-100/80 p-6 card-hover group"
        >
          <div class="w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-3" :class="card.iconBg">
            {{ card.icon }}
          </div>
          <h3 class="font-semibold text-gray-800 group-hover:text-primary-500 transition-colors">{{ card.title }}</h3>
          <p class="text-xs text-gray-400 mt-1">{{ card.description }}</p>
        </NuxtLink>
      </div>

      <!-- Recent documents -->
      <div v-motion :initial="{ opacity: 0, y: 15 }" :enter="{ opacity: 1, y: 0, transition: { delay: 300 } }" class="bg-white rounded-2xl border border-gray-100/80 overflow-hidden">
        <div class="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
          <h3 class="font-semibold text-gray-700">{{ locale === 'ar' ? 'آخر المستندات' : 'Recent Documents' }}</h3>
          <NuxtLink to="/eta/documents" class="text-sm text-secondary-400 hover:text-secondary-500">
            {{ locale === 'ar' ? 'عرض الكل' : 'View all' }}
          </NuxtLink>
        </div>

        <div v-if="docsLoading" class="p-6"><UiLoadingSkeleton :lines="4" :height="20" /></div>

        <table v-else-if="recentDocs.length > 0" class="w-full text-sm">
          <tbody>
            <tr v-for="doc in recentDocs" :key="doc.id" class="border-b border-gray-50 hover:bg-gray-50/30 transition-colors">
              <td class="px-5 py-3 font-mono text-xs text-primary-500">{{ doc.internal_id }}</td>
              <td class="px-5 py-3 text-gray-500">{{ doc.document_type === 'I' ? (locale === 'ar' ? 'فاتورة' : 'Invoice') : doc.document_type }}</td>
              <td class="px-5 py-3">
                <UiBadge :color="doc.status_color" dot>{{ locale === 'ar' ? doc.status_label_ar : doc.status_label }}</UiBadge>
              </td>
              <td class="px-5 py-3 text-xs text-gray-400">{{ doc.created_at ? new Date(doc.created_at).toLocaleDateString() : '' }}</td>
            </tr>
          </tbody>
        </table>

        <div v-else class="p-8">
          <UiEmptyState icon="&#11041;" :title="locale === 'ar' ? 'لا توجد مستندات' : 'No documents yet'" />
        </div>
      </div>
      </FeatureBoundary>
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })
const { locale } = useI18n()
const { getDocuments } = useEta()

const recentDocs = ref<any[]>([])
const docsLoading = ref(true)

const navCards = computed(() => [
  {
    to: '/eta/settings',
    icon: '&#9881;',
    iconBg: 'bg-primary-50 text-primary-400',
    title: locale.value === 'ar' ? 'الإعدادات' : 'Settings',
    description: locale.value === 'ar' ? 'بيانات الاعتماد والفرع' : 'Credentials & branch info',
  },
  {
    to: '/eta/documents',
    icon: '&#9993;',
    iconBg: 'bg-blue-50 text-blue-500',
    title: locale.value === 'ar' ? 'المستندات' : 'Documents',
    description: locale.value === 'ar' ? 'إدارة المستندات الإلكترونية' : 'Manage e-documents',
  },
  {
    to: '/eta/item-codes',
    icon: '&#9776;',
    iconBg: 'bg-emerald-50 text-emerald-500',
    title: locale.value === 'ar' ? 'أكواد الأصناف' : 'Item Codes',
    description: locale.value === 'ar' ? 'أكواد GS1/EGS' : 'GS1/EGS codes',
  },
  {
    to: '/eta/reconcile',
    icon: '&#128260;',
    iconBg: 'bg-amber-50 text-amber-500',
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
