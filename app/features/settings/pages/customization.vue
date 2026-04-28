<template>
  <FeatureBoundary id="settings-customization">
    <div class="px-4 lg:px-6 py-5 max-w-3xl mx-auto">
      <UiPageHeader
        icon="i-lucide-palette"
        :title="locale === 'ar' ? 'التخصيص والهوية' : 'Branding & Customization'"
        :subtitle="locale === 'ar' ? 'ألوان العلامة التجارية والشعار وصفحة الهبوط العامة' : 'Brand colors, logo, and public landing page'"
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

        <div v-if="loading" class="space-y-3">
          <div v-for="i in 3" :key="i" class="h-40 rounded-xl bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
        </div>

        <form v-else @submit.prevent="save" class="space-y-3">
          <!-- Brand colors -->
          <div
            v-motion
            :initial="{ opacity: 0, y: 15 }"
            :enter="{ opacity: 1, y: 0, transition: { delay: 100 } }"
            class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5"
          >
            <h3 class="text-sm font-semibold text-neutral-900 dark:text-neutral-0 mb-1">
              {{ locale === 'ar' ? 'ألوان العلامة التجارية' : 'Brand Colors' }}
            </h3>
            <p class="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
              {{ locale === 'ar' ? 'التغيير يُطبَّق فوراً على التطبيق وصفحة الهبوط.' : 'Changes apply immediately to the app and landing page.' }}
            </p>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="form-label">{{ locale === 'ar' ? 'اللون الأساسي' : 'Primary Color' }}</label>
                <div class="flex items-center gap-2">
                  <input
                    v-model="form.primary_color"
                    type="color"
                    class="w-11 h-9 rounded-md border border-neutral-200 dark:border-neutral-800 cursor-pointer bg-neutral-0 dark:bg-neutral-900 p-1"
                    @input="previewTheme"
                  />
                  <input
                    v-model="form.primary_color"
                    type="text"
                    maxlength="7"
                    class="input-field flex-1 font-mono"
                    :class="{ 'input-error': errors.primary_color }"
                    dir="ltr"
                    placeholder="#06B6D4"
                    @input="previewTheme"
                  />
                </div>
                <p v-if="errors.primary_color" class="form-error">{{ errors.primary_color }}</p>
              </div>

              <div>
                <label class="form-label">{{ locale === 'ar' ? 'اللون الثانوي' : 'Secondary Color' }}</label>
                <div class="flex items-center gap-2">
                  <input
                    v-model="form.secondary_color"
                    type="color"
                    class="w-11 h-9 rounded-md border border-neutral-200 dark:border-neutral-800 cursor-pointer bg-neutral-0 dark:bg-neutral-900 p-1"
                    @input="previewTheme"
                  />
                  <input
                    v-model="form.secondary_color"
                    type="text"
                    maxlength="7"
                    class="input-field flex-1 font-mono"
                    :class="{ 'input-error': errors.secondary_color }"
                    dir="ltr"
                    placeholder="#3B82F6"
                    @input="previewTheme"
                  />
                </div>
                <p v-if="errors.secondary_color" class="form-error">{{ errors.secondary_color }}</p>
              </div>
            </div>

            <div class="mt-4 flex items-center gap-2">
              <button
                type="button"
                class="inline-flex items-center gap-1 text-[11px] font-medium text-neutral-500 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                @click="resetColors"
              >
                <UIcon name="i-lucide-rotate-ccw" class="w-3 h-3" />
                {{ locale === 'ar' ? 'استعادة الألوان الافتراضية' : 'Reset to defaults' }}
              </button>
            </div>
          </div>

          <!-- Logo + hero image -->
          <div
            v-motion
            :initial="{ opacity: 0, y: 15 }"
            :enter="{ opacity: 1, y: 0, transition: { delay: 200 } }"
            class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5"
          >
            <h3 class="text-sm font-semibold text-neutral-900 dark:text-neutral-0 mb-1">
              {{ locale === 'ar' ? 'الشعار والصور' : 'Logo & Images' }}
            </h3>
            <p class="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
              {{ locale === 'ar' ? 'أدخل رابط الصورة (سيتم دعم الرفع المباشر قريباً).' : 'Paste an image URL. Direct upload coming soon.' }}
            </p>

            <div class="space-y-4">
              <div>
                <label class="form-label">{{ locale === 'ar' ? 'رابط الشعار' : 'Logo URL' }}</label>
                <input
                  v-model="form.logo_path"
                  type="url"
                  maxlength="500"
                  class="input-field"
                  :class="{ 'input-error': errors.logo_path }"
                  dir="ltr"
                  placeholder="https://cdn.example.com/logo.svg"
                />
                <p v-if="errors.logo_path" class="form-error">{{ errors.logo_path }}</p>
                <div
                  v-if="form.logo_path"
                  class="mt-3 flex items-center gap-3 p-3 bg-neutral-50/60 dark:bg-neutral-950/40 rounded-md border border-neutral-200 dark:border-neutral-800"
                >
                  <img
                    :src="form.logo_path"
                    alt="logo preview"
                    class="w-12 h-12 object-contain rounded-md bg-neutral-0 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800"
                    @error="onImageError"
                  />
                  <span class="text-xs text-neutral-500 dark:text-neutral-400 truncate flex-1" dir="ltr">{{ form.logo_path }}</span>
                </div>
              </div>

              <div>
                <label class="form-label">{{ locale === 'ar' ? 'رابط صورة صفحة الهبوط' : 'Hero Image URL' }}</label>
                <input
                  v-model="form.hero_image_path"
                  type="url"
                  maxlength="500"
                  class="input-field"
                  :class="{ 'input-error': errors.hero_image_path }"
                  dir="ltr"
                  placeholder="https://cdn.example.com/hero.jpg"
                />
                <p v-if="errors.hero_image_path" class="form-error">{{ errors.hero_image_path }}</p>
              </div>
            </div>
          </div>

          <!-- Public landing page -->
          <div
            v-motion
            :initial="{ opacity: 0, y: 15 }"
            :enter="{ opacity: 1, y: 0, transition: { delay: 300 } }"
            class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5"
          >
            <h3 class="text-sm font-semibold text-neutral-900 dark:text-neutral-0 mb-1">
              {{ locale === 'ar' ? 'صفحة الهبوط العامة' : 'Public Landing Page' }}
            </h3>
            <p class="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
              {{ locale === 'ar' ? 'صفحة عامة تُظهر علامتك التجارية للعملاء.' : 'A public page showcasing your brand to prospective clients.' }}
            </p>

            <div class="space-y-4">
              <label class="flex items-start gap-2 cursor-pointer select-none py-1">
                <input
                  v-model="form.is_landing_page_active"
                  type="checkbox"
                  class="mt-0.5 w-4 h-4 accent-primary-500 rounded cursor-pointer"
                />
                <div>
                  <p class="text-sm font-medium text-neutral-900 dark:text-neutral-0">
                    {{ locale === 'ar' ? 'تفعيل صفحة الهبوط' : 'Enable landing page' }}
                  </p>
                  <p class="text-[11px] text-neutral-500 dark:text-neutral-400">
                    {{ locale === 'ar' ? 'عند التفعيل، أي شخص يملك الرابط يمكنه مشاهدة الصفحة.' : 'When enabled, anyone with the URL can view the page.' }}
                  </p>
                </div>
              </label>

              <div
                v-if="landing.landing_page_url"
                class="p-3 bg-neutral-50/60 dark:bg-neutral-950/40 rounded-md border border-neutral-200 dark:border-neutral-800"
              >
                <p class="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">
                  {{ locale === 'ar' ? 'رابط الصفحة العام' : 'Public URL' }}
                </p>
                <div class="flex items-center gap-2">
                  <a
                    :href="landing.landing_page_url"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="font-mono text-xs text-primary-700 dark:text-primary-400 hover:underline truncate flex-1"
                    dir="ltr"
                  >
                    {{ landing.landing_page_url }}
                  </a>
                  <button
                    type="button"
                    class="inline-flex items-center gap-1 text-[11px] font-medium text-neutral-500 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    @click="copyUrl"
                  >
                    <UIcon :name="copied ? 'i-lucide-check' : 'i-lucide-copy'" class="w-3 h-3" />
                    {{ copied ? (locale === 'ar' ? 'تم النسخ' : 'Copied') : (locale === 'ar' ? 'نسخ' : 'Copy') }}
                  </button>
                </div>
              </div>

              <div>
                <label class="form-label">{{ locale === 'ar' ? 'الشعار (تاجلاين)' : 'Tagline' }}</label>
                <input
                  v-model="form.tagline"
                  type="text"
                  maxlength="255"
                  class="input-field"
                  :class="{ 'input-error': errors.tagline }"
                  :placeholder="locale === 'ar' ? 'جملة قصيرة تُلخِّص خدمتك' : 'A short phrase that summarizes your service'"
                />
                <p v-if="errors.tagline" class="form-error">{{ errors.tagline }}</p>
              </div>

              <div>
                <label class="form-label">{{ locale === 'ar' ? 'الوصف' : 'Description' }}</label>
                <textarea
                  v-model="form.description"
                  rows="4"
                  maxlength="5000"
                  class="input-field"
                  :class="{ 'input-error': errors.description }"
                  :placeholder="locale === 'ar' ? 'وصف شامل لخدماتك، يظهر على صفحة الهبوط' : 'A fuller description of your services, shown on the landing page'"
                />
                <p v-if="errors.description" class="form-error">{{ errors.description }}</p>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center justify-between gap-3 pt-2">
            <NuxtLink
              to="/settings"
              class="inline-flex items-center gap-1 text-xs font-medium text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-0 transition-colors"
            >
              <UIcon name="i-lucide-arrow-left" class="w-3.5 h-3.5 rtl:rotate-180" />
              {{ locale === 'ar' ? 'الإعدادات' : 'Settings' }}
            </NuxtLink>
            <div class="flex items-center gap-2">
              <UiAppButton variant="outline" size="sm" icon="i-lucide-undo-2" type="button" :disabled="saving" @click="revert">
                {{ locale === 'ar' ? 'تراجع' : 'Revert' }}
              </UiAppButton>
              <UiAppButton type="submit" variant="primary" size="sm" icon="i-lucide-save" :loading="saving">
                {{ $t('common.save') }}
              </UiAppButton>
            </div>
          </div>
        </form>
      </Can>
    </div>
  </FeatureBoundary>
