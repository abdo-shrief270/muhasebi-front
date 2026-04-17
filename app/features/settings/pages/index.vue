<template>
  <div>
    <NuxtLayout name="dashboard">
      <UiPageHeader
        :title="$t('nav.settings')"
        :subtitle="locale === 'ar' ? 'إعدادات الحساب والتفضيلات' : 'Account settings and preferences'"
      />

      <div class="max-w-2xl space-y-6">
        <!-- Profile section -->
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

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1">{{ $t('auth.fullName') }}</label>
              <input v-model="profileForm.name" type="text" class="input-field" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1">{{ $t('auth.phone') }}</label>
              <input v-model="profileForm.phone" type="tel" class="input-field" />
            </div>
          </div>

          <div class="mt-4 flex justify-end">
            <UiAppButton variant="primary" size="sm" :loading="saving" @click="saveProfile">
              {{ $t('common.save') }}
            </UiAppButton>
          </div>
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

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1">{{ locale === 'ar' ? 'اللغة' : 'Language' }}</label>
              <select v-model="prefForm.locale" class="input-field">
                <option value="ar">العربية</option>
                <option value="en">English</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1">{{ locale === 'ar' ? 'المنطقة الزمنية' : 'Timezone' }}</label>
              <select v-model="prefForm.timezone" class="input-field">
                <option value="Africa/Cairo">Africa/Cairo (EET)</option>
                <option value="Asia/Riyadh">Asia/Riyadh (AST)</option>
                <option value="UTC">UTC</option>
                <option value="Europe/London">Europe/London (GMT)</option>
                <option value="America/New_York">America/New_York (EST)</option>
              </select>
            </div>
          </div>

          <div class="mt-4 flex justify-end">
            <UiAppButton variant="primary" size="sm" @click="savePreferences">
              {{ $t('common.save') }}
            </UiAppButton>
          </div>
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

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1">{{ locale === 'ar' ? 'كلمة المرور الحالية' : 'Current Password' }}</label>
              <input v-model="passwordForm.current_password" type="password" class="input-field" />
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-1">{{ locale === 'ar' ? 'كلمة المرور الجديدة' : 'New Password' }}</label>
                <input v-model="passwordForm.password" type="password" class="input-field" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-1">{{ $t('auth.confirmPassword') }}</label>
                <input v-model="passwordForm.password_confirmation" type="password" class="input-field" />
              </div>
            </div>
          </div>

          <div class="mt-4 flex justify-end">
            <UiAppButton variant="primary" size="sm" @click="changePassword">
              {{ locale === 'ar' ? 'تغيير كلمة المرور' : 'Change Password' }}
            </UiAppButton>
          </div>
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
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  
  layout: false,
})

const { locale, setLocale } = useI18n()
const authStore = useAuthStore()
const toastStore = useToastStore()
const api = useApi()

const saving = ref(false)

const profileForm = reactive({
  name: authStore.user?.name || '',
  phone: authStore.user?.phone || '',
})

const prefForm = reactive({
  locale: authStore.user?.locale || 'ar',
  timezone: authStore.user?.timezone || 'Africa/Cairo',
})

const passwordForm = reactive({
  current_password: '',
  password: '',
  password_confirmation: '',
})

async function saveProfile() {
  saving.value = true
  try {
    await api.put('/profile', {
      name: profileForm.name,
      phone: profileForm.phone,
    })
    if (authStore.user) {
      authStore.user.name = profileForm.name
      authStore.user.phone = profileForm.phone
    }
    toastStore.success(locale.value === 'ar' ? 'تم تحديث الملف الشخصي' : 'Profile updated')
  } catch {
    toastStore.error(locale.value === 'ar' ? 'فشل التحديث' : 'Update failed')
  } finally {
    saving.value = false
  }
}

async function savePreferences() {
  try {
    await api.put('/profile', {
      locale: prefForm.locale,
      timezone: prefForm.timezone,
    })
    setLocale(prefForm.locale)
    toastStore.success(locale.value === 'ar' ? 'تم حفظ التفضيلات' : 'Preferences saved')
  } catch {
    setLocale(prefForm.locale)
    toastStore.success(locale.value === 'ar' ? 'تم حفظ التفضيلات' : 'Preferences saved')
  }
}

async function changePassword() {
  try {
    await api.post('/change-password', {
      current_password: passwordForm.current_password,
      password: passwordForm.password,
      password_confirmation: passwordForm.password_confirmation,
    })
    toastStore.success(locale.value === 'ar' ? 'تم تغيير كلمة المرور' : 'Password changed')
    passwordForm.current_password = ''
    passwordForm.password = ''
    passwordForm.password_confirmation = ''
  } catch (e: any) {
    toastStore.error(e.data?.message || (locale.value === 'ar' ? 'فشل تغيير كلمة المرور' : 'Password change failed'))
  }
}

async function logoutAll() {
  await authStore.logout()
  navigateTo('/auth/login')
}
</script>

<style scoped>
.input-field {
  @apply w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-sm bg-gray-50/50;
}
</style>
