<template>
  <div
    v-motion
    :initial="{ opacity: 0, y: 16 }"
    :enter="{ opacity: 1, y: 0, transition: { delay: delay } }"
    class="relative bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5 transition-all hover:border-neutral-300 dark:hover:border-neutral-700 hover:shadow-sm"
  >
    <div class="flex items-start justify-between mb-4">
      <p class="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">{{ label }}</p>
      <div
        class="w-9 h-9 rounded-lg flex items-center justify-center text-base flex-shrink-0"
        :class="iconBgClass"
      >
        <UIcon v-if="isLucide" :name="icon" class="w-4 h-4" />
        <span v-else>{{ icon }}</span>
      </div>
    </div>

    <p class="text-2xl xl:text-3xl font-bold tabular-nums tracking-tight text-neutral-900 dark:text-neutral-0">
      <template v-if="loading">
        <span class="inline-block w-20 h-7 rounded-md bg-neutral-100 dark:bg-neutral-800 animate-pulse"></span>
      </template>
      <template v-else>
        {{ formattedValue }}
      </template>
    </p>

    <p v-if="subtitle" class="text-xs text-neutral-500 dark:text-neutral-400 mt-2 truncate">{{ subtitle }}</p>

    <!-- Decorative accent line -->
    <span
      class="absolute top-0 start-5 right-5 h-0.5 rounded-b-full"
      :class="accentClass"
      aria-hidden="true"
    />
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
  icon: 'i-lucide-bar-chart-3',
  color: 'primary',
  format: 'number',
  loading: false,
  delay: 100,
})

const isLucide = computed(() => typeof props.icon === 'string' && props.icon.startsWith('i-'))

const colorMap = {
  primary:   { bg: 'bg-primary-500/10 text-primary-600 dark:text-primary-400',     accent: 'bg-primary-500' },
  secondary: { bg: 'bg-info-500/10 text-info-600 dark:text-info-400',              accent: 'bg-info-500' },
  green:     { bg: 'bg-success-500/10 text-success-600 dark:text-success-500',     accent: 'bg-success-500' },
  orange:    { bg: 'bg-warning-500/10 text-warning-600 dark:text-warning-500',     accent: 'bg-warning-500' },
  red:       { bg: 'bg-danger-500/10 text-danger-600 dark:text-danger-500',        accent: 'bg-danger-500' },
}

const iconBgClass = computed(() => colorMap[props.color].bg)
const accentClass = computed(() => colorMap[props.color].accent)

const formattedValue = computed(() => {
  if (props.format === 'none') return props.value
  if (props.format === 'currency') {
    return Number(props.value).toLocaleString('en-US', { minimumFractionDigits: 0 })
  }
  return Number(props.value).toLocaleString()
})
</script>
