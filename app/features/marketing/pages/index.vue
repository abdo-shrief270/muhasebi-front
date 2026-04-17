<template>
  <div :dir="locale === 'ar' ? 'rtl' : 'ltr'" class="min-h-screen bg-white font-cairo">
    <LandingNavbar />
    <LandingHero :data="landingData?.hero" />
    <LandingPartners />
    <LandingFeatures :features="landingData?.features" />
    <LandingAbout :stats="landingData?.stats" />
    <LandingPreview />
    <LandingPricing :plans="plans" />
    <LandingTestimonials :testimonials="testimonials" />
    <LandingFaq :faqs="faqs" />
    <LandingCta />
    <LandingFooter />
  </div>
</template>

<script setup lang="ts">
import type { LandingData, Plan, Testimonial, FaqItem } from '~/features/marketing/composables/useLanding'

definePageMeta({ layout: false })

const { locale } = useI18n()
const { getLanding, getPublicPlans } = useLanding()

const landingData = ref<LandingData | null>(null)
const plans = ref<Plan[] | null>(null)
const testimonials = ref<Testimonial[] | null>(null)
const faqs = ref<FaqItem[] | null>(null)

// Fetch all landing data in parallel; components fall back to hardcoded defaults on null
onMounted(async () => {
  const [landing, plansData] = await Promise.all([
    getLanding(),
    getPublicPlans(),
  ])
  if (landing) {
    landingData.value = landing
  }
  if (plansData) {
    plans.value = plansData
  }
  // Testimonials and FAQs come nested inside landing response
  if ((landing as any)?.testimonials) {
    testimonials.value = (landing as any).testimonials
  }
  if ((landing as any)?.faqs) {
    faqs.value = (landing as any).faqs
  }
})

useHead({
  title: locale.value === 'ar' ? 'محاسبي - نظام المحاسبة السحابي لمكاتب المحاسبة المصرية' : 'Muhasebi - Cloud Accounting for Egyptian Firms',
  meta: [
    { name: 'description', content: locale.value === 'ar' ? 'نظام محاسبة سحابي متكامل مصمم خصيصاً لمكاتب المحاسبة المصرية. فاتورة إلكترونية، تقارير مالية، إدارة عملاء.' : 'Complete cloud accounting system designed for Egyptian accounting firms. E-invoicing, financial reports, client management.' },
    { name: 'keywords', content: 'محاسبي, muhasebi, accounting, محاسبة, فاتورة إلكترونية, ETA, مكاتب محاسبة, مصر, cloud accounting' },
    { property: 'og:title', content: locale.value === 'ar' ? 'محاسبي - نظام المحاسبة السحابي' : 'Muhasebi - Cloud Accounting' },
    { property: 'og:description', content: locale.value === 'ar' ? 'نظام محاسبة سحابي متكامل لمكاتب المحاسبة المصرية' : 'Complete cloud accounting for Egyptian firms' },
    { property: 'og:type', content: 'website' },
  ],
})
</script>
