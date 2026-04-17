<template>
  <section id="testimonials" class="py-24 relative overflow-hidden">
    <div class="absolute inset-0 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700"></div>
    <div class="absolute inset-0">
      <div class="absolute top-20 start-20 w-60 h-60 bg-white/5 rounded-full blur-3xl"></div>
      <div class="absolute bottom-20 end-20 w-80 h-80 bg-secondary-400/10 rounded-full blur-3xl"></div>
    </div>

    <div class="relative max-w-7xl mx-auto px-6">
      <!-- Header -->
      <div
        v-motion
        :initial="{ opacity: 0, y: 30 }"
        :visible-once="{ opacity: 1, y: 0, transition: { duration: 600 } }"
        class="text-center mb-16"
      >
        <div class="inline-flex items-center gap-2 bg-white/10 text-white/90 text-xs font-bold px-4 py-1.5 rounded-full mb-4 uppercase tracking-wider backdrop-blur-sm">
          {{ t('landing.testimonials.badge') }}
        </div>
        <h2 class="text-3xl lg:text-5xl font-extrabold text-white mb-4">
          {{ t('landing.testimonials.title') }}
        </h2>
        <p class="text-lg text-white/60 max-w-2xl mx-auto">
          {{ t('landing.testimonials.subtitle') }}
        </p>
      </div>

      <!-- Testimonial Cards -->
      <div class="grid md:grid-cols-3 gap-6">
        <div
          v-for="(testimonial, i) in testimonials"
          :key="i"
          v-motion
          :initial="{ opacity: 0, y: 30 }"
          :visible-once="{ opacity: 1, y: 0, transition: { delay: i * 100, duration: 500 } }"
          class="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/10 hover:bg-white/15 transition-all duration-300"
        >
          <!-- Stars -->
          <div class="flex gap-1 mb-4">
            <svg v-for="s in 5" :key="s" class="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>

          <p class="text-white/80 leading-relaxed mb-6 text-sm">"{{ testimonial.quote }}"</p>

          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-gradient-to-br flex items-center justify-center text-sm font-bold text-white" :class="testimonial.avatarBg">
              {{ testimonial.initials }}
            </div>
            <div>
              <p class="font-semibold text-white text-sm">{{ testimonial.name }}</p>
              <p class="text-xs text-white/50">{{ testimonial.role }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Testimonial as TestimonialType } from '~/features/marketing/composables/useLanding'

const props = defineProps<{ testimonials?: TestimonialType[] | null }>()
const { t, locale } = useI18n()

const avatarColors = ['from-secondary-400 to-secondary-600', 'from-emerald-400 to-emerald-600', 'from-amber-400 to-amber-600', 'from-violet-400 to-violet-600', 'from-rose-400 to-rose-600']

const testimonials = computed(() => {
  const isAr = locale.value === 'ar'

  // If API data provided, map it
  if (props.testimonials?.length) {
    return props.testimonials
      .filter(t => t.is_active)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((t, i) => ({
        quote: isAr ? t.quote.ar : t.quote.en,
        name: isAr ? t.name.ar : t.name.en,
        role: isAr ? t.role.ar : t.role.en,
        initials: (isAr ? t.name.ar : t.name.en).split(' ').map(w => w[0]).join('').slice(0, 2),
        avatarBg: avatarColors[i % avatarColors.length],
      }))
  }

  // Fallback to hardcoded defaults
  return [
    {
      quote: isAr
        ? 'محاسبي غيّر طريقة عملنا بالكامل. أصبحنا ننجز في ساعة ما كان يأخذ يوماً كاملاً. الربط مع الفاتورة الإلكترونية وفّر علينا وقتاً هائلاً.'
        : 'Muhasebi completely transformed how we work. We now accomplish in an hour what used to take a full day. The ETA integration saved us tremendous time.',
      name: isAr ? 'أحمد محمود' : 'Ahmed Mahmoud',
      role: isAr ? 'مدير مكتب محاسبة - القاهرة' : 'Managing Partner - Cairo',
      initials: isAr ? 'أم' : 'AM',
      avatarBg: 'from-secondary-400 to-secondary-600',
    },
    {
      quote: isAr
        ? 'بوابة العملاء ميزة رائعة. عملاؤنا يتابعون فواتيرهم ومستنداتهم بأنفسهم مما قلل الاستفسارات بنسبة ٧٠٪. النظام سهل ومباشر.'
        : 'The client portal is amazing. Our clients track their invoices and documents themselves, reducing inquiries by 70%. The system is intuitive and straightforward.',
      name: isAr ? 'سارة حسن' : 'Sarah Hassan',
      role: isAr ? 'محاسبة قانونية - الإسكندرية' : 'CPA - Alexandria',
      initials: isAr ? 'سح' : 'SH',
      avatarBg: 'from-emerald-400 to-emerald-600',
    },
    {
      quote: isAr
        ? 'كنت أبحث عن نظام محاسبة يفهم السوق المصري فعلاً. محاسبي يدعم دليل الحسابات المصري والضرائب المحلية بشكل ممتاز. أنصح به بشدة.'
        : 'I was looking for an accounting system that truly understands the Egyptian market. Muhasebi supports the Egyptian chart of accounts and local taxes excellently.',
      name: isAr ? 'محمد عبدالرحمن' : 'Mohamed Abdelrahman',
      role: isAr ? 'مراجع حسابات - المنصورة' : 'Auditor - Mansoura',
      initials: isAr ? 'مع' : 'MA',
      avatarBg: 'from-amber-400 to-amber-600',
    },
  ]
})
</script>
