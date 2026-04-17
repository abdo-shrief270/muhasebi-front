<template>
  <div>
    <NuxtLayout name="portal">
      <UiPageHeader :title="locale === 'ar' ? 'الإشعارات' : 'Notifications'">
        <template #actions>
          <UiAppButton v-if="unreadCount > 0" variant="outline" size="sm" @click="markAllRead">
            {{ locale === 'ar' ? 'تحديد الكل كمقروء' : 'Mark all read' }}
          </UiAppButton>
        </template>
      </UiPageHeader>

      <div v-if="loading"><UiLoadingSkeleton :lines="5" :height="50" /></div>

      <div v-else-if="notifications.length" class="space-y-3">
        <div
          v-for="(notif, i) in notifications"
          :key="notif.id"
          v-motion
          :initial="{ opacity: 0, x: locale === 'ar' ? 15 : -15 }"
          :enter="{ opacity: 1, x: 0, transition: { delay: i * 40 } }"
          @click="markRead(notif)"
          class="bg-white rounded-xl border p-4 cursor-pointer hover:border-gray-200 transition-all"
          :class="notif.is_read ? 'border-gray-100/80' : 'border-s-4 border-s-secondary-400 border-gray-100/80'"
        >
          <div class="flex items-start justify-between">
            <div>
              <p class="font-medium text-gray-800 text-sm">{{ locale === 'ar' ? notif.title_ar : notif.title_en }}</p>
              <p v-if="(locale === 'ar' ? notif.body_ar : notif.body_en)" class="text-xs text-gray-400 mt-1">{{ locale === 'ar' ? notif.body_ar : notif.body_en }}</p>
              <p class="text-[10px] text-gray-300 mt-2">{{ new Date(notif.created_at).toLocaleString() }}</p>
            </div>
            <UiBadge v-if="!notif.is_read" color="blue" dot>{{ locale === 'ar' ? 'جديد' : 'New' }}</UiBadge>
          </div>
        </div>
      </div>

      <UiEmptyState v-else icon="🔔" :title="locale === 'ar' ? 'لا توجد إشعارات' : 'No notifications'" />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })
const { locale } = useI18n()
const api = useApi()

const notifications = ref<any[]>([])
const loading = ref(true)
const unreadCount = computed(() => notifications.value.filter(n => !n.is_read).length)

async function load() {
  loading.value = true
  try {
    const data = await api.get<{ data: any[] }>('/portal/notifications')
    notifications.value = data.data
  } catch { notifications.value = [] }
  finally { loading.value = false }
}

async function markRead(notif: any) {
  if (!notif.is_read) {
    try { await api.post(`/portal/notifications/${notif.id}/read`); notif.is_read = true } catch {}
  }
}

async function markAllRead() {
  try { await api.post('/portal/notifications/read-all'); notifications.value.forEach(n => n.is_read = true) } catch {}
}

onMounted(load)
</script>
