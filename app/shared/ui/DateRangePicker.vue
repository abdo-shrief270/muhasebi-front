<template>
  <div class="flex items-center gap-2">
    <input
      :value="from"
      @input="$emit('update:from', ($event.target as HTMLInputElement).value)"
      type="date"
      class="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
    />
    <span class="text-gray-300 text-xs">{{ locale === 'ar' ? 'إلى' : 'to' }}</span>
    <input
      :value="to"
      @input="$emit('update:to', ($event.target as HTMLInputElement).value)"
      type="date"
      class="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
    />
  </div>
</template>

<script setup lang="ts">
const { locale } = useI18n()

defineProps<{
  from: string
  to: string
}>()

defineEmits<{
  'update:from': [value: string]
  'update:to': [value: string]
}>()
</script>
