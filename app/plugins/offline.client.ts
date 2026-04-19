import { useOnline } from '@vueuse/core'

export default defineNuxtPlugin({
  name: 'muhasebi:offline-queue',
  dependsOn: ['pinia'],
  setup(nuxtApp) {
    const online = useOnline()
    const isOffline = computed(() => !online.value)

    nuxtApp.provide('isOffline', isOffline)

    watch(online, (now, was) => {
      if (now && was === false) {
        const queue = useOfflineQueue()
        queue.flush().catch(() => {})
      }
    })
  },
})
