<template>
  <FeatureBoundary id="settings">
    <div class="px-4 lg:px-6 py-5 max-w-3xl mx-auto">
      <UiPageHeader
        icon="i-lucide-settings"
        :title="$t('nav.settings')"
        :subtitle="locale === 'ar' ? 'إعدادات الحساب والتفضيلات' : 'Account settings and preferences'"
      />

      <div class="space-y-3">
        <!-- Profile -->
        <div
          v-motion
          :initial="{ opacity: 0, y: 15 }"
          :enter="{ opacity: 1, y: 0, transition: { delay: 100 } }"
          class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5"
        >
          <h3 class="text-sm font-semibold text-neutral-900 dark:text-neutral-0 mb-4 flex items-center gap-1.5">
            <UIcon name="i-lucide-user" class="w-3.5 h-3.5 text-neutral-400" />
            {{ locale === 'ar' ? 'الملف الشخصي' : 'Profile' }}
          </h3>
          <div class="flex items-center gap-3 mb-5">
            <div class="w-12 h-12 bg-primary-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <span class="text-primary-700 dark:text-primary-400 font-bold text-lg">{{ authStore.user?.name?.charAt(0)?.toUpperCase() }}</span>
            </div>
            <div class="min-w-0">
              <p class="font-semibold text-neutral-900 dark:text-neutral-0 truncate">{{ authStore.user?.name }}</p>
              <p class="text-sm text-neutral-500 dark:text-neutral-400 truncate">{{ authStore.user?.email }}</p>
              <UiBadge color="blue" class="mt-1">{{ authStore.user?.role }}</UiBadge>
            </div>
          </div>

          <form @submit.prevent="saveProfile" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="form-label">{{ $t('auth.fullName') }}</label>
              <input
                v-model="profile.values.name"
                type="text"
                class="input-field"
                :class="{ 'input-error': profile.errors.value.name }"
                @input="profile.clearError('name')"
              />
              <p v-if="profile.errors.value.name" class="form-error">{{ profile.errors.value.name }}</p>
            </div>
            <div>
              <label class="form-label">{{ $t('auth.phone') }}</label>
              <input
                v-model="profile.values.phone"
                type="tel"
                class="input-field"
                :class="{ 'input-error': profile.errors.value.phone }"
                dir="ltr"
                @input="profile.clearError('phone')"
              />
              <p v-if="profile.errors.value.phone" class="form-error">{{ profile.errors.value.phone }}</p>
            </div>
            <div class="md:col-span-2 flex justify-end">
              <UiAppButton type="submit" variant="primary" size="sm" :loading="profile.submitting.value">
                {{ $t('common.save') }}
              </UiAppButton>
            </div>
          </form>
        </div>

        <!-- Branding (only for users with manage_landing_page) -->
        <Can :perm="PERMISSIONS.MANAGE_LANDING_PAGE">
          <div
            v-motion
            :initial="{ opacity: 0, y: 15 }"
            :enter="{ opacity: 1, y: 0, transition: { delay: 150 } }"
            class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5"
          >
            <NuxtLink
              to="/settings/customization"
              class="flex items-start justify-between gap-3 group -m-1 p-1 rounded-md hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40 transition-colors"
            >
              <div class="flex items-start gap-3 min-w-0">
                <div class="w-10 h-10 rounded-md bg-purple-500/10 text-purple-700 dark:text-purple-400 inline-flex items-center justify-center flex-shrink-0">
                  <UIcon name="i-lucide-palette" class="w-4 h-4" />
                </div>
                <div class="min-w-0">
                  <h3 class="text-sm font-semibold text-neutral-900 dark:text-neutral-0 mb-0.5">
                    {{ locale === 'ar' ? 'التخصيص والهوية' : 'Branding & Customization' }}
                  </h3>
                  <p class="text-xs text-neutral-500 dark:text-neutral-400">
                    {{ locale === 'ar' ? 'ألوان العلامة التجارية والشعار وصفحة الهبوط العامة.' : 'Brand colors, logo, and public landing page.' }}
                  </p>
                </div>
              </div>
              <UIcon name="i-lucide-arrow-up-right" class="w-3.5 h-3.5 text-neutral-300 dark:text-neutral-600 group-hover:text-primary-500 rtl:rotate-90 transition-colors flex-shrink-0 mt-1" />
            </NuxtLink>
          </div>
        </Can>

        <!-- Preferences -->
        <div
          v-motion
          :initial="{ opacity: 0, y: 15 }"
          :enter="{ opacity: 1, y: 0, transition: { delay: 200 } }"
          class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5"
        >
          <h3 class="text-sm font-semibold text-neutral-900 dark:text-neutral-0 mb-4 flex items-center gap-1.5">
            <UIcon name="i-lucide-sliders-horizontal" class="w-3.5 h-3.5 text-neutral-400" />
            {{ locale === 'ar' ? 'التفضيلات' : 'Preferences' }}
          </h3>

          <form @submit.prevent="savePreferences" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="form-label">{{ locale === 'ar' ? 'اللغة' : 'Language' }}</label>
              <select v-model="prefs.values.locale" class="input-field">
                <option value="ar">العربية</option>
                <option value="en">English</option>
              </select>
            </div>
            <div>
              <label class="form-label">{{ locale === 'ar' ? 'المنطقة الزمنية' : 'Timezone' }}</label>
              <select v-model="prefs.values.timezone" class="input-field">
                <option value="Africa/Cairo">Africa/Cairo (EET)</option>
                <option value="Asia/Riyadh">Asia/Riyadh (AST)</option>
                <option value="UTC">UTC</option>
                <option value="Europe/London">Europe/London (GMT)</option>
                <option value="America/New_York">America/New_York (EST)</option>
              </select>
            </div>
            <div class="md:col-span-2 flex justify-end">
              <UiAppButton type="submit" variant="primary" size="sm" :loading="prefs.submitting.value">
                {{ $t('common.save') }}
              </UiAppButton>
            </div>
          </form>
        </div>

        <!-- Change Password -->
        <div
          v-motion
          :initial="{ opacity: 0, y: 15 }"
          :enter="{ opacity: 1, y: 0, transition: { delay: 300 } }"
          class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5"
        >
          <h3 class="text-sm font-semibold text-neutral-900 dark:text-neutral-0 mb-4 flex items-center gap-1.5">
            <UIcon name="i-lucide-key-round" class="w-3.5 h-3.5 text-neutral-400" />
            {{ locale === 'ar' ? 'تغيير كلمة المرور' : 'Change Password' }}
          </h3>

          <form @submit.prevent="changePassword" class="space-y-4">
            <div>
              <label class="form-label">{{ locale === 'ar' ? 'كلمة المرور الحالية' : 'Current Password' }}</label>
              <input
                v-model="password.values.current_password"
                type="password"
                autocomplete="current-password"
                class="input-field"
                :class="{ 'input-error': password.errors.value.current_password }"
                dir="ltr"
                @input="password.clearError('current_password')"
              />
              <p v-if="password.errors.value.current_password" class="form-error">{{ password.errors.value.current_password }}</p>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="form-label">{{ locale === 'ar' ? 'كلمة المرور الجديدة' : 'New Password' }}</label>
                <input
                  v-model="password.values.password"
                  type="password"
                  autocomplete="new-password"
                  class="input-field"
                  :class="{ 'input-error': password.errors.value.password }"
                  dir="ltr"
                  @input="password.clearError('password')"
                />
                <p v-if="password.errors.value.password" class="form-error">{{ password.errors.value.password }}</p>
              </div>
              <div>
                <label class="form-label">{{ $t('auth.confirmPassword') }}</label>
                <input
                  v-model="password.values.password_confirmation"
                  type="password"
                  autocomplete="new-password"
                  class="input-field"
                  :class="{ 'input-error': password.errors.value.password_confirmation }"
                  dir="ltr"
                  @input="password.clearError('password_confirmation')"
                />
                <p v-if="password.errors.value.password_confirmation" class="form-error">{{ password.errors.value.password_confirmation }}</p>
              </div>
            </div>
            <div class="flex justify-end">
              <UiAppButton type="submit" variant="primary" size="sm" :loading="password.submitting.value">
                {{ locale === 'ar' ? 'تغيير كلمة المرور' : 'Change Password' }}
              </UiAppButton>
            </div>
          </form>
        </div>

        <!-- Danger zone -->
        <div
          v-motion
          :initial="{ opacity: 0, y: 15 }"
          :enter="{ opacity: 1, y: 0, transition: { delay: 400 } }"
          class="bg-danger-500/5 dark:bg-danger-500/10 rounded-xl border border-danger-500/20 p-5"
        >
          <h3 class="text-sm font-semibold text-danger-700 dark:text-danger-400 mb-1 flex items-center gap-1.5">
            <UIcon name="i-lucide-shield-alert" class="w-3.5 h-3.5" />
            {{ locale === 'ar' ? 'منطقة الخطر' : 'Danger Zone' }}
          </h3>
          <p class="text-xs text-neutral-500 dark:text-neutral-400 mb-3">
            {{ locale === 'ar'
              ? 'سيؤدي ذلك إلى تسجيل الخروج من جميع الأجهزة وإلغاء كل الجلسات النشطة.'
              : 'This signs you out everywhere and revokes all active sessions.' }}
          </p>
          <UiAppButton variant="danger" size="sm" icon="i-lucide-log-out" @click="logoutAll">
            {{ locale === 'ar' ? 'تسجيل الخروج من جميع الأجهزة' : 'Logout All Sessions' }}
          </UiAppButton>
        </div>
      </div>
    </div>
  </FeatureBoundary>
