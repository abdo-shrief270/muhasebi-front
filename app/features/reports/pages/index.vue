<template>
  <FeatureBoundary id="reports">
    <div class="px-4 lg:px-6 py-5 max-w-[1400px] mx-auto">
      <UiPageHeader
        icon="i-lucide-bar-chart-3"
        :title="$t('nav.reports')"
        :subtitle="locale === 'ar' ? 'التقارير المالية والإدارية' : 'Financial & management reports'"
      />

      <!-- Grouped report cards. Each group keeps similar reports together so
           the user can scan the page by purpose (operations / financials /
           compliance) without reading every title. -->
      <div v-for="group in reportGroups" :key="group.id" class="mb-8 last:mb-0">
        <h2 class="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <UIcon :name="group.icon" class="w-3.5 h-3.5" />
          {{ locale === 'ar' ? group.titleAr : group.titleEn }}
        </h2>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <NuxtLink
            v-for="(report, index) in group.reports"
            :key="report.to"
            :to="report.to"
            v-motion
            :initial="{ opacity: 0, y: 8 }"
            :enter="{ opacity: 1, y: 0, transition: { delay: index * 40 } }"
            class="group relative bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 hover:border-primary-500/40 hover:shadow-sm transition-all"
          >
            <div
              class="w-10 h-10 rounded-md inline-flex items-center justify-center mb-3 group-hover:scale-105 transition-transform"
              :class="report.iconBg"
            >
              <UIcon :name="report.icon" class="w-5 h-5" :class="report.iconColor" />
            </div>
            <h3 class="text-sm font-semibold text-neutral-900 dark:text-neutral-0 mb-1 group-hover:text-primary-700 dark:group-hover:text-primary-400 transition-colors">
              {{ locale === 'ar' ? report.titleAr : report.titleEn }}
            </h3>
            <p class="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              {{ locale === 'ar' ? report.descAr : report.descEn }}
            </p>
            <UIcon
              name="i-lucide-arrow-up-right"
              class="absolute top-3 end-3 w-3.5 h-3.5 text-neutral-300 dark:text-neutral-700 group-hover:text-primary-500 rtl:rotate-90 transition-colors"
            />
          </NuxtLink>
        </div>
      </div>
    </div>
  </FeatureBoundary>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })

interface ReportCard {
  to: string
  icon: string
  iconBg: string
  iconColor: string
  titleEn: string
  titleAr: string
  descEn: string
  descAr: string
}

interface ReportGroup {
  id: string
  icon: string
  titleEn: string
  titleAr: string
  reports: ReportCard[]
}

const reportGroups: ReportGroup[] = [
  {
    id: 'financials',
    icon: 'i-lucide-landmark',
    titleEn: 'Financial Statements',
    titleAr: 'القوائم المالية',
    reports: [
      {
        to: '/reports/income-statement',
        icon: 'i-lucide-trending-up',
        iconBg: 'bg-success-500/10',
        iconColor: 'text-success-600 dark:text-success-400',
        titleEn: 'Income Statement',
        titleAr: 'قائمة الدخل',
        descEn: 'Revenue, expenses, and profit for the period.',
        descAr: 'الإيرادات والمصروفات وصافي الربح خلال الفترة.',
      },
      {
        to: '/reports/balance-sheet',
        icon: 'i-lucide-scale',
        iconBg: 'bg-info-500/10',
        iconColor: 'text-info-600 dark:text-info-400',
        titleEn: 'Balance Sheet',
        titleAr: 'الميزانية العمومية',
        descEn: 'Assets, liabilities, and equity at a point in time.',
        descAr: 'الأصول والخصوم وحقوق الملكية في تاريخ محدد.',
      },
      {
        to: '/reports/cash-flow',
        icon: 'i-lucide-arrow-left-right',
        iconBg: 'bg-warning-500/10',
        iconColor: 'text-warning-600 dark:text-warning-500',
        titleEn: 'Cash Flow',
        titleAr: 'التدفقات النقدية',
        descEn: 'Cash movement across operating, investing, and financing.',
        descAr: 'حركة النقد التشغيلي والاستثماري والتمويلي.',
      },
    ],
  },
  {
    id: 'ledger',
    icon: 'i-lucide-book-open',
    titleEn: 'Ledger & Balances',
    titleAr: 'الأستاذ والأرصدة',
    reports: [
      {
        to: '/reports/trial-balance',
        icon: 'i-lucide-list-checks',
        iconBg: 'bg-primary-500/10',
        iconColor: 'text-primary-700 dark:text-primary-400',
        titleEn: 'Trial Balance',
        titleAr: 'ميزان المراجعة',
        descEn: 'Debit and credit totals for every account.',
        descAr: 'مجاميع المدين والدائن لكل حساب.',
      },
      {
        to: '/reports/ledger',
        icon: 'i-lucide-receipt-text',
        iconBg: 'bg-purple-500/10',
        iconColor: 'text-purple-600 dark:text-purple-400',
        titleEn: 'Account Ledger',
        titleAr: 'دفتر الأستاذ',
        descEn: 'All transactions for a specific account.',
        descAr: 'حركات حساب معين خلال الفترة.',
      },
      {
        to: '/reports/comparative',
        icon: 'i-lucide-arrow-left-right',
        iconBg: 'bg-cyan-500/10',
        iconColor: 'text-cyan-600 dark:text-cyan-400',
        titleEn: 'Comparative Reports',
        titleAr: 'تقارير مقارنة',
        descEn: 'Compare two financial periods side by side.',
        descAr: 'مقارنة بين فترتين ماليتين جنباً إلى جنب.',
      },
    ],
  },
  {
    id: 'operations',
    icon: 'i-lucide-activity',
    titleEn: 'Operations',
    titleAr: 'العمليات',
    reports: [
      {
        to: '/reports/aging',
        icon: 'i-lucide-clock-alert',
        iconBg: 'bg-danger-500/10',
        iconColor: 'text-danger-600 dark:text-danger-500',
        titleEn: 'Aging Report',
        titleAr: 'أعمار الديون',
        descEn: 'Outstanding receivables and payables by age.',
        descAr: 'الذمم المدينة والدائنة مصنّفة حسب التقادم.',
      },
      {
        to: '/reports/client-statement',
        icon: 'i-lucide-user-square',
        iconBg: 'bg-indigo-500/10',
        iconColor: 'text-indigo-600 dark:text-indigo-400',
        titleEn: 'Client Statement',
        titleAr: 'كشف حساب عميل',
        descEn: 'Invoices and payments timeline for a client.',
        descAr: 'حركات الفواتير والمدفوعات لعميل محدد.',
      },
      {
        to: '/reports/scheduled',
        icon: 'i-lucide-calendar-clock',
        iconBg: 'bg-emerald-500/10',
        iconColor: 'text-emerald-600 dark:text-emerald-400',
        titleEn: 'Scheduled Reports',
        titleAr: 'التقارير المجدولة',
        descEn: 'Reports delivered on a recurring schedule.',
        descAr: 'تقارير تُرسل تلقائياً وفق جدول متكرر.',
      },
    ],
  },
]

const { locale } = useI18n()
</script>
