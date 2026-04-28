<template>
  <FeatureBoundary id="anomalies">
    <div class="px-4 lg:px-6 py-5 max-w-[1400px] mx-auto">
      <UiPageHeader
        icon="i-lucide-alert-octagon"
        :title="locale === 'ar' ? 'الشذوذ' : 'Anomalies'"
        :subtitle="locale === 'ar' ? 'معاملات غير مألوفة مكتشَفة تلقائياً' : 'Automatically detected unusual transactions'"
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
          <div class="w-14 h-14 mx-auto mb-4 rounded-full bg-warning-50 dark:bg-warning-500/10 flex items-center justify-center">
            <UIcon name="i-lucide-alert-octagon" class="w-7 h-7 text-warning-600 dark:text-warning-400" />
          </div>
          <p class="text-sm font-semibold text-neutral-900 dark:text-neutral-0 mb-1">
            {{ locale === 'ar' ? 'لا توجد حالات شذوذ حالياً' : 'No anomalies currently flagged' }}
          </p>
          <p class="text-xs text-neutral-500 dark:text-neutral-400 max-w-md mx-auto">
            {{ locale === 'ar' ? 'يجري التحليل بشكل دوري. سيظهر أي شذوذ هنا.' : 'Analysis runs periodically. Flagged items will appear here.' }}
          </p>
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
