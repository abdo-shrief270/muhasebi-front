<template>
  <div class="flex flex-col items-center justify-center text-center py-12 px-6">
    <div class="w-16 h-16 rounded-full flex items-center justify-center mb-4" :class="iconBgClass">
      <slot name="illustration">
        <UIcon :name="icon ?? defaultIcon" class="w-8 h-8" :class="iconColorClass" />
      </slot>
    </div>
    <h3 class="text-base font-semibold text-neutral-900 dark:text-neutral-0 mb-1">
      {{ title ?? defaultTitle }}
    </h3>
    <p v-if="description || $slots.description" class="text-sm text-neutral-500 dark:text-neutral-400 max-w-sm mb-4">
      <slot name="description">{{ description }}</slot>
    </p>
    <div v-if="$slots.actions" class="flex items-center justify-center gap-2">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
// Spec §11.6:
//   variant="default"  — no data yet (primary CTA to create)
//   variant="filtered" — filters returned 0 rows (suggest clear-filters)
//   variant="error"    — inline failure
const props = withDefaults(defineProps<{
  variant?: 'default' | 'filtered' | 'error'
  title?: string
  description?: string
  icon?: string
}>(), {
  variant: 'default',
})

const { locale } = useI18n()

const defaultIcon = computed(() => {
  switch (props.variant) {
    case 'filtered': return 'i-lucide-filter-x'
    case 'error':    return 'i-lucide-alert-triangle'
    default:         return 'i-lucide-inbox'
  }
})

const defaultTitle = computed(() => {
  switch (props.variant) {
    case 'filtered': return locale.value === 'ar' ? 'لا توجد نتائج مطابقة' : 'No matching results'
    case 'error':    return locale.value === 'ar' ? 'حدث خطأ' : 'Something went wrong'
    default:         return locale.value === 'ar' ? 'لا توجد بيانات' : 'No data yet'
  }
})

const iconBgClass = computed(() => {
  switch (props.variant) {
    case 'error': return 'bg-danger-50 dark:bg-danger-500/10'
    default:      return 'bg-neutral-100 dark:bg-neutral-800'
  }
})

const iconColorClass = computed(() => {
  switch (props.variant) {
    case 'error': return 'text-danger-500'
    default:      return 'text-neutral-400'
  }
})
</script>
