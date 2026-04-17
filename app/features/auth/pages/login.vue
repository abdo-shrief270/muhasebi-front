<template>
  <div>
    <NuxtLayout name="auth">
      <div class="mb-8">
        <h2 class="text-2xl font-bold text-gray-800">{{ $t('auth.login') }}</h2>
        <p class="text-gray-400 mt-1 text-sm">
          {{ locale === 'ar' ? 'أدخل بياناتك للوصول إلى حسابك' : 'Enter your credentials to access your account' }}
        </p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-5">
        <!-- Email -->
        <div>
          <label class="block text-sm font-medium text-gray-600 mb-1.5">{{ $t('auth.email') }}</label>
          <div class="relative">
            <span class="absolute start-4 top-1/2 -translate-y-1/2 text-gray-300">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"/></svg>
            </span>
            <input
              v-model="form.email"
              type="email"
              required
              autofocus
              class="w-full ps-11 pe-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-sm bg-white"
              :placeholder="locale === 'ar' ? 'أدخل بريدك الإلكتروني' : 'Enter your email'"
              dir="ltr"
            />
          </div>
          <p v-if="errors.email" class="text-red-500 text-xs mt-1.5">{{ errors.email[0] }}</p>
        </div>

        <!-- Password -->
        <div>
          <div class="flex items-center justify-between mb-1.5">
            <label class="block text-sm font-medium text-gray-600">{{ $t('auth.password') }}</label>
            <NuxtLink to="/auth/forgot-password" class="text-xs text-secondary-400 hover:text-secondary-500 transition">
              {{ $t('auth.forgotPassword') }}
            </NuxtLink>
          </div>
          <div class="relative">
            <span class="absolute start-4 top-1/2 -translate-y-1/2 text-gray-300">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"/></svg>
            </span>
            <input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              required
              class="w-full ps-11 pe-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-sm bg-white"
              :placeholder="locale === 'ar' ? 'أدخل كلمة المرور' : 'Enter your password'"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute end-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition"
            >
              <svg v-if="!showPassword" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/></svg>
              <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12c1.292 4.338 5.31 7.5 10.066 7.5.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"/></svg>
            </button>
          </div>
          <p v-if="errors.password" class="text-red-500 text-xs mt-1.5">{{ errors.password[0] }}</p>
        </div>

        <!-- Error -->
        <Transition name="fade-slide">
          <div v-if="errorMessage" class="flex items-center gap-3 bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100">
            <svg class="w-4 h-4 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"/></svg>
            <span>{{ errorMessage }}</span>
          </div>
        </Transition>

        <!-- Submit -->
        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-primary-500 text-white py-3 rounded-xl font-semibold hover:bg-primary-600 transition-all disabled:opacity-50 active:scale-[0.98] shadow-sm shadow-primary-500/20 hover:shadow-md hover:shadow-primary-500/30"
        >
          <span v-if="loading" class="inline-flex items-center gap-2">
            <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            {{ $t('common.loading') }}
          </span>
          <span v-else>{{ $t('auth.login') }}</span>
        </button>
      </form>

      <!-- Footer links -->
      <p class="mt-6 text-center text-sm text-gray-500">
        {{ locale === 'ar' ? 'ليس لديك حساب؟' : "Don't have an account?" }}
        <NuxtLink to="/auth/register" class="text-secondary-400 hover:text-secondary-500 font-medium">
          {{ $t('auth.register') }}
        </NuxtLink>
      </p>
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'guest', layout: false })

const { locale } = useI18n()
const authStore = useAuthStore()

const form = reactive({ email: '', password: '' })
const loading = ref(false)
const showPassword = ref(false)
const errorMessage = ref('')
const errors = ref<Record<string, string[]>>({})

async function handleLogin() {
  loading.value = true
  errorMessage.value = ''
  errors.value = {}

  try {
    await authStore.login(form)
    navigateTo('/dashboard')
  } catch (error: any) {
    if (error.data?.errors) errors.value = error.data.errors
    errorMessage.value = error.data?.message || (locale.value === 'ar' ? 'فشل تسجيل الدخول' : 'Login failed')
  } finally {
    loading.value = false
  }
}
</script>