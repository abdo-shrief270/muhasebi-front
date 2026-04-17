<template>
  <section id="features" class="py-24 relative overflow-hidden">
    <!-- Background -->
    <div class="absolute inset-0 bg-gradient-to-b from-gray-50/80 to-white"></div>
    <div class="absolute top-0 end-0 w-[500px] h-[500px] bg-primary-100/20 rounded-full blur-[100px]"></div>

    <div class="relative max-w-7xl mx-auto px-6">
      <!-- Header -->
      <div
        v-motion
        :initial="{ opacity: 0, y: 30 }"
        :visible-once="{ opacity: 1, y: 0, transition: { duration: 600 } }"
        class="text-center mb-20"
      >
        <div class="inline-flex items-center gap-2 bg-primary-50 text-primary-600 text-xs font-bold px-4 py-1.5 rounded-full mb-4 uppercase tracking-wider">
          {{ t('landing.features.badge') }}
        </div>
        <h2 class="text-3xl lg:text-5xl font-extrabold text-gray-900 mb-4">
          {{ t('landing.features.title') }}
        </h2>
        <p class="text-lg text-gray-400 max-w-2xl mx-auto">
          {{ t('landing.features.subtitle') }}
        </p>
      </div>

      <!-- Features Grid -->
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="(feature, i) in features"
          :key="i"
          v-motion
          :initial="{ opacity: 0, y: 30 }"
          :visible-once="{ opacity: 1, y: 0, transition: { delay: i * 80, duration: 500 } }"
          class="group relative bg-white rounded-3xl border border-gray-100 p-8 hover:shadow-2xl hover:shadow-gray-200/50 hover:border-gray-200 transition-all duration-500 hover:-translate-y-1"
        >
          <!-- Gradient hover effect -->
          <div class="absolute inset-0 bg-gradient-to-br rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" :class="feature.gradient"></div>

          <div class="relative">
            <div class="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg" :class="[feature.bgColor, feature.shadowColor]">
              <svg class="w-6 h-6" :class="feature.iconColor" fill="none" stroke="currentColor" viewBox="0 0 24 24" v-html="feature.icon"></svg>
            </div>
            <h3 class="text-lg font-bold text-gray-800 mb-3">{{ feature.title }}</h3>
            <p class="text-sm text-gray-400 leading-relaxed">{{ feature.desc }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { LandingFeature } from '~/features/marketing/composables/useLanding'

const props = defineProps<{ features?: LandingFeature[] | null }>()
const { t, locale } = useI18n()

const colorPresets = [
  { bgColor: 'bg-primary-50', iconColor: 'text-primary-600', shadowColor: 'group-hover:shadow-primary-200/50', gradient: 'from-primary-50/50 to-transparent' },
  { bgColor: 'bg-secondary-50', iconColor: 'text-secondary-600', shadowColor: 'group-hover:shadow-secondary-200/50', gradient: 'from-secondary-50/50 to-transparent' },
  { bgColor: 'bg-emerald-50', iconColor: 'text-emerald-600', shadowColor: 'group-hover:shadow-emerald-200/50', gradient: 'from-emerald-50/50 to-transparent' },
  { bgColor: 'bg-amber-50', iconColor: 'text-amber-600', shadowColor: 'group-hover:shadow-amber-200/50', gradient: 'from-amber-50/50 to-transparent' },
  { bgColor: 'bg-violet-50', iconColor: 'text-violet-600', shadowColor: 'group-hover:shadow-violet-200/50', gradient: 'from-violet-50/50 to-transparent' },
  { bgColor: 'bg-rose-50', iconColor: 'text-rose-600', shadowColor: 'group-hover:shadow-rose-200/50', gradient: 'from-rose-50/50 to-transparent' },
  { bgColor: 'bg-cyan-50', iconColor: 'text-cyan-600', shadowColor: 'group-hover:shadow-cyan-200/50', gradient: 'from-cyan-50/50 to-transparent' },
  { bgColor: 'bg-indigo-50', iconColor: 'text-indigo-600', shadowColor: 'group-hover:shadow-indigo-200/50', gradient: 'from-indigo-50/50 to-transparent' },
  { bgColor: 'bg-orange-50', iconColor: 'text-orange-600', shadowColor: 'group-hover:shadow-orange-200/50', gradient: 'from-orange-50/50 to-transparent' },
]

const features = computed(() => {
  const isAr = locale.value === 'ar'

  // If API features are provided, use them with color cycling
  if (props.features?.length) {
    return props.features
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((f, i) => ({
        title: isAr ? f.title.ar : f.title.en,
        desc: isAr ? f.description.ar : f.description.en,
        icon: f.icon,
        ...colorPresets[i % colorPresets.length],
      }))
  }

  // Fallback to hardcoded defaults
  return [
    {
      title: isAr ? 'إدارة العملاء المتقدمة' : 'Advanced Client Management',
      desc: isAr ? 'أنشئ ملفات شاملة لكل عميل مع تتبع كامل للمعاملات المالية والمستندات والتاريخ المحاسبي.' : 'Create comprehensive client profiles with full tracking of financial transactions, documents, and accounting history.',
      icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />',
      bgColor: 'bg-primary-50', iconColor: 'text-primary-600', shadowColor: 'group-hover:shadow-primary-200/50',
      gradient: 'from-primary-50/50 to-transparent',
    },
    {
      title: isAr ? 'الفواتير الذكية' : 'Smart Invoicing',
      desc: isAr ? 'أنشئ فواتير احترافية بلمسة واحدة مع حساب تلقائي للضرائب وتتبع حالة الدفع في الوقت الفعلي.' : 'Create professional invoices instantly with automatic tax calculations and real-time payment status tracking.',
      icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />',
      bgColor: 'bg-secondary-50', iconColor: 'text-secondary-600', shadowColor: 'group-hover:shadow-secondary-200/50',
      gradient: 'from-secondary-50/50 to-transparent',
    },
    {
      title: isAr ? 'دليل الحسابات المصري' : 'Egyptian Chart of Accounts',
      desc: isAr ? 'شجرة حسابات مصرية جاهزة متوافقة مع معايير المحاسبة المصرية مع إمكانية التخصيص الكامل.' : 'Pre-built Egyptian chart of accounts compliant with Egyptian Accounting Standards with full customization.',
      icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />',
      bgColor: 'bg-emerald-50', iconColor: 'text-emerald-600', shadowColor: 'group-hover:shadow-emerald-200/50',
      gradient: 'from-emerald-50/50 to-transparent',
    },
    {
      title: isAr ? 'القيود المحاسبية الآلية' : 'Automated Journal Entries',
      desc: isAr ? 'سجل القيود المحاسبية بذكاء مع التحقق التلقائي من التوازن وربط تلقائي بالفواتير والمستندات.' : 'Record journal entries intelligently with automatic balance validation and auto-linking to invoices and documents.',
      icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />',
      bgColor: 'bg-amber-50', iconColor: 'text-amber-600', shadowColor: 'group-hover:shadow-amber-200/50',
      gradient: 'from-amber-50/50 to-transparent',
    },
    {
      title: isAr ? 'الفاتورة الإلكترونية (ETA)' : 'E-Invoicing (ETA)',
      desc: isAr ? 'ربط مباشر مع منظومة الفاتورة الإلكترونية المصرية. إرسال واستقبال الفواتير بشكل آلي ومتوافق.' : 'Direct integration with the Egyptian Tax Authority e-invoicing system. Send and receive invoices automatically.',
      icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />',
      bgColor: 'bg-violet-50', iconColor: 'text-violet-600', shadowColor: 'group-hover:shadow-violet-200/50',
      gradient: 'from-violet-50/50 to-transparent',
    },
    {
      title: isAr ? 'تقارير مالية شاملة' : 'Comprehensive Financial Reports',
      desc: isAr ? 'ميزان مراجعة، قائمة دخل، ميزانية عمومية، تدفقات نقدية، وتقارير مخصصة بنقرة واحدة.' : 'Trial balance, income statement, balance sheet, cash flow, and custom reports with one click.',
      icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />',
      bgColor: 'bg-rose-50', iconColor: 'text-rose-600', shadowColor: 'group-hover:shadow-rose-200/50',
      gradient: 'from-rose-50/50 to-transparent',
    },
    {
      title: isAr ? 'إدارة الفريق والصلاحيات' : 'Team & Permissions',
      desc: isAr ? 'أضف أعضاء فريقك وحدد صلاحيات دقيقة لكل مستخدم مع تتبع كامل لسجل النشاطات.' : 'Add team members with granular role-based permissions and complete activity audit trails.',
      icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />',
      bgColor: 'bg-cyan-50', iconColor: 'text-cyan-600', shadowColor: 'group-hover:shadow-cyan-200/50',
      gradient: 'from-cyan-50/50 to-transparent',
    },
    {
      title: isAr ? 'بوابة العملاء' : 'Client Portal',
      desc: isAr ? 'وفر لعملائك بوابة خاصة لمتابعة فواتيرهم ومستنداتهم والتواصل معك مباشرة.' : 'Provide clients with a dedicated portal to view invoices, documents, and communicate directly with you.',
      icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />',
      bgColor: 'bg-indigo-50', iconColor: 'text-indigo-600', shadowColor: 'group-hover:shadow-indigo-200/50',
      gradient: 'from-indigo-50/50 to-transparent',
    },
    {
      title: isAr ? 'الرواتب والجداول الزمنية' : 'Payroll & Time Tracking',
      desc: isAr ? 'أدر رواتب الموظفين وتتبع ساعات العمل مع حساب تلقائي للتأمينات والضرائب.' : 'Manage employee payroll and track work hours with automatic insurance and tax calculations.',
      icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />',
      bgColor: 'bg-orange-50', iconColor: 'text-orange-600', shadowColor: 'group-hover:shadow-orange-200/50',
      gradient: 'from-orange-50/50 to-transparent',
    },
  ]
})
</script>
