<template>
  <div>
    <NuxtLayout name="dashboard">
      <UiPageHeader
        :title="locale === 'ar' ? 'الإشعارات' : 'Notifications'"
      >
        <template #actions>
          <UiAppButton
            v-if="notifStore.unreadCount > 0"
            variant="outline"
            size="sm"
            @click="notifStore.markAllAsRead()"
          >
            {{ locale === 'ar' ? 'تحديد الكل كمقروء' : 'Mark all read' }}
          </UiAppButton>
        </template>
      </UiPageHeader>

      <div class="max-w-3xl">
        <template v-if="notifStore.loading">
          <UiLoadingSkeleton :lines="5" :height="60" />
        </template>

        <template v-else-if="notifStore.notifications.length > 0">
          <TransitionGroup name="fade-slide">
            <div
              v-for="(notif, index) in notifStore.notifications"
              :key="notif.id"
              v-motion
              :initial="{ opacity: 0, x: locale === 'ar' ? 20 : -20 }"
              :enter="{ opacity: 1, x: 0, transition: { delay: index * 50 } }"
              @click="handleClick(notif)"
              class="bg-white rounded-xl border border-gray-100/80 p-5 mb-3 cursor-pointer hover:border-gray-200 transition-all"
              :class="{ 'border-s-4 border-s-secondary-400': !notif.is_read }"
            >
              <div class="flex items-start justify-between gap-4">
                <div class="flex-1">
                  <p class="font-medium text-gray-800">
                    {{ locale === 'ar' ? notif.title_ar : notif.title_en }}
                  </p>
                  <p v-if="locale === 'ar' ? notif.body_ar : notif.body_en" class="text-sm text-gray-400 mt-1">
                    {{ locale === 'ar' ? notif.body_ar : notif.body_en }}
                  </p>
                  <p class="text-xs text-gray-300 mt-2">{{ formatDate(notif.created_at) }}</p>
                </div>
                <UiBadge v-if="!notif.is_read" color="blue" dot>
                  {{ locale === 'ar' ? 'جديد' : 'New' }}
                </UiBadge>
              </div>
            </div>
          </TransitionGroup>
        </template>

        <UiEmptyState
          v-else
          icon="&#128276;"
          :title="locale === 'ar' ? 'لا توجد إشعارات' : 'No notifications'"
          :description="locale === 'ar' ? 'ستظهر هنا الإشعارات الجديدة' : 'New notifications will appear here'"
        />
      </div>
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  
  layout: false,
})

const { locale } = useI18n()
const notifStore = useNotificationStore()

onMounted(() => {
  notifStore.fetchNotifications()
})

function handleClick(notif: any) {
  if (!notif.is_read) {
    notifStore.markAsRead(notif.id)
  }
  if (notif.action_url) {
    navigateTo(notif.action_url)
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString(locale.value === 'ar' ? 'ar-EG' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>
