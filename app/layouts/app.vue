<template>
  <div class="min-h-screen flex bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
    <UiOfflineIndicator />

    <div
      v-if="mobileOpen"
      class="fixed inset-0 bg-neutral-950/40 z-30 lg:hidden"
      @click="mobileOpen = false"
      aria-hidden="true"
    />

    <div
      class="fixed lg:static inset-y-0 start-0 z-40 transition-transform duration-200"
      :class="mobileOpen ? 'translate-x-0' : (isRtl ? 'translate-x-full lg:translate-x-0' : '-translate-x-full lg:translate-x-0')"
    >
      <UiAppSidebar />
    </div>

    <div class="flex-1 flex flex-col min-w-0">
      <UiAppTopbar
        @toggle-sidebar="mobileOpen = !mobileOpen"
        @open-search="searchRef?.open()"
      />

      <main class="flex-1 overflow-y-auto">
        <slot />
      </main>

      <UiAppFooter />
    </div>

    <UiGlobalSearch ref="searchRef" />
  </div>
</template>

<script setup lang="ts">
const { isRtl } = useDir()
const { init: initDarkMode } = useDarkMode()
const searchRef = ref<{ open: () => void }>()
const mobileOpen = ref(false)

const route = useRoute()
watch(() => route.path, () => { mobileOpen.value = false })

onMounted(() => {
  initDarkMode()
  const handler = (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault()
      searchRef.value?.open()
    }
  }
  window.addEventListener('keydown', handler)
  onBeforeUnmount(() => window.removeEventListener('keydown', handler))
})
</script>