</template>

<script setup lang="ts">
import {
  profileDefaults, profileSchema, type ProfileInput,
  preferencesDefaults, preferencesSchema, type PreferencesInput,
  passwordChangeDefaults, passwordChangeSchema, type PasswordChangeInput,
} from '~/features/settings/schemas'
import type { ApiError } from '~/core/api/errors'
import Can from '~/core/rbac/Can.vue'
import { PERMISSIONS } from '~/core/rbac/permissions'

definePageMeta({ layout: 'dashboard' })

const { locale, setLocale } = useI18n()
const authStore = useAuthStore()
const toastStore = useToastStore()
const api = useApi()

const profile = useZodForm<ProfileInput>({
  schema: profileSchema,
  initial: {
    name: authStore.user?.name ?? profileDefaults.name,
    phone: authStore.user?.phone ?? profileDefaults.phone,
  },
})

const prefs = useZodForm<PreferencesInput>({
  schema: preferencesSchema,
  initial: {
    locale: (authStore.user?.locale as PreferencesInput['locale']) ?? preferencesDefaults.locale,
    timezone: (authStore.user?.timezone as PreferencesInput['timezone']) ?? preferencesDefaults.timezone,
  },
})

const password = useZodForm<PasswordChangeInput>({
  schema: passwordChangeSchema,
  initial: { ...passwordChangeDefaults },
})

