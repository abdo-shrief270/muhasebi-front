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
        {{ locale === 'ar' ? 'إعادة تعيين كلمة المرور' : 'Reset your password' }}
      </h2>
      <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-1.5 leading-relaxed">
        <template v-if="email">
          {{ locale === 'ar' ? 'اختر كلمة مرور جديدة لـ' : 'Choose a new password for' }}
          <span class="font-medium text-neutral-700 dark:text-neutral-200" dir="ltr">{{ email }}</span>
        </template>
        <template v-else>
          {{ locale === 'ar' ? 'أدخل بريدك الإلكتروني وكلمة المرور الجديدة.' : 'Enter your email and new password.' }}
        </template>
      </p>
    </div>

    <!-- Missing token warning -->
    <div
      v-if="!token"
      class="flex items-start gap-2.5 px-3 py-2.5 rounded-md bg-warning-500/10 border border-warning-500/30 text-warning-700 dark:text-warning-500 mb-5"
    >
      <UIcon name="i-lucide-alert-triangle" class="w-4 h-4 mt-0.5 flex-shrink-0" />
      <span class="text-xs leading-relaxed">
        {{ locale === 'ar'
          ? 'الرابط غير صالح. اطلب رابطاً جديداً من صفحة "نسيت كلمة المرور".'
          : 'Invalid or missing reset link. Please request a new one from the forgot-password page.' }}
      </span>
    </div>

    <form v-else @submit.prevent="handleReset" class="space-y-4" novalidate>
      <!-- Email (readonly when prefilled, editable otherwise) -->
      <FormField :label="$t('auth.email')" icon="i-lucide-mail" :error="errors.email?.[0]">
        <input
          v-model="form.email"
          type="email"
          required
          dir="ltr"
          :readonly="!!emailFromQuery"
          class="form-input"
          :class="[errors.email ? 'form-input--error' : '', emailFromQuery ? 'form-input--readonly' : '']"
          placeholder="name@company.com"
        />
      </FormField>

      <!-- New password -->
      <FormField :label="locale === 'ar' ? 'كلمة المرور الجديدة' : 'New Password'" icon="i-lucide-lock" :errors="errors.password">
        <template #label-action>
          <button
            type="button"
            @click="handleGeneratePassword"
            class="inline-flex items-center gap-1 text-[11px] font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
            :title="locale === 'ar' ? 'توليد كلمة مرور قوية' : 'Generate a strong password'"
          >
            <UIcon name="i-lucide-wand-sparkles" class="w-3 h-3" />
            {{ locale === 'ar' ? 'توليد' : 'Generate' }}
          </button>
        </template>
        <input
          v-model="form.password"
          :type="showPassword ? 'text' : 'password'"
          required
          class="form-input form-input--with-trailing"
          :class="errors.password ? 'form-input--error' : ''"
          :placeholder="locale === 'ar' ? '10 أحرف على الأقل' : 'At least 10 characters'"
        />
        <template #trailing>
          <button
            type="button"
            @click="showPassword = !showPassword"
            class="w-7 h-7 inline-flex items-center justify-center rounded-sm text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
            :aria-label="showPassword ? 'Hide password' : 'Show password'"
          >
            <UIcon :name="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'" class="w-4 h-4" />
          </button>
        </template>
        <template #help>
          <PasswordStrength :password="form.password" />
        </template>
      </FormField>

      <!-- Confirm -->
      <FormField :label="$t('auth.confirmPassword')" icon="i-lucide-shield-check" :error="confirmError">
        <input
          v-model="form.password_confirmation"
          :type="showConfirmPassword ? 'text' : 'password'"
          required
          class="form-input form-input--with-trailing"
          :class="confirmError ? 'form-input--error' : ''"
          :placeholder="locale === 'ar' ? 'أعد إدخال كلمة المرور' : 'Re-enter your password'"
        />
        <template #trailing>
          <button
            type="button"
            @click="showConfirmPassword = !showConfirmPassword"
            class="w-7 h-7 inline-flex items-center justify-center rounded-sm text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
            :aria-label="showConfirmPassword ? 'Hide password' : 'Show password'"
          >
            <UIcon :name="showConfirmPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'" class="w-4 h-4" />
          </button>
        </template>
        <template v-if="form.password_confirmation && form.password === form.password_confirmation && form.password.length > 0" #help>
          <p class="text-[11px] text-success-600 dark:text-success-500 flex items-center gap-1">
            <UIcon name="i-lucide-check-circle-2" class="w-3 h-3" />
            {{ locale === 'ar' ? 'كلمتا المرور متطابقتان' : 'Passwords match' }}
          </p>
        </template>
      </FormField>

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

      <button
        type="submit"
        :disabled="loading"
        class="w-full h-10 inline-flex items-center justify-center gap-2 rounded-md bg-primary-600 hover:bg-primary-700 active:bg-primary-700 text-white text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
      >
        <UIcon v-if="loading" name="i-lucide-loader-2" class="w-4 h-4 animate-spin" />
        <span>{{ loading ? $t('common.loading') : (locale === 'ar' ? 'تعيين كلمة المرور' : 'Set new password') }}</span>
      </button>
    </form>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'guest', layout: 'auth' })

