<template>
  <FeatureBoundary id="settings.branding">
    <div class="px-4 lg:px-6 py-5 max-w-[1400px] mx-auto">
      <!-- Header -->
      <div class="mb-5 flex items-start justify-between gap-3 flex-wrap">
        <div class="min-w-0 flex-1">
          <h1 class="text-xl font-bold text-neutral-900 dark:text-neutral-0 tracking-tight">
            {{ locale === 'ar' ? 'الهوية البصرية' : 'Branding' }}
          </h1>
          <p class="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            {{ locale === 'ar'
              ? 'اضبط الألوان والخطوط والشكل العام للنظام. التغييرات تُطبَّق فوراً بدون إعادة بناء.'
              : 'Tune colors, typography, and shape. Changes apply at runtime — no rebuild required.' }}
          </p>
        </div>
        <div class="flex items-center gap-2 flex-shrink-0">
          <UiAppButton
            variant="ghost"
            size="sm"
            icon="i-lucide-download"
            @click="exportPreset"
          >
            {{ locale === 'ar' ? 'تصدير' : 'Export' }}
          </UiAppButton>
          <UiAppButton
            variant="ghost"
            size="sm"
            icon="i-lucide-upload"
            @click="importPreset"
          >
            {{ locale === 'ar' ? 'استيراد' : 'Import' }}
          </UiAppButton>
          <UiAppButton
            variant="outline"
            size="sm"
            icon="i-lucide-rotate-ccw"
            :disabled="!hasOverrides || saving"
            @click="confirmResetOpen = true"
          >
            {{ locale === 'ar' ? 'إعادة الافتراضي' : 'Reset to default' }}
          </UiAppButton>
        </div>
      </div>

      <!-- Loading -->
      <template v-if="loading">
        <div class="space-y-4">
          <div class="h-12 rounded-md bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div class="h-96 rounded-xl bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
            <div class="h-96 rounded-xl bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
          </div>
        </div>
      </template>

      <template v-else-if="form">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <!-- LEFT: Editor -->
          <div class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
            <!-- Tabs -->
            <div class="flex border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-950/40">
              <button
                v-for="tab in tabs"
                :key="tab.key"
                type="button"
                class="flex-1 px-4 py-2.5 text-xs font-semibold tracking-wide transition-colors inline-flex items-center justify-center gap-2"
                :class="activeTab === tab.key
                  ? 'bg-neutral-0 dark:bg-neutral-900 text-primary-600 dark:text-primary-400 border-b-2 border-primary-500'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 border-b-2 border-transparent'"
                @click="activeTab = tab.key"
              >
                <UIcon :name="tab.icon" class="w-3.5 h-3.5" />
                {{ tab.label }}
              </button>
            </div>

            <!-- Colors tab -->
            <div v-if="activeTab === 'colors'" class="p-5 space-y-5">
              <div v-for="cfg in colorFields" :key="cfg.key" class="space-y-2">
                <div class="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <label class="text-xs font-semibold text-neutral-700 dark:text-neutral-200">
                      {{ cfg.label }}
                    </label>
                    <p class="text-[11px] text-neutral-400 dark:text-neutral-500">{{ cfg.hint }}</p>
                  </div>
                  <div class="flex items-center gap-2">
                    <ContrastBadge :fg="'#FFFFFF'" :bg="form.colors[cfg.key]" />
                    <input
                      :value="form.colors[cfg.key]"
                      type="color"
                      class="w-9 h-9 rounded-md border border-neutral-200 dark:border-neutral-800 cursor-pointer bg-transparent"
                      @input="onColorInput(cfg.key, ($event.target as HTMLInputElement).value)"
                    />
                    <input
                      :value="form.colors[cfg.key]"
                      type="text"
                      maxlength="7"
                      class="w-24 h-9 px-2 rounded-md border border-neutral-200 dark:border-neutral-800 bg-neutral-0 dark:bg-neutral-900 text-xs font-mono uppercase text-neutral-900 dark:text-neutral-0 outline-none focus:border-primary-500"
                      @input="onColorInput(cfg.key, ($event.target as HTMLInputElement).value)"
                    />
                  </div>
                </div>
                <RampInspector :hex="form.colors[cfg.key]" />
              </div>

              <!-- Neutral tone -->
              <div class="pt-3 border-t border-neutral-100 dark:border-neutral-800">
                <label class="text-xs font-semibold text-neutral-700 dark:text-neutral-200 mb-2 block">
                  {{ locale === 'ar' ? 'لون الحياد' : 'Neutral tone' }}
                </label>
                <div class="grid grid-cols-3 gap-2">
                  <button
                    v-for="opt in neutralToneOptions"
                    :key="opt.value"
                    type="button"
                    class="px-3 py-2 rounded-lg text-xs font-medium transition-colors border"
                    :class="form.colors.neutral_tone === opt.value
                      ? 'border-primary-500 bg-primary-50/40 dark:bg-primary-500/10 text-primary-700 dark:text-primary-300'
                      : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/40'"
                    @click="form.colors.neutral_tone = opt.value"
                  >
                    {{ opt.label }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Typography tab -->
            <div v-if="activeTab === 'typography'" class="p-5 space-y-5">
              <div v-for="cfg in fontFields" :key="cfg.key" class="space-y-1.5">
                <label class="text-xs font-semibold text-neutral-700 dark:text-neutral-200">
                  {{ cfg.label }}
                </label>
                <p class="text-[11px] text-neutral-400 dark:text-neutral-500">{{ cfg.hint }}</p>
                <div class="relative">
                  <input
                    v-model="form.typography[cfg.key]"
                    type="text"
                    maxlength="120"
                    :list="`fonts-${cfg.key}`"
                    class="w-full h-9 px-3 rounded-md border border-neutral-200 dark:border-neutral-800 bg-neutral-0 dark:bg-neutral-900 text-sm text-neutral-900 dark:text-neutral-0 outline-none focus:border-primary-500"
                    :placeholder="cfg.placeholder"
                  />
                  <datalist :id="`fonts-${cfg.key}`">
                    <option v-for="f in cfg.suggestions" :key="f" :value="f" />
                  </datalist>
                </div>
                <div
                  class="px-3 py-2 rounded-md bg-neutral-50 dark:bg-neutral-950/40 text-sm text-neutral-700 dark:text-neutral-200"
                  :style="{ fontFamily: previewFontFamily(form.typography[cfg.key]) }"
                  :dir="cfg.key === 'font_arabic' ? 'rtl' : 'ltr'"
                >
                  {{ cfg.sampleText }}
                </div>
              </div>

              <!-- Type scale -->
              <div class="pt-3 border-t border-neutral-100 dark:border-neutral-800">
                <label class="text-xs font-semibold text-neutral-700 dark:text-neutral-200 mb-2 block">
                  {{ locale === 'ar' ? 'حجم الخط الأساسي' : 'Type scale' }}
                </label>
                <div class="grid grid-cols-3 gap-2">
                  <button
                    v-for="opt in typeScaleOptions"
                    :key="opt.value"
                    type="button"
                    class="px-3 py-2 rounded-lg text-xs font-medium transition-colors border"
                    :class="form.typography.scale === opt.value
                      ? 'border-primary-500 bg-primary-50/40 dark:bg-primary-500/10 text-primary-700 dark:text-primary-300'
                      : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/40'"
                    @click="form.typography.scale = opt.value"
                  >
                    {{ opt.label }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Shape tab -->
            <div v-if="activeTab === 'shape'" class="p-5 space-y-5">
              <div>
                <label class="text-xs font-semibold text-neutral-700 dark:text-neutral-200 mb-2 block">
                  {{ locale === 'ar' ? 'استدارة الزوايا' : 'Corner radius' }}
                </label>
                <div class="grid grid-cols-3 gap-2">
                  <button
                    v-for="opt in radiusOptions"
                    :key="opt.value"
                    type="button"
                    class="p-3 rounded-lg text-xs font-medium transition-colors border flex flex-col items-center gap-1.5"
                    :class="form.shape.radius_scale === opt.value
                      ? 'border-primary-500 bg-primary-50/40 dark:bg-primary-500/10 text-primary-700 dark:text-primary-300'
                      : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/40'"
                    @click="form.shape.radius_scale = opt.value"
                  >
                    <div
                      class="w-10 h-10 bg-neutral-200 dark:bg-neutral-700"
                      :style="{ borderRadius: opt.preview }"
                    />
                    {{ opt.label }}
                  </button>
                </div>
              </div>

              <div class="pt-3 border-t border-neutral-100 dark:border-neutral-800">
                <label class="text-xs font-semibold text-neutral-700 dark:text-neutral-200 mb-2 block">
                  {{ locale === 'ar' ? 'حدّة الظلال' : 'Shadow depth' }}
                </label>
                <div class="grid grid-cols-3 gap-2">
                  <button
                    v-for="opt in shadowOptions"
                    :key="opt.value"
                    type="button"
                    class="p-3 rounded-lg text-xs font-medium transition-colors border flex flex-col items-center gap-2 bg-neutral-50/40 dark:bg-neutral-950/40"
                    :class="form.shape.shadow_scale === opt.value
                      ? 'border-primary-500 text-primary-700 dark:text-primary-300'
                      : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/40'"
                    @click="form.shape.shadow_scale = opt.value"
                  >
                    <div
                      class="w-10 h-10 rounded-md bg-neutral-0 dark:bg-neutral-800"
                      :style="{ boxShadow: opt.preview }"
                    />
                    {{ opt.label }}
                  </button>
                </div>
              </div>

              <div class="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between gap-3">
                <div>
                  <label class="text-xs font-semibold text-neutral-700 dark:text-neutral-200">
                    {{ locale === 'ar' ? 'تفعيل الحركة' : 'Motion enabled' }}
                  </label>
                  <p class="text-[11px] text-neutral-400 dark:text-neutral-500">
                    {{ locale === 'ar'
                      ? 'تعطيل لاختصار جميع الانتقالات إلى مللي ثانية واحدة.'
                      : 'Disable to collapse all transitions to 1 ms (denser feel).' }}
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  :aria-checked="form.motion.enabled"
                  class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors"
                  :class="form.motion.enabled ? 'bg-primary-500' : 'bg-neutral-300 dark:bg-neutral-700'"
                  @click="form.motion.enabled = !form.motion.enabled"
                >
                  <span
                    class="inline-block h-3.5 w-3.5 rounded-full bg-neutral-0 shadow-sm transform transition-transform"
                    :class="form.motion.enabled ? 'translate-x-5' : 'translate-x-1'"
                  />
                </button>
              </div>
            </div>

            <!-- Assets tab -->
            <div v-if="activeTab === 'assets'" class="p-5 space-y-6">
              <!-- Logo -->
              <div>
                <div class="flex items-center justify-between gap-3 mb-2">
                  <div>
                    <label class="text-xs font-semibold text-neutral-700 dark:text-neutral-200">
                      {{ locale === 'ar' ? 'الشعار' : 'Logo' }}
                    </label>
                    <p class="text-[11px] text-neutral-400 dark:text-neutral-500">
                      {{ locale === 'ar'
                        ? 'PNG / JPG / WebP / SVG — حتى 1 ميجابايت. يظهر في الشريط الجانبي والفواتير ورسائل البريد.'
                        : 'PNG, JPG, WebP, or SVG — up to 1 MB. Used in sidebar, invoices, and emails.' }}
                    </p>
                  </div>
                </div>
                <div class="flex items-center gap-3 flex-wrap">
                  <div
                    class="w-20 h-20 rounded-lg border border-dashed border-neutral-300 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-950/40 flex items-center justify-center overflow-hidden"
                  >
                    <img v-if="assets.logo_url" :src="assets.logo_url" alt="logo" class="max-w-full max-h-full object-contain" />
                    <UIcon v-else name="i-lucide-image" class="w-6 h-6 text-neutral-300 dark:text-neutral-600" />
                  </div>
                  <div class="flex items-center gap-2">
                    <UiAppButton
                      variant="outline"
                      size="sm"
                      icon="i-lucide-upload"
                      :loading="uploadingKind === 'logo'"
                      @click="logoInput?.click()"
                    >
                      {{ assets.logo_url
                        ? (locale === 'ar' ? 'تغيير' : 'Replace')
                        : (locale === 'ar' ? 'رفع' : 'Upload') }}
                    </UiAppButton>
                    <UiAppButton
                      v-if="assets.logo_url"
                      variant="ghost"
                      size="sm"
                      icon="i-lucide-trash-2"
                      :loading="uploadingKind === 'logo'"
                      @click="removeAsset('logo')"
                    >
                      {{ locale === 'ar' ? 'حذف' : 'Remove' }}
                    </UiAppButton>
                  </div>
                  <input
                    ref="logoInput"
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    class="hidden"
                    @change="uploadAsset('logo', ($event.target as HTMLInputElement).files?.[0]); ($event.target as HTMLInputElement).value = ''"
                  />
                </div>
              </div>

              <!-- Favicon -->
              <div class="pt-4 border-t border-neutral-100 dark:border-neutral-800">
                <div class="flex items-center justify-between gap-3 mb-2">
                  <div>
                    <label class="text-xs font-semibold text-neutral-700 dark:text-neutral-200">
                      {{ locale === 'ar' ? 'أيقونة المتصفح' : 'Favicon' }}
                    </label>
                    <p class="text-[11px] text-neutral-400 dark:text-neutral-500">
                      {{ locale === 'ar'
                        ? 'PNG / ICO / SVG — حتى 256 كيلوبايت. تظهر في تبويب المتصفح.'
                        : 'PNG, ICO, or SVG — up to 256 KB. Shown in the browser tab.' }}
                    </p>
                  </div>
                </div>
                <div class="flex items-center gap-3 flex-wrap">
                  <div
                    class="w-12 h-12 rounded-lg border border-dashed border-neutral-300 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-950/40 flex items-center justify-center overflow-hidden"
                  >
                    <img v-if="assets.favicon_url" :src="assets.favicon_url" alt="favicon" class="max-w-full max-h-full object-contain" />
                    <UIcon v-else name="i-lucide-globe" class="w-5 h-5 text-neutral-300 dark:text-neutral-600" />
                  </div>
                  <div class="flex items-center gap-2">
                    <UiAppButton
                      variant="outline"
                      size="sm"
                      icon="i-lucide-upload"
                      :loading="uploadingKind === 'favicon'"
                      @click="faviconInput?.click()"
                    >
                      {{ assets.favicon_url
                        ? (locale === 'ar' ? 'تغيير' : 'Replace')
                        : (locale === 'ar' ? 'رفع' : 'Upload') }}
                    </UiAppButton>
                    <UiAppButton
                      v-if="assets.favicon_url"
                      variant="ghost"
                      size="sm"
                      icon="i-lucide-trash-2"
                      :loading="uploadingKind === 'favicon'"
                      @click="removeAsset('favicon')"
                    >
                      {{ locale === 'ar' ? 'حذف' : 'Remove' }}
                    </UiAppButton>
                  </div>
                  <input
                    ref="faviconInput"
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml,image/x-icon,.ico"
                    class="hidden"
                    @change="uploadAsset('favicon', ($event.target as HTMLInputElement).files?.[0]); ($event.target as HTMLInputElement).value = ''"
                  />
                </div>
              </div>
            </div>

            <!-- Footer actions -->
            <div class="px-5 py-3 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-950/40 flex items-center justify-between gap-3">
              <p class="text-[11px] text-neutral-500 dark:text-neutral-400">
                <template v-if="isDirty">
                  <UIcon name="i-lucide-circle-dot" class="inline w-3 h-3 text-warning-500 align-middle" />
                  {{ locale === 'ar' ? 'تغييرات غير محفوظة' : 'Unsaved changes' }}
                </template>
                <template v-else>
                  <UIcon name="i-lucide-check-circle" class="inline w-3 h-3 text-success-500 align-middle" />
                  {{ locale === 'ar' ? 'محفوظ' : 'All saved' }}
                </template>
              </p>
              <div class="flex items-center gap-2">
                <UiAppButton
                  variant="ghost"
                  size="sm"
                  :disabled="!isDirty || saving"
                  @click="discardChanges"
                >
                  {{ $t('common.cancel') }}
                </UiAppButton>
                <UiAppButton
                  variant="primary"
                  size="sm"
                  icon="i-lucide-save"
                  :loading="saving"
                  :disabled="!isDirty"
                  @click="save"
                >
                  {{ locale === 'ar' ? 'حفظ ونشر' : 'Save & apply' }}
                </UiAppButton>
              </div>
            </div>
          </div>

          <!-- RIGHT: Live preview -->
          <div class="lg:sticky lg:top-4 self-start">
            <BrandingPreview :branding="form" />
          </div>
        </div>
      </template>
    </div>

    <!-- Reset confirm -->
    <UiConfirmModal
      v-model="confirmResetOpen"
      :title="locale === 'ar' ? 'استعادة الإعدادات الافتراضية' : 'Reset branding'"
      :description="locale === 'ar'
        ? 'سيتم حذف كل التخصيصات والعودة إلى ألوان وخطوط النظام الافتراضية.'
        : 'All your customizations will be removed and the platform defaults restored.'"
      icon="i-lucide-rotate-ccw"
      variant="default"
      :confirm-label="locale === 'ar' ? 'استعادة' : 'Reset'"
      :loading="resetting"
      @confirm="performReset"
    />

    <!-- Hidden file input for import -->
    <input
      ref="importInput"
      type="file"
      accept="application/json,.json"
      class="hidden"
      @change="onImportFile"
    />
  </FeatureBoundary>
</template>

<script setup lang="ts">
import { applyBranding } from '~/core/theme/applyBranding'
import { BRANDING_DEFAULTS } from '~/core/theme/brandingDefaults'
import { brandingService } from '~/features/settings/services/brandingService'
import type { Branding, BrandingAssets, BrandingColors, BrandingTypography } from '~/core/theme/types'

definePageMeta({
  layout: 'dashboard',
  middleware: ['access'],
})

const { locale } = useI18n()
const toastStore = useToastStore()

const loading = ref(true)
const saving = ref(false)
const resetting = ref(false)
const confirmResetOpen = ref(false)
const importInput = ref<HTMLInputElement | null>(null)

/** Form is the live editing state. Starts as a clone of the loaded effective. */
const form = ref<Branding | null>(null)

/** What we loaded from the server — used to detect dirty state and to revert. */
const original = ref<Branding | null>(null)

/** What was committed (saved). After save, equals form. */
const committed = ref<Branding | null>(null)

const hasOverrides = ref(false)

const activeTab = ref<'colors' | 'typography' | 'shape' | 'assets'>('colors')

const tabs = computed(() => [
  { key: 'colors' as const,     icon: 'i-lucide-palette',   label: locale.value === 'ar' ? 'الألوان' : 'Colors' },
  { key: 'typography' as const, icon: 'i-lucide-type',      label: locale.value === 'ar' ? 'الخطوط' : 'Typography' },
  { key: 'shape' as const,      icon: 'i-lucide-square',    label: locale.value === 'ar' ? 'الشكل'   : 'Shape' },
  { key: 'assets' as const,     icon: 'i-lucide-image',     label: locale.value === 'ar' ? 'الشعار'  : 'Assets' },
])

// Logo + favicon state. Loaded from /v1/branding alongside the JSON
// branding; mutations go through dedicated upload/delete endpoints.
const assets = ref<BrandingAssets>({
  logo_path: null, logo_url: null, favicon_path: null, favicon_url: null,
})
const uploadingKind = ref<'logo' | 'favicon' | null>(null)
const logoInput = ref<HTMLInputElement | null>(null)
const faviconInput = ref<HTMLInputElement | null>(null)

async function uploadAsset(kind: 'logo' | 'favicon', file: File | null | undefined) {
  if (!file) return
  uploadingKind.value = kind
  try {
    const res = await brandingService().uploadAsset(kind, file)
    assets.value = res.data.assets
    toastStore.success(locale.value === 'ar' ? 'تم رفع الملف' : 'Uploaded')
  } catch (e: any) {
    const msg = e?.fieldErrors?.file?.[0] ?? e?.message
    toastStore.error(msg || (locale.value === 'ar' ? 'فشل الرفع' : 'Upload failed'))
  } finally {
    uploadingKind.value = null
  }
}

async function removeAsset(kind: 'logo' | 'favicon') {
  uploadingKind.value = kind
  try {
    const res = await brandingService().deleteAsset(kind)
    assets.value = res.data.assets
    toastStore.success(locale.value === 'ar' ? 'تم الحذف' : 'Removed')
  } catch (e: any) {
    toastStore.error(e?.message || (locale.value === 'ar' ? 'فشل الحذف' : 'Remove failed'))
  } finally {
    uploadingKind.value = null
  }
}

const colorFields = computed<Array<{ key: keyof BrandingColors; label: string; hint: string }>>(() => [
  { key: 'primary',   label: locale.value === 'ar' ? 'اللون الأساسي'  : 'Primary',   hint: locale.value === 'ar' ? 'الأزرار والروابط والتأكيد' : 'Buttons, links, focus rings' },
  { key: 'secondary', label: locale.value === 'ar' ? 'اللون الثانوي'  : 'Secondary', hint: locale.value === 'ar' ? 'لمسات إضافية' : 'Accent surfaces' },
  { key: 'success',   label: locale.value === 'ar' ? 'النجاح'         : 'Success',   hint: locale.value === 'ar' ? 'تأكيدات وحالات إيجابية' : 'Confirmations and positive states' },
  { key: 'warning',   label: locale.value === 'ar' ? 'تحذير'          : 'Warning',   hint: locale.value === 'ar' ? 'تنبيهات وحالات معلّقة' : 'Alerts and pending states' },
  { key: 'danger',    label: locale.value === 'ar' ? 'خطأ'            : 'Danger',    hint: locale.value === 'ar' ? 'إجراءات مدمرة وأخطاء' : 'Destructive actions and errors' },
  { key: 'info',      label: locale.value === 'ar' ? 'معلومة'         : 'Info',      hint: locale.value === 'ar' ? 'إشعارات وروابط معلوماتية' : 'Informational notices' },
])

const neutralToneOptions = computed(() => [
  { value: 'cool' as const,    label: locale.value === 'ar' ? 'بارد'   : 'Cool' },
  { value: 'warm' as const,    label: locale.value === 'ar' ? 'دافئ'   : 'Warm' },
  { value: 'neutral' as const, label: locale.value === 'ar' ? 'محايد'  : 'Neutral' },
])

const fontFields = computed<Array<{
  key: keyof BrandingTypography
  label: string
  hint: string
  placeholder: string
  sampleText: string
  suggestions: string[]
}>>(() => [
  {
    key: 'font_latin',
    label: locale.value === 'ar' ? 'الخط اللاتيني' : 'Latin font',
    hint: locale.value === 'ar' ? 'أي خط من Google Fonts' : 'Any Google Fonts family',
    placeholder: 'Inter',
    sampleText: 'The quick brown fox jumps over the lazy dog 0123',
    suggestions: POPULAR_LATIN_FONTS,
  },
  {
    key: 'font_arabic',
    label: locale.value === 'ar' ? 'الخط العربي' : 'Arabic font',
    hint: locale.value === 'ar' ? 'خطوط عربية مدعومة من Google Fonts' : 'Arabic-supporting Google Fonts',
    placeholder: 'IBM Plex Sans Arabic',
    sampleText: 'محاسبي للمحاسبة الإلكترونية والإدارة المالية ١٢٣٤',
    suggestions: POPULAR_ARABIC_FONTS,
  },
  {
    key: 'font_mono',
    label: locale.value === 'ar' ? 'الخط أحادي العرض' : 'Monospace font',
    hint: locale.value === 'ar' ? 'للأرقام والأكواد' : 'For numbers, invoice codes, money',
    placeholder: 'JetBrains Mono',
    sampleText: 'INV-2026-0042  ₪ 12,584.99',
    suggestions: POPULAR_MONO_FONTS,
  },
])

const typeScaleOptions = computed(() => [
  { value: 'compact' as const,     label: locale.value === 'ar' ? 'مدمج'   : 'Compact' },
  { value: 'default' as const,     label: locale.value === 'ar' ? 'افتراضي' : 'Default' },
  { value: 'comfortable' as const, label: locale.value === 'ar' ? 'مريح'   : 'Comfortable' },
])

const radiusOptions = computed(() => [
  { value: 'sharp' as const,   label: locale.value === 'ar' ? 'حاد'     : 'Sharp',   preview: '2px' },
  { value: 'default' as const, label: locale.value === 'ar' ? 'افتراضي' : 'Default', preview: '6px' },
  { value: 'rounded' as const, label: locale.value === 'ar' ? 'دائري'   : 'Rounded', preview: '14px' },
])

const shadowOptions = computed(() => [
  { value: 'flat' as const,    label: locale.value === 'ar' ? 'مسطح'    : 'Flat',    preview: '0 1px 1px rgba(15,23,42,0.04)' },
  { value: 'default' as const, label: locale.value === 'ar' ? 'افتراضي' : 'Default', preview: '0 4px 6px -1px rgba(15,23,42,0.10)' },
  { value: 'heavy' as const,   label: locale.value === 'ar' ? 'ثقيل'    : 'Heavy',   preview: '0 14px 30px -8px rgba(15,23,42,0.30)' },
])

const isDirty = computed(() => {
  if (!form.value || !committed.value) return false
  return JSON.stringify(form.value) !== JSON.stringify(committed.value)
})

onMounted(async () => {
  try {
    const res = await brandingService().get()
    const eff = res.data.effective as Branding
    form.value = JSON.parse(JSON.stringify(eff))
    original.value = JSON.parse(JSON.stringify(eff))
    committed.value = JSON.parse(JSON.stringify(eff))
    hasOverrides.value = Object.keys(res.data.overrides ?? {}).length > 0
    if (res.data.assets) assets.value = res.data.assets
  } catch (e: unknown) {
    toastStore.error(locale.value === 'ar' ? 'تعذر تحميل الإعدادات' : 'Failed to load branding')
    form.value = JSON.parse(JSON.stringify(BRANDING_DEFAULTS))
    original.value = JSON.parse(JSON.stringify(BRANDING_DEFAULTS))
    committed.value = JSON.parse(JSON.stringify(BRANDING_DEFAULTS))
  } finally {
    loading.value = false
  }
})

/** Hex normaliser — accepts #RGB / #RRGGBB / RRGGBB and returns canonical #RRGGBB. */
function onColorInput(key: keyof BrandingColors, raw: string) {
  if (!form.value) return
  const v = raw.trim().toUpperCase()
  // Allow partial typing — only update when we have a valid hex.
  const m = v.match(/^#?([0-9A-F]{6}|[0-9A-F]{3})$/)
  if (!m) {
    // Persist the raw text in form so the user can keep editing the input.
    form.value.colors[key] = v.startsWith('#') ? v : `#${v}`
    return
  }
  const hex = m[1].length === 3
    ? '#' + m[1].split('').map(c => c + c).join('')
    : '#' + m[1]
  form.value.colors[key] = hex
}

async function save() {
  if (!form.value) return
  saving.value = true
  try {
    // Send the FULL form as overrides — backend strips any leaves that match
    // its own defaults so we don't bloat the JSON. Simpler than computing the
    // diff client-side and avoids subtle merge bugs.
    const res = await brandingService().update(form.value)
    const eff = res.data.effective as Branding
    committed.value = JSON.parse(JSON.stringify(eff))
    original.value = JSON.parse(JSON.stringify(eff))
    hasOverrides.value = Object.keys(res.data.overrides ?? {}).length > 0
    // Apply globally so the rest of the app reflects the change immediately.
    applyBranding(eff)
    toastStore.success(locale.value === 'ar' ? 'تم الحفظ والتطبيق' : 'Saved & applied')
  } catch (e: any) {
    toastStore.error(e?.message || (locale.value === 'ar' ? 'فشل الحفظ' : 'Save failed'))
  } finally {
    saving.value = false
  }
}

function discardChanges() {
  if (!committed.value) return
  form.value = JSON.parse(JSON.stringify(committed.value))
  toastStore.info(locale.value === 'ar' ? 'تم التراجع' : 'Changes discarded')
}

async function performReset() {
  resetting.value = true
  try {
    const res = await brandingService().reset()
    const eff = res.data.effective as Branding
    form.value = JSON.parse(JSON.stringify(eff))
    committed.value = JSON.parse(JSON.stringify(eff))
    original.value = JSON.parse(JSON.stringify(eff))
    hasOverrides.value = false
    applyBranding(eff)
    confirmResetOpen.value = false
    toastStore.success(locale.value === 'ar' ? 'تم استعادة الافتراضي' : 'Reset to defaults')
  } catch (e: any) {
    toastStore.error(e?.message || (locale.value === 'ar' ? 'فشل الاستعادة' : 'Reset failed'))
  } finally {
    resetting.value = false
  }
}

function exportPreset() {
  if (!form.value) return
  const blob = new Blob([JSON.stringify(form.value, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `muhasebi-branding-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

function importPreset() {
  importInput.value?.click()
}

async function onImportFile(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = '' // reset so re-importing the same file fires change again
  if (!file || !form.value) return
  try {
    const text = await file.text()
    const parsed = JSON.parse(text) as Partial<Branding>
    // Shallow-merge so the user can import a partial preset (e.g. just
    // colors). Missing sections fall back to current values.
    form.value = {
      colors:     { ...form.value.colors,     ...(parsed.colors ?? {}) },
      typography: { ...form.value.typography, ...(parsed.typography ?? {}) },
      shape:      { ...form.value.shape,      ...(parsed.shape ?? {}) },
      motion:     { ...form.value.motion,     ...(parsed.motion ?? {}) },
    }
    toastStore.success(locale.value === 'ar' ? 'تم الاستيراد — راجع وأحفظ' : 'Imported — review and save')
  } catch (err) {
    toastStore.error(locale.value === 'ar' ? 'ملف غير صالح' : 'Invalid preset file')
  }
}

function previewFontFamily(family: string): string {
  if (!family) return 'system-ui, sans-serif'
  return family.includes(' ') ? `"${family}", system-ui, sans-serif` : `${family}, system-ui, sans-serif`
}

// ──────────────────────────────────────────────────────────────────
// Curated suggestion lists (datalist powers free-form autocomplete).
// Free-form input is preserved — these are just hints, the user can
// type any Google Fonts family name.
// ──────────────────────────────────────────────────────────────────
const POPULAR_LATIN_FONTS = [
  'Inter', 'Roboto', 'Open Sans', 'Lato', 'Poppins', 'Montserrat', 'Nunito',
  'Source Sans 3', 'Work Sans', 'Manrope', 'DM Sans', 'Plus Jakarta Sans',
  'Outfit', 'Geist', 'Public Sans', 'Figtree', 'Albert Sans', 'Onest',
  'Mulish', 'Karla', 'Rubik', 'Sora', 'IBM Plex Sans',
]
const POPULAR_ARABIC_FONTS = [
  'IBM Plex Sans Arabic', 'Cairo', 'Tajawal', 'Almarai', 'Readex Pro',
  'El Messiri', 'Noto Sans Arabic', 'Markazi Text', 'Amiri', 'Reem Kufi',
  'Lateef', 'Scheherazade New', 'Vibes', 'Changa', 'Kufam',
]
const POPULAR_MONO_FONTS = [
  'JetBrains Mono', 'Fira Code', 'Source Code Pro', 'IBM Plex Mono',
  'Roboto Mono', 'Geist Mono', 'Space Mono', 'DM Mono', 'Inconsolata',
  'Ubuntu Mono', 'Cousine',
]
</script>
