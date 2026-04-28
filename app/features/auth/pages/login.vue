<template>
    <div class="mb-8">
      <h2 class="text-2xl font-bold text-neutral-900 dark:text-neutral-0 tracking-tight">
        {{ locale === 'ar' ? 'مرحباً بعودتك' : 'Welcome back' }}
      </h2>
      <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-1.5">
        {{ locale === 'ar' ? 'سجّل الدخول للمتابعة إلى حسابك.' : 'Sign in to continue to your workspace.' }}
      </p>
    </div>

    <form @submit.prevent="handleLogin" class="space-y-4" novalidate>
      <!-- Email -->
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
            v-model="form.email"
            type="email"
            required
            autofocus
            dir="ltr"
            class="w-full ps-9 pe-3 h-10 text-sm rounded-md border bg-neutral-0 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-0 placeholder:text-neutral-400 outline-none transition-colors focus:ring-2 focus:ring-primary-500/25"
            :class="errors.email ? 'border-danger-500/60 focus:border-danger-500' : 'border-neutral-200 dark:border-neutral-800 focus:border-primary-500'"
            :placeholder="locale === 'ar' ? 'name@company.com' : 'name@company.com'"
          />
        </div>
        <p v-if="errors.email" class="mt-1.5 text-xs text-danger-600 dark:text-danger-500 flex items-center gap-1">
          <UIcon name="i-lucide-alert-circle" class="w-3.5 h-3.5" />
          {{ errors.email[0] }}
        </p>
      </div>

      <!-- Password -->
      <div>
        <div class="flex items-center justify-between mb-1.5">
          <label class="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
            {{ $t('auth.password') }}
          </label>
          <NuxtLink
            to="/auth/forgot-password"
            class="text-xs font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
          >
            {{ $t('auth.forgotPassword') }}
          </NuxtLink>
        </div>
        <div class="relative">
          <UIcon
            name="i-lucide-lock"
            class="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none"
          />
          <input
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            required
            class="w-full ps-9 pe-10 h-10 text-sm rounded-md border bg-neutral-0 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-0 placeholder:text-neutral-400 outline-none transition-colors focus:ring-2 focus:ring-primary-500/25"
            :class="errors.password ? 'border-danger-500/60 focus:border-danger-500' : 'border-neutral-200 dark:border-neutral-800 focus:border-primary-500'"
            :placeholder="locale === 'ar' ? '••••••••' : '••••••••'"
          />
          <button
            type="button"
            @click="showPassword = !showPassword"
            class="absolute end-2 top-1/2 -translate-y-1/2 w-7 h-7 inline-flex items-center justify-center rounded-sm text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
            :aria-label="showPassword ? 'Hide password' : 'Show password'"
          >
            <UIcon :name="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'" class="w-4 h-4" />
          </button>
        </div>
        <p v-if="errors.password" class="mt-1.5 text-xs text-danger-600 dark:text-danger-500 flex items-center gap-1">
          <UIcon name="i-lucide-alert-circle" class="w-3.5 h-3.5" />
          {{ errors.password[0] }}
        </p>
      </div>

      <!-- Remember me -->
      <label class="flex items-center gap-2 select-none cursor-pointer">
        <input
          v-model="form.remember"
          type="checkbox"
          class="w-4 h-4 rounded-sm border-neutral-300 dark:border-neutral-700 text-primary-500 focus:ring-2 focus:ring-primary-500/25"
        />
        <span class="text-xs text-neutral-600 dark:text-neutral-400">{{ $t('auth.rememberMe') }}</span>
      </label>

      <!-- Top-level error -->
      <Transition name="fade-slide">
        <div
          v-if="errorMessage"
          class="flex items-start gap-2.5 px-3 py-2.5 rounded-md bg-danger-50 dark:bg-danger-500/10 border border-danger-500/20 text-danger-700 dark:text-danger-400"
        >
          <UIcon name="i-lucide-alert-triangle" class="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span class="text-xs leading-relaxed">{{ errorMessage }}</span>
        </div>
      </Transition>

      <!-- Submit -->
      <button
        type="submit"
        :disabled="loading"
        class="w-full h-10 inline-flex items-center justify-center gap-2 rounded-md bg-primary-600 hover:bg-primary-700 active:bg-primary-700 text-white text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
      >
        <UIcon v-if="loading" name="i-lucide-loader-2" class="w-4 h-4 animate-spin" />
        <span>{{ loading ? $t('common.loading') : $t('auth.login') }}</span>
      </button>
    </form>

    <!-- Footer -->
    <div class="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-800 text-center">
      <p class="text-xs text-neutral-500 dark:text-neutral-400">
        {{ $t('auth.noAccount') }}
        <NuxtLink
          to="/auth/register"
          class="ms-1 font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
        >
          {{ $t('auth.register') }}
        </NuxtLink>
      </p>
    </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'guest', layout: 'auth' })

const { locale } = useI18n()
const authStore = useAuthStore()

const form = reactive({ email: '', password: '', remember: false })
const loading = ref(false)
const showPassword = ref(false)
const errorMessage = ref('')
const errors = ref<Record<string, string[]>>({})

function validate(): boolean {
  const next: Record<string, string[]> = {}
  const required = locale.value === 'ar' ? 'هذا الحقل مطلوب.' : 'This field is required.'
  if (!form.email.trim()) next.email = [required]
  if (!form.password) next.password = [required]
  errors.value = next
  return Object.keys(next).length === 0
}

async function handleLogin() {
  errorMessage.value = ''
  if (!validate()) return  // No API call — surface inline errors only.

  loading.value = true
  try {
    await authStore.login(form)
    navigateTo('/dashboard')
  } catch (error: any) {
    if (error?.fieldErrors) errors.value = error.fieldErrors
    errorMessage.value = error?.message || (locale.value === 'ar' ? 'فشل تسجيل الدخول' : 'Login failed')
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
