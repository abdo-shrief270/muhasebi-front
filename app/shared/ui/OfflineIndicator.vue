<template>
  <Transition name="slide-down">
    <div
      v-if="!isOnline || pendingCount > 0"
      class="fixed top-0 inset-x-0 z-[100] text-white text-center py-2 text-sm font-medium shadow-lg"
      :class="isOnline ? 'bg-blue-500' : 'bg-amber-500'"
    >
      <span class="flex items-center justify-center gap-2">
        <svg class="w-4 h-4 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636a9 9 0 010 12.728M5.636 5.636a9 9 0 000 12.728M12 12h.01" />
        </svg>
        <template v-if="!isOnline">
          {{ locale === 'ar' ? 'لا يوجد اتصال بالإنترنت' : 'No internet connection' }}
          <span v-if="pendingCount > 0" class="opacity-90">
            ({{ locale === 'ar' ? `${pendingCount} معلق` : `${pendingCount} pending` }})
          </span>
        </template>
        <template v-else>
          {{ locale === 'ar' ? `جاري مزامنة ${pendingCount} عملية...` : `Syncing ${pendingCount} pending changes...` }}
        </template>
      </span>
    </div>
  </Transition>
</template>

<script setup lang="ts">
const nuxtApp = useNuxtApp()
const injected = nuxtApp.$isOffline as Ref<boolean> | undefined
const fallback = useNetwork()
const isOnline = computed(() => injected ? !injected.value : fallback.isOnline.value)

const queue = useOfflineQueue()
const pendingCount = computed(() => queue.queue.length)

const { locale } = useI18n()
</script>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}
.slide-down-enter-from,
.slide-down-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}
</style>
