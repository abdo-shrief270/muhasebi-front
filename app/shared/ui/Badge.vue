<template>
  <span
    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors"
    :class="colorClasses"
  >
    <span v-if="dot" class="w-1.5 h-1.5 rounded-full me-1.5" :class="dotClass"></span>
    <slot />
  </span>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  color?: 'gray' | 'green' | 'blue' | 'orange' | 'red' | 'emerald' | 'purple'
  dot?: boolean
}>(), {
  color: 'gray',
  dot: false,
})

const colorMap: Record<string, { badge: string; dot: string }> = {
  gray: { badge: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' },
  green: { badge: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' },
  blue: { badge: 'bg-blue-50 text-blue-700', dot: 'bg-blue-500' },
  orange: { badge: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500' },
  red: { badge: 'bg-red-50 text-red-700', dot: 'bg-red-500' },
  emerald: { badge: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' },
  purple: { badge: 'bg-purple-50 text-purple-700', dot: 'bg-purple-500' },
}

const colorClasses = computed(() => colorMap[props.color]?.badge)
const dotClass = computed(() => colorMap[props.color]?.dot)
</script>
