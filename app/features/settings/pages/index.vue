<template>
  <div>
    <NuxtLayout name="dashboard">
      <FeatureBoundary id="settings">
      <UiPageHeader
        :title="$t('nav.settings')"
        :subtitle="locale === 'ar' ? 'إعدادات الحساب والتفضيلات' : 'Account settings and preferences'"
      />

      <div class="max-w-2xl space-y-6">
        <!-- Profile -->
        <div
          v-motion
          :initial="{ opacity: 0, y: 15 }"
          :enter="{ opacity: 1, y: 0, transition: { delay: 100 } }"
          class="bg-white rounded-2xl border border-gray-100/80 p-6"
        >
          <h3 class="font-semibold text-gray-700 mb-4">
            {{ locale === 'ar' ? 'الملف الشخصي' : 'Profile' }}
          </h3>
          <div class="flex items-center gap-4 mb-6">
            <div class="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center">
              <span class="text-primary-500 font-bold text-2xl">{{ authStore.user?.name?.charAt(0) }}</span>
            </div>
            <div>
              <p class="font-semibold text-gray-800">{{ authStore.user?.name }}</p>
              <p class="text-sm text-gray-400">{{ authStore.user?.email }}</p>
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

        <!-- Preferences -->
        <div
          v-motion
          :initial="{ opacity: 0, y: 15 }"
          :enter="{ opacity: 1, y: 0, transition: { delay: 200 } }"
          class="bg-white rounded-2xl border border-gray-100/80 p-6"
        >
          <h3 class="font-semibold text-gray-700 mb-4">
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
          class="bg-white rounded-2xl border border-gray-100/80 p-6"
        >
          <h3 class="font-semibold text-gray-700 mb-4">
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
          class="bg-white rounded-2xl border border-red-100/80 p-6"
        >
          <h3 class="font-semibold text-red-600 mb-2">
            {{ locale === 'ar' ? 'منطقة الخطر' : 'Danger Zone' }}
          </h3>
          <p class="text-sm text-gray-400 mb-4">
            {{ locale === 'ar' ? 'تسجيل الخروج من جميع الأجهزة' : 'Logout from all devices' }}
          </p>
          <UiAppButton variant="danger" size="sm" @click="logoutAll">
            {{ locale === 'ar' ? 'تسجيل الخروج من الكل' : 'Logout All Sessions' }}
          </UiAppButton>
        </div>
      </div>
      </FeatureBoundary>
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
import {
  profileDefaults, profileSchema, type ProfileInput,
  preferencesDefaults, preferencesSchema, type PreferencesInput,
  passwordChangeDefaults, passwordChangeSchema, type PasswordChangeInput,
} from '~/features/settings/schemas'
import type { ApiError } from '~/core/api/errors'

definePageMeta({ layout: false })

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
.input-field { @apply w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-sm bg-gray-50/50; }
.input-error { @apply border-red-300 focus:ring-red-500/20 focus:border-red-500; }
.form-label { @apply block text-sm font-medium text-gray-600 mb-1; }
.form-error { @apply mt-1 text-xs text-red-500; }
</style>
