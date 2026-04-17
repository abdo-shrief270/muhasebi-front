<template>
  <div>
    <NuxtLayout name="portal">
      <UiPageHeader :title="locale === 'ar' ? 'مرحباً' : 'Welcome'" :subtitle="authStore.user?.name" />

      <div v-if="loading"><UiLoadingSkeleton :lines="4" :height="80" /></div>

      <div v-else class="space-y-6">
        <!-- KPIs -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
          <UiKpiCard
            :label="locale === 'ar' ? 'المستحقات' : 'Outstanding Balance'"
            :value="data?.outstanding_balance || 0"
            icon="&#9670;"
            color="orange"
            format="currency"
            :delay="100"
          />
          <UiKpiCard
            :label="locale === 'ar' ? 'فواتير متأخرة' : 'Overdue Invoices'"
            :value="data?.overdue_invoices_count || 0"
            icon="&#9888;"
            color="red"
            :delay="200"
          />
          <UiKpiCard
            :label="locale === 'ar' ? 'إشعارات' : 'Notifications'"
            :value="data?.unread_notifications_count || 0"
            icon="&#128276;"
            color="secondary"
            :delay="300"
          />
        </div>

        <!-- Recent invoices -->
        <div v-motion :initial="{ opacity: 0, y: 15 }" :enter="{ opacity: 1, y: 0, transition: { delay: 400 } }" class="bg-white rounded-2xl border border-gray-100/80 overflow-hidden">
          <div class="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <h3 class="font-semibold text-gray-700">{{ locale === 'ar' ? 'آخر الفواتير' : 'Recent Invoices' }}</h3>
            <NuxtLink to="/portal/invoices" class="text-sm text-secondary-400">{{ locale === 'ar' ? 'عرض الكل' : 'View all' }}</NuxtLink>
          </div>
          <div v-if="data?.recent_invoices?.length" class="divide-y divide-gray-50">
            <div v-for="inv in data.recent_invoices" :key="inv.id" class="px-5 py-3 flex items-center justify-between hover:bg-gray-50/30 transition-colors">
              <div>
                <span class="font-mono text-xs text-primary-500 me-2">{{ inv.invoice_number }}</span>
                <span class="text-sm text-gray-600">{{ inv.date }}</span>
              </div>
              <div class="flex items-center gap-3">
                <span class="font-mono text-sm font-medium" dir="ltr">{{ Number(inv.total).toLocaleString() }}</span>
                <UiBadge :color="inv.status === 'paid' ? 'green' : inv.status === 'sent' ? 'blue' : 'orange'">{{ inv.status }}</UiBadge>
              </div>
            </div>
          </div>
          <div v-else class="p-8"><UiEmptyState icon="&#9993;" :title="locale === 'ar' ? 'لا توجد فواتير' : 'No invoices'" /></div>
        </div>
      </div>
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })
const { locale } = useI18n()
const authStore = useAuthStore()
const api = useApi()

const data = ref<any>(null)
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await api.get<{ data: any }>('/portal/dashboard')
    data.value = res.data
  } catch { /* ignore */ }
  finally { loading.value = false }
})
</script>
