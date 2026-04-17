<template>
  <section id="faq" class="py-24 relative">
    <div class="absolute inset-0 bg-gradient-to-b from-gray-50/80 to-white"></div>

    <div class="relative max-w-3xl mx-auto px-6">
      <!-- Header -->
      <div
        v-motion
        :initial="{ opacity: 0, y: 30 }"
        :visible-once="{ opacity: 1, y: 0, transition: { duration: 600 } }"
        class="text-center mb-16"
      >
        <div class="inline-flex items-center gap-2 bg-amber-50 text-amber-600 text-xs font-bold px-4 py-1.5 rounded-full mb-4 uppercase tracking-wider">
          {{ t('landing.faq.badge') }}
        </div>
        <h2 class="text-3xl lg:text-5xl font-extrabold text-gray-900 mb-4">
          {{ t('landing.faq.title') }}
        </h2>
        <p class="text-lg text-gray-400">
          {{ t('landing.faq.subtitle') }}
        </p>
      </div>

      <!-- FAQ Items -->
      <div class="space-y-3">
        <div
          v-for="(item, i) in faqs"
          :key="i"
          v-motion
          :initial="{ opacity: 0, y: 20 }"
          :visible-once="{ opacity: 1, y: 0, transition: { delay: i * 60, duration: 400 } }"
          class="bg-white rounded-2xl border border-gray-100 overflow-hidden transition-all duration-300"
          :class="openIndex === i ? 'shadow-lg shadow-gray-100/50 border-gray-200' : 'hover:border-gray-200'"
        >
          <button
            @click="openIndex = openIndex === i ? -1 : i"
            class="w-full flex items-center justify-between px-6 py-5 text-start"
          >
            <span class="font-semibold text-gray-800 text-sm pe-4">{{ item.q }}</span>
            <svg
              class="w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-300"
              :class="openIndex === i ? 'rotate-180' : ''"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <Transition
            enter-active-class="transition-all duration-300 ease-out"
            enter-from-class="opacity-0 max-h-0"
            enter-to-class="opacity-100 max-h-96"
            leave-active-class="transition-all duration-200 ease-in"
            leave-from-class="opacity-100 max-h-96"
            leave-to-class="opacity-0 max-h-0"
          >
            <div v-if="openIndex === i" class="overflow-hidden">
              <p class="px-6 pb-5 text-sm text-gray-500 leading-relaxed">{{ item.a }}</p>
            </div>
          </Transition>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { FaqItem } from '~/features/marketing/composables/useLanding'

const props = defineProps<{ faqs?: FaqItem[] | null }>()
const { t, locale } = useI18n()

const openIndex = ref(0)

const faqs = computed(() => {
  const isAr = locale.value === 'ar'

  // If API data provided, map it
  if (props.faqs?.length) {
    return props.faqs
      .filter(f => f.is_active)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(f => ({
        q: isAr ? f.question.ar : f.question.en,
        a: isAr ? f.answer.ar : f.answer.en,
      }))
  }

  // Fallback to hardcoded defaults
  return [
    {
      q: isAr ? 'هل يمكنني تجربة النظام مجاناً قبل الاشتراك؟' : 'Can I try the system for free before subscribing?',
      a: isAr ? 'نعم! نوفر فترة تجريبية مجانية لمدة 14 يوماً بجميع المزايا بدون الحاجة لبطاقة ائتمان. يمكنك استكشاف جميع خصائص النظام والتأكد من ملاءمته لاحتياجاتك.' : 'Yes! We offer a 14-day free trial with all features, no credit card required. You can explore all system capabilities and ensure it fits your needs.',
    },
    {
      q: isAr ? 'هل النظام متوافق مع منظومة الفاتورة الإلكترونية المصرية؟' : 'Is the system compatible with the Egyptian e-invoicing system?',
      a: isAr ? 'بالتأكيد. محاسبي متوافق بالكامل مع منظومة الفاتورة الإلكترونية المصرية (ETA). يمكنك إرسال واستقبال الفواتير الإلكترونية مباشرة من النظام مع تحقق تلقائي من صحة البيانات.' : 'Absolutely. Muhasebi is fully compatible with the Egyptian Tax Authority e-invoicing system (ETA). You can send and receive e-invoices directly from the system with automatic data validation.',
    },
    {
      q: isAr ? 'هل بياناتي آمنة؟' : 'Is my data secure?',
      a: isAr ? 'أمان بياناتك أولويتنا القصوى. نستخدم تشفير SSL 256-bit، خوادم محمية على مستوى البنوك، ونسخ احتياطية يومية تلقائية. بياناتك ملكك فقط ولا يمكن لأحد الوصول إليها.' : 'Your data security is our top priority. We use 256-bit SSL encryption, bank-level secure servers, and automatic daily backups. Your data belongs only to you and no one else can access it.',
    },
    {
      q: isAr ? 'هل يمكنني ترحيل بياناتي من نظام آخر؟' : 'Can I migrate my data from another system?',
      a: isAr ? 'نعم، يدعم محاسبي استيراد البيانات من ملفات Excel وCSV. كما يمكن لفريق الدعم الفني مساعدتك في ترحيل بياناتك من أي نظام محاسبي آخر بسلاسة.' : 'Yes, Muhasebi supports data import from Excel and CSV files. Our support team can also help you seamlessly migrate your data from any other accounting system.',
    },
    {
      q: isAr ? 'ما هي طرق الدفع المتاحة؟' : 'What payment methods are available?',
      a: isAr ? 'نقبل الدفع عبر بطاقات الائتمان (Visa/Mastercard)، التحويل البنكي، وفودافون كاش. يمكنك الدفع شهرياً أو سنوياً مع خصم 20٪ على الاشتراك السنوي.' : 'We accept credit cards (Visa/Mastercard), bank transfers, and Vodafone Cash. You can pay monthly or yearly with a 20% discount on annual subscriptions.',
    },
    {
      q: isAr ? 'هل يدعم النظام اللغة العربية والإنجليزية؟' : 'Does the system support Arabic and English?',
      a: isAr ? 'نعم، محاسبي يدعم اللغتين العربية والإنجليزية بشكل كامل مع دعم الكتابة من اليمين لليسار (RTL). يمكنك التبديل بين اللغتين في أي وقت.' : 'Yes, Muhasebi fully supports both Arabic and English with right-to-left (RTL) writing support. You can switch between languages at any time.',
    },
  ]
})
</script>
