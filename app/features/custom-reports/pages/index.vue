<template>
  <FeatureBoundary id="custom-reports">
    <div class="px-4 lg:px-6 py-5 max-w-[1400px] mx-auto">
      <UiPageHeader
        icon="i-lucide-sliders-horizontal"
        :title="locale === 'ar' ? 'تقارير مخصصة' : 'Custom Reports'"
        :subtitle="locale === 'ar' ? 'تقارير مُصمَّمة حسب احتياجك' : 'Reports tailored to your workflow'"
      />

      <Can :perm="PERMISSIONS.VIEW_REPORTS">
        <template #fallback>
          <div class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-12 text-center">
            <div class="w-12 h-12 mx-auto mb-4 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
              <UIcon name="i-lucide-lock" class="w-5 h-5 text-neutral-400" />
            </div>
            <p class="text-sm font-semibold text-neutral-900 dark:text-neutral-0">
              {{ locale === 'ar' ? 'لا تملك صلاحية الوصول' : "You don't have access" }}
            </p>
          </div>
        </template>

        <div class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-12 text-center">
          <div class="w-14 h-14 mx-auto mb-4 rounded-full bg-primary-50 dark:bg-primary-500/10 flex items-center justify-center">
            <UIcon name="i-lucide-sliders-horizontal" class="w-7 h-7 text-primary-600 dark:text-primary-400" />
          </div>
          <p class="text-sm font-semibold text-neutral-900 dark:text-neutral-0 mb-1">
            {{ locale === 'ar' ? 'لم تُنشئ أي تقرير مخصص بعد' : 'No custom reports yet' }}
          </p>
          <p class="text-xs text-neutral-500 dark:text-neutral-400 max-w-md mx-auto mb-4">
            {{ locale === 'ar' ? 'صمّم تقاريرك من مركز التقارير.' : 'Build reports from the Reports Center.' }}
          </p>
          <NuxtLink
            to="/reports"
            class="inline-flex items-center gap-1 text-xs font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
          >
            {{ locale === 'ar' ? 'الذهاب لمركز التقارير' : 'Go to Reports Center' }}
            <UIcon name="i-lucide-arrow-right" class="w-3.5 h-3.5 rtl:rotate-180" />
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
</script>
