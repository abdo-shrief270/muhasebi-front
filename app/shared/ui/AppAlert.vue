<template>
  <div
    class="rounded-md border px-3 py-2.5 flex items-start gap-2.5"
    :class="rootClass"
    role="alert"
    :aria-live="color === 'error' ? 'assertive' : 'polite'"
  >
    <UIcon :name="iconName" class="w-4 h-4 mt-0.5 flex-shrink-0" :class="iconClass" />
    <div class="flex-1 min-w-0">
      <p v-if="title" class="text-sm font-medium" :class="titleClass">{{ title }}</p>
      <p v-if="description || $slots.default" class="text-sm" :class="descClass">
        <slot>{{ description }}</slot>
      </p>
    </div>
    <div v-if="$slots.actions" class="flex items-center gap-1 flex-shrink-0">
      <slot name="actions" />
    </div>
    <button
      v-if="dismissible"
      type="button"
      class="w-6 h-6 rounded flex items-center justify-center flex-shrink-0 opacity-60 hover:opacity-100"
      :class="iconClass"
      :aria-label="$t('common.close')"
      @click="$emit('dismiss')"
    >
      <UIcon name="i-lucide-x" class="w-3.5 h-3.5" />
    </button>
  </div>
</template>

<script setup lang="ts">
// Four variants aligned with semantic colors — §11.1, §11.6.
const props = withDefaults(defineProps<{
  color?: 'info' | 'success' | 'warning' | 'error'
  title?: string
  description?: string
  icon?: string
  dismissible?: boolean
}>(), {
  color: 'info',
  dismissible: false,
})

defineEmits<{
  'dismiss': []
}>()

const iconName = computed(() => props.icon ?? {
  info:    'i-lucide-info',
  success: 'i-lucide-check-circle',
  warning: 'i-lucide-triangle-alert',
  error:   'i-lucide-alert-circle',
}[props.color])

const rootClass = computed(() => ({
  info:    'border-info-200 bg-info-50 dark:bg-info-500/5 dark:border-info-500/20',
  success: 'border-success-200 bg-success-50 dark:bg-success-500/5 dark:border-success-500/20',
  warning: 'border-warning-200 bg-warning-50 dark:bg-warning-500/5 dark:border-warning-500/20',
  error:   'border-danger-200 bg-danger-50 dark:bg-danger-500/5 dark:border-danger-500/20',
}[props.color]))

const iconClass = computed(() => ({
  info:    'text-info-500',
  success: 'text-success-500',
  warning: 'text-warning-500',
  error:   'text-danger-500',
}[props.color]))

const titleClass = computed(() => ({
  info:    'text-info-800 dark:text-info-200',
  success: 'text-success-800 dark:text-success-200',
  warning: 'text-warning-800 dark:text-warning-200',
  error:   'text-danger-800 dark:text-danger-200',
}[props.color]))

const descClass = computed(() => ({
  info:    'text-info-700 dark:text-info-300',
  success: 'text-success-700 dark:text-success-300',
  warning: 'text-warning-700 dark:text-warning-300',
  error:   'text-danger-700 dark:text-danger-300',
}[props.color]))
</script>
