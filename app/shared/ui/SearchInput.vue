<template>
  <div class="relative">
    <span class="absolute start-3 top-1/2 -translate-y-1/2 text-gray-300 text-sm">&#x1F50D;</span>
    <input
      :value="modelValue"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      type="text"
      :placeholder="placeholder || $t('common.search')"
      class="w-full ps-10 pe-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all placeholder:text-gray-300"
    />
    <button
      v-if="modelValue"
      @click="$emit('update:modelValue', '')"
      class="absolute end-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 text-xs"
    >
      &#10005;
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
</script>
