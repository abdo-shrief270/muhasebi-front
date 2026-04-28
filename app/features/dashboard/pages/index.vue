<template>
    <FeatureBoundary id="dashboard">
      <div class="px-4 lg:px-6 py-5 max-w-[1400px] mx-auto">
        <!-- Page header -->
        <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
          <div>
            <h1 class="text-xl font-bold text-neutral-900 dark:text-neutral-0 tracking-tight">
              {{ greeting }}
            </h1>
            <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              {{ subtitleLabel }}
            </p>
          </div>
          <div class="flex items-center gap-2">
            <button
              type="button"
              class="h-8 px-3 inline-flex items-center gap-1.5 rounded-md border border-neutral-200 dark:border-neutral-800 bg-neutral-0 dark:bg-neutral-900 text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-0 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
              @click="refresh"
            >
              <UIcon name="i-lucide-refresh-cw" class="w-3.5 h-3.5" :class="refreshing ? 'animate-spin' : ''" />
              {{ locale === 'ar' ? 'تحديث' : 'Refresh' }}
            </button>
            <NuxtLink
              to="/reports"
              class="h-8 px-3 inline-flex items-center gap-1.5 rounded-md bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold transition-colors shadow-sm"
            >
              <UIcon name="i-lucide-bar-chart-3" class="w-3.5 h-3.5" />
              {{ locale === 'ar' ? 'التقارير' : 'Reports' }}
            </NuxtLink>
          </div>
        </div>

        <!-- Onboarding banner -->
        <div
          v-if="dashboard.data.value && !dashboard.data.value.onboarding.completed"
          v-motion
          :initial="{ opacity: 0, y: -8 }"
          :enter="{ opacity: 1, y: 0, transition: { delay: 50 } }"
          class="relative overflow-hidden mb-6 rounded-xl border border-primary-500/20 bg-primary-500/5 dark:bg-primary-500/10 p-5"
        >
          <div
            class="absolute inset-y-0 end-0 w-64 opacity-30 pointer-events-none"
            :style="{ background: `radial-gradient(ellipse at right, ${secondaryColor}, transparent 60%)` }"
          />
          <div class="relative flex items-center justify-between gap-4">
            <div class="flex items-start gap-3 min-w-0">
              <div class="w-9 h-9 rounded-md bg-primary-500/15 flex items-center justify-center flex-shrink-0">
                <UIcon name="i-lucide-rocket" class="w-4 h-4 text-primary-600 dark:text-primary-400" />
              </div>
              <div class="min-w-0">
                <h3 class="text-sm font-semibold text-neutral-900 dark:text-neutral-0">
                  {{ locale === 'ar' ? 'أكمل إعداد حسابك' : 'Finish setting up your workspace' }}
                </h3>
                <p class="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  {{ locale === 'ar' ? 'أنت على بعد خطوات قليلة من البدء.' : "You're a few steps away from getting started." }}
                </p>
              </div>
            </div>
            <div class="flex items-center gap-3 flex-shrink-0">
              <div class="hidden sm:flex flex-col items-end leading-tight">
                <span class="text-xl font-bold tabular-nums text-primary-600 dark:text-primary-400">
                  {{ dashboard.data.value.onboarding.percent }}%
                </span>
                <span class="text-[10px] text-neutral-400">{{ locale === 'ar' ? 'مكتمل' : 'complete' }}</span>
              </div>
              <NuxtLink
                to="/onboarding"
                class="h-8 px-3 inline-flex items-center gap-1.5 rounded-md bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold transition-colors shadow-sm"
              >
                {{ locale === 'ar' ? 'متابعة' : 'Continue' }}
                <UIcon name="i-lucide-arrow-right" class="w-3.5 h-3.5 rtl:rotate-180" />
              </NuxtLink>
            </div>
          </div>
          <div class="relative mt-3 h-1 bg-primary-500/15 rounded-full overflow-hidden">
            <div
              class="h-full bg-primary-500 rounded-full transition-all duration-700 ease-out"
              :style="{ width: dashboard.data.value.onboarding.percent + '%' }"
            />
          </div>
        </div>

        <!-- KPI cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <UiKpiCard
            :label="$t('nav.clients')"
            :value="dashboard.data.value?.clients.total ?? 0"
            icon="i-lucide-users"
            color="primary"
            :subtitle="addedLabel"
            :loading="dashboard.loading.value"
            :delay="100"
          />
          <UiKpiCard
            :label="locale === 'ar' ? 'فواتير مستحقة' : 'Outstanding Invoices'"
            :value="dashboard.data.value?.invoices.outstanding ?? 0"
            icon="i-lucide-file-clock"
            color="orange"
            :subtitle="outstandingLabel"
            :loading="dashboard.loading.value"
            :delay="180"
          />
          <UiKpiCard
            :label="locale === 'ar' ? 'إيرادات الشهر' : 'Revenue this month'"
            :value="dashboard.data.value?.invoices.revenue_this_month ?? 0"
            icon="i-lucide-trending-up"
            color="green"
            format="currency"
            :subtitle="locale === 'ar' ? 'ج.م.' : 'EGP'"
            :loading="dashboard.loading.value"
            :delay="260"
          />
          <UiKpiCard
            :label="locale === 'ar' ? 'مدفوعات الشهر' : 'Payments this month'"
            :value="dashboard.data.value?.payments.received_this_month ?? 0"
            icon="i-lucide-wallet"
            color="secondary"
            format="currency"
            :subtitle="`${dashboard.data.value?.payments.count_this_month ?? 0} ${locale === 'ar' ? 'دفعة' : 'payments'}`"
            :loading="dashboard.loading.value"
            :delay="340"
          />
        </div>

        <!-- Reorderable widgets -->
        <div class="space-y-5">
          <template v-for="widgetId in widgetOrder" :key="widgetId">
            <!-- Quick Overview + Subscription row -->
            <div
              v-if="widgetId === 'overview'"
              class="grid grid-cols-1 lg:grid-cols-3 gap-4 group/widget relative"
              draggable="true"
              @dragstart="onDragStart($event, widgetId)"
              @dragover.prevent
              @drop="onDrop($event, widgetId)"
            >
              <button
                type="button"
                class="absolute -top-2 end-2 z-10 w-6 h-6 inline-flex items-center justify-center rounded-sm bg-neutral-100 dark:bg-neutral-800 text-neutral-400 opacity-0 group-hover/widget:opacity-100 cursor-grab transition-opacity"
                :title="locale === 'ar' ? 'اسحب لإعادة الترتيب' : 'Drag to reorder'"
                tabindex="-1"
              >
                <UIcon name="i-lucide-grip-vertical" class="w-3.5 h-3.5" />
              </button>

              <!-- Quick stats -->
              <div
                v-motion
                :initial="{ opacity: 0, y: 16 }"
                :enter="{ opacity: 1, y: 0, transition: { delay: 420 } }"
                class="lg:col-span-2 bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5"
              >
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-sm font-semibold text-neutral-900 dark:text-neutral-0">
                    {{ locale === 'ar' ? 'نظرة سريعة' : 'Quick Overview' }}
                  </h3>
                  <span class="text-[10px] uppercase tracking-wider text-neutral-400">
                    {{ locale === 'ar' ? 'هذا الشهر' : 'This month' }}
                  </span>
                </div>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <StatTile
                    :label="locale === 'ar' ? 'إجمالي القيود' : 'Total entries'"
                    :value="dashboard.data.value?.journal_entries.total ?? 0"
                    icon="i-lucide-book-open"
                    color="primary"
                  />
                  <StatTile
                    :label="locale === 'ar' ? 'قيود الشهر' : 'This month'"
                    :value="dashboard.data.value?.journal_entries.this_month ?? 0"
                    icon="i-lucide-calendar"
                    color="info"
                  />
                  <StatTile
                    :label="locale === 'ar' ? 'متأخرة' : 'Overdue'"
                    :value="dashboard.data.value?.invoices.overdue ?? 0"
                    icon="i-lucide-alert-triangle"
                    color="warning"
                  />
                  <StatTile
                    :label="locale === 'ar' ? 'مدفوعة' : 'Paid'"
                    :value="dashboard.data.value?.invoices.paid_this_month ?? 0"
                    icon="i-lucide-check-circle-2"
                    color="success"
                  />
                </div>
              </div>

              <!-- Subscription status -->
              <div
                v-motion
                :initial="{ opacity: 0, y: 16 }"
                :enter="{ opacity: 1, y: 0, transition: { delay: 500 } }"
                class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5 flex flex-col"
              >
                <div class="flex items-center justify-between mb-3">
                  <h3 class="text-sm font-semibold text-neutral-900 dark:text-neutral-0">
                    {{ $t('nav.subscription') }}
                  </h3>
                  <UIcon name="i-lucide-crown" class="w-4 h-4 text-warning-500" />
                </div>
                <template v-if="dashboard.data.value?.subscription.plan_name">
                  <p class="text-lg font-bold text-neutral-900 dark:text-neutral-0 mb-2 truncate">
                    {{ dashboard.data.value.subscription.plan_name }}
                  </p>
                  <div class="flex items-center gap-2 mb-auto">
                    <span
                      class="inline-flex items-center gap-1 px-2 h-5 rounded-sm text-[10px] font-semibold uppercase tracking-wider"
                      :class="dashboard.data.value.subscription.status === 'نشط' ? 'bg-success-500/10 text-success-700 dark:text-success-400' : 'bg-info-500/10 text-info-700 dark:text-info-400'"
                    >
                      <span class="w-1.5 h-1.5 rounded-full bg-current" />
                      {{ dashboard.data.value.subscription.status }}
                    </span>
                  </div>
                  <p
                    v-if="dashboard.data.value.subscription.trial_days_remaining !== null"
                    class="text-xs text-warning-600 dark:text-warning-500 mt-3 flex items-center gap-1.5"
                  >
                    <UIcon name="i-lucide-clock" class="w-3.5 h-3.5" />
                    {{ locale === 'ar' ? `متبقي ${dashboard.data.value.subscription.trial_days_remaining} يوم` : `${dashboard.data.value.subscription.trial_days_remaining} days remaining` }}
                  </p>
                  <NuxtLink
                    to="/subscription"
                    class="mt-4 text-xs font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 inline-flex items-center gap-1"
                  >
                    {{ locale === 'ar' ? 'إدارة الاشتراك' : 'Manage subscription' }}
                    <UIcon name="i-lucide-arrow-right" class="w-3 h-3 rtl:rotate-180" />
                  </NuxtLink>
                </template>
                <template v-else>
                  <p class="text-sm text-neutral-500 dark:text-neutral-400 mb-auto">
                    {{ locale === 'ar' ? 'لا يوجد اشتراك نشط' : 'No active subscription' }}
                  </p>
                  <NuxtLink
                    to="/subscription"
                    class="mt-4 h-8 inline-flex items-center justify-center gap-1.5 rounded-md bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold transition-colors"
                  >
                    {{ locale === 'ar' ? 'استكشف الخطط' : 'Explore plans' }}
                  </NuxtLink>
                </template>
              </div>
            </div>

            <!-- Recent Activity -->
            <div
              v-else-if="widgetId === 'activity'"
              class="group/widget relative"
              draggable="true"
              @dragstart="onDragStart($event, widgetId)"
              @dragover.prevent
              @drop="onDrop($event, widgetId)"
            >
              <button
                type="button"
                class="absolute -top-2 end-2 z-10 w-6 h-6 inline-flex items-center justify-center rounded-sm bg-neutral-100 dark:bg-neutral-800 text-neutral-400 opacity-0 group-hover/widget:opacity-100 cursor-grab transition-opacity"
                :title="locale === 'ar' ? 'اسحب لإعادة الترتيب' : 'Drag to reorder'"
                tabindex="-1"
              >
                <UIcon name="i-lucide-grip-vertical" class="w-3.5 h-3.5" />
              </button>

              <div
                v-motion
                :initial="{ opacity: 0, y: 16 }"
                :enter="{ opacity: 1, y: 0, transition: { delay: 580 } }"
                class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5"
              >
                <div class="flex items-center justify-between mb-4">
                  <div class="flex items-center gap-2">
                    <h3 class="text-sm font-semibold text-neutral-900 dark:text-neutral-0">
                      {{ locale === 'ar' ? 'النشاط الأخير' : 'Recent Activity' }}
                    </h3>
                    <span
                      v-if="recentActivity.length > 0"
                      class="text-[10px] font-semibold px-1.5 h-4 inline-flex items-center justify-center rounded-sm bg-neutral-100 dark:bg-neutral-800 text-neutral-500"
                    >
                      {{ recentActivity.length }}
                    </span>
                  </div>
                  <NuxtLink
                    to="/notifications"
                    class="text-xs font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 inline-flex items-center gap-1"
                  >
                    {{ locale === 'ar' ? 'عرض الكل' : 'View all' }}
                    <UIcon name="i-lucide-arrow-right" class="w-3 h-3 rtl:rotate-180" />
                  </NuxtLink>
                </div>

                <!-- Loading -->
                <div v-if="activityLoading" class="space-y-2">
                  <div v-for="i in 4" :key="i" class="flex items-start gap-3 px-2 py-2 animate-pulse">
                    <div class="w-2 h-2 mt-2 rounded-full bg-neutral-200 dark:bg-neutral-800 flex-shrink-0"></div>
                    <div class="flex-1">
                      <div class="h-3 bg-neutral-100 dark:bg-neutral-800 rounded w-3/4 mb-1.5"></div>
                      <div class="h-2.5 bg-neutral-100 dark:bg-neutral-800/60 rounded w-1/4"></div>
                    </div>
                  </div>
                </div>

                <!-- List -->
                <ul v-else-if="recentActivity.length > 0" class="-mx-2">
                  <li
                    v-for="(item, idx) in recentActivity"
                    :key="item.id"
                    v-motion
                    :initial="{ opacity: 0, x: locale === 'ar' ? 8 : -8 }"
                    :enter="{ opacity: 1, x: 0, transition: { delay: 620 + idx * 50 } }"
                    class="flex items-start gap-3 px-2 py-2 rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors"
                  >
                    <span
                      class="mt-1.5 w-2 h-2 rounded-full flex-shrink-0"
                      :class="item.is_read ? 'bg-neutral-300 dark:bg-neutral-700' : 'bg-primary-500'"
                    />
                    <div class="flex-1 min-w-0">
                      <p class="text-sm text-neutral-800 dark:text-neutral-100 leading-snug">
                        {{ locale === 'ar' ? item.title_ar : item.title_en }}
                      </p>
                      <p
                        v-if="locale === 'ar' ? item.body_ar : item.body_en"
                        class="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 line-clamp-1"
                      >
                        {{ locale === 'ar' ? item.body_ar : item.body_en }}
                      </p>
                    </div>
                    <span class="text-[10px] text-neutral-400 whitespace-nowrap mt-0.5 tabular-nums">
                      {{ timeAgo(item.created_at) }}
                    </span>
                  </li>
                </ul>

                <!-- Empty -->
                <div v-else class="py-10 flex flex-col items-center justify-center text-center">
                  <div class="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-2">
                    <UIcon name="i-lucide-bell-off" class="w-4 h-4 text-neutral-400" />
                  </div>
                  <p class="text-xs text-neutral-500 dark:text-neutral-400">
                    {{ locale === 'ar' ? 'لا يوجد نشاط حديث' : 'No recent activity' }}
                  </p>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </FeatureBoundary>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })

