<template>
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-neutral-900 dark:text-neutral-0 tracking-tight">
        {{ locale === 'ar' ? 'أنشئ حسابك' : 'Create your account' }}
      </h2>
      <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-1.5">
        {{ locale === 'ar' ? 'ابدأ بإدارة دفاتر شركتك في دقائق.' : 'Start managing your books in minutes.' }}
      </p>
    </div>

    <form @submit.prevent="handleRegister" class="space-y-3.5" novalidate>
      <!-- Company Name -->
      <FormField
        :label="$t('auth.companyName')"
        icon="i-lucide-building-2"
        :error="errors.tenant_name?.[0] || errors.tenant_slug?.[0]"
      >
        <input
          v-model="form.tenant_name"
          type="text"
          required
          autofocus
          class="form-input"
          :class="errors.tenant_name || errors.tenant_slug ? 'form-input--error' : ''"
          :placeholder="locale === 'ar' ? 'اسم الشركة أو المكتب' : 'Acme Trading Co.'"
        />
        <template v-if="form.tenant_name && !errors.tenant_name && !errors.tenant_slug" #help>
          <p class="text-[11px] text-neutral-400 dark:text-neutral-500 flex items-center gap-1">
            <UIcon name="i-lucide-link" class="w-3 h-3" />
            <span dir="ltr" class="font-mono">{{ derivedSlug || '—' }}</span>
          </p>
        </template>
      </FormField>

      <!-- Full Name -->
      <FormField
        :label="$t('auth.fullName')"
        icon="i-lucide-user"
        :error="errors.name?.[0]"
      >
        <input
          v-model="form.name"
          type="text"
          required
          class="form-input"
          :class="errors.name ? 'form-input--error' : ''"
          :placeholder="locale === 'ar' ? 'الاسم الكامل' : 'Jane Doe'"
        />
      </FormField>

      <!-- Email -->
      <FormField
        :label="$t('auth.email')"
        icon="i-lucide-mail"
        :error="errors.email?.[0]"
      >
        <input
          v-model="form.email"
          type="email"
          required
          dir="ltr"
          class="form-input"
          :class="errors.email ? 'form-input--error' : ''"
          placeholder="name@company.com"
        />
      </FormField>

      <!-- Password -->
      <FormField
        :label="$t('auth.password')"
        icon="i-lucide-lock"
        :errors="errors.password"
      >
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

      <!-- Confirm Password -->
      <FormField
        :label="$t('auth.confirmPassword')"
        icon="i-lucide-shield-check"
        :error="confirmError"
      >
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

      <!-- Terms -->
      <p class="text-[11px] leading-relaxed text-neutral-500 dark:text-neutral-400">
        {{ locale === 'ar' ? 'بإنشاء الحساب فإنك توافق على' : 'By creating an account you agree to our' }}
        <a href="/terms" class="text-primary-600 dark:text-primary-400 hover:underline">
          {{ locale === 'ar' ? 'الشروط' : 'Terms' }}
        </a>
        {{ locale === 'ar' ? 'و' : 'and' }}
        <a href="/privacy" class="text-primary-600 dark:text-primary-400 hover:underline">
          {{ locale === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy' }}
        </a>.
      </p>

      <!-- Submit -->
      <button
        type="submit"
        :disabled="loading"
        class="w-full h-10 inline-flex items-center justify-center gap-2 rounded-md bg-primary-600 hover:bg-primary-700 active:bg-primary-700 text-white text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
      >
        <UIcon v-if="loading" name="i-lucide-loader-2" class="w-4 h-4 animate-spin" />
        <span>{{ loading ? $t('common.loading') : (locale === 'ar' ? 'إنشاء الحساب' : 'Create account') }}</span>
      </button>
    </form>

    <!-- Footer -->
    <div class="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-800 text-center">
      <p class="text-xs text-neutral-500 dark:text-neutral-400">
        {{ $t('auth.hasAccount') }}
        <NuxtLink
          to="/auth/login"
          class="ms-1 font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
        >
          {{ $t('auth.login') }}
        </NuxtLink>
      </p>
    </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'guest', layout: 'auth' })

const { locale } = useI18n()
const authStore = useAuthStore()
const toast = useAppToast()

const form = reactive({
  tenant_name: '',
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
})

const loading = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const errorMessage = ref('')
const errors = ref<Record<string, string[]>>({})

