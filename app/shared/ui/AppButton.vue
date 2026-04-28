<template>
  <button
    :type="type"
    :disabled="loading || disabled"
    class="inline-flex items-center justify-center gap-1.5 font-semibold rounded-md transition-colors active:scale-[0.98] outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40"
    :class="[sizeClasses, variantClasses, { 'opacity-60 cursor-not-allowed': loading || disabled }]"
  >
    <UIcon v-if="loading" name="i-lucide-loader-2" class="w-4 h-4 animate-spin flex-shrink-0" />
    <UIcon v-else-if="icon" :name="icon" class="flex-shrink-0" :class="iconSize" />
    <slot />
  </button>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  type?: 'button' | 'submit'
  loading?: boolean
  disabled?: boolean
  icon?: string
}>(), {
  variant: 'primary',
  size: 'md',
  type: 'button',
  loading: false,
  disabled: false,
})

const sizeClasses = computed(() => ({
  sm: 'h-7 px-2.5 text-xs',
  md: 'h-8 px-3 text-xs',
  lg: 'h-10 px-4 text-sm',
} as const)[props.size])

const iconSize = computed(() => ({
  sm: 'w-3.5 h-3.5',
  md: 'w-3.5 h-3.5',
  lg: 'w-4 h-4',
} as const)[props.size])

const variantClasses = computed(() => ({
  primary:   'bg-primary-600 text-white hover:bg-primary-700 shadow-sm',
  secondary: 'bg-info-600 text-white hover:bg-info-700 shadow-sm',
  outline:   'border border-neutral-200 dark:border-neutral-800 bg-neutral-0 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800',
  ghost:     'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800',
  danger:    'bg-danger-600 text-white hover:bg-danger-700 shadow-sm',
} as const)[props.variant])
</script>