const { locale } = useI18n()
const authStore = useAuthStore()
const dashboard = useDashboard()
const api = useApi()
const { secondaryColor } = useTenantTheme()

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
const refreshing = ref(false)

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

async function refresh() {
  refreshing.value = true
  try {
    await Promise.all([dashboard.fetch(), fetchActivity()])
  } finally {
    refreshing.value = false
  }
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return locale.value === 'ar' ? 'الآن' : 'just now'
  if (mins < 60) return locale.value === 'ar' ? `منذ ${mins} د` : `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return locale.value === 'ar' ? `منذ ${hours} س` : `${hours}h ago`
  const days = Math.floor(hours / 24)
  return locale.value === 'ar' ? `منذ ${days} ي` : `${days}d ago`
}

onMounted(() => {
  dashboard.fetch()
  fetchActivity()
})

const greeting = computed(() => {
  const name = authStore.user?.name?.split(' ')[0] || ''
  const hour = new Date().getHours()
  if (locale.value === 'ar') {
    if (hour < 12) return `صباح الخير، ${name}`
    if (hour < 18) return `مساء الخير، ${name}`
    return `أهلاً ${name}`
  }
  if (hour < 12) return `Good morning, ${name}`
  if (hour < 18) return `Good afternoon, ${name}`
  return `Good evening, ${name}`
})

const subtitleLabel = computed(() => {
  const today = new Date().toLocaleDateString(locale.value === 'ar' ? 'ar-EG' : 'en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  return today
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
