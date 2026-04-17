<template>
  <section class="py-16 bg-white border-y border-gray-100">
    <div class="max-w-7xl mx-auto px-6">
      <div
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :visible-once="{ opacity: 1, y: 0, transition: { duration: 500 } }"
        class="text-center"
      >
        <p class="text-sm font-medium text-gray-400 mb-8 uppercase tracking-wider">{{ t('landing.partners.title') }}</p>
        <div class="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
          <div v-for="(partner, i) in partners" :key="i"
            class="flex items-center gap-3 text-gray-300 hover:text-gray-500 transition-colors duration-300 group"
          >
            <div class="w-10 h-10 rounded-xl bg-gray-100 group-hover:bg-gray-200 transition-colors flex items-center justify-center">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" v-html="partner.icon"></svg>
            </div>
            <span class="font-semibold text-sm">{{ partner.name }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const { t, locale } = useI18n()

const partners = computed(() => [
  {
    name: locale.value === 'ar' ? 'مصلحة الضرائب المصرية' : 'Egyptian Tax Authority',
    icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />',
  },
  {
    name: locale.value === 'ar' ? 'منظومة الفاتورة الإلكترونية' : 'E-Invoice System (ETA)',
    icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />',
  },
  {
    name: locale.value === 'ar' ? 'معايير المحاسبة المصرية' : 'Egyptian Accounting Standards',
    icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />',
  },
  {
    name: locale.value === 'ar' ? 'تأمين بيانات SSL' : 'SSL Data Security',
    icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />',
  },
  {
    name: locale.value === 'ar' ? 'سحابة آمنة ١٠٠٪' : '100% Secure Cloud',
    icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />',
  },
])
</script>
