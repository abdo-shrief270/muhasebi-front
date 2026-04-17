<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <!-- Topbar -->
    <header class="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0">
      <div class="flex items-center gap-4">
        <h1 class="text-lg font-bold text-primary-500">{{ $t('app.name') }}</h1>
        <nav class="hidden md:flex items-center gap-1 ms-6">
          <NuxtLink v-for="link in navLinks" :key="link.to" :to="link.to"
            class="px-3 py-2 text-sm rounded-lg transition-colors"
            :class="route.path === link.to ? 'bg-primary-50 text-primary-500 font-semibold' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'"
          >
            {{ link.label }}
          </NuxtLink>
        </nav>
      </div>
      <div class="flex items-center gap-3">
        <button @click="toggleLocale" class="text-sm text-gray-400 hover:text-primary-500 transition">
          {{ locale === 'ar' ? 'EN' : 'عر' }}
        </button>
        <button @click="handleLogout" class="text-sm text-gray-400 hover:text-red-500 transition">
          {{ $t('auth.logout') }}
        </button>
      </div>
    </header>

    <main class="flex-1 max-w-6xl w-full mx-auto px-6 py-8">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
const { locale, setLocale } = useI18n()
const route = useRoute()
const authStore = useAuthStore()

const navLinks = computed(() => [
  { to: '/portal', label: locale.value === 'ar' ? 'الرئيسية' : 'Dashboard' },
  { to: '/portal/invoices', label: locale.value === 'ar' ? 'الفواتير' : 'Invoices' },
  { to: '/portal/documents', label: locale.value === 'ar' ? 'المستندات' : 'Documents' },
  { to: '/portal/messages', label: locale.value === 'ar' ? 'الرسائل' : 'Messages' },
  { to: '/portal/notifications', label: locale.value === 'ar' ? 'الإشعارات' : 'Notifications' },
  { to: '/portal/profile', label: locale.value === 'ar' ? 'الملف الشخصي' : 'Profile' },
])

function toggleLocale() { setLocale(locale.value === 'ar' ? 'en' : 'ar') }
async function handleLogout() { await authStore.logout(); navigateTo('/auth/login') }
</script>
