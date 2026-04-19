<template>
  <NuxtLink
    :to="to"
    class="group relative flex items-center gap-2 rounded-md text-[13px] leading-tight transition-colors"
    :class="[
      isCollapsed ? 'ps-2 pe-2 py-2 justify-center' : 'ps-2 pe-2 py-1.5',
      isActive
        ? 'bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-0 font-medium'
        : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-0',
    ]"
    :title="isCollapsed ? label : undefined"
  >
    <span
      v-if="isActive"
      class="absolute start-0 top-1 bottom-1 w-[2px] rounded-e bg-primary-500"
      aria-hidden="true"
    />
    <UIcon :name="icon" class="w-4 h-4 flex-shrink-0" :class="isActive ? 'text-primary-500' : 'text-neutral-400'" />
    <span v-if="!isCollapsed" class="truncate">{{ label }}</span>
  </NuxtLink>
</template>

<script setup lang="ts">
const props = defineProps<{
  to: string
  icon: string
  label: string
  isCollapsed?: boolean
}>()

const route = useRoute()
const isActive = computed(() => {
  if (props.to === route.path) return true
  // Avoid `/` matching everything; prefix-match only for non-root paths with a trailing segment.
  return props.to !== '/' && route.path.startsWith(props.to + '/')
})
</script>
