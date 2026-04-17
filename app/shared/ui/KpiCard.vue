<template>
  <div
    v-motion
    :initial="{ opacity: 0, y: 20 }"
    :enter="{ opacity: 1, y: 0, transition: { delay: delay } }"
    class="bg-white rounded-2xl border border-gray-100/80 p-6 card-hover"
  >
    <div class="flex items-start justify-between mb-3">
      <p class="text-sm font-medium text-gray-400">{{ label }}</p>
      <div
        class="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
        :class="iconBgClass"
      >
        {{ icon }}
      </div>
    </div>

    <p class="text-3xl font-bold tracking-tight" :class="valueClass">
      <template v-if="loading">
        <span class="skeleton inline-block w-20 h-8"></span>
      </template>
      <template v-else>
        {{ formattedValue }}
      </template>
    </p>

    <p v-if="subtitle" class="text-xs text-gray-400 mt-2">{{ subtitle }}</p>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  label: string
  value: number | string
  icon?: string
  color?: 'primary' | 'secondary' | 'green' | 'orange' | 'red'
  format?: 'number' | 'currency' | 'none'
  subtitle?: string
  loading?: boolean
  delay?: number
}>(), {
  icon: '◈',
  color: 'primary',
  format: 'number',
  loading: false,
  delay: 100,
})

const colorMap = {
  primary: { value: 'text-primary-500', bg: 'bg-primary-50 text-primary-400' },
  secondary: { value: 'text-secondary-400', bg: 'bg-secondary-50 text-secondary-400' },
  green: { value: 'text-emerald-600', bg: 'bg-emerald-50 text-emerald-500' },
  orange: { value: 'text-amber-500', bg: 'bg-amber-50 text-amber-500' },
  red: { value: 'text-red-500', bg: 'bg-red-50 text-red-500' },
}

const valueClass = computed(() => colorMap[props.color].value)
const iconBgClass = computed(() => colorMap[props.color].bg)

const formattedValue = computed(() => {
  if (props.format === 'none') return props.value
  if (props.format === 'currency') {
    return Number(props.value).toLocaleString('en-US', { minimumFractionDigits: 0 })
  }
  return Number(props.value).toLocaleString()
})
</script>
