<template>
  <div>
      <div class="max-w-3xl mx-auto px-6 py-12">
        <!-- Header -->
        <div class="mb-12">
          <div class="inline-flex items-center gap-2 bg-primary-50 text-primary-600 text-xs font-bold px-4 py-1.5 rounded-full mb-4 uppercase tracking-wider">
            {{ locale === 'ar' ? 'سجل التغييرات' : 'Changelog' }}
          </div>
          <h1 class="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-3">
            {{ locale === 'ar' ? 'ما الجديد في محاسبي' : "What's new in Muhasebi" }}
          </h1>
          <p class="text-lg text-gray-400">
            {{ locale === 'ar' ? 'تابع آخر التحديثات والتحسينات والإصلاحات' : 'Stay up to date with the latest updates, improvements, and fixes' }}
          </p>
        </div>

        <div v-if="loading" class="space-y-8">
          <div v-for="i in 3" :key="i" class="space-y-3">
            <UiLoadingSkeleton :lines="1" :height="24" />
            <UiLoadingSkeleton :lines="4" :height="16" />
          </div>
        </div>

        <!-- Changelog entries from API -->
        <div v-else-if="page" class="prose prose-gray max-w-none prose-headings:font-bold prose-a:text-primary-500"
          :class="locale === 'ar' ? 'prose-rtl' : ''"
          v-html="pageContent"
        ></div>

        <!-- Fallback hardcoded changelog -->
        <div v-else class="space-y-8">
          <div
            v-for="(entry, i) in fallbackEntries"
            :key="i"
            v-motion
            :initial="{ opacity: 0, y: 20 }"
            :visible-once="{ opacity: 1, y: 0, transition: { delay: i * 80 } }"
            class="relative ps-8 border-s-2 border-gray-200 pb-8 last:pb-0"
          >
            <!-- Timeline dot -->
            <div class="absolute start-0 top-0 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-white" :class="i === 0 ? 'bg-primary-500' : 'bg-gray-300'"></div>

            <div class="flex items-center gap-3 mb-3">
              <span class="text-sm font-bold text-gray-800">{{ entry.version }}</span>
              <span class="text-xs text-gray-400">{{ entry.date }}</span>
              <span
                class="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase"
                :class="{
                  'bg-emerald-50 text-emerald-600': entry.type === 'feature',
                  'bg-amber-50 text-amber-600': entry.type === 'improvement',
                  'bg-red-50 text-red-600': entry.type === 'fix',
                }"
              >
                {{ entry.type }}
              </span>
            </div>
            <h3 class="font-semibold text-gray-800 mb-2">{{ entry.title }}</h3>
            <ul class="space-y-1.5">
              <li v-for="(item, j) in entry.items" :key="j" class="flex items-start gap-2 text-sm text-gray-500">
                <svg class="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" /></svg>
                {{ item }}
              </li>
            </ul>
          </div>
        </div>
      </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'public' })

const { locale } = useI18n()
const { getPage } = usePages()

const page = ref<any>(null)
const loading = ref(true)

const pageContent = computed(() => {
  if (page.value?.content) return locale.value === 'ar' ? page.value.content.ar : page.value.content.en
  return ''
})

useHead({
  title: computed(() => locale.value === 'ar' ? 'سجل التغييرات - محاسبي' : 'Changelog - Muhasebi'),
})

const fallbackEntries = computed(() => {
  const isAr = locale.value === 'ar'
  return [
    {
      version: 'v2.4.0', date: isAr ? '١ أبريل ٢٠٢٦' : 'April 1, 2026', type: 'feature',
      title: isAr ? 'بوابة العملاء الجديدة' : 'New Client Portal',
      items: isAr ? [
        'بوابة مخصصة لكل عميل لمتابعة فواتيره ومستنداته',
        'نظام مراسلات مباشرة بين العميل ومكتب المحاسبة',
        'إشعارات فورية للعملاء عند إصدار فاتورة جديدة',
      ] : [
        'Dedicated portal for each client to track invoices and documents',
        'Direct messaging system between client and accounting firm',
        'Instant notifications for clients when new invoices are issued',
      ],
    },
    {
      version: 'v2.3.0', date: isAr ? '١٥ مارس ٢٠٢٦' : 'March 15, 2026', type: 'improvement',
      title: isAr ? 'تحسينات الفاتورة الإلكترونية' : 'E-Invoicing Improvements',
      items: isAr ? [
        'دعم مطابقة الفواتير التلقائية مع ETA',
        'تحسين سرعة إرسال الفواتير بنسبة 60%',
        'إضافة تقارير حالة الفواتير الإلكترونية',
      ] : [
        'Automatic invoice reconciliation with ETA',
        '60% faster invoice submission speed',
        'Added e-invoice status reports',
      ],
    },
    {
      version: 'v2.2.1', date: isAr ? '٢ مارس ٢٠٢٦' : 'March 2, 2026', type: 'fix',
      title: isAr ? 'إصلاحات وتحسينات' : 'Bug Fixes & Improvements',
      items: isAr ? [
        'إصلاح مشكلة في حساب ضريبة القيمة المضافة للفواتير المعدلة',
        'تحسين أداء تحميل التقارير المالية',
        'إصلاح عرض التاريخ الهجري في التقارير',
      ] : [
        'Fixed VAT calculation issue for modified invoices',
        'Improved financial report loading performance',
        'Fixed Hijri date display in reports',
      ],
    },
  ]
})

onMounted(async () => {
  try { page.value = await getPage('changelog') } catch {}
  finally { loading.value = false }
})
</script>
