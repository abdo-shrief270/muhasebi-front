<template>
  <div>
    <NuxtLayout name="dashboard">
      <FeatureBoundary id="dashboard">
      <UiPageHeader
        :title="$t('nav.dashboard')"
        :subtitle="greeting"
      />

      <!-- Onboarding banner -->
      <div
        v-if="dashboard.data.value && !dashboard.data.value.onboarding.completed"
        v-motion
        :initial="{ opacity: 0, y: -10 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: 50 } }"
        class="mb-8 bg-gradient-to-r from-secondary-400 to-primary-500 rounded-2xl p-6 text-white"
      >
        <div class="flex items-center justify-between">
          <div>
            <h3 class="font-bold text-lg mb-1">
              {{ locale === 'ar' ? 'أكمل إعداد حسابك' : 'Complete your setup' }}
            </h3>
            <p class="text-white/80 text-sm">
              {{ locale === 'ar' ? 'أنت على بعد خطوات قليلة من البدء' : "You're a few steps away from getting started" }}
            </p>
          </div>
          <div class="flex items-center gap-3">
            <div class="text-right">
              <span class="text-2xl font-bold">{{ dashboard.data.value.onboarding.percent }}%</span>
            </div>
            <NuxtLink
              to="/onboarding"
              class="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl text-sm font-semibold transition"
            >
              {{ locale === 'ar' ? 'إكمال الإعداد' : 'Continue Setup' }}
            </NuxtLink>
          </div>
        </div>

        <!-- Progress bar -->
        <div class="mt-4 bg-white/20 rounded-full h-2 overflow-hidden">
          <div
            class="bg-white rounded-full h-2 transition-all duration-1000 ease-out"
            :style="{ width: dashboard.data.value.onboarding.percent + '%' }"
          ></div>
        </div>
      </div>

      <!-- KPI Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <UiKpiCard
          :label="$t('nav.clients')"
          :value="dashboard.data.value?.clients.total ?? 0"
          icon="◉"
          color="primary"
          :subtitle="addedLabel"
          :loading="dashboard.loading.value"
          :delay="100"
        />
        <UiKpiCard
          :label="locale === 'ar' ? 'فواتير مستحقة' : 'Outstanding Invoices'"
          :value="dashboard.data.value?.invoices.outstanding ?? 0"
          icon="◊"
          color="orange"
          :subtitle="outstandingLabel"
          :loading="dashboard.loading.value"
          :delay="200"
        />
        <UiKpiCard
          :label="locale === 'ar' ? 'إيرادات الشهر' : 'Revenue this month'"
          :value="dashboard.data.value?.invoices.revenue_this_month ?? 0"
          icon="▲"
          color="green"
          format="currency"
          :subtitle="locale === 'ar' ? 'ج.م.' : 'EGP'"
          :loading="dashboard.loading.value"
          :delay="300"
        />
        <UiKpiCard
          :label="locale === 'ar' ? 'مدفوعات الشهر' : 'Payments this month'"
          :value="dashboard.data.value?.payments.received_this_month ?? 0"
          icon="✦"
          color="secondary"
          format="currency"
          :subtitle="`${dashboard.data.value?.payments.count_this_month ?? 0} ${locale === 'ar' ? 'دفعة' : 'payments'}`"
          :loading="dashboard.loading.value"
          :delay="400"
        />
      </div>

      <!-- Reorderable widgets -->
      <div class="space-y-5">
        <template v-for="widgetId in widgetOrder" :key="widgetId">
          <!-- Quick Overview + Subscription row -->
          <div v-if="widgetId === 'overview'" class="grid grid-cols-1 lg:grid-cols-3 gap-5 group/widget relative" draggable="true" @dragstart="onDragStart($event, widgetId)" @dragover.prevent @drop="onDrop($event, widgetId)">
            <div class="absolute -top-2 right-2 opacity-0 group-hover/widget:opacity-100 transition cursor-grab text-gray-300 text-xs z-10" :title="locale === 'ar' ? 'اسحب لإعادة الترتيب' : 'Drag to reorder'">⠿</div>
            <!-- Quick stats -->
            <div
              v-motion
              :initial="{ opacity: 0, y: 20 }"
              :enter="{ opacity: 1, y: 0, transition: { delay: 500 } }"
              class="lg:col-span-2 bg-white rounded-2xl border border-gray-100/80 p-6"
            >
              <h3 class="font-semibold text-gray-700 mb-4">
                {{ locale === 'ar' ? 'نظرة سريعة' : 'Quick Overview' }}
              </h3>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div class="text-center p-4 bg-gray-50/50 rounded-xl">
                  <p class="text-2xl font-bold text-primary-500">{{ dashboard.data.value?.journal_entries.total ?? 0 }}</p>
                  <p class="text-xs text-gray-400 mt-1">{{ locale === 'ar' ? 'إجمالي القيود' : 'Total Entries' }}</p>
                </div>
                <div class="text-center p-4 bg-gray-50/50 rounded-xl">
                  <p class="text-2xl font-bold text-secondary-400">{{ dashboard.data.value?.journal_entries.this_month ?? 0 }}</p>
                  <p class="text-xs text-gray-400 mt-1">{{ locale === 'ar' ? 'قيود الشهر' : 'This Month' }}</p>
                </div>
                <div class="text-center p-4 bg-gray-50/50 rounded-xl">
                  <p class="text-2xl font-bold text-amber-500">{{ dashboard.data.value?.invoices.overdue ?? 0 }}</p>
                  <p class="text-xs text-gray-400 mt-1">{{ locale === 'ar' ? 'متأخرة' : 'Overdue' }}</p>
                </div>
                <div class="text-center p-4 bg-gray-50/50 rounded-xl">
                  <p class="text-2xl font-bold text-emerald-600">{{ dashboard.data.value?.invoices.paid_this_month ?? 0 }}</p>
                  <p class="text-xs text-gray-400 mt-1">{{ locale === 'ar' ? 'مدفوعة الشهر' : 'Paid This Month' }}</p>
                </div>
              </div>
            </div>

            <!-- Subscription status -->
            <div
              v-motion
              :initial="{ opacity: 0, y: 20 }"
              :enter="{ opacity: 1, y: 0, transition: { delay: 600 } }"
              class="bg-white rounded-2xl border border-gray-100/80 p-6"
            >
              <h3 class="font-semibold text-gray-700 mb-4">
                {{ $t('nav.subscription') }}
              </h3>
              <template v-if="dashboard.data.value?.subscription.plan_name">
                <p class="text-lg font-bold text-primary-500 mb-2">
                  {{ dashboard.data.value.subscription.plan_name }}
                </p>
                <UiBadge :color="dashboard.data.value.subscription.status === 'نشط' ? 'green' : 'blue'" dot>
                  {{ dashboard.data.value.subscription.status }}
                </UiBadge>
                <p
                  v-if="dashboard.data.value.subscription.trial_days_remaining !== null"
                  class="text-sm text-amber-500 mt-3"
                >
                  {{ locale === 'ar' ? `متبقي ${dashboard.data.value.subscription.trial_days_remaining} يوم` : `${dashboard.data.value.subscription.trial_days_remaining} days remaining` }}
                </p>
              </template>
              <template v-else>
                <p class="text-gray-400 text-sm">
                  {{ locale === 'ar' ? 'لا يوجد اشتراك نشط' : 'No active subscription' }}
                </p>
              </template>
            </div>
          </div>

          <!-- Recent Activity -->
          <div v-else-if="widgetId === 'activity'" class="group/widget relative" draggable="true" @dragstart="onDragStart($event, widgetId)" @dragover.prevent @drop="onDrop($event, widgetId)">
            <div class="absolute -top-2 right-2 opacity-0 group-hover/widget:opacity-100 transition cursor-grab text-gray-300 text-xs z-10" :title="locale === 'ar' ? 'اسحب لإعادة الترتيب' : 'Drag to reorder'">⠿</div>
            <div
              v-motion
              :initial="{ opacity: 0, y: 20 }"
              :enter="{ opacity: 1, y: 0, transition: { delay: 700 } }"
              class="bg-white rounded-2xl border border-gray-100/80 p-6"
            >
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-gray-700">
            {{ locale === 'ar' ? 'النشاط الأخير' : 'Recent Activity' }}
          </h3>
          <NuxtLink
            to="/notifications"
            class="text-xs text-secondary-400 hover:text-secondary-500 font-medium transition"
          >
            {{ locale === 'ar' ? 'عرض الكل' : 'View all' }}
          </NuxtLink>
        </div>

        <!-- Loading state -->
        <div v-if="activityLoading" class="space-y-3">
          <div v-for="i in 5" :key="i" class="flex items-start gap-3 animate-pulse">
            <div class="w-2 h-2 mt-2 rounded-full bg-gray-200 flex-shrink-0"></div>
            <div class="flex-1">
              <div class="h-3.5 bg-gray-100 rounded w-3/4 mb-1.5"></div>
              <div class="h-2.5 bg-gray-50 rounded w-1/4"></div>
            </div>
          </div>
        </div>

        <!-- Activity list -->
        <div v-else-if="recentActivity.length > 0" class="space-y-1">
          <div
            v-for="(item, idx) in recentActivity"
            :key="item.id"
            v-motion
            :initial="{ opacity: 0, x: locale === 'ar' ? 10 : -10 }"
            :enter="{ opacity: 1, x: 0, transition: { delay: 750 + idx * 60 } }"
            class="flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50/60 transition-colors group"
          >
            <span
              class="w-2 h-2 mt-2 rounded-full flex-shrink-0"
              :class="item.is_read ? 'bg-gray-200' : 'bg-secondary-400'"
            ></span>
            <div class="flex-1 min-w-0">
              <p class="text-sm text-gray-700 leading-snug">
                {{ locale === 'ar' ? item.title_ar : item.title_en }}
              </p>
              <p
                v-if="locale === 'ar' ? item.body_ar : item.body_en"
                class="text-xs text-gray-400 mt-0.5 line-clamp-1"
              >
                {{ locale === 'ar' ? item.body_ar : item.body_en }}
              </p>
            </div>
            <span class="text-[10px] text-gray-300 whitespace-nowrap mt-0.5">
              {{ timeAgo(item.created_at) }}
            </span>
          </div>
        </div>

        <!-- Empty state -->
        <div v-else class="py-8 text-center text-gray-300 text-sm">
          {{ locale === 'ar' ? 'لا يوجد نشاط حديث' : 'No recent activity' }}
        </div>
      </div>
          </div>
        </template>
      </div>
      </FeatureBoundary>
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  
  layout: false,
})

