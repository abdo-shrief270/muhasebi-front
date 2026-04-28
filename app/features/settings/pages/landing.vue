<template>
  <FeatureBoundary id="settings-landing">
    <div class="px-4 lg:px-6 py-5 max-w-3xl mx-auto">
      <UiPageHeader
        icon="i-lucide-globe"
        :title="locale === 'ar' ? 'صفحة الهبوط' : 'Landing Page'"
        :subtitle="locale === 'ar' ? 'إعدادات صفحة الهبوط العامة للشركة' : 'Public landing page settings'"
      />

      <Can :perm="PERMISSIONS.MANAGE_LANDING_PAGE">
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

        <!--
          /settings/landing is a sibling route of /settings/customization, which
          already hosts the full landing-page editor (colors, logo, tagline, etc.).
          Rather than duplicate the form, point users at the unified editor.
        -->
        <NuxtLink
          to="/settings/customization"
          class="block bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5 hover:border-primary-500/40 transition-colors group"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-start gap-3 min-w-0">
              <div class="w-10 h-10 rounded-md bg-purple-500/10 text-purple-700 dark:text-purple-400 inline-flex items-center justify-center flex-shrink-0">
                <UIcon name="i-lucide-palette" class="w-4 h-4" />
              </div>
              <div class="min-w-0">
                <h3 class="text-sm font-semibold text-neutral-900 dark:text-neutral-0 mb-0.5">
                  {{ locale === 'ar' ? 'محرر التخصيص الموحَّد' : 'Unified Customization Editor' }}
                </h3>
                <p class="text-xs text-neutral-500 dark:text-neutral-400">
                  {{ locale === 'ar'
                    ? 'تحرير الألوان والشعار والتاجلاين ومحتوى صفحة الهبوط يتم من نفس المكان.'
                    : 'Colors, logo, tagline, and landing-page copy all live in one editor.' }}
                </p>
              </div>
            </div>
            <UIcon
              name="i-lucide-arrow-up-right"
              class="w-3.5 h-3.5 text-neutral-300 dark:text-neutral-600 group-hover:text-primary-500 rtl:rotate-90 transition-colors flex-shrink-0 mt-1"
            />
          </div>
        </NuxtLink>
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