</template>

<script setup lang="ts">
import Can from '~/core/rbac/Can.vue'
import { PERMISSIONS } from '~/core/rbac/permissions'
import {
  landingSettingsService,
  type LandingPageSettings,
  type LandingPageUpdatePayload,
} from '~/features/marketing/services/landingSettingsService'
import type { ApiError } from '~/core/api/errors'

definePageMeta({ layout: 'dashboard' })

const { locale } = useI18n()
const toastStore = useToastStore()
const authStore = useAuthStore()
const { can } = usePermissions()
const { applyTheme } = useTenantTheme()
const service = landingSettingsService()

const HEX_RE = /^#[0-9A-Fa-f]{6}$/
const DEFAULT_PRIMARY = '#06B6D4'
const DEFAULT_SECONDARY = '#3B82F6'

const loading = ref(true)
const saving = ref(false)
const copied = ref(false)
const landing = ref<Partial<LandingPageSettings>>({})

// Editable form state — flat non-nullable strings + boolean so v-model on
// text inputs stays string-typed. Null from the backend coerces to '' on
// populate; ''/null collapse back to null on save.
interface FormState {
  tagline: string
  description: string
  primary_color: string
  secondary_color: string
  logo_path: string
  hero_image_path: string
  is_landing_page_active: boolean
}

