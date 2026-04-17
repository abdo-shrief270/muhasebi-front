import { useOnline } from '@vueuse/core'

export default defineNuxtPlugin((nuxtApp) => {
  const online = useOnline()
  const isOffline = computed(() => !online.value)

  nuxtApp.provide('isOffline', isOffline)

  watch(online, (now, was) => {
    if (now && was === false) {
      const queue = useOfflineQueue()
      queue.flush().catch(() => {})
    }
  })
})
