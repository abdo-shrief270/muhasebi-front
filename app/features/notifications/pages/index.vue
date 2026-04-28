<template>
  <div class="px-4 lg:px-6 py-5 max-w-3xl mx-auto">
    <UiPageHeader
      icon="i-lucide-bell"
      :title="locale === 'ar' ? 'الإشعارات' : 'Notifications'"
      :subtitle="subtitle"
    >
      <template #actions>
        <UiAppButton
          v-if="notifStore.unreadCount > 0"
          variant="outline"
          size="sm"
          icon="i-lucide-check-check"
          @click="notifStore.markAllAsRead()"
        >
          {{ locale === 'ar' ? 'تحديد الكل كمقروء' : 'Mark all read' }}
        </UiAppButton>
      </template>
    </UiPageHeader>

    <div v-if="notifStore.loading" class="space-y-2">
      <div v-for="i in 5" :key="i" class="h-16 rounded-xl bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
    </div>

    <template v-else-if="notifStore.notifications.length > 0">
      <TransitionGroup name="fade-slide" tag="ul" class="space-y-2">
        <li
          v-for="(notif, index) in notifStore.notifications"
          :key="notif.id"
          v-motion
          :initial="{ opacity: 0, x: locale === 'ar' ? 20 : -20 }"
          :enter="{ opacity: 1, x: 0, transition: { delay: index * 40 } }"
          class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 cursor-pointer hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors group"
          :class="{ 'border-s-4 border-s-primary-500 dark:border-s-primary-400': !notif.is_read }"
          @click="handleClick(notif)"
        >
          <div class="flex items-start gap-3">
            <div
              class="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
              :class="notif.is_read
                ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500'
                : 'bg-primary-500/10 text-primary-700 dark:text-primary-400'"
            >
              <UIcon :name="iconFor(notif)" class="w-4 h-4" />
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex items-baseline justify-between gap-2 flex-wrap">
                <p
                  class="text-sm truncate"
                  :class="notif.is_read
                    ? 'text-neutral-700 dark:text-neutral-300'
                    : 'font-semibold text-neutral-900 dark:text-neutral-0'"
                >
                  {{ locale === 'ar' ? notif.title_ar : notif.title_en }}
                </p>
                <UiBadge v-if="!notif.is_read" color="blue" dot>
                  {{ locale === 'ar' ? 'جديد' : 'New' }}
                </UiBadge>
              </div>
              <p
                v-if="locale === 'ar' ? notif.body_ar : notif.body_en"
                class="text-sm text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2"
              >
                {{ locale === 'ar' ? notif.body_ar : notif.body_en }}
              </p>
              <p class="text-[11px] text-neutral-400 dark:text-neutral-500 mt-2 tabular-nums">
                {{ formatRelative(notif.created_at) }}
              </p>
            </div>
            <UIcon
              v-if="notif.action_url"
              name="i-lucide-arrow-up-right"
              class="w-3.5 h-3.5 text-neutral-300 dark:text-neutral-600 group-hover:text-primary-500 rtl:rotate-90 transition-colors flex-shrink-0 mt-1"
            />
          </div>
        </li>
      </TransitionGroup>
    </template>

    <div v-else class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 py-12 text-center">
      <div class="w-12 h-12 mx-auto mb-3 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
        <UIcon name="i-lucide-bell-off" class="w-5 h-5 text-neutral-400" />
      </div>
      <p class="text-sm font-semibold text-neutral-900 dark:text-neutral-0 mb-1">
        {{ locale === 'ar' ? 'لا توجد إشعارات' : 'No notifications' }}
      </p>
      <p class="text-xs text-neutral-500 dark:text-neutral-400">
        {{ locale === 'ar' ? 'ستظهر الإشعارات الجديدة هنا.' : 'New notifications will show up here.' }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })

const { locale } = useI18n()
const notifStore = useNotificationStore()

const subtitle = computed(() => {
  if (locale.value === 'ar') {
    return notifStore.unreadCount > 0
      ? `${notifStore.unreadCount} إشعار جديد`
      : 'كل الإشعارات مقروءة'
  }
  return notifStore.unreadCount > 0
    ? `${notifStore.unreadCount} unread`
    : 'All caught up'
})

onMounted(() => {
  notifStore.fetchNotifications()
})

function handleClick(notif: any) {
  if (!notif.is_read) notifStore.markAsRead(notif.id)
  if (notif.action_url) navigateTo(notif.action_url)
}

/**
 * Best-effort icon mapping. Notifications carry a `type` (e.g.
 * 'invoice_overdue', 'bill_approved') — match a couple of known prefixes
 * and fall back to a generic bell. Keeps the page useful even before the
 * backend types are fully cataloged.
 */
function iconFor(notif: any): string {
  const t = String(notif.type ?? '').toLowerCase()
  if (t.includes('invoice')) return 'i-lucide-file-text'
  if (t.includes('bill') || t.includes('payment')) return 'i-lucide-banknote'
  if (t.includes('expense')) return 'i-lucide-credit-card'
  if (t.includes('approval')) return 'i-lucide-check-circle-2'
  if (t.includes('overdue') || t.includes('alert')) return 'i-lucide-alert-triangle'
  if (t.includes('user') || t.includes('team')) return 'i-lucide-user'
  return 'i-lucide-bell'
}

function formatRelative(d: string) {
  const date = new Date(d)
  const minutes = Math.floor((Date.now() - date.getTime()) / 60000)
  if (minutes < 1) return locale.value === 'ar' ? 'الآن' : 'just now'
  if (minutes < 60) return locale.value === 'ar' ? `منذ ${minutes} دقيقة` : `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return locale.value === 'ar' ? `منذ ${hours} ساعة` : `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return locale.value === 'ar' ? `منذ ${days} يوم` : `${days}d ago`
  // Fall back to a full date for older items.
  return date.toLocaleDateString(locale.value === 'ar' ? 'ar-EG' : 'en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}
</script>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 200ms ease, transform 200ms ease;
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(-4px);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-12px);
}
</style>
