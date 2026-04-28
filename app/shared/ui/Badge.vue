<template>
  <span
    class="inline-flex items-center font-medium transition-colors whitespace-nowrap"
    :class="[sizeClasses, variantClasses]"
  >
    <span
      v-if="dot"
      class="rounded-full me-1.5"
      :class="[dotSizeClass, dotColorClass]"
    />
    <UIcon v-if="icon" :name="icon" class="me-1 flex-shrink-0" :class="iconSizeClass" />
    <slot />
  </span>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  color?: 'gray' | 'green' | 'blue' | 'orange' | 'red' | 'emerald' | 'purple'
  variant?: 'soft' | 'solid' | 'outline'
  size?: 'xs' | 'sm'
  dot?: boolean
  icon?: string
}>(), {
  color: 'gray',
  variant: 'soft',
  size: 'sm',
  dot: false,
})

// Map legacy color names → token-aligned semantic classes (light + dark mode).
const softMap: Record<string, { badge: string; dot: string }> = {
  gray:    { badge: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300', dot: 'bg-neutral-400' },
  green:   { badge: 'bg-success-500/10 text-success-700 dark:text-success-400',                  dot: 'bg-success-500' },
  emerald: { badge: 'bg-success-500/10 text-success-700 dark:text-success-400',                  dot: 'bg-success-500' },
  blue:    { badge: 'bg-info-500/10 text-info-700 dark:text-info-400',                           dot: 'bg-info-500' },
  orange:  { badge: 'bg-warning-500/10 text-warning-700 dark:text-warning-500',                  dot: 'bg-warning-500' },
  red:     { badge: 'bg-danger-500/10 text-danger-700 dark:text-danger-400',                     dot: 'bg-danger-500' },
  purple:  { badge: 'bg-primary-500/10 text-primary-700 dark:text-primary-300',                  dot: 'bg-primary-500' },
}

const solidMap: Record<string, { badge: string; dot: string }> = {
  gray:    { badge: 'bg-neutral-700 text-neutral-0',  dot: 'bg-neutral-200' },
  green:   { badge: 'bg-success-600 text-white',      dot: 'bg-white' },
  emerald: { badge: 'bg-success-600 text-white',      dot: 'bg-white' },
  blue:    { badge: 'bg-info-600 text-white',         dot: 'bg-white' },
  orange:  { badge: 'bg-warning-600 text-white',      dot: 'bg-white' },
  red:     { badge: 'bg-danger-600 text-white',       dot: 'bg-white' },
  purple:  { badge: 'bg-primary-600 text-white',      dot: 'bg-white' },
}

const outlineMap: Record<string, { badge: string; dot: string }> = {
  gray:    { badge: 'border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300', dot: 'bg-neutral-400' },
  green:   { badge: 'border border-success-500/40 text-success-700 dark:text-success-400',                     dot: 'bg-success-500' },
  emerald: { badge: 'border border-success-500/40 text-success-700 dark:text-success-400',                     dot: 'bg-success-500' },
  blue:    { badge: 'border border-info-500/40 text-info-700 dark:text-info-400',                              dot: 'bg-info-500' },
  orange:  { badge: 'border border-warning-500/40 text-warning-700 dark:text-warning-500',                     dot: 'bg-warning-500' },
  red:     { badge: 'border border-danger-500/40 text-danger-700 dark:text-danger-400',                        dot: 'bg-danger-500' },
  purple:  { badge: 'border border-primary-500/40 text-primary-700 dark:text-primary-300',                     dot: 'bg-primary-500' },
}

const variantClasses = computed(() => {
  const map = props.variant === 'solid' ? solidMap : props.variant === 'outline' ? outlineMap : softMap
  return map[props.color]?.badge ?? softMap.gray.badge
})

const dotColorClass = computed(() => {
  const map = props.variant === 'solid' ? solidMap : props.variant === 'outline' ? outlineMap : softMap
  return map[props.color]?.dot ?? softMap.gray.dot
})

const sizeClasses = computed(() => props.size === 'xs'
  ? 'px-1.5 h-4 text-[10px] rounded-sm tracking-wide'
  : 'px-2 h-5 text-[11px] rounded-md')

const dotSizeClass = computed(() => props.size === 'xs' ? 'w-1 h-1' : 'w-1.5 h-1.5')
const iconSizeClass = computed(() => props.size === 'xs' ? 'w-2.5 h-2.5' : 'w-3 h-3')
</script>