const { locale } = useI18n()
const authStore = useAuthStore()
const dashboard = useDashboard()
const api = useApi()

// Widget reordering
const defaultOrder = ['overview', 'activity']
const widgetOrder = ref<string[]>([...defaultOrder])
let draggedWidget = ''

if (import.meta.client) {
  const saved = localStorage.getItem('dashboard_widget_order')
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed) && parsed.length === defaultOrder.length) {
        widgetOrder.value = parsed
      }
    } catch {}
  }
}

function onDragStart(e: DragEvent, widgetId: string) {
  draggedWidget = widgetId
  if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move'
}

function onDrop(_e: DragEvent, targetId: string) {
  if (!draggedWidget || draggedWidget === targetId) return
  const fromIdx = widgetOrder.value.indexOf(draggedWidget)
  const toIdx = widgetOrder.value.indexOf(targetId)
  if (fromIdx === -1 || toIdx === -1) return
  widgetOrder.value.splice(fromIdx, 1)
  widgetOrder.value.splice(toIdx, 0, draggedWidget)
  draggedWidget = ''
  if (import.meta.client) {
    localStorage.setItem('dashboard_widget_order', JSON.stringify(widgetOrder.value))
  }
}

interface ActivityItem {
  id: string
  type: string
  title_ar: string
  title_en: string
  body_ar: string | null
  body_en: string | null
  is_read: boolean
  created_at: string
}

