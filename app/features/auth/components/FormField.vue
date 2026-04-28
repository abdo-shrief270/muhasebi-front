<template>
  <div>
    <div class="flex items-center justify-between mb-1.5">
      <label class="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
        {{ label }}
      </label>
      <slot name="label-action" />
    </div>
    <div class="relative">
      <UIcon
        v-if="icon"
        :name="icon"
        class="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none"
      />
      <slot />
      <div v-if="$slots.trailing" class="absolute end-2 top-1/2 -translate-y-1/2">
        <slot name="trailing" />
      </div>
    </div>
    <ul v-if="errors && errors.length > 0" class="mt-1.5 space-y-0.5">
      <li
        v-for="(msg, i) in errors"
        :key="i"
        class="text-xs text-danger-600 dark:text-danger-500 flex items-start gap-1"
      >
        <UIcon name="i-lucide-alert-circle" class="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
        <span>{{ msg }}</span>
      </li>
    </ul>
    <p v-else-if="error" class="mt-1.5 text-xs text-danger-600 dark:text-danger-500 flex items-center gap-1">
      <UIcon name="i-lucide-alert-circle" class="w-3.5 h-3.5" />
      {{ error }}
    </p>
    <div v-else-if="$slots.help" class="mt-1.5">
      <slot name="help" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  icon?: string
  error?: string
  errors?: string[]
}>()
</script>
