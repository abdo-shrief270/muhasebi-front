<template>
  <section id="pricing" class="py-24 relative overflow-hidden">
    <div class="absolute inset-0 bg-gradient-to-b from-white to-gray-50/80"></div>
    <div class="absolute top-0 start-0 w-[500px] h-[500px] bg-secondary-100/20 rounded-full blur-[100px]"></div>

    <div class="relative max-w-7xl mx-auto px-6">
      <!-- Header -->
      <div
        v-motion
        :initial="{ opacity: 0, y: 30 }"
        :visible-once="{ opacity: 1, y: 0, transition: { duration: 600 } }"
        class="text-center mb-16"
      >
        <div class="inline-flex items-center gap-2 bg-emerald-50 text-emerald-600 text-xs font-bold px-4 py-1.5 rounded-full mb-4 uppercase tracking-wider">
          {{ t('landing.pricing.badge') }}
        </div>
        <h2 class="text-3xl lg:text-5xl font-extrabold text-gray-900 mb-4">
          {{ t('landing.pricing.title') }}
        </h2>
        <p class="text-lg text-gray-400 max-w-2xl mx-auto mb-8">
          {{ t('landing.pricing.subtitle') }}
        </p>

        <!-- Billing Toggle -->
        <div class="inline-flex items-center gap-4 bg-gray-100 rounded-2xl p-1.5">
          <button
            @click="yearly = false"
            class="px-6 py-2.5 rounded-xl text-sm font-semibold transition-all"
            :class="!yearly ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400 hover:text-gray-600'"
          >
            {{ t('landing.pricing.monthly') }}
          </button>
          <button
            @click="yearly = true"
            class="px-6 py-2.5 rounded-xl text-sm font-semibold transition-all relative"
            :class="yearly ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400 hover:text-gray-600'"
          >
            {{ t('landing.pricing.yearly') }}
            <span class="absolute -top-2.5 -end-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              -20%
            </span>
          </button>
        </div>
      </div>

      <!-- Plans -->
      <div class="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
        <div
          v-for="(plan, i) in plans"
          :key="i"
          v-motion
          :initial="{ opacity: 0, y: 30 }"
          :visible-once="{ opacity: 1, y: 0, transition: { delay: i * 100, duration: 500 } }"
          class="relative group"
        >
          <!-- Popular badge -->
          <div v-if="plan.popular" class="absolute -top-4 inset-x-0 flex justify-center z-10">
            <span class="bg-gradient-to-r from-primary-500 to-secondary-500 text-white text-xs font-bold px-5 py-1.5 rounded-full shadow-lg shadow-primary-500/20">
              {{ t('landing.pricing.popular') }}
            </span>
          </div>

          <div
            class="h-full rounded-3xl p-8 transition-all duration-300 border"
            :class="plan.popular
              ? 'bg-white border-primary-200 shadow-2xl shadow-primary-100/50 scale-[1.02] hover:shadow-3xl'
              : 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-xl'"
          >
            <div class="mb-6">
              <h3 class="text-lg font-bold text-gray-800 mb-2">{{ plan.name }}</h3>
              <p class="text-sm text-gray-400">{{ plan.desc }}</p>
            </div>

            <div class="mb-8">
              <div class="flex items-baseline gap-1">
                <span class="text-4xl font-extrabold text-gray-900">{{ yearly ? plan.yearlyPrice : plan.monthlyPrice }}</span>
                <span class="text-sm text-gray-400">/ {{ t('landing.pricing.month') }}</span>
              </div>
              <p v-if="yearly && plan.monthlyPrice !== plan.yearlyPrice" class="text-xs text-gray-300 line-through mt-1">
                {{ plan.monthlyPrice }} / {{ t('landing.pricing.month') }}
              </p>
            </div>

            <NuxtLink
              to="/auth/register"
              class="block text-center py-3.5 rounded-2xl font-semibold text-sm transition-all mb-8"
              :class="plan.popular
                ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:shadow-lg hover:shadow-primary-500/30 active:scale-[0.97]'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
            >
              {{ t('landing.pricing.startTrial') }}
            </NuxtLink>

            <div class="space-y-3">
              <div v-for="(feature, fi) in plan.features" :key="fi" class="flex items-center gap-3">
                <svg class="w-4 h-4 flex-shrink-0" :class="plan.popular ? 'text-primary-500' : 'text-emerald-500'" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" />
                </svg>
                <span class="text-sm text-gray-500">{{ feature }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Plan } from '~/features/marketing/composables/useLanding'