/**
 * Backend `tenant_slug` is `alpha_dash` + `unique:tenants,slug`. We derive an
 * ASCII-only slug from the tenant_name. Arabic / non-ASCII inputs collapse to
 * empty, so we fall back to a `co-<rand>` token. A short random suffix is
 * always appended to dodge unique-collision on common names; users can rename
 * it later from tenant settings.
 */
const derivedSlug = computed(() => slugify(form.tenant_name))

function slugify(input: string): string {
  if (!input) return ''
  const ascii = input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
  const base = ascii.length >= 2 ? ascii : 'co'
  // Stable per-keystroke is fine — we only read it at submit time. We do not
  // re-roll on every input event because computed() re-runs deterministically
  // per `form.tenant_name` value. The randomness is generated once per submit.
  return base
}

function buildTenantSlug(name: string): string {
  const base = slugify(name) || 'co'
  const suffix = Math.random().toString(36).slice(2, 6)
  return `${base}-${suffix}`.slice(0, 80)
}

const confirmError = computed(() => {
  if (errors.value.password_confirmation) return errors.value.password_confirmation[0]
  if (form.password_confirmation && form.password !== form.password_confirmation) {
    return locale.value === 'ar' ? 'كلمة المرور غير متطابقة' : "Passwords don't match"
  }
  return ''
})

/**
 * Generate a 16-char password that satisfies the backend Password::defaults()
 * policy (10+ chars, mixedCase, letters, numbers, symbols) and is overwhelm-
 * ingly unlikely to appear in haveibeenpwned. Ambiguous glyphs (0/O, 1/l/I)
 * are excluded so users can read it back without confusion.
 */
function generateStrongPassword(): string {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ'   // no I, O
  const lower = 'abcdefghijkmnpqrstuvwxyz'   // no l, o
  const digits = '23456789'                   // no 0, 1
  const symbols = '!@#$%^&*-_=+'
  const all = upper + lower + digits + symbols

  function pick(set: string): string {
    const buf = new Uint32Array(1)
    crypto.getRandomValues(buf)
    return set[buf[0] % set.length]!
  }

  const out: string[] = [pick(upper), pick(lower), pick(digits), pick(symbols)]
  while (out.length < 16) out.push(pick(all))

  // Fisher-Yates shuffle so the guaranteed-class chars aren't always at the start.
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
    toast.success(
      locale.value === 'ar' ? 'تم نسخ كلمة المرور' : 'Password copied to clipboard',
      { description: locale.value === 'ar' ? 'احفظها في مكان آمن قبل المتابعة.' : 'Save it somewhere safe before continuing.' },
    )
  } catch {
    toast.success(
      locale.value === 'ar' ? 'تم توليد كلمة مرور قوية' : 'Strong password generated',
      { description: locale.value === 'ar' ? 'انسخها يدوياً قبل إنشاء الحساب.' : 'Copy it manually before creating the account.' },
    )
  }
}

function validate(): boolean {
  const next: Record<string, string[]> = {}
  const required = locale.value === 'ar' ? 'هذا الحقل مطلوب.' : 'This field is required.'
  if (!form.tenant_name.trim()) next.tenant_name = [required]
  if (!form.name.trim()) next.name = [required]
  if (!form.email.trim()) next.email = [required]
  if (!form.password) next.password = [required]
  if (!form.password_confirmation) next.password_confirmation = [required]
  errors.value = next
  return Object.keys(next).length === 0
}

async function handleRegister() {
  errorMessage.value = ''
  if (!validate()) return  // No API call — surface inline errors only.

  loading.value = true
  try {
    await authStore.register({
      name: form.name,
      email: form.email,
      password: form.password,
      password_confirmation: form.password_confirmation,
      tenant_name: form.tenant_name,
      tenant_slug: buildTenantSlug(form.tenant_name),
    })
    navigateTo('/dashboard')
  } catch (error: any) {
    if (error?.fieldErrors) errors.value = error.fieldErrors
    errorMessage.value = error?.message || (locale.value === 'ar' ? 'فشل إنشاء الحساب' : 'Registration failed')
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
.form-input--error {
  border-color: color-mix(in oklab, var(--color-danger-500) 60%, transparent);
}
.form-input--error:focus { border-color: var(--color-danger-500); box-shadow: 0 0 0 2px color-mix(in oklab, var(--color-danger-500) 25%, transparent); }

:global(html.dark) .form-input {
  background-color: var(--color-neutral-900);
  border-color: var(--color-neutral-800);
  color: var(--color-neutral-0);
}

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
