<template>
    <div class="text-center">
      <!-- Spinner state — exchanging the token for a session -->
      <template v-if="state === 'loading'">
        <div class="w-14 h-14 mx-auto mb-5 rounded-full bg-info-500/10 flex items-center justify-center">
          <UIcon name="i-lucide-user-cog" class="w-6 h-6 text-info-600 dark:text-info-400" />
        </div>
        <h2 class="text-xl font-bold text-neutral-900 dark:text-neutral-0 tracking-tight mb-1.5">
          {{ locale === 'ar' ? 'جارٍ تسجيل الدخول…' : 'Signing in…' }}
        </h2>
        <p class="text-sm text-neutral-500 dark:text-neutral-400 mb-6">
          {{ locale === 'ar'
            ? 'يجري التحقق من جلسة المحاكاة.'
            : 'Validating the impersonation session.' }}
        </p>
        <div class="inline-flex items-center gap-2 text-xs text-neutral-400">
          <UIcon name="i-lucide-loader-2" class="w-4 h-4 animate-spin" />
          {{ $t('common.loading') }}
        </div>
      </template>

      <!-- Error state — invalid / expired / missing token -->
      <template v-else-if="state === 'error'">
        <div class="w-14 h-14 mx-auto mb-5 rounded-full bg-danger-500/10 flex items-center justify-center">
          <UIcon name="i-lucide-shield-alert" class="w-6 h-6 text-danger-600 dark:text-danger-500" />
        </div>
        <h2 class="text-xl font-bold text-neutral-900 dark:text-neutral-0 tracking-tight mb-1.5">
          {{ locale === 'ar' ? 'تعذّر بدء المحاكاة' : "Couldn't start impersonation" }}
        </h2>
        <p class="text-sm text-neutral-500 dark:text-neutral-400 mb-6 leading-relaxed max-w-md mx-auto">
          {{ errorMessage }}
        </p>
        <div class="flex items-center justify-center gap-2">
          <NuxtLink
            to="/auth/login"
            class="inline-flex items-center gap-1.5 h-10 px-4 rounded-md bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold transition-colors"
          >
            <UIcon name="i-lucide-arrow-left" class="w-4 h-4 rtl:rotate-180" />
            {{ locale === 'ar' ? 'الذهاب لتسجيل الدخول' : 'Go to sign in' }}
          </NuxtLink>
        </div>
      </template>
    </div>
</template>

<script setup lang="ts">
/**
 * Impersonation landing page.
 *
 * Filament's UserResource impersonate action opens this page with a 1-hour
 * Sanctum token. We exchange the token for a session by:
 *   1. Storing it as `auth_token` (cookie + authStore.token).
 *   2. Calling /me to hydrate user / tenant / permissions / subscription.
 *   3. Redirecting to the `redirect` query param (defaults to /dashboard).
 *
 * If anything fails (missing token, /me returns 401, network error) we land
 * on an error state with a back-to-login CTA. The interceptor in
 * `core/api/client.ts` would normally bounce a 401 back to /auth/login, but
 * since we're already on an /auth/* route the bounce is a no-op — the user
 * sees this page's own error UI instead.
 */
definePageMeta({
  // No `middleware: 'guest'` here — admins clicking the impersonate link from
  // Filament may already be authenticated as a SuperAdmin in another tab.
  // The token in the query takes precedence and overwrites that session.
  layout: 'auth',
})

const { locale } = useI18n()
const route = useRoute()
const authStore = useAuthStore()

const state = ref<'loading' | 'error'>('loading')
const errorMessage = ref('')

const token = computed(() => String(route.query.token ?? ''))
const redirectTo = computed(() => {
  const r = String(route.query.redirect ?? '/dashboard')
  // Reject absolute URLs — only same-origin relative paths.
  return r.startsWith('/') && !r.startsWith('//') ? r : '/dashboard'
})

onMounted(async () => {
  if (!token.value) {
    state.value = 'error'
    errorMessage.value = locale.value === 'ar'
      ? 'الرابط غير صالح — لا يوجد رمز محاكاة.'
      : 'Invalid link — no impersonation token provided.'
    return
  }

  try {
    // Persist the token via the auth-token cookie (the API client reads it
    // from there for the Authorization header on every subsequent request).
    const tokenCookie = useCookie<string | null>('auth_token', { maxAge: 60 * 60 * 24 * 30 })
    tokenCookie.value = token.value

    // Mirror it onto the in-memory store. setToken() takes (token, user) but
    // we don't have a user yet — assign the token ref directly so the API
    // client picks it up on the next request, then fetchUser() hydrates user
    // / tenant / permissions / subscription from /me.
    authStore.token = token.value
    authStore.startImpersonation()

    await authStore.fetchUser()
    if (!authStore.user) {
      throw new Error('me-failed')
    }

    await navigateTo(redirectTo.value)
  } catch (err: any) {
    state.value = 'error'
    if (err?.status === 401 || err?.message === 'me-failed') {
      errorMessage.value = locale.value === 'ar'
        ? 'انتهت صلاحية رمز المحاكاة أو أنه غير صالح. اطلب رابطاً جديداً من لوحة المسؤول.'
        : 'The impersonation token has expired or is invalid. Request a fresh link from the admin panel.'
    } else {
      errorMessage.value = err?.message
        || (locale.value === 'ar' ? 'حدث خطأ غير متوقع.' : 'An unexpected error occurred.')
    }
    // Clean up the half-set token so a refresh doesn't loop.
    authStore.clearAuth()
  }
})
</script>
