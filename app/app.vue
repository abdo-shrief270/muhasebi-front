<template>
  <UApp>
    <NuxtLoadingIndicator color="var(--color-primary-500, #2c3e50)" :height="2" />
    <NuxtPage />
    <UiOfflineIndicator />
  </UApp>
</template>

<script setup lang="ts">
// `<html dir="..">` + font-family is set by plugins/direction.ts on both
// SSR and client. Keep this shell minimal — overlays (toasts, modals,
// slide-overs) are portaled inside <UApp>.
useHead({
  link: [
    { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
  ],
})
</script>