const props = defineProps<{ plans?: Plan[] | null }>()
const { t, locale } = useI18n()

const yearly = ref(false)

const plans = computed(() => {
  const isAr = locale.value === 'ar'
  const currency = isAr ? 'ج.م' : 'EGP'

  // If API plans provided, map them
  if (props.plans?.length) {
    return props.plans
      .filter(p => p.is_active)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(p => ({
        name: isAr ? p.name.ar : p.name.en,
        desc: isAr ? p.description.ar : p.description.en,
        monthlyPrice: `${p.monthly_price} ${p.currency || currency}`,
        yearlyPrice: `${p.yearly_price} ${p.currency || currency}`,
        popular: p.is_popular,
        features: isAr ? p.features.ar : p.features.en,
      }))
  }

  // Fallback to hardcoded defaults
  return [
    {
      name: isAr ? 'المبتدئ' : 'Starter',
      desc: isAr ? 'مثالي للمكاتب الصغيرة والمحاسبين المستقلين' : 'Perfect for small firms and freelance accountants',
      monthlyPrice: `299 ${currency}`,
      yearlyPrice: `239 ${currency}`,
      popular: false,
      features: isAr ? [
        'حتى 50 عميل',
        '500 فاتورة شهرياً',
        'مستخدم واحد',
        'الفاتورة الإلكترونية (ETA)',
        'التقارير الأساسية',
        'دعم عبر البريد الإلكتروني',
      ] : [
        'Up to 50 clients',
        '500 invoices/month',
        '1 user',
        'E-Invoicing (ETA)',
        'Basic reports',
        'Email support',
      ],
    },
    {
      name: isAr ? 'الاحترافي' : 'Professional',
      desc: isAr ? 'الأنسب لمكاتب المحاسبة المتوسطة والمتنامية' : 'Best for growing mid-size accounting firms',
      monthlyPrice: `599 ${currency}`,
      yearlyPrice: `479 ${currency}`,
      popular: true,
      features: isAr ? [
        'حتى 200 عميل',
        'فواتير غير محدودة',
        'حتى 5 مستخدمين',
        'الفاتورة الإلكترونية (ETA)',
        'جميع التقارير المالية',
        'بوابة العملاء',
        'إدارة الفريق والصلاحيات',
        'دعم ذو أولوية',
      ] : [
        'Up to 200 clients',
        'Unlimited invoices',
        'Up to 5 users',
        'E-Invoicing (ETA)',
        'All financial reports',
        'Client portal',
        'Team & permissions',
        'Priority support',
      ],
    },
    {
      name: isAr ? 'المؤسسي' : 'Enterprise',
      desc: isAr ? 'للمكاتب الكبيرة التي تحتاج إلى حلول مخصصة' : 'For large firms that need custom solutions',
      monthlyPrice: `999 ${currency}`,
      yearlyPrice: `799 ${currency}`,
      popular: false,
      features: isAr ? [
        'عملاء غير محدودين',
        'فواتير غير محدودة',
        'مستخدمين غير محدودين',
        'كل مزايا الاحترافي',
        'الرواتب والجداول الزمنية',
        'API مخصص',
        'مدير حساب مخصص',
        'دعم 24/7',
      ] : [
        'Unlimited clients',
        'Unlimited invoices',
        'Unlimited users',
        'All Professional features',
        'Payroll & time tracking',
        'Custom API access',
        'Dedicated account manager',
        '24/7 support',
      ],
    },
  ]
})
</script>
