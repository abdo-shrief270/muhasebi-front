<template>
  <div>
    <NuxtLayout name="dashboard">
      <FeatureBoundary id="reports">
      <UiPageHeader :title="$t('nav.reports')" :subtitle="locale === 'ar' ? 'التقارير المالية' : 'Financial Reports'" />

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <NuxtLink
          v-for="(report, index) in reports"
          :key="report.to"
          :to="report.to"
          v-motion
          :initial="{ opacity: 0, y: 20 }"
          :enter="{ opacity: 1, y: 0, transition: { delay: index * 80 } }"
          class="bg-white rounded-2xl border border-gray-100/80 p-6 card-hover group"
        >
          <div class="w-12 h-12 rounded-xl flex items-center justify-center text-xl mb-4" :class="report.iconBg">
            {{ report.icon }}
          </div>
          <h3 class="font-bold text-gray-800 mb-1 group-hover:text-primary-500 transition-colors">{{ report.title }}</h3>
          <p class="text-sm text-gray-400">{{ report.description }}</p>
        </NuxtLink>
      </div>
      </FeatureBoundary>
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })
const { locale } = useI18n()

const reports = computed(() => [
  {
    to: '/reports/trial-balance',
    icon: '&#9776;',
    iconBg: 'bg-primary-50 text-primary-400',
    title: locale.value === 'ar' ? 'ميزان المراجعة' : 'Trial Balance',
    description: locale.value === 'ar' ? 'أرصدة جميع الحسابات' : 'All account balances',
  },
  {
    to: '/reports/income-statement',
    icon: '&#9650;',
    iconBg: 'bg-emerald-50 text-emerald-500',
    title: locale.value === 'ar' ? 'قائمة الدخل' : 'Income Statement',
    description: locale.value === 'ar' ? 'الإيرادات والمصروفات والأرباح' : 'Revenue, expenses, and profit',
  },
  {
    to: '/reports/balance-sheet',
    icon: '&#9881;',
    iconBg: 'bg-blue-50 text-blue-500',
    title: locale.value === 'ar' ? 'الميزانية العمومية' : 'Balance Sheet',
    description: locale.value === 'ar' ? 'الأصول = الخصوم + حقوق الملكية' : 'Assets = Liabilities + Equity',
  },
  {
    to: '/reports/cash-flow',
    icon: '&#8644;',
    iconBg: 'bg-amber-50 text-amber-500',
    title: locale.value === 'ar' ? 'التدفقات النقدية' : 'Cash Flow',
    description: locale.value === 'ar' ? 'حركة النقد خلال الفترة' : 'Cash movement during the period',
  },
  {
    to: '/reports/ledger',
    icon: '&#9679;',
    iconBg: 'bg-purple-50 text-purple-500',
    title: locale.value === 'ar' ? 'دفتر الأستاذ' : 'Account Ledger',
    description: locale.value === 'ar' ? 'حركات حساب معين' : 'Transactions for a specific account',
  },
  {
    to: '/reports/aging',
    icon: '&#9200;',
    iconBg: 'bg-red-50 text-red-500',
    title: locale.value === 'ar' ? 'أعمار الديون' : 'Aging Report',
    description: locale.value === 'ar' ? 'تحليل المستحقات المتأخرة' : 'Overdue receivables analysis',
  },
  {
    to: '/reports/client-statement',
    icon: '&#128203;',
    iconBg: 'bg-indigo-50 text-indigo-500',
    title: locale.value === 'ar' ? 'كشف حساب عميل' : 'Client Statement',
    description: locale.value === 'ar' ? 'حركات الفواتير والمدفوعات لعميل' : 'Invoice and payment transactions for a client',
  },
  {
    to: '/reports/comparative',
    icon: '&#128200;',
    iconBg: 'bg-cyan-50 text-cyan-500',
    title: locale.value === 'ar' ? 'تقارير مقارنة' : 'Comparative Reports',
    description: locale.value === 'ar' ? 'مقارنة بين فترتين ماليتين' : 'Compare two financial periods side by side',
  },
])
</script>
