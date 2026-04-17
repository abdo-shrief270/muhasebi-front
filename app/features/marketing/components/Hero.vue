<template>
  <section class="relative min-h-screen flex items-center overflow-hidden pt-18">
    <!-- Animated gradient background -->
    <div class="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40"></div>

    <!-- Animated orbs -->
    <div class="absolute inset-0 pointer-events-none overflow-hidden">
      <div class="absolute top-20 start-[10%] w-[500px] h-[500px] bg-primary-200/20 rounded-full blur-[100px] animate-float-slow"></div>
      <div class="absolute bottom-20 end-[5%] w-[600px] h-[600px] bg-secondary-200/25 rounded-full blur-[120px] animate-float-slower"></div>
      <div class="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-violet-200/15 rounded-full blur-[80px] animate-float-medium"></div>
    </div>

    <!-- Grid pattern overlay -->
    <div class="absolute inset-0 opacity-[0.03]" style="background-image: radial-gradient(circle, #2c3e50 1px, transparent 1px); background-size: 40px 40px;"></div>

    <div class="relative max-w-7xl mx-auto px-6 py-20 lg:py-0">
      <div class="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        <!-- Text content -->
        <div>
          <div
            v-motion
            :initial="{ opacity: 0, y: 40 }"
            :enter="{ opacity: 1, y: 0, transition: { duration: 700, delay: 100 } }"
          >
            <!-- Badge -->
            <div class="inline-flex items-center gap-2.5 bg-white/80 backdrop-blur-sm text-secondary-600 text-sm font-semibold px-5 py-2 rounded-full mb-8 shadow-sm border border-secondary-100/50">
              <span class="relative flex h-2.5 w-2.5">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-secondary-500"></span>
              </span>
              {{ badge }}
            </div>

            <h1 class="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-gray-900 leading-[1.1] mb-6">
              {{ title1 }}
              <br />
              <span class="bg-gradient-to-r from-primary-500 via-secondary-500 to-primary-400 bg-clip-text text-transparent animate-gradient-x">
                {{ title2 }}
              </span>
            </h1>

            <p class="text-lg lg:text-xl text-gray-500 leading-relaxed max-w-xl mb-10">
              {{ subtitle }}
            </p>

            <!-- CTA Buttons -->
            <div class="flex flex-col sm:flex-row items-start gap-4 mb-10">
              <NuxtLink
                to="/auth/register"
                class="group relative inline-flex items-center gap-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white px-8 py-4 rounded-2xl font-bold hover:shadow-2xl hover:shadow-primary-500/30 transition-all duration-300 active:scale-[0.97] text-sm overflow-hidden"
              >
                <span class="relative z-10">{{ t('landing.hero.cta') }}</span>
                <svg class="relative z-10 w-5 h-5 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                <div class="absolute inset-0 bg-gradient-to-r from-primary-600 to-secondary-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </NuxtLink>
              <a
                href="#preview"
                @click.prevent="scrollTo('preview')"
                class="group inline-flex items-center gap-2 text-gray-600 px-6 py-4 rounded-2xl font-semibold border border-gray-200 hover:border-primary-200 hover:bg-white hover:text-primary-500 transition-all text-sm"
              >
                <svg class="w-5 h-5 text-primary-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                {{ t('landing.hero.cta2') }}
              </a>
            </div>

            <!-- Trust indicators -->
            <div class="flex items-center gap-6 text-sm text-gray-400">
              <div class="flex items-center gap-1.5">
                <svg class="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clip-rule="evenodd" /></svg>
                {{ t('landing.hero.trust1') }}
              </div>
              <div class="flex items-center gap-1.5">
                <svg class="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clip-rule="evenodd" /></svg>
                {{ t('landing.hero.trust2') }}
              </div>
              <div class="flex items-center gap-1.5">
                <svg class="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clip-rule="evenodd" /></svg>
                {{ t('landing.hero.trust3') }}
              </div>
            </div>
          </div>
        </div>

        <!-- Dashboard Mockup -->
        <div
          v-motion
          :initial="{ opacity: 0, x: 60, scale: 0.95 }"
          :enter="{ opacity: 1, x: 0, scale: 1, transition: { duration: 800, delay: 400 } }"
          class="relative hidden lg:block"
        >
          <div class="relative">
            <!-- Floating cards behind -->
            <div class="absolute -top-8 -start-8 w-48 h-32 bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-4 animate-float-slow z-0 border border-gray-100">
              <div class="flex items-center gap-2 mb-3">
                <div class="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" /></svg>
                </div>
                <div class="text-xs text-gray-400">{{ t('landing.hero.mockup.revenue') }}</div>
              </div>
              <div class="text-xl font-bold text-gray-800">٣٤٥,٠٠٠</div>
              <div class="text-xs text-emerald-500 font-semibold">+12.5%</div>
            </div>

            <div class="absolute -bottom-6 -end-6 w-44 h-28 bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-4 animate-float-medium z-0 border border-gray-100">
              <div class="flex items-center gap-2 mb-2">
                <div class="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                  <svg class="w-4 h-4 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
                </div>
                <div class="text-xs text-gray-400">{{ t('landing.hero.mockup.clients') }}</div>
              </div>
              <div class="text-xl font-bold text-gray-800">٢٤٧</div>
            </div>

            <!-- Main mockup -->
            <div class="relative z-10 bg-white rounded-3xl shadow-2xl shadow-gray-300/30 border border-gray-200/60 overflow-hidden">
              <!-- Window bar -->
              <div class="flex items-center gap-2 px-5 py-3 bg-gray-50 border-b border-gray-100">
                <div class="flex gap-1.5">
                  <div class="w-3 h-3 rounded-full bg-red-400"></div>
                  <div class="w-3 h-3 rounded-full bg-amber-400"></div>
                  <div class="w-3 h-3 rounded-full bg-emerald-400"></div>
                </div>
                <div class="flex-1 text-center">
                  <div class="inline-flex items-center gap-2 bg-white rounded-lg px-4 py-1 text-xs text-gray-400 border border-gray-100">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582" /></svg>
                    muhasebi.app
                  </div>
                </div>
              </div>

              <!-- Dashboard content mockup -->
              <div class="p-6">
                <!-- Top bar mockup -->
                <div class="flex items-center justify-between mb-6">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg bg-primary-500"></div>
                    <div class="h-3 w-20 bg-gray-200 rounded-full"></div>
                  </div>
                  <div class="flex gap-2">
                    <div class="h-8 w-8 bg-gray-100 rounded-lg"></div>
                    <div class="h-8 w-8 bg-gray-100 rounded-lg"></div>
                    <div class="w-8 h-8 rounded-full bg-primary-100"></div>
                  </div>
                </div>

                <!-- KPI cards -->
                <div class="grid grid-cols-3 gap-3 mb-6">
                  <div class="bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl p-4 text-white">
                    <div class="text-xs opacity-70 mb-1">{{ t('landing.hero.mockup.totalInvoices') }}</div>
                    <div class="text-lg font-bold">١,٢٤٨</div>
                    <div class="w-full h-1 bg-white/20 rounded-full mt-2"><div class="w-3/4 h-full bg-white/60 rounded-full"></div></div>
                  </div>
                  <div class="bg-white border border-gray-100 rounded-xl p-4">
                    <div class="text-xs text-gray-400 mb-1">{{ t('landing.hero.mockup.pending') }}</div>
                    <div class="text-lg font-bold text-gray-800">٣٢</div>
                    <div class="w-full h-1 bg-gray-100 rounded-full mt-2"><div class="w-1/3 h-full bg-amber-400 rounded-full"></div></div>
                  </div>
                  <div class="bg-white border border-gray-100 rounded-xl p-4">
                    <div class="text-xs text-gray-400 mb-1">{{ t('landing.hero.mockup.revenue') }}</div>
                    <div class="text-lg font-bold text-gray-800">٣٤٥K</div>
                    <div class="w-full h-1 bg-gray-100 rounded-full mt-2"><div class="w-2/3 h-full bg-emerald-400 rounded-full"></div></div>
                  </div>
                </div>

                <!-- Chart area mockup -->
                <div class="bg-gray-50 rounded-xl p-4 h-32 flex items-end gap-2">
                  <div v-for="(h, i) in [40, 60, 35, 80, 55, 70, 90, 45, 75, 65, 85, 50]" :key="i"
                    class="flex-1 bg-gradient-to-t from-primary-500 to-secondary-400 rounded-t-md transition-all duration-500 opacity-80"
                    :style="{ height: h + '%' }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Scroll indicator -->
    <div class="absolute bottom-8 inset-x-0 flex justify-center">
      <div
        v-motion
        :initial="{ opacity: 0, y: -10 }"
        :enter="{ opacity: 1, y: 0, transition: { duration: 600, delay: 1200 } }"
        class="animate-bounce"
      >
        <svg class="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { LandingData } from '~/features/marketing/composables/useLanding'

const props = defineProps<{ data?: LandingData['hero'] | null }>()
const { t, locale } = useI18n()

const isAr = computed(() => locale.value === 'ar')

// Use API data if available, otherwise fall back to i18n keys
const badge = computed(() => props.data?.badge?.[isAr.value ? 'ar' : 'en'] || t('landing.hero.badge'))
const title1 = computed(() => props.data?.title1?.[isAr.value ? 'ar' : 'en'] || t('landing.hero.title1'))
const title2 = computed(() => props.data?.title2?.[isAr.value ? 'ar' : 'en'] || t('landing.hero.title2'))
const subtitle = computed(() => props.data?.subtitle?.[isAr.value ? 'ar' : 'en'] || t('landing.hero.subtitle'))

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}
</script>
