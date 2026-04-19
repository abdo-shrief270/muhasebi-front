<template>
  <header
    class="h-12 flex items-center gap-2 px-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-0 dark:bg-neutral-950 sticky top-0 z-20"
  >
    <button
      type="button"
      class="lg:hidden w-8 h-8 flex items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
      @click="$emit('toggle-sidebar')"
      :aria-label="locale === 'ar' ? 'القائمة' : 'Menu'"
    >
      <UIcon name="i-lucide-menu" class="w-5 h-5" />
    </button>

    <div class="flex-1 max-w-md">
      <button
        type="button"
        class="w-full h-8 flex items-center gap-2 ps-3 pe-2 rounded-md border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-xs"
        @click="openSearch"
      >
        <UIcon name="i-lucide-search" class="w-4 h-4 flex-shrink-0" />
        <span class="flex-1 text-start truncate">{{ locale === 'ar' ? 'بحث…' : 'Search…' }}</span>
        <kbd class="hidden sm:inline-flex items-center px-1.5 h-5 rounded border border-neutral-200 dark:border-neutral-700 bg-neutral-0 dark:bg-neutral-950 text-[10px] font-mono text-neutral-400">
          {{ cmdKeyLabel }}
        </kbd>
      </button>
    </div>

    <div class="flex items-center gap-1 ms-auto">
      <Feature id="timesheets" v-slot="{ allowed }">
        <UiTimerWidget v-if="allowed" />
      </Feature>

      <button
        type="button"
        class="w-8 h-8 flex items-center justify-center rounded-md text-xs font-medium text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        @click="toggleLocale"
        :aria-label="locale === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'"
      >
        {{ locale === 'ar' ? 'EN' : 'عر' }}
      </button>

      <button
        type="button"
        class="w-8 h-8 flex items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        @click="toggleDarkMode"
        :aria-label="isDark ? 'Light mode' : 'Dark mode'"
      >
        <UIcon :name="isDark ? 'i-lucide-sun' : 'i-lucide-moon'" class="w-4 h-4" />
      </button>

      <UiNotificationBell />

      <NuxtLink
        to="/settings"
        class="w-8 h-8 flex items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        :aria-label="$t('nav.general')"
      >
        <UIcon name="i-lucide-settings" class="w-4 h-4" />
      </NuxtLink>

      <div class="w-px h-5 bg-neutral-200 dark:bg-neutral-800 mx-1" />

      <div class="flex items-center gap-2 ps-1">
        <div
          class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold text-white flex-shrink-0"
          :style="{ backgroundColor: primaryColor }"
        >
          {{ initials }}
        </div>
        <div class="hidden md:flex flex-col leading-tight">
          <span class="text-xs font-medium text-neutral-900 dark:text-neutral-0 truncate max-w-[120px]">{{ authStore.user?.name }}</span>
          <span class="text-[10px] text-neutral-400 truncate max-w-[120px]">{{ authStore.user?.role }}</span>
        </div>
      </div>

      <button
        type="button"
        class="w-8 h-8 flex items-center justify-center rounded-md text-neutral-400 hover:bg-danger-50 hover:text-danger-500 dark:hover:bg-danger-500/10 transition-colors"
        @click="handleLogout"
        :aria-label="$t('auth.logout')"
        :title="$t('auth.logout')"
      >
        <UIcon name="i-lucide-log-out" class="w-4 h-4" />
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  'toggle-sidebar': []
  'open-search': []
}>()

const { locale, setLocale } = useI18n()
const authStore = useAuthStore()
const { isDark, toggle: toggleDarkMode } = useDarkMode()
const { primaryColor } = useTenantTheme()

const initials = computed(() => authStore.user?.name?.charAt(0).toUpperCase() ?? '?')
const cmdKeyLabel = computed(() => {
  if (!import.meta.client) return 'Ctrl+K'
  return navigator.platform.toLowerCase().includes('mac') ? '⌘K' : 'Ctrl+K'
})

function openSearch() { emit('open-search') }
function toggleLocale() { setLocale(locale.value === 'ar' ? 'en' : 'ar') }
async function handleLogout() {
  await authStore.logout()
  navigateTo('/auth/login')
}
</script>