async function saveProfile() {
  const result = await profile.handleSubmit(async (data) => {
    await api.put('/profile', data)
    if (authStore.user) {
      authStore.user.name = data.name
      authStore.user.phone = data.phone
    }
  })
  if (result.ok) {
    toastStore.success(locale.value === 'ar' ? 'تم تحديث الملف الشخصي' : 'Profile updated')
  } else if ('error' in result && result.error) {
    const err = result.error as ApiError
    profile.applyApiErrors(err)
    toastStore.error(err.message || 'Error')
  }
}

async function savePreferences() {
  const result = await prefs.handleSubmit(async (data) => {
    await api.put('/profile', data)
  })
  if (result.ok) {
    setLocale(prefs.values.locale)
    toastStore.success(locale.value === 'ar' ? 'تم حفظ التفضيلات' : 'Preferences saved')
  } else if ('error' in result && result.error) {
    toastStore.error((result.error as ApiError).message || 'Error')
  }
}

async function changePassword() {
  const result = await password.handleSubmit(async (data) => {
    await api.post('/change-password', data)
  })
  if (result.ok) {
    toastStore.success(locale.value === 'ar' ? 'تم تغيير كلمة المرور' : 'Password changed')
    password.reset()
  } else if ('error' in result && result.error) {
    const err = result.error as ApiError
    password.applyApiErrors(err)
    toastStore.error(err.message || 'Error')
  }
}

async function logoutAll() {
  await authStore.logout()
  navigateTo('/auth/login')
}
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
.input-error { border-color: color-mix(in oklab, var(--color-danger-500) 60%, transparent); }

:global(html.dark) .input-field {
  background-color: var(--color-neutral-900);
  border-color: var(--color-neutral-800);
  color: var(--color-neutral-0);
}
</style>
