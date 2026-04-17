<template>
  <div
    v-motion
    :initial="{ opacity: 0, y: -10 }"
    :enter="{ opacity: 1, y: 0 }"
    class="flex items-center justify-between mb-8"
  >
    <div>
      <h1 class="text-2xl font-bold text-gray-800">{{ title }}</h1>
      <p v-if="subtitle" class="text-sm text-gray-400 mt-1">{{ subtitle }}</p>
    </div>
    <div class="flex items-center gap-3">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
}>()
</script>
