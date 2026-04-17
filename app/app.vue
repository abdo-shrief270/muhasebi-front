<template>
  <div :dir="locale === 'ar' ? 'rtl' : 'ltr'">
    <NuxtLoadingIndicator color="#3498db" :height="3" />
    <NuxtPage />
    <UiToastContainer />
  </div>
</template>

<script setup lang="ts">
const { locale } = useI18n()

useHead({
  htmlAttrs: {
    lang: locale,
    dir: computed(() => locale.value === 'ar' ? 'rtl' : 'ltr'),
  },
  link: [
    { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
  ],
})
</script>