const form = reactive<FormState>({
  tagline: '',
  description: '',
  primary_color: DEFAULT_PRIMARY,
  secondary_color: DEFAULT_SECONDARY,
  logo_path: '',
  hero_image_path: '',
  is_landing_page_active: false,
})

const errors = reactive<Record<string, string>>({})

function populate(data: Partial<LandingPageSettings>) {
  landing.value = data
  form.tagline = data.tagline ?? ''
  form.description = data.description ?? ''
  form.primary_color = data.primary_color || DEFAULT_PRIMARY
  form.secondary_color = data.secondary_color || DEFAULT_SECONDARY
  form.logo_path = data.logo_path ?? ''
  form.hero_image_path = data.hero_image_path ?? ''
  form.is_landing_page_active = !!data.is_landing_page_active
  Object.keys(errors).forEach(k => delete errors[k])
}

async function load() {
  loading.value = true
  try {
    const data = await service.get()
    populate(data)
  } catch {
    toastStore.error(locale.value === 'ar' ? 'فشل تحميل الإعدادات' : 'Failed to load settings')
  } finally {
    loading.value = false
  }
}

function validate(): boolean {
  Object.keys(errors).forEach(k => delete errors[k])
  let ok = true
  if (form.primary_color && !HEX_RE.test(form.primary_color)) {
    errors.primary_color = locale.value === 'ar' ? 'يجب أن يكون لوناً سداسياً مثل #06B6D4' : 'Must be a 6-digit hex like #06B6D4'
    ok = false
  }
  if (form.secondary_color && !HEX_RE.test(form.secondary_color)) {
    errors.secondary_color = locale.value === 'ar' ? 'يجب أن يكون لوناً سداسياً مثل #3B82F6' : 'Must be a 6-digit hex like #3B82F6'
    ok = false
  }
  return ok
}

