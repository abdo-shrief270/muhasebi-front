<template>
  <div class="bg-neutral-50 dark:bg-neutral-800/40 rounded-md p-3 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800/70">
    <div class="flex items-center gap-1.5 mb-2">
      <UIcon :name="icon" class="w-3.5 h-3.5" :class="iconColor" />
      <p class="text-[10px] uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-medium truncate">
        {{ label }}
      </p>
    </div>
    <p class="text-xl font-bold tabular-nums" :class="valueColor">
      {{ Number(value).toLocaleString() }}
    </p>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  label: string
  value: number | string
  icon: string
  color?: 'primary' | 'info' | 'success' | 'warning' | 'danger'
}>(), {
  color: 'primary',
})

const colorMap = {
  primary: { value: 'text-primary-600 dark:text-primary-400',     icon: 'text-primary-500' },
  info:    { value: 'text-info-600 dark:text-info-400',           icon: 'text-info-500' },
  success: { value: 'text-success-600 dark:text-success-500',     icon: 'text-success-500' },
  warning: { value: 'text-warning-600 dark:text-warning-500',     icon: 'text-warning-500' },
  danger:  { value: 'text-danger-600 dark:text-danger-500',       icon: 'text-danger-500' },
}

const valueColor = computed(() => colorMap[props.color].value)
const iconColor = computed(() => colorMap[props.color].icon)
</script>