const recentActivity = ref<ActivityItem[]>([])
const activityLoading = ref(true)

async function fetchActivity() {
  activityLoading.value = true
  try {
    const data = await api.get<{ data: ActivityItem[] }>('/notifications?per_page=5')
    recentActivity.value = data.data
  } catch {
    // Silently fail
  } finally {
    activityLoading.value = false
  }
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return locale.value === 'ar' ? 'الآن' : 'just now'
  if (mins < 60) return locale.value === 'ar' ? `منذ ${mins} دقيقة` : `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return locale.value === 'ar' ? `منذ ${hours} ساعة` : `${hours}h ago`
  const days = Math.floor(hours / 24)
  return locale.value === 'ar' ? `منذ ${days} يوم` : `${days}d ago`
}

onMounted(() => {
  dashboard.fetch()
  fetchActivity()
})

const greeting = computed(() => {
  const name = authStore.user?.name || ''
  return locale.value === 'ar'
    ? `مرحباً ${name}`
    : `Welcome, ${name}`
})

const addedLabel = computed(() => {
  const count = dashboard.data.value?.clients.added_this_month ?? 0
  return locale.value === 'ar'
    ? `+${count} هذا الشهر`
    : `+${count} this month`
})

const outstandingLabel = computed(() => {
  const amount = dashboard.data.value?.invoices.outstanding_amount ?? 0
  return `${Number(amount).toLocaleString()} ${locale.value === 'ar' ? 'ج.م.' : 'EGP'}`
})
</script>
