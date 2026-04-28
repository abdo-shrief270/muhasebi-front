<template>
  <div
    class="min-h-screen flex relative bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100"
    :dir="isRtl ? 'rtl' : 'ltr'"
  >
    <!-- Top-corner toggles -->
    <div class="absolute top-4 end-4 z-30 flex items-center gap-1.5">
      <button
        type="button"
        class="w-9 h-9 inline-flex items-center justify-center rounded-md border border-neutral-200 dark:border-neutral-800 bg-neutral-0 dark:bg-neutral-900 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-0 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors shadow-xs"
        @click="toggleDarkMode"
        :aria-label="isDark ? 'Light mode' : 'Dark mode'"
      >
        <UIcon :name="isDark ? 'i-lucide-sun' : 'i-lucide-moon'" class="w-4 h-4" />
      </button>
      <button
        type="button"
        class="h-9 px-3 inline-flex items-center justify-center rounded-md border border-neutral-200 dark:border-neutral-800 bg-neutral-0 dark:bg-neutral-900 text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-0 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors shadow-xs"
        @click="toggleLocale"
      >
        {{ locale === 'ar' ? 'EN' : 'عر' }}
      </button>
    </div>

    <!-- Brand panel (split-screen, lg+) -->
    <div
      class="hidden lg:flex lg:w-1/2 relative overflow-hidden"
      :style="{ backgroundColor: primaryColor }"
    >
      <!-- Mesh / decorative shapes -->
      <div class="absolute inset-0 opacity-90">
        <div
          class="absolute -top-32 -start-32 w-[28rem] h-[28rem] rounded-full blur-3xl"
          :style="{ backgroundColor: secondaryColor, opacity: 0.35 }"
        />
        <div class="absolute top-1/3 end-[-6rem] w-[22rem] h-[22rem] bg-white/10 rounded-full blur-3xl" />
        <div class="absolute bottom-[-4rem] start-1/3 w-72 h-72 bg-black/20 rounded-full blur-3xl" />
        <!-- Subtle grid -->
        <div
          class="absolute inset-0 opacity-[0.06]"
          :style="{
            backgroundImage: 'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }"
        />
      </div>

      <div class="relative z-10 flex flex-col justify-between w-full p-12 text-white">
        <!-- Top: brand mark -->
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-md bg-white/15 backdrop-blur flex items-center justify-center ring-1 ring-white/20">
            <img v-if="tenantLogo" :src="tenantLogo" alt="" class="w-6 h-6 object-contain" />
            <span v-else class="text-base font-bold">{{ brandInitial }}</span>
          </div>
          <span class="text-sm font-semibold tracking-tight">{{ tenantName || $t('app.name') }}</span>
        </div>

        <!-- Middle: tagline + product preview card -->
        <div
          v-motion
          :initial="{ opacity: 0, y: 24 }"
          :enter="{ opacity: 1, y: 0, transition: { delay: 150 } }"
        >
          <p class="text-xs font-medium uppercase tracking-[0.2em] text-white/60 mb-3">
            {{ locale === 'ar' ? 'منصة محاسبية متكاملة' : 'Unified accounting platform' }}
          </p>
          <h1 class="text-4xl xl:text-5xl font-bold leading-[1.1] mb-4 max-w-md">
            {{ locale === 'ar' ? 'دفاتر منظمة. قرارات أوضح.' : 'Tidy books.\nClearer decisions.' }}
          </h1>
          <p class="text-base text-white/75 leading-relaxed max-w-md">
            {{ $t('app.tagline') }}
          </p>

          <!-- Product preview card (mock invoice) -->
          <div class="mt-10 max-w-md">
            <div
              v-motion
              :initial="{ opacity: 0, y: 16 }"
              :enter="{ opacity: 1, y: 0, transition: { delay: 280 } }"
              class="rounded-xl bg-white/10 backdrop-blur-md ring-1 ring-white/15 p-5 shadow-overlay"
            >
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-2 text-xs text-white/70">
                  <UIcon name="i-lucide-file-text" class="w-3.5 h-3.5" />
                  <span>{{ locale === 'ar' ? 'فاتورة #INV-2041' : 'Invoice #INV-2041' }}</span>
                </div>
                <span class="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-sm bg-emerald-400/20 text-emerald-100 ring-1 ring-emerald-300/30">
                  {{ locale === 'ar' ? 'مدفوعة' : 'Paid' }}
                </span>
              </div>
              <div class="flex items-end justify-between mb-4">
                <div>
                  <p class="text-[10px] text-white/50 uppercase tracking-wider mb-1">
                    {{ locale === 'ar' ? 'المبلغ' : 'Amount' }}
                  </p>
                  <p class="text-2xl font-bold tabular-nums">
                    <span class="text-white/60 text-sm me-1">EGP</span>14,250.00
                  </p>
                </div>
                <div class="text-end">
                  <p class="text-[10px] text-white/50 uppercase tracking-wider mb-1">
                    {{ locale === 'ar' ? 'العميل' : 'Client' }}
                  </p>
                  <p class="text-sm font-medium">Cairo Trading Co.</p>
                </div>
              </div>
              <!-- Mini bars -->
              <div class="flex items-end gap-1 h-12">
                <div
                  v-for="(h, i) in [40, 65, 30, 80, 55, 95, 70]"
                  :key="i"
                  class="flex-1 rounded-sm bg-white/30"
                  :style="{ height: h + '%' }"
                />
              </div>
              <p class="text-[10px] text-white/50 mt-2">
                {{ locale === 'ar' ? 'إيرادات الأسبوع' : 'Last 7 days' }}
              </p>
            </div>

            <!-- Trust badges -->
            <div class="mt-6 flex items-center gap-4 text-xs text-white/60">
              <span class="inline-flex items-center gap-1.5">
                <UIcon name="i-lucide-shield-check" class="w-3.5 h-3.5" />
                {{ locale === 'ar' ? 'تشفير TLS 1.3' : 'TLS 1.3 encrypted' }}
              </span>
              <span class="w-px h-3 bg-white/20" />
              <span class="inline-flex items-center gap-1.5">
                <UIcon name="i-lucide-check-circle-2" class="w-3.5 h-3.5" />
                {{ locale === 'ar' ? 'متوافق مع الفوترة الإلكترونية' : 'ETA-compliant' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Bottom: copyright -->
        <p class="text-xs text-white/50">
          © {{ year }} {{ tenantName || $t('app.name') }}.
          {{ locale === 'ar' ? 'جميع الحقوق محفوظة.' : 'All rights reserved.' }}
        </p>
      </div>
    </div>

    <!-- Form panel -->
    <div class="flex-1 flex items-center justify-center px-6 py-12 lg:px-12">
      <div
        v-motion
        :initial="{ opacity: 0, x: locale === 'ar' ? -16 : 16 }"
        :enter="{ opacity: 1, x: 0, transition: { delay: 100 } }"
        class="w-full max-w-[400px]"
      >
        <!-- Mobile brand -->
        <div class="lg:hidden flex items-center justify-center gap-2 mb-10">
          <div
            class="w-9 h-9 rounded-md flex items-center justify-center text-white font-bold"
            :style="{ backgroundColor: primaryColor }"
          >
            <img v-if="tenantLogo" :src="tenantLogo" alt="" class="w-5 h-5 object-contain" />
            <span v-else>{{ brandInitial }}</span>
          </div>
          <span class="text-base font-semibold tracking-tight">{{ tenantName || $t('app.name') }}</span>
        </div>

        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { locale, setLocale } = useI18n()
const { isDark, toggle: toggleDarkMode, init: initDarkMode } = useDarkMode()
const { isRtl } = useDir()
const { primaryColor, secondaryColor, tenantName, tenantLogo } = useTenantTheme()

const year = new Date().getFullYear()

const brandInitial = computed(() => {
  const n = tenantName.value
  if (n) return n.charAt(0).toUpperCase()
  return locale.value === 'ar' ? 'م' : 'M'
})

function toggleLocale() {
  setLocale(locale.value === 'ar' ? 'en' : 'ar')
}

onMounted(() => {
  initDarkMode()
})
</script>
