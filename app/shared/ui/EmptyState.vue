<template>
  <div
    v-motion
    :initial="{ opacity: 0, scale: 0.95 }"
    :enter="{ opacity: 1, scale: 1 }"
    class="text-center py-16 px-6"
  >
    <!-- Animated illustration -->
    <div class="relative w-24 h-24 mx-auto mb-6">
      <!-- Decorative pulsing circles -->
      <div class="absolute inset-0 flex items-center justify-center">
        <div class="w-24 h-24 bg-gray-100 rounded-full animate-pulse-slow"></div>
      </div>
      <div class="absolute inset-0 flex items-center justify-center">
        <div class="w-16 h-16 bg-gray-50 rounded-full animate-pulse-slower"></div>
      </div>
      <!-- Floating icon -->
      <div class="absolute inset-0 flex items-center justify-center animate-float">
        <div class="w-14 h-14 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center text-2xl text-gray-300">
          {{ icon }}
        </div>
      </div>
      <!-- Small decorative dots -->
      <div class="absolute top-1 right-1 w-2 h-2 bg-primary-200 rounded-full animate-ping-slow"></div>
      <div class="absolute bottom-2 left-0 w-1.5 h-1.5 bg-secondary-200 rounded-full animate-ping-slow" style="animation-delay: 0.5s;"></div>
      <div class="absolute top-4 left-2 w-1 h-1 bg-gray-200 rounded-full animate-ping-slow" style="animation-delay: 1s;"></div>
    </div>

    <h3 class="text-lg font-semibold text-gray-700 mb-1">{{ title }}</h3>
    <p v-if="description" class="text-sm text-gray-400 max-w-sm mx-auto mb-6">{{ description }}</p>
    <slot name="action" />
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  icon?: string
  title: string
  description?: string
}>(), {
  icon: '◇',
  description: '',
})
</script>

<style scoped>
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-6px); }
}
@keyframes pulse-slow {
  0%, 100% { opacity: 0.4; transform: scale(1); }
  50% { opacity: 0.2; transform: scale(1.05); }
}
@keyframes pulse-slower {
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 0.3; transform: scale(1.08); }
}
@keyframes ping-slow {
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 0; transform: scale(1.5); }
}
.animate-float { animation: float 3s ease-in-out infinite; }
.animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
.animate-pulse-slower { animation: pulse-slower 5s ease-in-out infinite; }
.animate-ping-slow { animation: ping-slow 3s ease-in-out infinite; }
</style>
