<script setup lang="ts">
import type { FeatureAccess } from './types'

const props = defineProps<{ id: string }>()
const { feature, access } = useFeature(props.id)

defineSlots<{
  default(props: { allowed: boolean; access: FeatureAccess }): any
  denied(props: { access: FeatureAccess }): any
}>()
</script>

<template>
  <template v-if="access.allowed">
    <slot :allowed="true" :access="access" />
  </template>
  <template v-else-if="!feature?.hideWhenDenied">
    <slot name="denied" :access="access" />
  </template>
</template>
