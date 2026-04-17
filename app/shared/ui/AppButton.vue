<template>
  <button
    :type="type"
    :disabled="loading || disabled"
    class="inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 active:scale-[0.97]"
    :class="[sizeClasses, variantClasses, { 'opacity-50 cursor-not-allowed': loading || disabled }]"
  >
    <span v-if="loading" class="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
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
}>(), {
  variant: 'primary',
  size: 'md',
  type: 'button',
  loading: false,
  disabled: false,
})

const sizeClasses = computed(() => ({
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3 text-base',
} as const)[props.size])

const variantClasses = computed(() => ({
  primary: 'bg-primary-500 text-white hover:bg-primary-600 shadow-sm shadow-primary-500/20',
  secondary: 'bg-secondary-400 text-white hover:bg-secondary-500 shadow-sm shadow-secondary-400/20',
  outline: 'border border-gray-200 text-gray-700 hover:bg-gray-50',
  ghost: 'text-gray-600 hover:bg-gray-100',
  danger: 'bg-red-500 text-white hover:bg-red-600 shadow-sm shadow-red-500/20',
} as const)[props.variant])
</script>
