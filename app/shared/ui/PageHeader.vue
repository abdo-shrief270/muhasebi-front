<template>
  <div
    v-motion
    :initial="{ opacity: 0, y: -6 }"
    :enter="{ opacity: 1, y: 0 }"
    class="mb-5"
  >
    <!-- Breadcrumb (optional) -->
    <nav
      v-if="breadcrumb && breadcrumb.length > 0"
      class="flex items-center gap-1 text-xs text-neutral-400 mb-2"
      :aria-label="locale === 'ar' ? 'مسار التنقل' : 'Breadcrumb'"
    >
      <template v-for="(crumb, i) in breadcrumb" :key="i">
        <NuxtLink
          v-if="crumb.to && i < breadcrumb.length - 1"
          :to="crumb.to"
          class="hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
        >
          {{ crumb.label }}
        </NuxtLink>
        <span
          v-else
          class="font-medium text-neutral-700 dark:text-neutral-200"
        >
          {{ crumb.label }}
        </span>
        <UIcon
          v-if="i < breadcrumb.length - 1"
          name="i-lucide-chevron-right"
          class="w-3 h-3 text-neutral-300 dark:text-neutral-700 rtl:rotate-180"
        />
      </template>
    </nav>

    <div class="flex items-start sm:items-center justify-between gap-3 flex-wrap">
      <div class="min-w-0 flex-1">
        <div class="flex items-center gap-2.5">
          <UIcon v-if="icon" :name="icon" class="w-5 h-5 text-neutral-400 flex-shrink-0" />
          <h1 class="text-xl font-bold text-neutral-900 dark:text-neutral-0 tracking-tight truncate">
            {{ title }}
          </h1>
          <slot name="title-meta" />
        </div>
        <p
          v-if="subtitle"
          class="text-sm text-neutral-500 dark:text-neutral-400 mt-1 truncate"
        >
          {{ subtitle }}
        </p>
      </div>

      <div v-if="$slots.actions" class="flex items-center gap-2 flex-shrink-0">
        <slot name="actions" />
      </div>
    </div>

    <slot name="below" />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
  icon?: string
  breadcrumb?: { label: string; to?: string }[]
}>()

const { locale } = useI18n()
</script>
