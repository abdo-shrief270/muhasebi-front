<script setup lang="ts">
const props = defineProps<{
  perm?: string
  any?: string[]
  all?: string[]
}>()

const { can, canAny, permissions, isSuperAdmin } = usePermissions()

const allowed = computed(() => {
  if (isSuperAdmin.value) return true
  if (props.perm) return can(props.perm)
  if (props.any?.length) return canAny(props.any)
  if (props.all?.length) return props.all.every(p => permissions.value.includes(p))
  return true
})
</script>

<template>
  <template v-if="allowed">
    <slot />
  </template>
  <slot v-else name="fallback" />
</template>
