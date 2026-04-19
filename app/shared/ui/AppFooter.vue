<template>
  <footer class="h-8 flex items-center justify-between px-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-0 dark:bg-neutral-950 text-[10px] text-neutral-400 flex-shrink-0">
    <div class="flex items-center gap-3 truncate">
      <span v-if="tenantName" class="truncate">{{ tenantName }}</span>
      <span v-if="showEnvBadge" class="px-1.5 py-0.5 rounded bg-warning-500/10 text-warning-700 dark:text-warning-500 font-medium">
        {{ appEnv }}
      </span>
    </div>
    <div class="flex items-center gap-3 flex-shrink-0">
      <span>{{ baseCurrency }}</span>
      <span class="hidden sm:inline">{{ timezone }}</span>
      <span v-if="buildHash" class="hidden md:inline font-mono">#{{ buildHash }}</span>
    </div>
  </footer>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()
const authStore = useAuthStore()
const { tenantName } = useTenantTheme()

const appEnv = computed(() => (config.public.appEnv as string) || 'development')
const showEnvBadge = computed(() => appEnv.value !== 'production')
const baseCurrency = computed(() => (authStore.user as any)?.tenant?.base_currency || 'EGP')
const timezone = computed(() => (authStore.user as any)?.tenant?.timezone || authStore.user?.timezone || 'Africa/Cairo')
const buildHash = computed(() => (config.public.buildHash as string) || '')
</script>
