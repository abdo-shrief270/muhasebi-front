<template>
  <section id="about" class="py-24 relative overflow-hidden">
    <div class="absolute inset-0 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700"></div>
    <!-- Decorative patterns -->
    <div class="absolute inset-0">
      <div class="absolute top-10 start-10 w-60 h-60 bg-white/5 rounded-full blur-3xl"></div>
      <div class="absolute bottom-10 end-10 w-80 h-80 bg-secondary-400/10 rounded-full blur-3xl"></div>
      <div class="absolute inset-0 opacity-5" style="background-image: radial-gradient(circle, white 1px, transparent 1px); background-size: 30px 30px;"></div>
    </div>

    <div class="relative max-w-7xl mx-auto px-6">
      <div class="grid lg:grid-cols-2 gap-16 items-center">
        <!-- Text -->
        <div
          v-motion
          :initial="{ opacity: 0, x: -40 }"
          :visible-once="{ opacity: 1, x: 0, transition: { duration: 600 } }"
        >
          <div class="inline-flex items-center gap-2 bg-white/10 text-white/90 text-xs font-bold px-4 py-1.5 rounded-full mb-6 uppercase tracking-wider backdrop-blur-sm">
            {{ t('landing.about.badge') }}
          </div>
          <h2 class="text-3xl lg:text-5xl font-extrabold text-white leading-tight mb-6">
            {{ t('landing.about.title') }}
          </h2>
          <p class="text-lg text-white/70 leading-relaxed mb-8">
            {{ t('landing.about.desc') }}
          </p>

          <div class="space-y-4">
            <div v-for="(point, i) in aboutPoints" :key="i" class="flex items-start gap-4">
              <div class="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg class="w-4 h-4 text-secondary-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 class="font-bold text-white mb-1">{{ point.title }}</h4>
                <p class="text-sm text-white/60">{{ point.desc }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Stats Grid -->
        <div
          v-motion
          :initial="{ opacity: 0, x: 40 }"
          :visible-once="{ opacity: 1, x: 0, transition: { duration: 600, delay: 200 } }"
          class="grid grid-cols-2 gap-5"
        >
          <div
            v-for="(stat, i) in stats"
            :key="i"
            class="bg-white/10 backdrop-blur-sm rounded-3xl p-8 text-center border border-white/10 hover:bg-white/15 transition-colors duration-300"
          >
            <div class="w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center" :class="stat.bgColor">
              <svg class="w-6 h-6" :class="stat.iconColor" fill="none" stroke="currentColor" viewBox="0 0 24 24" v-html="stat.icon"></svg>
            </div>
            <p class="text-3xl lg:text-4xl font-extrabold text-white mb-1"><UiCountUp :value="stat.value" :duration="2000" /></p>
            <p class="text-sm text-white/50">{{ stat.label }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const props = defineProps<{ stats?: { firms?: string; invoices?: string; uptime?: string } | null }>()
const { t, locale } = useI18n()

const aboutPoints = computed(() => {
  const isAr = locale.value === 'ar'
  return [
    {
      title: isAr ? 'مصمم للسوق المصري' : 'Built for Egypt',
      desc: isAr ? 'نظام محاسبة مصمم من الألف للياء ليتوافق مع المعايير المحاسبية المصرية والتشريعات الضريبية.' : 'An accounting system built from the ground up to comply with Egyptian accounting standards and tax regulations.',
    },
    {
      title: isAr ? 'أمان على مستوى البنوك' : 'Bank-Level Security',
      desc: isAr ? 'بياناتك مشفرة ومحمية بأعلى معايير الأمان مع نسخ احتياطية يومية تلقائية.' : 'Your data is encrypted and protected with the highest security standards with automatic daily backups.',
    },
    {
      title: isAr ? 'دعم فني متميز' : 'Premium Support',
      desc: isAr ? 'فريق دعم فني متخصص في المحاسبة جاهز لمساعدتك على مدار الساعة.' : 'A specialized accounting support team ready to help you around the clock.',
    },
  ]
})

const stats = computed(() => {
  const isAr = locale.value === 'ar'
  return [
    {
      value: props.stats?.firms || '+500',
      label: isAr ? 'مكتب محاسبة' : 'Accounting Firms',
      icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />',
      bgColor: 'bg-secondary-400/20', iconColor: 'text-secondary-300',
    },
    {
      value: props.stats?.invoices || '+10K',
      label: isAr ? 'فاتورة شهرياً' : 'Monthly Invoices',
      icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />',
      bgColor: 'bg-emerald-400/20', iconColor: 'text-emerald-300',
    },
    {
      value: props.stats?.uptime || '99.9%',
      label: isAr ? 'وقت التشغيل' : 'Uptime',
      icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />',
      bgColor: 'bg-amber-400/20', iconColor: 'text-amber-300',
    },
    {
      value: '24/7',
      label: isAr ? 'دعم فني' : 'Support',
      icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />',
      bgColor: 'bg-rose-400/20', iconColor: 'text-rose-300',
    },
  ]
})
</script>
