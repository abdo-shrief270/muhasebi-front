<template>
  <Transition name="slide-down">
    <div v-if="!isOnline" class="fixed top-0 inset-x-0 z-[100] bg-amber-500 text-white text-center py-2 text-sm font-medium shadow-lg">
      <span class="flex items-center justify-center gap-2">
        <svg class="w-4 h-4 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636a9 9 0 010 12.728M5.636 5.636a9 9 0 000 12.728M12 12h.01"/>
        </svg>
        {{ locale === 'ar' ? 'لا يوجد اتصال بالإنترنت' : 'No internet connection' }}
      </span>
    </div>
  </Transition>
</template>

<script setup lang="ts">
const { isOnline } = useNetwork()
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
