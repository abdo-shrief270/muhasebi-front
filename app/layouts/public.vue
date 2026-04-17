<template>
  <div :dir="locale === 'ar' ? 'rtl' : 'ltr'" class="min-h-screen bg-white font-cairo flex flex-col">
    <LandingNavbar />
    <main class="flex-1 pt-24">
      <slot />
    </main>
    <LandingFooter />
  </div>
</template>

<script setup lang="ts">
const { locale } = useI18n()
</script>
