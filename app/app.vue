<template>
  <UApp>
    <NuxtLoadingIndicator color="var(--color-primary-500, #2c3e50)" :height="2" />
    <!--
      `<NuxtLayout>` (no `name` prop) picks the layout up from each page's
      `definePageMeta({ layout: '…' })`. Mounting it once here means the
      layout chrome (sidebar, topbar, …) persists across client navigations
      instead of being remounted by every page — which was the root cause
      of the "blank page until refresh" bug, where page-leave + page-enter
      transition Suspense got wedged on the inner layout instance.
    -->
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
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
