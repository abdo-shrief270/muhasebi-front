<template>
  <div class="relative">
    <UIcon
      name="i-lucide-search"
      class="absolute start-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none"
    />
    <input
      :value="modelValue"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      type="text"
      :placeholder="placeholder || $t('common.search')"
      :class="[
        'w-full ps-8 pe-8 h-8 text-xs rounded-md border bg-neutral-0 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-0 placeholder:text-neutral-400 outline-none transition-colors',
        'border-neutral-200 dark:border-neutral-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20',
      ]"
    />
    <button
      v-if="modelValue"
      type="button"
      @click="$emit('update:modelValue', '')"
      class="absolute end-1.5 top-1/2 -translate-y-1/2 w-5 h-5 inline-flex items-center justify-center rounded-sm text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
      :aria-label="locale === 'ar' ? 'مسح' : 'Clear'"
    >
      <UIcon name="i-lucide-x" class="w-3 h-3" />
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: string
  placeholder?: string
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()

const { locale } = useI18n()
</script>