// Handler-level guard to match the phase-1 pattern in features/team. The
// <Can> wrapper already hides the form, but a direct navigate + submit via
// devtools or a stale render shouldn't call the API.
function guardManageBranding(): boolean {
  if (can(PERMISSIONS.MANAGE_LANDING_PAGE)) return true
  toastStore.error(locale.value === 'ar' ? 'لا تملك صلاحية تعديل التخصيص' : 'You do not have permission to edit branding')
  return false
}

async function save() {
  if (!guardManageBranding()) return
  if (!validate()) return

  saving.value = true
  try {
    const payload: LandingPageUpdatePayload = {
      tagline: form.tagline || null,
      description: form.description || null,
      primary_color: form.primary_color || null,
      secondary_color: form.secondary_color || null,
      logo_path: form.logo_path || null,
      hero_image_path: form.hero_image_path || null,
      is_landing_page_active: form.is_landing_page_active,
    }
    const updated = await service.update(payload)
    populate(updated)

    // Mirror colors + logo onto the in-memory tenant so useTenantTheme's
    // watcher re-applies the CSS variables without a page reload.
    if (authStore.tenant) {
      authStore.tenant.primary_color = updated.primary_color
      authStore.tenant.secondary_color = updated.secondary_color
      authStore.tenant.logo_path = updated.logo_path
    }
    applyTheme()

    toastStore.success(locale.value === 'ar' ? 'تم حفظ التخصيص' : 'Branding saved')
  } catch (e: unknown) {
    const err = e as ApiError
    if (err?.fieldErrors) {
      for (const [field, msgs] of Object.entries(err.fieldErrors)) {
        const msg = Array.isArray(msgs) ? msgs[0] : msgs
        if (typeof msg === 'string') errors[field] = msg
      }
    }
    toastStore.error(err?.message || (locale.value === 'ar' ? 'فشل الحفظ' : 'Save failed'))
  } finally {
    saving.value = false
  }
}

function revert() {
  populate(landing.value)
  applyTheme()
}

function previewTheme() {
  // Live preview — write current form values straight to the CSS vars without
  // touching the authStore. If the user reverts/cancels, we reapply from the
  // server snapshot via `applyTheme()`.
  if (!import.meta.client) return
  if (HEX_RE.test(form.primary_color)) {
    document.documentElement.style.setProperty('--color-primary', form.primary_color)
  }
  if (HEX_RE.test(form.secondary_color)) {
    document.documentElement.style.setProperty('--color-secondary', form.secondary_color)
  }
}

function resetColors() {
  form.primary_color = DEFAULT_PRIMARY
  form.secondary_color = DEFAULT_SECONDARY
  previewTheme()
}

function onImageError(e: Event) {
  const img = e.target as HTMLImageElement
  img.style.opacity = '0.3'
}

async function copyUrl() {
  const url = landing.value.landing_page_url
  if (!url || !import.meta.client) return
  try {
    await navigator.clipboard.writeText(url)
    copied.value = true
    setTimeout(() => { copied.value = false }, 1500)
  } catch {}
}

onMounted(load)
</script>

<style scoped>
@reference "~/assets/css/tokens.css";

.form-label { @apply block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5; }
.form-error { @apply mt-1 text-xs text-danger-600 dark:text-danger-500; }

.input-field {
  width: 100%;
  padding-inline: 0.75rem;
  height: 2.25rem;
  font-size: 0.875rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-neutral-200);
  background-color: var(--color-neutral-0, #fff);
  color: var(--color-neutral-900);
  outline: none;
  transition: border-color 150ms var(--ease-standard);
  appearance: none;
}
.input-field:focus {
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 2px color-mix(in oklab, var(--color-primary-500) 20%, transparent);
}
textarea.input-field { height: auto; padding-block: 0.5rem; }
.input-error { border-color: color-mix(in oklab, var(--color-danger-500) 60%, transparent); }

:global(html.dark) .input-field {
  background-color: var(--color-neutral-900);
  border-color: var(--color-neutral-800);
  color: var(--color-neutral-0);
}
</style>
