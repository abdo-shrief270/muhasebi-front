<template>
  <div class="min-h-screen flex items-center justify-center px-4 py-10 bg-neutral-50 dark:bg-neutral-950">
    <div class="w-full max-w-md">
      <!-- Branded header -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-400 shadow-lg shadow-primary-500/20 mb-4">
          <UIcon name="i-lucide-mail-check" class="w-7 h-7 text-white" />
        </div>
        <h1 class="text-2xl font-bold text-neutral-900 dark:text-neutral-0 tracking-tight">
          {{ locale === 'ar' ? 'قبول دعوة البوابة' : 'Accept your invitation' }}
        </h1>
        <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-1.5">
          {{ locale === 'ar'
            ? 'اختر كلمة مرور لإكمال إعداد حسابك في بوابة العملاء.'
            : 'Pick a password to finish setting up your client portal account.' }}
        </p>
      </div>

      <!-- Card -->
      <div class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm">
        <!-- No-token state — should only ever hit this if the user pasted
             a bare URL without the magic token. We don't want to show the
             form because the submit would 422 anyway. -->
        <div v-if="!token" class="text-center py-4">
          <div class="w-12 h-12 mx-auto mb-3 rounded-full bg-warning-50 dark:bg-warning-500/10 flex items-center justify-center">
            <UIcon name="i-lucide-link-2-off" class="w-5 h-5 text-warning-600 dark:text-warning-400" />
          </div>
          <p class="text-sm font-semibold text-neutral-900 dark:text-neutral-0 mb-1">
            {{ locale === 'ar' ? 'رابط الدعوة غير صالح' : 'Invitation link is incomplete' }}
          </p>
          <p class="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
            {{ locale === 'ar'
              ? 'افتح الرابط من بريد الدعوة الأصلي ليعمل بشكل صحيح.'
              : 'Open the link from your original invitation email so it carries the access token.' }}
          </p>
          <NuxtLink
            to="/auth/login"
            class="inline-flex items-center gap-1 text-xs font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
          >
            {{ locale === 'ar' ? 'الذهاب لتسجيل الدخول' : 'Go to login' }}
            <UIcon name="i-lucide-arrow-right" class="w-3.5 h-3.5 rtl:rotate-180" />
          </NuxtLink>
        </div>

        <form v-else @submit.prevent="handleAccept" class="space-y-4" novalidate>
          <!-- Password -->
          <div>
            <label class="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
              {{ locale === 'ar' ? 'كلمة المرور الجديدة' : 'New password' }}
            </label>
            <div class="relative">
              <UIcon name="i-lucide-lock" class="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                required
                autofocus
                autocomplete="new-password"
                minlength="10"
                dir="ltr"
                class="w-full ps-9 pe-10 h-10 text-sm rounded-md border bg-neutral-0 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-0 outline-none transition-colors focus:ring-2 focus:ring-primary-500/25"
                :class="errors.password ? 'border-danger-500/60 focus:border-danger-500' : 'border-neutral-200 dark:border-neutral-800 focus:border-primary-500'"
              />
              <button
                type="button"
                class="absolute end-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                :aria-label="showPassword ? (locale === 'ar' ? 'إخفاء' : 'Hide') : (locale === 'ar' ? 'إظهار' : 'Show')"
                @click="showPassword = !showPassword"
              >
                <UIcon :name="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'" class="w-4 h-4" />
              </button>
            </div>
            <p class="mt-1.5 text-[11px] text-neutral-500 dark:text-neutral-400">
              {{ locale === 'ar'
                ? 'الحد الأدنى 10 أحرف، مع أحرف كبيرة وصغيرة وأرقام ورموز.'
                : 'Minimum 10 characters, including uppercase, lowercase, numbers, and symbols.' }}
            </p>
            <p v-if="errors.password" class="mt-1.5 text-xs text-danger-600 dark:text-danger-500 flex items-center gap-1">
              <UIcon name="i-lucide-alert-circle" class="w-3.5 h-3.5 flex-shrink-0" />
              {{ errors.password[0] }}
            </p>
          </div>

          <!-- Confirm -->
          <div>
            <label class="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
              {{ locale === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm password' }}
            </label>
            <div class="relative">
              <UIcon name="i-lucide-lock-keyhole" class="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
              <input
                v-model="form.password_confirmation"
                :type="showPassword ? 'text' : 'password'"
                required
                autocomplete="new-password"
                minlength="10"
                dir="ltr"
                class="w-full ps-9 pe-3 h-10 text-sm rounded-md border bg-neutral-0 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-0 outline-none transition-colors focus:ring-2 focus:ring-primary-500/25"
                :class="confirmMismatch ? 'border-danger-500/60 focus:border-danger-500' : 'border-neutral-200 dark:border-neutral-800 focus:border-primary-500'"
              />
            </div>
            <p v-if="confirmMismatch" class="mt-1.5 text-xs text-danger-600 dark:text-danger-500 flex items-center gap-1">
              <UIcon name="i-lucide-alert-circle" class="w-3.5 h-3.5" />
              {{ locale === 'ar' ? 'كلمتا المرور غير متطابقتين.' : 'Passwords do not match.' }}
            </p>
          </div>

          <!-- Token-level errors (expired, used, invalid) -->
          <div
            v-if="errors.token"
            class="rounded-md bg-danger-50 dark:bg-danger-500/10 border border-danger-500/20 px-3 py-2 text-xs text-danger-700 dark:text-danger-400 flex items-start gap-2"
          >
            <UIcon name="i-lucide-alert-triangle" class="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
            <span>{{ errors.token[0] }}</span>
          </div>

          <UiAppButton
            type="submit"
            variant="primary"
            class="w-full"
            icon="i-lucide-check-circle-2"
            :loading="submitting"
            :disabled="!canSubmit"
          >
            {{ locale === 'ar' ? 'إنشاء الحساب وتسجيل الدخول' : 'Create account & sign in' }}
          </UiAppButton>

          <p class="text-center text-[11px] text-neutral-500 dark:text-neutral-400 pt-2">
            {{ locale === 'ar' ? 'لديك حساب بالفعل؟' : 'Already have an account?' }}
            <NuxtLink to="/auth/login" class="font-semibold text-primary-600 dark:text-primary-400 hover:underline">
              {{ locale === 'ar' ? 'تسجيل الدخول' : 'Sign in' }}
            </NuxtLink>
          </p>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ENDPOINTS } from '~/core/api/endpoints'
import type { ApiError } from '~/core/api/errors'

// `layout: false` because the standard portal layout requires auth — the
// invited user has no token yet. The component renders its own centered
// card so it stands on its own.
definePageMeta({ layout: false })

const { locale } = useI18n()
const route = useRoute()
const toastStore = useToastStore()
const authStore = useAuthStore()
const api = useApi()

const token = computed(() => {
  const raw = route.query.token
  return Array.isArray(raw) ? raw[0] ?? '' : (raw ?? '').toString()
})

const form = reactive({
  password: '',
  password_confirmation: '',
})

const showPassword = ref(false)
const submitting = ref(false)
const errors = ref<Record<string, string[]>>({})

const confirmMismatch = computed(() =>
  form.password.length > 0
  && form.password_confirmation.length > 0
  && form.password !== form.password_confirmation,
)

const canSubmit = computed(() =>
  !!token.value
  && form.password.length >= 10
  && form.password === form.password_confirmation
  && !submitting.value,
)

async function handleAccept() {
  if (!canSubmit.value) return
  errors.value = {}
  submitting.value = true

  try {
    /**
     * Backend response shape:
     *   { data: { user: {...}, token: 'sanctum-plain-text' } }
     * We mirror what `authStore.login()` does — set the cookie via
     * setToken(), then call fetchUser() so /me populates tenant +
     * permissions before navigateTo('/portal') triggers the global
     * middleware (which now sees the user as authenticated and
     * isClient → stays on /portal).
     */
    const response = await api.post<{
      data: {
        user: { id: number; name: string; email: string; role: string; tenant_id: number; locale?: string }
        token: string
      }
    }>(ENDPOINTS.portal.acceptInvite, {
      token: token.value,
      password: form.password,
      password_confirmation: form.password_confirmation,
    })

    authStore.setToken(response.data.token, response.data.user as any)
    await authStore.fetchUser()

    toastStore.success(locale.value === 'ar' ? 'مرحباً بك!' : 'Welcome!')
    await navigateTo('/portal')
  } catch (e: unknown) {
    const err = e as ApiError
    if (err?.fieldErrors) {
      errors.value = err.fieldErrors as Record<string, string[]>
    }
    toastStore.error(err?.message || (locale.value === 'ar' ? 'فشل قبول الدعوة' : 'Failed to accept invitation'))
  } finally {
    submitting.value = false
  }
}

useHead(() => ({
  title: locale.value === 'ar'
    ? 'قبول دعوة البوابة · محاسبي'
    : 'Accept Invitation · Muhasebi',
  // Discourage indexing — these URLs carry single-use tokens.
  meta: [{ name: 'robots', content: 'noindex,nofollow' }],
}))
</script>
