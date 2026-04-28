<template>
  <div class="relative">
    <select
      :value="modelValue"
      @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
      class="ps-3 pe-8 h-8 text-xs rounded-md border border-neutral-200 dark:border-neutral-800 bg-neutral-0 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-colors appearance-none cursor-pointer min-w-[140px]"
    >
      <option v-if="allLabel" value="">{{ allLabel }}</option>
      <option v-for="opt in options" :key="opt.value" :value="opt.value">
        {{ opt.label }}
      </option>
    </select>
    <UIcon
      name="i-lucide-chevron-down"
      class="absolute end-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none"
    />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: string
  options: { value: string; label: string }[]
  allLabel?: string
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>
