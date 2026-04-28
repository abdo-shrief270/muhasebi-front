<template>
  <div>
    <div
      class="flex items-center gap-0.5 border-b border-neutral-200 dark:border-neutral-800 mb-5 overflow-x-auto scrollbar-hide"
      role="tablist"
    >
      <button
        v-for="tab in tabs"
        :key="tab.key"
        type="button"
        role="tab"
        :aria-selected="modelValue === tab.key"
        @click="$emit('update:modelValue', tab.key)"
        class="relative inline-flex items-center gap-1.5 h-9 px-3 text-xs font-medium transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 rounded-t-md"
        :class="modelValue === tab.key
          ? 'text-primary-700 dark:text-primary-300'
          : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-0 hover:bg-neutral-50 dark:hover:bg-neutral-800/40'"
      >
        <UIcon v-if="tab.icon" :name="tab.icon" class="w-3.5 h-3.5 flex-shrink-0" />
        <span>{{ tab.label }}</span>
        <span
          v-if="tab.count !== undefined"
          class="ms-0.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-semibold rounded-sm tabular-nums"
          :class="modelValue === tab.key
            ? 'bg-primary-500/15 text-primary-700 dark:text-primary-300'
            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400'"
        >
          {{ tab.count }}
        </span>
        <span
          v-if="modelValue === tab.key"
          class="absolute -bottom-px start-0 end-0 h-0.5 bg-primary-500 rounded-t-full"
          aria-hidden="true"
        />
      </button>
    </div>
    <slot />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: string
  tabs: { key: string; label: string; count?: number; icon?: string }[]
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<style scoped>
.scrollbar-hide { scrollbar-width: none; }
.scrollbar-hide::-webkit-scrollbar { display: none; }
</style>
