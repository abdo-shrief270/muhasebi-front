<template>
    <div class="mb-8">
      <NuxtLink
        to="/auth/login"
        class="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-0 transition-colors mb-5"
      >
        <UIcon name="i-lucide-arrow-left" class="w-3.5 h-3.5 rtl:rotate-180" />
        {{ locale === 'ar' ? 'العودة لتسجيل الدخول' : 'Back to sign in' }}
      </NuxtLink>
      <h2 class="text-2xl font-bold text-neutral-900 dark:text-neutral-0 tracking-tight">
        {{ $t('auth.forgotPassword') }}
      </h2>
      <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-1.5 leading-relaxed">
        {{ locale === 'ar' ? 'أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة تعيين كلمة المرور.' : "Enter your email and we'll send you a reset link." }}
      </p>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-4" novalidate>
      <div>
        <label class="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
          {{ $t('auth.email') }}
        </label>
        <div class="relative">
          <UIcon
            name="i-lucide-mail"
            class="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none"
          />
          <input
            v-model="email"
            type="email"
            required
            autofocus
            dir="ltr"
            class="w-full ps-9 pe-3 h-10 text-sm rounded-md border border-neutral-200 dark:border-neutral-800 bg-neutral-0 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-0 placeholder:text-neutral-400 outline-none transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-500/25"
            placeholder="name@company.com"
          />
        </div>
      </div>

      <!-- Success -->
      <Transition name="fade-slide">
        <div
          v-if="successMessage"
          class="flex items-start gap-2.5 px-3 py-2.5 rounded-md bg-success-50 dark:bg-success-500/10 border border-success-500/20 text-success-700 dark:text-success-500"
        >
          <UIcon name="i-lucide-check-circle-2" class="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span class="text-xs leading-relaxed">{{ successMessage }}</span>
        </div>
      </Transition>

      <!-- Error -->
      <Transition name="fade-slide">
        <div
          v-if="errorMessage"
          class="flex items-start gap-2.5 px-3 py-2.5 rounded-md bg-danger-50 dark:bg-danger-500/10 border border-danger-500/20 text-danger-700 dark:text-danger-400"
        >
          <UIcon name="i-lucide-alert-triangle" class="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span class="text-xs leading-relaxed">{{ errorMessage }}</span>
        </div>
      </Transition>

      <button
        type="submit"
        :disabled="loading"
        class="w-full h-10 inline-flex items-center justify-center gap-2 rounded-md bg-primary-600 hover:bg-primary-700 active:bg-primary-700 text-white text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
      >
        <UIcon v-if="loading" name="i-lucide-loader-2" class="w-4 h-4 animate-spin" />
        <span>{{ loading ? $t('common.loading') : $t('auth.resetPassword') }}</span>
      </button>
    </form>

    <!-- Footer help -->
    <div class="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-800">
      <p class="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
        {{ locale === 'ar' ? 'لم تستلم البريد؟ تحقق من مجلد الرسائل غير المرغوب فيها أو' : "Didn't get the email? Check your spam folder or" }}
        <a
          href="mailto:support@muhasebi.com"
          class="font-medium text-primary-600 dark:text-primary-400 hover:underline"
        >
          {{ locale === 'ar' ? 'تواصل مع الدعم' : 'contact support' }}
        </a>.
      </p>
    </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'guest', layout: 'auth' })

const { locale } = useI18n()

const email = ref('')
const loading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

async function handleSubmit() {
  successMessage.value = ''
  errorMessage.value = ''

  if (!email.value.trim()) {
    errorMessage.value = locale.value === 'ar' ? 'الرجاء إدخال البريد الإلكتروني.' : 'Please enter your email.'
    return  // No API call — surface inline error only.
  }

  loading.value = true
  try {
    const api = useApi()
    await api.post('/forgot-password', { email: email.value })
    successMessage.value = locale.value === 'ar'
      ? 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني.'
      : 'Password reset link sent to your email.'
  } catch (error: any) {
    errorMessage.value = error?.message || (locale.value === 'ar' ? 'حدث خطأ ما' : 'Something went wrong')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 220ms var(--ease-standard), transform 220ms var(--ease-standard);
}
.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
