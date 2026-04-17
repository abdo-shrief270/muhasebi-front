<template>
  <div>
    <div class="flex border-b border-gray-100 gap-1 mb-6">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        @click="$emit('update:modelValue', tab.key)"
        class="px-4 py-2.5 text-sm font-medium rounded-t-lg transition-all relative"
        :class="modelValue === tab.key
          ? 'text-primary-500'
          : 'text-gray-400 hover:text-gray-600'
        "
      >
        {{ tab.label }}
        <span v-if="tab.count !== undefined" class="ms-1.5 text-xs bg-gray-100 text-gray-500 rounded-full px-1.5 py-0.5">
          {{ tab.count }}
        </span>
        <div
          v-if="modelValue === tab.key"
          class="absolute bottom-0 start-0 end-0 h-0.5 bg-primary-500 rounded-t"
        ></div>
      </button>
    </div>
    <slot />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: string
  tabs: { key: string; label: string; count?: number }[]
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>
