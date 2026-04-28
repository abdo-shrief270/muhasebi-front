<template>
  <FeatureBoundary id="tax">
    <div class="px-4 lg:px-6 py-5 max-w-[1400px] mx-auto">
      <UiPageHeader
        icon="i-lucide-percent"
        :title="locale === 'ar' ? 'الضرائب' : 'Tax Management'"
        :subtitle="locale === 'ar' ? 'إقرارات ومسؤوليات ضريبية مصرية' : 'Egyptian tax returns and obligations'"
      />

      <Can :perm="PERMISSIONS.MANAGE_TAX">
        <template #fallback>
          <div class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-12 text-center">
            <div class="w-12 h-12 mx-auto mb-4 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
              <UIcon name="i-lucide-lock" class="w-5 h-5 text-neutral-400" />
            </div>
            <p class="text-sm font-semibold text-neutral-900 dark:text-neutral-0 mb-1">
              {{ locale === 'ar' ? 'لا تملك صلاحية الوصول' : "You don't have access" }}
            </p>
          </div>
        </template>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <NuxtLink
            v-for="link in quickLinks"
            :key="link.to"
            :to="link.to"
            class="group relative bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 hover:border-primary-500/40 hover:shadow-sm transition-all"
          >
            <div
              class="w-10 h-10 rounded-md inline-flex items-center justify-center mb-3 group-hover:scale-105 transition-transform"
              :class="link.iconBg"
            >
              <UIcon :name="link.icon" class="w-5 h-5" :class="link.iconColor" />
            </div>
            <h3 class="text-sm font-semibold text-neutral-900 dark:text-neutral-0 mb-1 group-hover:text-primary-700 dark:group-hover:text-primary-400 transition-colors">
              {{ link.title }}
            </h3>
            <p class="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">{{ link.subtitle }}</p>
            <UIcon
              name="i-lucide-arrow-up-right"
              class="absolute top-3 end-3 w-3.5 h-3.5 text-neutral-300 dark:text-neutral-700 group-hover:text-primary-500 rtl:rotate-90 transition-colors"
            />
          </NuxtLink>
        </div>
      </Can>
    </div>
  </FeatureBoundary>
</template>

<script setup lang="ts">
import Can from '~/core/rbac/Can.vue'
import { PERMISSIONS } from '~/core/rbac/permissions'

definePageMeta({ layout: 'dashboard' })

const { locale } = useI18n()

const quickLinks = computed(() => [
  {
    to: '/tax/vat',
    icon: 'i-lucide-percent',
    iconBg: 'bg-info-500/10',
    iconColor: 'text-info-600 dark:text-info-400',
    title: locale.value === 'ar' ? 'إقرارات القيمة المضافة' : 'VAT Returns',
    subtitle: locale.value === 'ar' ? 'إعداد وتقديم إقرارات شهرية لضريبة القيمة المضافة.' : 'Prepare and file monthly VAT returns.',
  },
  {
    to: '/tax/wht',
    icon: 'i-lucide-receipt-text',
    iconBg: 'bg-warning-500/10',
    iconColor: 'text-warning-600 dark:text-warning-500',
    title: locale.value === 'ar' ? 'الخصم عند المنبع' : 'Withholding Tax',
    subtitle: locale.value === 'ar' ? 'سجلات الخصم من المدفوعات للموردين.' : 'Withholding records on vendor payments.',
  },
  {
    to: '/tax/corporate',
    icon: 'i-lucide-building-2',
    iconBg: 'bg-primary-500/10',
    iconColor: 'text-primary-700 dark:text-primary-400',
    title: locale.value === 'ar' ? 'ضريبة الشركات' : 'Corporate Tax',
    subtitle: locale.value === 'ar' ? 'الالتزامات الضريبية السنوية على الأرباح.' : 'Annual corporate-tax obligations.',
  },
  {
    to: '/eta',
    icon: 'i-lucide-scan-line',
    iconBg: 'bg-success-500/10',
    iconColor: 'text-success-600 dark:text-success-400',
    title: locale.value === 'ar' ? 'الفاتورة الإلكترونية' : 'ETA E-Invoice',
    subtitle: locale.value === 'ar' ? 'الربط مع منظومة مصلحة الضرائب المصرية.' : 'Egyptian Tax Authority integration.',
  },
])
</script>
