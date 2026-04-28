<template>
  <div
    v-motion
    :initial="{ opacity: 0, y: 8 }"
    :enter="{ opacity: 1, y: 0 }"
    class="text-center py-12 px-6"
  >
    <div
      class="w-12 h-12 mx-auto mb-4 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-400"
    >
      <UIcon v-if="isLucideIcon" :name="icon" class="w-5 h-5" />
      <span v-else class="text-lg">{{ icon }}</span>
    </div>

    <h3 class="text-sm font-semibold text-neutral-900 dark:text-neutral-0 mb-1">
      {{ title }}
    </h3>
    <p
      v-if="description"
      class="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto leading-relaxed"
    >
      {{ description }}
    </p>

    <div v-if="$slots.action" class="mt-5 inline-flex items-center gap-2">
      <slot name="action" />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  icon?: string
  title: string
  description?: string
}>(), {
  icon: 'i-lucide-inbox',
  description: '',
})

const isLucideIcon = computed(() => typeof props.icon === 'string' && props.icon.startsWith('i-'))
</script>
