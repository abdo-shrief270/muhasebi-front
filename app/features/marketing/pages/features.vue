<template>
  <div :dir="locale === 'ar' ? 'rtl' : 'ltr'" class="min-h-screen bg-white font-cairo">
    <LandingNavbar />

    <!-- ─────────────── Hero ─────────────── -->
    <section class="pt-32 pb-16 px-6 bg-gradient-to-b from-primary-50/40 via-white to-white relative overflow-hidden">
      <!-- Background ornaments -->
      <div class="absolute top-20 -end-20 w-72 h-72 rounded-full bg-primary-500/10 blur-3xl pointer-events-none" />
      <div class="absolute top-40 -start-32 w-96 h-96 rounded-full bg-secondary-400/10 blur-3xl pointer-events-none" />

      <div class="max-w-5xl mx-auto text-center relative">
        <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 border border-primary-100 text-primary-700 text-xs font-semibold mb-6">
          <UIcon name="i-lucide-sparkles" class="w-3.5 h-3.5" />
          {{ locale === 'ar' ? 'دليل المنصة الكامل' : 'Complete Platform Tour' }}
        </div>

        <h1 class="text-4xl md:text-6xl font-extrabold tracking-tight mb-5 text-gray-900">
          {{ locale === 'ar' ? 'كل ما يقدمه ' : 'Everything ' }}
          <span class="bg-gradient-to-r from-primary-500 via-primary-600 to-secondary-500 bg-clip-text text-transparent">
            {{ locale === 'ar' ? 'محاسبي' : 'Muhasebi' }}
          </span>
          {{ locale === 'ar' ? '' : ' Delivers' }}
        </h1>

        <p class="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          {{ locale === 'ar'
            ? 'منصة محاسبة سحابية متكاملة من المحاسبة الأساسية إلى الفاتورة الإلكترونية والرواتب والتقارير. تصفّح كل ميزة، بما فيها المتقدمة والمخفية، وكل ما تحت الغطاء.'
            : 'A complete cloud accounting platform spanning core bookkeeping, e-invoicing, payroll, and reporting. Browse every capability, including the advanced + hidden ones, and the technology underneath.' }}
        </p>

        <!-- Quick stats -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 max-w-3xl mx-auto">
          <div
            v-for="stat in heroStats"
            :key="stat.labelEn"
            class="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm shadow-gray-200/40"
          >
            <p class="text-2xl md:text-3xl font-extrabold text-gray-900 tabular-nums" dir="ltr">{{ stat.value }}</p>
            <p class="text-[11px] md:text-xs text-gray-500 mt-1">
              {{ locale === 'ar' ? stat.labelAr : stat.labelEn }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- ─────────────── Section index (jump links) ─────────────── -->
    <section v-if="sections.length" class="px-6 py-10 border-y border-gray-100 bg-gray-50/50">
      <div class="max-w-7xl mx-auto">
        <p class="text-center text-xs font-semibold uppercase tracking-wider text-gray-500 mb-5">
          {{ locale === 'ar' ? 'تنقل سريع' : 'Jump to a section' }}
        </p>
        <div class="flex flex-wrap justify-center gap-2">
          <a
            v-for="section in sections"
            :key="section.slug"
            :href="`#${section.slug}`"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-gray-200 text-xs font-medium text-gray-700 hover:border-primary-300 hover:text-primary-700 hover:shadow-sm transition-all"
          >
            <UIcon v-if="section.icon" :name="section.icon" class="w-3 h-3" :class="accentText(section.accent)" />
            {{ locale === 'ar' ? section.title_ar : section.title_en }}
            <span class="text-gray-400 font-mono tabular-nums" dir="ltr">{{ section.items.length }}</span>
          </a>
        </div>
      </div>
    </section>

    <!-- ─────────────── Loading skeleton ─────────────── -->
    <div v-if="loading" class="px-6 py-16 max-w-7xl mx-auto space-y-12">
      <div v-for="i in 3" :key="i" class="space-y-4">
        <div class="h-8 w-2/3 max-w-md mx-auto bg-gray-100 rounded-lg animate-pulse" />
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="j in 6" :key="j" class="h-40 rounded-2xl bg-gray-100 animate-pulse" />
        </div>
      </div>
    </div>

    <!-- ─────────────── Sections ─────────────── -->
    <template v-else>
      <section
        v-for="(section, sIdx) in sections"
        :id="section.slug"
        :key="section.slug"
        class="px-6 py-16 md:py-20 scroll-mt-20"
        :class="sIdx % 2 === 0 ? 'bg-white' : 'bg-gradient-to-b from-gray-50/40 to-white'"
      >
        <div class="max-w-7xl mx-auto">
          <!-- Section header -->
          <div class="text-center mb-12">
            <div
              class="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-5"
              :class="accentBg(section.accent)"
            >
              <UIcon :name="section.icon || 'i-lucide-layers'" class="w-7 h-7" :class="accentText(section.accent)" />
            </div>
            <h2 class="text-2xl md:text-4xl font-bold text-gray-900 mb-3">
              {{ locale === 'ar' ? section.title_ar : section.title_en }}
            </h2>
            <p
              v-if="(locale === 'ar' ? section.subtitle_ar : section.subtitle_en)"
              class="text-base md:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed"
            >
              {{ locale === 'ar' ? section.subtitle_ar : section.subtitle_en }}
            </p>
          </div>

          <!-- Items grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              v-for="item in section.items"
              :key="item.id"
              class="group relative bg-white border border-gray-100 rounded-2xl p-5 hover:border-primary-200 hover:shadow-lg hover:shadow-primary-500/5 transition-all"
            >
              <!-- Badge (Hidden / New / Pro) -->
              <span
                v-if="(locale === 'ar' ? item.badge_ar : item.badge_en)"
                class="absolute -top-2 end-4 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                :class="badgeClasses(locale === 'ar' ? item.badge_ar : item.badge_en)"
              >
                <UIcon
                  :name="badgeIcon(locale === 'ar' ? item.badge_ar : item.badge_en)"
                  class="w-2.5 h-2.5"
                />
                {{ locale === 'ar' ? item.badge_ar : item.badge_en }}
              </span>

              <!-- Item icon -->
              <div
                class="w-10 h-10 rounded-xl mb-4 inline-flex items-center justify-center"
                :class="accentBgSoft(section.accent)"
              >
                <UIcon
                  :name="item.icon || 'i-lucide-circle-check'"
                  class="w-5 h-5"
                  :class="accentText(section.accent)"
                />
              </div>

              <!-- Title + description -->
              <h3 class="text-base font-bold text-gray-900 mb-2 leading-snug">
                {{ locale === 'ar' ? item.title_ar : item.title_en }}
              </h3>
              <p class="text-sm text-gray-600 leading-relaxed">
                {{ locale === 'ar' ? item.description_ar : item.description_en }}
              </p>
            </div>
          </div>
        </div>
      </section>
    </template>

    <!-- ─────────────── Empty state (backend miss) ─────────────── -->
    <section v-if="!loading && !sections.length" class="px-6 py-32 text-center">
      <div class="max-w-md mx-auto">
        <div class="w-14 h-14 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
          <UIcon name="i-lucide-package-x" class="w-7 h-7 text-gray-400" />
        </div>
        <p class="text-sm font-semibold text-gray-900 mb-1">
          {{ locale === 'ar' ? 'لا تتوفر بيانات الميزات حالياً' : 'Feature catalog unavailable right now' }}
        </p>
        <p class="text-xs text-gray-500">
          {{ locale === 'ar' ? 'حاول مجدداً بعد دقيقة، أو عد للصفحة الرئيسية.' : 'Try again in a minute, or head back to the home page.' }}
        </p>
      </div>
    </section>

    <!-- ─────────────── CTA ─────────────── -->
    <section class="px-6 py-20 bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-500 text-white">
      <div class="max-w-4xl mx-auto text-center">
        <h2 class="text-3xl md:text-5xl font-extrabold mb-4 leading-tight">
          {{ locale === 'ar' ? 'جاهز لرؤية كل ذلك في العمل؟' : 'Ready to see all of this in action?' }}
        </h2>
        <p class="text-lg md:text-xl text-white/90 mb-8">
          {{ locale === 'ar'
            ? '14 يوم تجربة مجانية، بدون بطاقة ائتمان، إلغاء في أي وقت.'
            : '14-day free trial, no credit card, cancel anytime.' }}
        </p>
        <div class="flex flex-wrap justify-center gap-3">
          <NuxtLink
            to="/auth/register"
            class="bg-white text-primary-600 font-semibold px-8 py-3.5 rounded-xl hover:shadow-2xl hover:shadow-black/20 transition-all active:scale-[0.97]"
          >
            {{ locale === 'ar' ? 'ابدأ التجربة المجانية' : 'Start Free Trial' }}
          </NuxtLink>
          <NuxtLink
            to="/#pricing"
            class="bg-white/15 backdrop-blur text-white border border-white/30 font-semibold px-8 py-3.5 rounded-xl hover:bg-white/25 transition-all"
          >
            {{ locale === 'ar' ? 'عرض الأسعار' : 'See Pricing' }}
          </NuxtLink>
        </div>
      </div>
    </section>

    <LandingFooter />
  </div>
</template>

<script setup lang="ts">
import { useLanding, type FeatureShowcaseSection } from '~/features/marketing/composables/useLanding'

definePageMeta({ layout: false })

const { locale } = useI18n()
const { getFeatureShowcase } = useLanding()

const sections = ref<FeatureShowcaseSection[]>([])
const loading = ref(true)

// Hero stats — derived from the seeded catalog so they match what the page
// actually shows. Computed after fetch so the numbers don't lie if the
// backend returns a smaller subset.
const heroStats = computed(() => {
  const sectionCount = sections.value.length
  const itemCount = sections.value.reduce((s, sec) => s + sec.items.length, 0)
  const hiddenCount = sections.value.reduce(
    (s, sec) => s + sec.items.filter(i => i.badge_en === 'Hidden').length,
    0,
  )
  return [
    { value: sectionCount.toString(), labelEn: 'Sections', labelAr: 'أقسام' },
    { value: itemCount.toString(), labelEn: 'Capabilities', labelAr: 'قدرات' },
    { value: hiddenCount.toString(), labelEn: 'Hidden gems', labelAr: 'مزايا خفية' },
    { value: 'AR + EN', labelEn: 'Bilingual', labelAr: 'لغتان' },
  ]
})

// ── Color tokens ──
// Sections carry an `accent` slug from the backend; these helpers map it
// onto Tailwind classes so the design is consistent across all sections
// without each one having to know its own color story.
function accentBg(accent: string): string {
  return ({
    primary: 'bg-primary-100/70',
    info: 'bg-info-100/70',
    success: 'bg-success-100/70',
    warning: 'bg-warning-100/70',
    danger: 'bg-danger-100/70',
  } as Record<string, string>)[accent] ?? 'bg-primary-100/70'
}
function accentBgSoft(accent: string): string {
  return ({
    primary: 'bg-primary-50',
    info: 'bg-info-50',
    success: 'bg-success-50',
    warning: 'bg-warning-50',
    danger: 'bg-danger-50',
  } as Record<string, string>)[accent] ?? 'bg-primary-50'
}
function accentText(accent: string): string {
  return ({
    primary: 'text-primary-600',
    info: 'text-info-600',
    success: 'text-success-600',
    warning: 'text-warning-600',
    danger: 'text-danger-600',
  } as Record<string, string>)[accent] ?? 'text-primary-600'
}

// Badges have their own color story regardless of section — "Hidden" is
// always the warning-tinted pill, "New" is always success, "Pro" is primary.
function badgeClasses(badge: string | null | undefined): string {
  if (!badge) return ''
  const k = badge.toLowerCase()
  if (k.includes('hidden') || k.includes('خفي')) return 'bg-warning-500 text-white'
  if (k.includes('new') || k.includes('جديد')) return 'bg-success-500 text-white'
  if (k.includes('pro') || k.includes('احتراف')) return 'bg-primary-500 text-white'
  if (k.includes('built') || k.includes('مدمج')) return 'bg-info-500 text-white'
  return 'bg-gray-700 text-white'
}
function badgeIcon(badge: string | null | undefined): string {
  if (!badge) return 'i-lucide-tag'
  const k = badge.toLowerCase()
  if (k.includes('hidden') || k.includes('خفي')) return 'i-lucide-eye-off'
  if (k.includes('new') || k.includes('جديد')) return 'i-lucide-sparkles'
  if (k.includes('pro') || k.includes('احتراف')) return 'i-lucide-crown'
  if (k.includes('built') || k.includes('مدمج')) return 'i-lucide-package-check'
  return 'i-lucide-tag'
}

useHead(() => ({
  title: locale.value === 'ar'
    ? 'دليل المزايا الكامل · محاسبي'
    : 'Complete Feature Tour · Muhasebi',
  meta: [
    {
      name: 'description',
      content: locale.value === 'ar'
        ? 'دليل شامل لكل ميزات منصة محاسبي — محاسبة، فاتورة إلكترونية، رواتب، تقارير، وكل القدرات المتقدمة.'
        : 'Full tour of every Muhasebi platform capability — accounting, e-invoicing, payroll, reporting, and every advanced feature underneath.',
    },
  ],
}))

onMounted(async () => {
  try {
    sections.value = await getFeatureShowcase()
  } finally {
    loading.value = false
  }
})
</script>
