<template>
  <div class="relative">
    <button
      @click="toggle"
      class="relative text-gray-500 hover:text-primary-500 transition p-1"
    >
      <span class="text-xl">&#128276;</span>
      <span
        v-if="notifStore.unreadCount > 0"
        class="absolute -top-0.5 -end-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center pulse-dot"
      >
        {{ notifStore.unreadCount > 9 ? '9+' : notifStore.unreadCount }}
      </span>
    </button>

    <!-- Dropdown -->
    <Transition name="fade">
      <div
        v-if="isOpen"
        class="absolute end-0 top-full mt-2 w-80 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden"
      >
        <div class="flex items-center justify-between px-4 py-3 border-b border-gray-50">
          <h4 class="font-semibold text-sm text-gray-700">
            {{ locale === 'ar' ? 'الإشعارات' : 'Notifications' }}
          </h4>
          <button
            v-if="notifStore.unreadCount > 0"
            @click="notifStore.markAllAsRead()"
            class="text-xs text-secondary-400 hover:text-secondary-500"
          >
            {{ locale === 'ar' ? 'تحديد الكل كمقروء' : 'Mark all read' }}
          </button>
        </div>

        <div class="max-h-80 overflow-y-auto">
          <template v-if="notifStore.notifications.length > 0">
            <div
              v-for="notif in notifStore.notifications"
              :key="notif.id"
              @click="handleClick(notif)"
              class="px-4 py-3 border-b border-gray-50/50 cursor-pointer hover:bg-gray-50/50 transition-colors"
              :class="{ 'bg-primary-50/30': !notif.is_read }"
            >
              <div class="flex items-start gap-2">
                <span
                  v-if="!notif.is_read"
                  class="w-2 h-2 rounded-full bg-secondary-400 mt-1.5 flex-shrink-0"
                ></span>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-800 truncate">
                    {{ locale === 'ar' ? notif.title_ar : notif.title_en }}
                  </p>
                  <p v-if="locale === 'ar' ? notif.body_ar : notif.body_en" class="text-xs text-gray-400 mt-0.5 line-clamp-2">
                    {{ locale === 'ar' ? notif.body_ar : notif.body_en }}
                  </p>
                  <p class="text-[10px] text-gray-300 mt-1">{{ timeAgo(notif.created_at) }}</p>
                </div>
              </div>
            </div>
          </template>
          <div v-else class="py-10 text-center text-gray-300 text-sm">
            {{ locale === 'ar' ? 'لا توجد إشعارات' : 'No notifications' }}
          </div>
        </div>

        <NuxtLink
          to="/notifications"
          @click="isOpen = false"
          class="block text-center py-3 text-xs text-secondary-400 hover:bg-gray-50 border-t border-gray-50 font-medium"
        >
          {{ locale === 'ar' ? 'عرض الكل' : 'View all' }}
        </NuxtLink>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
const { locale } = useI18n()
const notifStore = useNotificationStore()

const isOpen = ref(false)

function toggle() {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    notifStore.fetchNotifications()
  }
}

function handleClick(notif: any) {
  if (!notif.is_read) {
    notifStore.markAsRead(notif.id)
  }
  if (notif.action_url) {
    navigateTo(notif.action_url)
  }
  isOpen.value = false
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return locale.value === 'ar' ? `منذ ${mins} دقيقة` : `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return locale.value === 'ar' ? `منذ ${hours} ساعة` : `${hours}h ago`
  const days = Math.floor(hours / 24)
  return locale.value === 'ar' ? `منذ ${days} يوم` : `${days}d ago`
}

// Poll for unread count
onMounted(() => {
  notifStore.fetchUnreadCount()
  const interval = setInterval(() => notifStore.fetchUnreadCount(), 60000)
  onUnmounted(() => clearInterval(interval))
})

// Close on click outside
onMounted(() => {
  const handler = (e: Event) => {
    if (!(e.target as HTMLElement).closest('.relative')) {
      isOpen.value = false
    }
  }
  document.addEventListener('click', handler)
  onUnmounted(() => document.removeEventListener('click', handler))
})
</script>
