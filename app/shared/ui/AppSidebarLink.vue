<template>
  <NuxtLink
    :to="to"
    class="group relative flex items-center gap-2.5 rounded-md text-[13px] leading-tight transition-colors"
    :class="[
      isCollapsed ? 'px-2 py-2 justify-center' : 'px-2.5 py-1.5',
      isActive
        ? 'bg-primary-500/10 text-primary-700 dark:bg-primary-500/15 dark:text-primary-300 font-semibold'
        : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-neutral-0',
    ]"
    :title="isCollapsed ? label : undefined"
  >
    <span
      v-if="isActive"
      class="absolute start-0 top-1.5 bottom-1.5 w-[2px] rounded-e-full bg-primary-500"
      aria-hidden="true"
    />
    <UIcon
      :name="icon"
      class="w-4 h-4 flex-shrink-0 transition-colors"
      :class="isActive ? 'text-primary-600 dark:text-primary-400' : 'text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300'"
    />
    <span v-if="!isCollapsed" class="truncate flex-1">{{ label }}</span>
    <span
      v-if="!isCollapsed && badge"
      class="text-[10px] font-semibold px-1.5 h-4 inline-flex items-center justify-center rounded-sm"
      :class="isActive ? 'bg-primary-500/20 text-primary-700 dark:text-primary-300' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500'"
    >
      {{ badge }}
    </span>
  </NuxtLink>
</template>

<script setup lang="ts">
const props = defineProps<{
  to: string
  icon: string
  label: string
  isCollapsed?: boolean
  badge?: string | number
}>()

const route = useRoute()
const isActive = computed(() => {
  if (props.to === route.path) return true
  return props.to !== '/' && route.path.startsWith(props.to + '/')
})
</script>
