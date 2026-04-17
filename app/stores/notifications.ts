import { defineStore } from 'pinia'

interface Notification {
  id: string
  type: string
  title_ar: string
  title_en: string
  body_ar: string | null
  body_en: string | null
  action_url: string | null
  is_read: boolean
  created_at: string
}

export const useNotificationStore = defineStore('notifications', () => {
  const notifications = ref<Notification[]>([])
  const unreadCount = ref(0)
  const loading = ref(false)

  async function fetchUnreadCount() {
    try {
      const api = useApi()
      const data = await api.get<{ count: number }>('/notifications/unread-count')
      unreadCount.value = data.count
    } catch {
      // Silently fail
    }
  }

  async function fetchNotifications() {
    loading.value = true
    try {
      const api = useApi()
      const data = await api.get<{ data: Notification[] }>('/notifications?per_page=10')
      notifications.value = data.data
    } catch {
      // Silently fail
    } finally {
      loading.value = false
    }
  }

  async function markAsRead(id: string) {
    try {
      const api = useApi()
      await api.post(`/notifications/${id}/read`)
      const notif = notifications.value.find(n => n.id === id)
      if (notif) notif.is_read = true
      unreadCount.value = Math.max(0, unreadCount.value - 1)
    } catch {
      // Silently fail
    }
  }

  async function markAllAsRead() {
    try {
      const api = useApi()
      await api.post('/notifications/read-all')
      notifications.value.forEach(n => n.is_read = true)
      unreadCount.value = 0
    } catch {
      // Silently fail
    }
  }

  return { notifications, unreadCount, loading, fetchUnreadCount, fetchNotifications, markAsRead, markAllAsRead }
})
