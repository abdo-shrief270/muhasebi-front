<template>
  <div>
    <NuxtLayout name="auth">
      <div class="mb-8">
        <h2 class="text-2xl font-bold text-gray-800">{{ $t('auth.forgotPassword') }}</h2>
        <p class="text-gray-400 mt-1 text-sm">
          {{ locale === 'ar' ? 'أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة تعيين كلمة المرور' : "Enter your email and we'll send you a password reset link" }}
        </p>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-5">
        <div>
          <label class="block text-sm font-medium text-gray-600 mb-1.5">{{ $t('auth.email') }}</label>
          <div class="relative">
            <span class="absolute start-4 top-1/2 -translate-y-1/2 text-gray-300">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"/></svg>
            </span>
            <input
              v-model="email"
              type="email"
              required
              autofocus
              class="w-full ps-11 pe-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-sm bg-white"
              :placeholder="locale === 'ar' ? 'أدخل بريدك الإلكتروني' : 'Enter your email'"
              dir="ltr"
            />
          </div>
        </div>

        <!-- Success -->
        <Transition name="fade-slide">
          <div v-if="successMessage" class="flex items-center gap-3 bg-green-50 text-green-600 text-sm px-4 py-3 rounded-xl border border-green-100">
            <svg class="w-4 h-4 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/></svg>
            <span>{{ successMessage }}</span>
          </div>
        </Transition>

        <!-- Error -->
        <Transition name="fade-slide">
          <div v-if="errorMessage" class="flex items-center gap-3 bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100">
            <svg class="w-4 h-4 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"/></svg>
            <span>{{ errorMessage }}</span>
          </div>
        </Transition>

        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-primary-500 text-white py-3 rounded-xl font-semibold hover:bg-primary-600 transition-all disabled:opacity-50 active:scale-[0.98] shadow-sm shadow-primary-500/20 hover:shadow-md hover:shadow-primary-500/30"
        >
          <span v-if="loading" class="inline-flex items-center gap-2">
            <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            {{ $t('common.loading') }}
          </span>
          <span v-else>{{ $t('auth.resetPassword') }}</span>
        </button>
      </form>

      <p class="mt-6 text-center text-sm text-gray-500">
        <NuxtLink to="/auth/login" class="text-secondary-400 hover:text-secondary-500 font-medium inline-flex items-center gap-1">
          <svg class="w-3.5 h-3.5 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"/></svg>
          {{ locale === 'ar' ? 'العودة لتسجيل الدخول' : 'Back to login' }}
        </NuxtLink>
      </p>
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'guest',
  layout: false,
})

const { locale } = useI18n()

const email = ref('')
const loading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

async function handleSubmit() {
  loading.value = true
  successMessage.value = ''
  errorMessage.value = ''

  try {
    const api = useApi()
    await api.post('/forgot-password', { email: email.value })
    successMessage.value = locale.value === 'ar'
      ? 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني.'
      : 'Password reset link sent to your email.'
  } catch (error: any) {
    errorMessage.value = error.data?.message || (locale.value === 'ar' ? 'حدث خطأ ما' : 'Something went wrong')
  } finally {
    loading.value = false
  }
}
</script>