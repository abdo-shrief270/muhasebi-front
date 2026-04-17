<template>
  <div class="min-h-screen bg-gray-50/80 flex">
    <OfflineIndicator />

    <div v-if="sidebarOpen" class="fixed inset-0 bg-black/30 z-40 lg:hidden" @click="sidebarOpen = false"></div>

    <aside
      class="w-64 text-white flex-shrink-0 flex flex-col transition-all duration-300 fixed lg:relative z-50 h-full"
      :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:-ms-64'"
      :style="{ backgroundColor: primaryColor, backgroundImage: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.15))' }"
    >
      <div class="h-16 flex items-center gap-3 px-5 border-b border-white/10">
        <img v-if="tenantLogo" :src="tenantLogo" alt="" class="w-8 h-8 rounded-lg object-cover" />
        <div v-else class="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-sm font-bold">
          {{ tenantName ? tenantName.charAt(0) : 'M' }}
        </div>
        <div>
          <h1 class="text-sm font-bold tracking-wide">{{ tenantName || $t('app.name') }}</h1>
          <p class="text-[10px] text-white/40">{{ locale === 'ar' ? 'نظام محاسبة' : 'Accounting' }}</p>
        </div>
      </div>

      <nav class="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
        <template v-for="group in groups" :key="group.id">
          <p class="text-[10px] font-semibold text-white/30 uppercase tracking-widest px-3 mt-5 mb-2 first:mt-0">
            {{ $t(`nav.groups.${group.id}`, group.id) }}
          </p>
          <SidebarLink
            v-for="item in group.items"
            :key="item.id"
            :to="item.to"
            :icon="item.icon"
            :label="$t(item.label)"
          />
        </template>
      </nav>

      <div class="p-3 border-t border-white/10">
        <div class="flex items-center gap-3 p-2 rounded-xl bg-white/[0.08]">
          <div class="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0">
            {{ authStore.user?.name?.charAt(0) }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-xs font-medium truncate">{{ authStore.user?.name }}</p>
            <p class="text-[10px] text-white/40 truncate">{{ authStore.user?.role }}</p>
          </div>
        </div>
      </div>
    </aside>

    <div class="flex-1 flex flex-col min-w-0">
      <header class="h-14 bg-white/[0.08]0 backdrop-blur-md border-b border-gray-200/50 flex items-center justify-between px-6 flex-shrink-0 sticky top-0 z-30">
        <div class="flex items-center gap-3">
          <button @click="sidebarOpen = !sidebarOpen" class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"/></svg>
          </button>
        </div>

        <div class="flex items-center gap-2">
          <button @click="searchRef?.open()" class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition" :title="'Ctrl+K'">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"/></svg>
          </button>

          <Feature id="timesheets" v-slot="{ allowed }">
            <TimerWidget v-if="allowed" />
          </Feature>

          <button @click="toggleLocale" class="w-8 h-8 flex items-center justify-center rounded-lg text-xs text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition font-medium">
            {{ locale === 'ar' ? 'EN' : 'عر' }}
          </button>

          <button @click="toggleDarkMode" class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition" :title="isDark ? 'Light mode' : 'Dark mode'">
            <svg v-if="isDark" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"/></svg>
            <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"/></svg>
          </button>

          <NotificationBell />

          <NuxtLink to="/settings" class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition">
            <svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/></svg>
          </NuxtLink>

          <Feature id="subscription" v-slot="{ allowed }">
            <template v-if="allowed">
              <div class="w-px h-5 bg-gray-200 mx-1"></div>
              <NuxtLink to="/subscription" class="text-xs text-gray-400 hover:text-primary-500 transition px-2 py-1 rounded-lg hover:bg-primary-50">
                {{ $t('nav.subscription') }}
              </NuxtLink>
            </template>
          </Feature>

          <button @click="handleLogout" class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-300 hover:bg-red-50 hover:text-red-500 transition ms-1" :title="$t('auth.logout')">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9"/></svg>
          </button>
        </div>
      </header>

      <main class="flex-1 overflow-y-auto p-6">
        <slot />
      </main>
    </div>

    <GlobalSearch ref="searchRef" />
  </div>
</template>

<script setup lang="ts">
const { locale, setLocale } = useI18n()
const authStore = useAuthStore()
const { tenantName, tenantLogo, primaryColor } = useTenantTheme()
const { isDark, toggle: toggleDarkMode, init: initDarkMode } = useDarkMode()
const { groups } = useNavigation()
const searchRef = ref<{ open: () => void }>()
const sidebarOpen = ref(true)

onMounted(initDarkMode)

function toggleLocale() { setLocale(locale.value === 'ar' ? 'en' : 'ar') }
async function handleLogout() { await authStore.logout(); navigateTo('/auth/login') }
</script>
