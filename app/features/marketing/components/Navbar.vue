<template>
  <nav
    class="fixed top-0 inset-x-0 z-50 transition-all duration-300"
    :class="scrolled ? 'bg-white/90 backdrop-blur-xl shadow-sm shadow-gray-200/50' : 'bg-transparent'"
  >
    <div class="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
      <!-- Logo -->
      <NuxtLink to="/" class="flex items-center gap-2.5 group">
        <div class="w-9 h-9 bg-gradient-to-br from-primary-500 to-secondary-400 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20 group-hover:shadow-primary-500/40 transition-shadow">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
          </svg>
        </div>
        <span class="text-xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
          {{ t('app.name') }}
        </span>
      </NuxtLink>

      <!-- Desktop Navigation -->
      <div class="hidden lg:flex items-center gap-1">
        <a
          v-for="link in navLinks"
          :key="link.id"
          :href="`#${link.id}`"
          @click.prevent="scrollToSection(link.id)"
          class="px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200"
          :class="scrolled ? 'text-gray-600 hover:text-primary-500 hover:bg-primary-50' : 'text-gray-700 hover:text-primary-500 hover:bg-white/50'"
        >
          {{ link.label }}
        </a>
        <!-- Full feature tour — opens dedicated /features page rather than
             scrolling to a section on the home page. -->
        <NuxtLink
          to="/features"
          class="px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 inline-flex items-center gap-1.5"
          :class="scrolled ? 'text-gray-600 hover:text-primary-500 hover:bg-primary-50' : 'text-gray-700 hover:text-primary-500 hover:bg-white/50'"
        >
          {{ locale === 'ar' ? 'الميزات الكاملة' : 'All Features' }}
          <span class="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-primary-50 text-primary-700">
            {{ locale === 'ar' ? 'جديد' : 'NEW' }}
          </span>
        </NuxtLink>
      </div>

      <!-- Desktop Actions -->
      <div class="hidden lg:flex items-center gap-3">
        <button
          @click="toggleLocale"
          class="text-sm font-medium px-3 py-1.5 rounded-lg transition-all"
          :class="scrolled ? 'text-gray-400 hover:text-gray-600 hover:bg-gray-50' : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'"
        >
          {{ locale === 'ar' ? 'EN' : 'عربي' }}
        </button>
        <NuxtLink
          to="/auth/login"
          class="text-sm font-medium px-5 py-2.5 rounded-xl transition-all"
          :class="scrolled ? 'text-gray-600 hover:text-primary-500' : 'text-gray-700 hover:text-primary-500'"
        >
          {{ t('auth.login') }}
        </NuxtLink>
        <NuxtLink
          to="/auth/register"
          class="text-sm font-semibold bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-2.5 rounded-xl hover:shadow-lg hover:shadow-primary-500/30 transition-all active:scale-[0.97]"
        >
          {{ t('landing.hero.cta') }}
        </NuxtLink>
      </div>

      <!-- Mobile Menu Toggle -->
      <button
        @click="mobileOpen = !mobileOpen"
        class="lg:hidden p-2 rounded-xl transition-colors"
        :class="scrolled ? 'text-gray-600 hover:bg-gray-100' : 'text-gray-700 hover:bg-white/50'"
      >
        <svg v-if="!mobileOpen" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
        <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18 18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Mobile Menu -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div v-if="mobileOpen" class="lg:hidden bg-white/95 backdrop-blur-xl border-t border-gray-100 shadow-xl">
        <div class="max-w-7xl mx-auto px-6 py-4 space-y-1">
          <a
            v-for="link in navLinks"
            :key="link.id"
            :href="`#${link.id}`"
            @click.prevent="scrollToSection(link.id); mobileOpen = false"
            class="block px-4 py-3 text-sm font-medium text-gray-600 hover:text-primary-500 hover:bg-primary-50 rounded-xl transition"
          >
            {{ link.label }}
          </a>
          <NuxtLink
            to="/features"
            @click="mobileOpen = false"
            class="block px-4 py-3 text-sm font-medium text-gray-600 hover:text-primary-500 hover:bg-primary-50 rounded-xl transition"
          >
            {{ locale === 'ar' ? 'الميزات الكاملة' : 'All Features' }}
          </NuxtLink>
          <div class="pt-3 border-t border-gray-100 flex flex-col gap-2">
            <button @click="toggleLocale" class="text-sm text-gray-400 hover:text-gray-600 px-4 py-2 text-start">
              {{ locale === 'ar' ? 'English' : 'العربية' }}
            </button>
            <NuxtLink to="/auth/login" class="text-sm font-medium text-gray-600 px-4 py-2.5 rounded-xl hover:bg-gray-50 transition text-center">
              {{ t('auth.login') }}
            </NuxtLink>
            <NuxtLink to="/auth/register" class="text-sm font-semibold bg-primary-500 text-white px-4 py-2.5 rounded-xl text-center hover:bg-primary-600 transition">
              {{ t('landing.hero.cta') }}
            </NuxtLink>
          </div>
        </div>
      </div>
    </Transition>
  </nav>
</template>

<script setup lang="ts">
const { locale, setLocale, t } = useI18n()

const scrolled = ref(false)
const mobileOpen = ref(false)

const navLinks = computed(() => [
  { id: 'features', label: t('landing.nav.features') },
  { id: 'about', label: t('landing.nav.about') },
  { id: 'preview', label: t('landing.nav.preview') },
  { id: 'pricing', label: t('landing.nav.pricing') },
  { id: 'testimonials', label: t('landing.nav.testimonials') },
  { id: 'faq', label: t('landing.nav.faq') },
])

function toggleLocale() {
  setLocale(locale.value === 'ar' ? 'en' : 'ar')
}

function scrollToSection(id: string) {
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

onMounted(() => {
  const onScroll = () => { scrolled.value = window.scrollY > 20 }
  window.addEventListener('scroll', onScroll, { passive: true })
  onUnmounted(() => window.removeEventListener('scroll', onScroll))
})
</script>