const { locale } = useI18n()
const route = useRoute()
const toast = useAppToast()

const token = computed(() => String(route.query.token ?? ''))
const emailFromQuery = computed(() => String(route.query.email ?? ''))
const email = computed(() => emailFromQuery.value)

const form = reactive({
  email: emailFromQuery.value,
  password: '',
  password_confirmation: '',
})

const loading = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const errorMessage = ref('')
const errors = ref<Record<string, string[]>>({})

const confirmError = computed(() => {
  if (errors.value.password_confirmation) return errors.value.password_confirmation[0]
  if (form.password_confirmation && form.password !== form.password_confirmation) {
    return locale.value === 'ar' ? 'كلمة المرور غير متطابقة' : "Passwords don't match"
  }
  return ''
})

function generateStrongPassword(): string {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
  const lower = 'abcdefghijkmnpqrstuvwxyz'
  const digits = '23456789'
  const symbols = '!@#$%^&*-_=+'
  const all = upper + lower + digits + symbols

  function pick(set: string): string {
    const buf = new Uint32Array(1)
    crypto.getRandomValues(buf)
    return set[buf[0] % set.length]!
  }

  const out: string[] = [pick(upper), pick(lower), pick(digits), pick(symbols)]
  while (out.length < 16) out.push(pick(all))

  for (let i = out.length - 1; i > 0; i--) {
    const buf = new Uint32Array(1)
    crypto.getRandomValues(buf)
    const j = buf[0]! % (i + 1)
    ;[out[i], out[j]] = [out[j]!, out[i]!]
  }
  return out.join('')
}

async function handleGeneratePassword() {
  const pw = generateStrongPassword()
  form.password = pw
  form.password_confirmation = pw
  showPassword.value = true
  showConfirmPassword.value = true
  errors.value.password = undefined as any
  errors.value.password_confirmation = undefined as any
  try {
    await navigator.clipboard.writeText(pw)
    toast.success(locale.value === 'ar' ? 'تم نسخ كلمة المرور' : 'Password copied to clipboard')
  } catch {
    toast.success(locale.value === 'ar' ? 'تم توليد كلمة مرور قوية' : 'Strong password generated')
  }
}

function validate(): boolean {
  const next: Record<string, string[]> = {}
  const required = locale.value === 'ar' ? 'هذا الحقل مطلوب.' : 'This field is required.'
  if (!form.email.trim()) next.email = [required]
  if (!form.password) next.password = [required]
  if (!form.password_confirmation) next.password_confirmation = [required]
  errors.value = next
  return Object.keys(next).length === 0
}

async function handleReset() {
  errorMessage.value = ''
  if (!validate()) return  // No API call — surface inline errors only.

  loading.value = true
  try {
    const api = useApi()
    await api.post('/reset-password', {
      token: token.value,
      email: form.email,
      password: form.password,
      password_confirmation: form.password_confirmation,
    })
    toast.success(
      locale.value === 'ar' ? 'تم تحديث كلمة المرور' : 'Password updated',
      { description: locale.value === 'ar' ? 'يمكنك تسجيل الدخول الآن.' : 'You can now sign in.' },
    )
    navigateTo('/auth/login')
  } catch (error: any) {
    if (error?.fieldErrors) errors.value = error.fieldErrors
    errorMessage.value = error?.message || (locale.value === 'ar' ? 'فشلت إعادة التعيين' : 'Reset failed')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.form-input {
  width: 100%;
  padding-inline-start: 2.25rem;
  padding-inline-end: 0.75rem;
  height: 2.5rem;
  font-size: 0.875rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-neutral-200);
  background-color: var(--color-neutral-0, #fff);
  color: var(--color-neutral-900);
  outline: none;
  transition: border-color 150ms var(--ease-standard);
}
.form-input::placeholder { color: var(--color-neutral-400); }
.form-input:focus {
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 2px color-mix(in oklab, var(--color-primary-500) 25%, transparent);
}
.form-input--with-trailing { padding-inline-end: 2.5rem; }
.form-input--error { border-color: color-mix(in oklab, var(--color-danger-500) 60%, transparent); }
.form-input--error:focus { border-color: var(--color-danger-500); box-shadow: 0 0 0 2px color-mix(in oklab, var(--color-danger-500) 25%, transparent); }
.form-input--readonly { background-color: var(--color-neutral-50); cursor: not-allowed; }

:global(html.dark) .form-input {
  background-color: var(--color-neutral-900);
  border-color: var(--color-neutral-800);
  color: var(--color-neutral-0);
}
:global(html.dark) .form-input--readonly { background-color: var(--color-neutral-800); }

.fade-slide-enter-active, .fade-slide-leave-active {
  transition: opacity 220ms var(--ease-standard), transform 220ms var(--ease-standard);
}
.fade-slide-enter-from, .fade-slide-leave-to { opacity: 0; transform: translateY(-4px); }
</style>
