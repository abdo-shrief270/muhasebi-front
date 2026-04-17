<template>
  <section class="py-24 relative overflow-hidden">
    <div class="absolute inset-0 bg-white"></div>

    <div class="relative max-w-4xl mx-auto px-6">
      <div
        v-motion
        :initial="{ opacity: 0, y: 30, scale: 0.98 }"
        :visible-once="{ opacity: 1, y: 0, scale: 1, transition: { duration: 600 } }"
        class="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-[2rem] p-12 lg:p-16 text-center overflow-hidden"
      >
        <!-- Decorative -->
        <div class="absolute inset-0">
          <div class="absolute top-0 start-1/4 w-64 h-64 bg-primary-500/20 rounded-full blur-[80px]"></div>
          <div class="absolute bottom-0 end-1/4 w-64 h-64 bg-secondary-500/20 rounded-full blur-[80px]"></div>
          <div class="absolute inset-0 opacity-5" style="background-image: radial-gradient(circle, white 1px, transparent 1px); background-size: 24px 24px;"></div>
        </div>

        <div class="relative">
          <div class="inline-flex items-center gap-2 bg-white/10 text-white/80 text-xs font-bold px-4 py-1.5 rounded-full mb-6 uppercase tracking-wider backdrop-blur-sm">
            {{ t('landing.cta.badge') }}
          </div>

          <h2 class="text-3xl lg:text-5xl font-extrabold text-white leading-tight mb-4">
            {{ t('landing.cta.title') }}
          </h2>
          <p class="text-lg text-white/50 max-w-xl mx-auto mb-10">
            {{ t('landing.cta.subtitle') }}
          </p>

          <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
            <NuxtLink
              to="/auth/register"
              class="group inline-flex items-center gap-2 bg-white text-gray-900 px-8 py-4 rounded-2xl font-bold hover:shadow-2xl hover:shadow-white/20 transition-all active:scale-[0.97] text-sm"
            >
              {{ t('landing.cta.button') }}
              <svg class="w-5 h-5 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </NuxtLink>
            <a href="mailto:info@muhasebi.com" class="text-white/60 hover:text-white text-sm font-medium transition-colors">
              {{ t('landing.cta.contact') }}
            </a>
          </div>

          <p class="text-xs text-white/30 mt-6">
            {{ t('landing.cta.note') }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const { t } = useI18n()
</script>
