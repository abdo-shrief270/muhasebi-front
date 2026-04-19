<template>
  <div class="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-0 dark:bg-neutral-950 px-4 py-3 sticky top-12 z-10">
    <nav v-if="crumbs.length > 1" aria-label="Breadcrumb" class="mb-1.5">
      <ol class="flex items-center gap-1 text-[11px] text-neutral-400">
        <li v-for="(c, idx) in crumbs" :key="idx" class="flex items-center gap-1">
          <NuxtLink
            v-if="c.to && idx < crumbs.length - 1"
            :to="c.to"
            class="hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
          >
            {{ $t(c.label, c.label) }}
          </NuxtLink>
          <span
            v-else
            class="text-neutral-500 dark:text-neutral-400"
          >
            {{ $t(c.label, c.label) }}
          </span>
          <UIcon
            v-if="idx < crumbs.length - 1"
            :name="isRtl ? 'i-lucide-chevron-left' : 'i-lucide-chevron-right'"
            class="w-3 h-3 text-neutral-300"
          />
        </li>
      </ol>
    </nav>

    <div class="flex items-start justify-between gap-4">
      <div class="min-w-0 flex-1">
        <h1 class="text-lg font-semibold text-neutral-900 dark:text-neutral-0 leading-tight truncate">
          <slot name="title">{{ title }}</slot>
        </h1>
        <p v-if="description || $slots.description" class="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400 truncate">
          <slot name="description">{{ description }}</slot>
        </p>
      </div>
      <div v-if="$slots.actions" class="flex items-center gap-2 flex-shrink-0">
        <slot name="actions" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title?: string
  description?: string
}>()

const { crumbs } = useBreadcrumbs()
const { isRtl } = useDir()
</script>
