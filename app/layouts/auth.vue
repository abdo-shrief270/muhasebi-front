<template>
  <div class="min-h-screen flex relative">
    <!-- Top-corner toggles -->
    <div class="absolute top-4 end-4 z-20 flex items-center gap-1">
      <button
        type="button"
        class="w-9 h-9 flex items-center justify-center rounded-lg bg-white/80 backdrop-blur text-neutral-500 hover:bg-white hover:text-neutral-900 transition-colors shadow-sm"
        @click="toggleDarkMode"
        :aria-label="isDark ? 'Light mode' : 'Dark mode'"
      >
        <UIcon :name="isDark ? 'i-lucide-sun' : 'i-lucide-moon'" class="w-4 h-4" />
      </button>
      <button
        type="button"
        class="h-9 px-3 rounded-lg bg-white/80 backdrop-blur text-xs font-medium text-neutral-500 hover:bg-white hover:text-neutral-900 transition-colors shadow-sm"
        @click="toggleLocale"
      >
        {{ locale === 'ar' ? 'EN' : 'عر' }}
      </button>
    </div>
    <!-- Left panel — branding -->
    <div class="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 relative overflow-hidden">
      <!-- Decorative shapes -->
      <div class="absolute inset-0">
        <div class="absolute top-20 -start-20 w-72 h-72 bg-white/5 rounded-full blur-3xl"></div>
        <div class="absolute bottom-20 end-10 w-96 h-96 bg-secondary-400/10 rounded-full blur-3xl"></div>
        <div class="absolute top-1/2 start-1/3 w-40 h-40 bg-white/5 rounded-2xl rotate-45"></div>
      </div>

      <div class="relative z-10 flex flex-col justify-center px-16 text-white">
        <div
          v-motion
          :initial="{ opacity: 0, y: 20 }"
          :enter="{ opacity: 1, y: 0, transition: { delay: 200 } }"
        >
          <h1 class="text-5xl font-bold mb-4">{{ $t('app.name') }}</h1>
          <p class="text-xl text-white/70 leading-relaxed max-w-md">
            {{ $t('app.tagline') }}
          </p>
          <div class="mt-12 grid grid-cols-2 gap-4">
            <div class="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div class="w-8 h-8 bg-white/15 rounded-lg flex items-center justify-center mb-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"/></svg>
              </div>
              <p class="text-sm text-white/60">{{ locale === 'ar' ? 'محاسبة متكاملة' : 'Full Accounting' }}</p>
            </div>
            <div class="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div class="w-8 h-8 bg-white/15 rounded-lg flex items-center justify-center mb-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"/></svg>
              </div>
              <p class="text-sm text-white/60">{{ locale === 'ar' ? 'فوترة إلكترونية' : 'E-Invoicing' }}</p>
            </div>
            <div class="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div class="w-8 h-8 bg-white/15 rounded-lg flex items-center justify-center mb-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941"/></svg>
              </div>
              <p class="text-sm text-white/60">{{ locale === 'ar' ? 'تقارير مالية' : 'Financial Reports' }}</p>
            </div>
            <div class="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div class="w-8 h-8 bg-white/15 rounded-lg flex items-center justify-center mb-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.25 15a4.5 4.5 0 0 0 4.5 4.5H18a3.75 3.75 0 0 0 1.332-7.257 3 3 0 0 0-3.758-3.848 5.25 5.25 0 0 0-10.233 2.33A4.502 4.502 0 0 0 2.25 15Z"/></svg>
              </div>
              <p class="text-sm text-white/60">{{ locale === 'ar' ? 'سحابي بالكامل' : 'Fully Cloud' }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Right panel — form -->
    <div class="flex-1 flex items-center justify-center px-6 py-12 bg-gray-50/50">
      <div
        v-motion
        :initial="{ opacity: 0, x: locale === 'ar' ? -20 : 20 }"
        :enter="{ opacity: 1, x: 0, transition: { delay: 100 } }"
        class="w-full max-w-[420px]"
      >
        <!-- Mobile logo -->
        <div class="lg:hidden text-center mb-10">
          <h1 class="text-3xl font-bold text-primary-500">{{ $t('app.name') }}</h1>
          <p class="text-gray-400 mt-1 text-sm">{{ $t('app.tagline') }}</p>
        </div>

        <slot />

        <!-- Language toggle -->
        <div class="mt-8 text-center">
          <button
            @click="toggleLocale"
            class="text-xs text-gray-300 hover:text-primary-500 transition px-3 py-1.5 rounded-lg hover:bg-gray-100"
          >
            {{ locale === 'ar' ? 'Switch to English' : 'التبديل للعربية' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { locale, setLocale } = useI18n()
const { isDark, toggle: toggleDarkMode } = useDarkMode()

function toggleLocale() {
  setLocale(locale.value === 'ar' ? 'en' : 'ar')
}
</script>