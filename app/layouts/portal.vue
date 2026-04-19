<template>
  <div class="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col">
    <header class="h-16 bg-neutral-0 dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between px-6 flex-shrink-0 sticky top-0 z-20">
      <div class="flex items-center gap-6">
        <NuxtLink to="/portal" class="flex items-center gap-2">
          <img v-if="tenantLogo" :src="tenantLogo" alt="" class="w-8 h-8 rounded-lg object-cover" />
          <div
            v-else
            class="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white"
            :style="{ backgroundColor: primaryColor }"
          >
            {{ tenantName ? tenantName.charAt(0).toUpperCase() : 'M' }}
          </div>
          <span class="hidden sm:block text-base font-semibold">{{ tenantName || $t('app.name') }}</span>
        </NuxtLink>
        <nav class="hidden md:flex items-center gap-1">
          <NuxtLink
            v-for="link in items"
            :key="link.to"
            :to="link.to"
            class="px-3 py-2 text-sm rounded-lg transition-colors"
            :class="isActive(link.to)
              ? 'bg-primary-50 text-primary-600 font-semibold dark:bg-primary-500/10 dark:text-primary-400'
              : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:text-neutral-100 dark:hover:bg-neutral-800'
            "
          >
            {{ $t(link.label, link.id) }}
          </NuxtLink>
        </nav>
      </div>
      <div class="flex items-center gap-2">
        <button
          type="button"
          class="md:hidden w-9 h-9 flex items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          @click="mobileOpen = !mobileOpen"
          :aria-label="locale === 'ar' ? 'القائمة' : 'Menu'"
        >
          <UIcon :name="mobileOpen ? 'i-lucide-x' : 'i-lucide-menu'" class="w-5 h-5" />
        </button>
        <button
          type="button"
          class="px-3 h-9 rounded-lg text-sm font-medium text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          @click="toggleLocale"
        >
          {{ locale === 'ar' ? 'EN' : 'عر' }}
        </button>
        <button
          type="button"
          class="px-3 h-9 rounded-lg text-sm font-medium text-neutral-500 hover:bg-danger-50 hover:text-danger-600 dark:hover:bg-danger-500/10 transition-colors"
          @click="handleLogout"
        >
          {{ $t('auth.logout') }}
        </button>
      </div>
    </header>

    <div
      v-if="mobileOpen"
      class="md:hidden border-b border-neutral-200 dark:border-neutral-800 bg-neutral-0 dark:bg-neutral-950"
    >
      <nav class="flex flex-col px-4 py-3 gap-1">
        <NuxtLink
          v-for="link in items"
          :key="link.to"
          :to="link.to"
          class="px-3 py-2 text-base rounded-lg"
          :class="isActive(link.to)
            ? 'bg-primary-50 text-primary-600 font-semibold dark:bg-primary-500/10 dark:text-primary-400'
            : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800'
          "
        >
          {{ $t(link.label, link.id) }}
        </NuxtLink>
      </nav>
    </div>

    <main class="flex-1 w-full max-w-screen-xl mx-auto px-6 py-8">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
const { locale, setLocale } = useI18n()
const authStore = useAuthStore()
const route = useRoute()
const { tenantName, tenantLogo, primaryColor } = useTenantTheme()
const { items } = usePortalNavigation()

const mobileOpen = ref(false)
watch(() => route.path, () => { mobileOpen.value = false })

function isActive(to: string): boolean {
  if (to === route.path) return true
  return to !== '/portal' && route.path.startsWith(to + '/')
    // Treat /portal as exact match only so every portal page doesn't light it up.
    || (to === '/portal' && route.path === '/portal')
}

function toggleLocale() { setLocale(locale.value === 'ar' ? 'en' : 'ar') }
async function handleLogout() { await authStore.logout(); navigateTo('/auth/login') }
</script>
