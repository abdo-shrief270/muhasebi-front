<template>
  <div class="space-y-4 animate-pulse">
    <div v-for="i in lines" :key="i" class="skeleton" :style="{ height: height + 'px', width: widths[i % widths.length] }"></div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  lines?: number
  height?: number
}>(), {
  lines: 3,
  height: 16,
})

const widths = ['100%', '80%', '60%', '90%', '70%']
</script>
